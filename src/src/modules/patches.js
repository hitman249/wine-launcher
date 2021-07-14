import _          from "lodash";
import Utils      from "./utils";
import AppFolders from "./app-folders";
import Patch      from "./patch";
import Registry   from "./registry";
import Command    from "./command";

export default class Patches {

  /**
   * @type {AppFolders}
   */
  appFolders = null;

  /**
   * @type {Command}
   */
  command = null;

  /**
   * @type {System}
   */
  system = null;

  /**
   * @type {FileSystem}
   */
  fs = null;

  /**
   * @type {Registry}
   */
  registry = null;

  /**
   * @param {AppFolders} appFolders
   * @param {Command} command
   * @param {System} system
   * @param {FileSystem} fs
   * @param {Registry} registry
   */
  constructor(appFolders, command, system, fs, registry) {
    this.appFolders = appFolders;
    this.command    = command;
    this.system     = system;
    this.fs         = fs;
    this.registry   = registry;
  }

  /**
   * @return {Patch[]}
   */
  findPatches(onlyActive = false) {
    let patchesDir = this.appFolders.getPatchesDir();

    if (!this.fs.exists(patchesDir)) {
      return [];
    }

    return _.sortBy(
      Utils.natsort(this.fs.glob(patchesDir + '/*'))
        .map(path => new Patch(path))
        .filter(patch => onlyActive ? patch.isActive() : true),
      [ 'sort', 'createdAt' ]
    );
  }

  /**
   * @return {Patch[]}
   */
  getActivePatches() {
    return this.findPatches(true);
  }

  /**
   * @param {string} code
   * @return {Patch|null}
   */
  findByCode(code) {
    return this.getActivePatches().find(patch => patch.getCode() === code) || null;
  }

  /**
   * @param {string} path
   * @return {boolean}
   */
  unpack(path) {
    if (!this.fs.exists(path)) {
      return false;
    }

    let wine   = window.app.getKernel();
    let parent = this.fs.dirname(path);
    let driveC = wine.getDriveC();

    this.command.exec(`cd "${parent}" && tar -h -xzf "${path}" -C "${driveC}"`);

    return true;
  }

  /**
   * @param {null|Array.<Patch>} patches
   * @return {boolean}
   */
  apply(patches = null) {
    if (null === patches) {
      patches = this.getActivePatches();
    }

    let patchesDir = this.appFolders.getPatchesDir();
    let wine       = window.app.getKernel();

    if (!this.fs.exists(wine.getWinePrefix()) || !this.fs.exists(patchesDir) || this.fs.isEmptyDir(patchesDir)) {
      return false;
    }

    let driveC      = wine.getDriveC();
    let username    = wine.getUserName();
    let userDefault = wine.getDriveC() + '/users/default';
    let userCurrent = `${driveC}/users/${username}`;
    let overwrite   = { overwrite: true };
    let status      = false;

    patches.forEach((patch) => {
      if (patch.getArch() !== wine.getWineArch()) {
        return;
      }

      let path = patch.getPath();

      if (false === status) {
        status = true;
      }

      if (this.fs.exists(`${path}/files.tar.gz`)) {
        this.unpack(`${path}/files.tar.gz`);

        if ('default' !== username && this.fs.exists(userDefault)) {
          this.fs.mv(userDefault, userCurrent, overwrite);
        }
      } else if (this.fs.isDirectory(path) && this.fs.exists(`${path}/files`)) {
        let replace = `${path}/files/`;

        this.fs.glob(`${path}/files/*`).forEach(path => {
          let name         = this.fs.basename(path);
          let relativePath = this.fs.relativePath(path, replace);

          if (this.fs.isDirectory(path)) {
            let out = `${driveC}/${relativePath}`;

            if (this.fs.exists(out)) {
              this.fs.rm(out);
            }

            this.fs.cp(path, out, overwrite);
          } else if ('users' === name) {
            this.fs.glob(`${path}/*`).forEach(user => {
              let name         = this.fs.basename(user);
              let relativePath = this.fs.relativePath(user, replace);

              if (!this.fs.isDirectory(user)) {
                let out = `${driveC}/${relativePath}`;
                if (this.fs.exists(out)) {
                  this.fs.rm(out);
                }
                this.fs.cp(user, out, overwrite);
              } else if ('default' === name) {
                this.fs.cp(user, userCurrent, overwrite);
              } else {
                this.fs.cp(user, `${driveC}/${relativePath}`, overwrite);
              }
            });
          } else {
            this.fs.cp(path, `${driveC}/${relativePath}`, overwrite);
          }
        });
      }
    });

    return status;
  }

  /**
   * @param {null|Array.<Patch>} patches
   * @return {string[]}
   */
  getRegistryFiles(patches = null) {
    let wine  = window.app.getKernel();
    let files = [];

    if (null === patches) {
      patches = this.getActivePatches();
    }

    patches.forEach((patch) => {
      if (patch.getArch() !== wine.getWineArch()) {
        return;
      }

      patch.getRegistryFiles().forEach((path) => {
        files.push(path);
      });
    });

    return files;
  }

  /**
   * @param {Patch} patch
   * @return {boolean}
   */
  append(patch) {
    let path = this.fs.basename(patch.getPath());
    let out  = this.appFolders.getPatchesDir() + '/' + path;

    if (this.fs.exists(out)) {
      return false;
    }

    return this.fs.cp(patch.getPath(), out);
  }

  /**
   * @param {Patch} patch
   * @return {boolean}
   */
  appendAndApply(patch) {
    this.append(patch);

    let appendedPatch = this.findByCode(patch.getCode());

    if (appendedPatch) {
      let patches = [ appendedPatch ];

      this.apply(patches);

      return this.registry.apply(this.getRegistryFiles(patches));
    }

    return false;
  }
}