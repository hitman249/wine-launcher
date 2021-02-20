import _       from "lodash";
import Prefix  from "./prefix";
import Patch   from "./patch";
import Patches from "./patches";
import Utils   from "./utils";

export default class MyPatches {

  /**
   * @type {Prefix}
   */
  prefix = null;

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
   * @type {Patches}
   */
  patches = null;

  /**
   * @param {Prefix} prefix
   * @param {Command} command
   * @param {System} system
   * @param {FileSystem} fs
   * @param {Patches} patches
   */
  constructor(prefix, command, system, fs, patches) {
    this.prefix  = prefix;
    this.command = command;
    this.system  = system;
    this.fs      = fs;
    this.patches = patches;
  }

  /**
   * @return {string}
   */
  getPatchesDir() {
    let home = this.system.getHomeDir();
    let dir  = '/.local/share/wine-launcher/patches';
    let path = `${home}${dir}`;

    if (!this.fs.exists(path)) {
      this.fs.mkdir(path);
    }

    return path;
  }

  /**
   * @return {Patch[]}
   */
  findPatches(onlyActive = false) {
    let patchesDir = this.getPatchesDir();

    return _.sortBy(
      Utils.natsort(this.fs.glob(patchesDir + '/*'))
        .map(path => new Patch(path))
        .filter(patch => onlyActive ? patch.isActive() : true),
      [ 'name', 'sort' ]
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
   * @param {Patch} patch
   * @return {boolean}
   */
  append(patch) {
    let path = this.fs.basename(patch.getPath());
    let out  = this.getPatchesDir() + '/' + path;

    if (this.fs.exists(out)) {
      return false;
    }

    return this.fs.cp(patch.getPath(), out);
  }
}