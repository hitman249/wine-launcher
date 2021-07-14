import _          from "lodash";
import FileSystem from "./file-system";
import AppFolders from "./app-folders";

export default class Symlink {

  /**
   * @type {string[]}
   */
  extensions = [ 'cfg', 'conf', 'ini', 'inf', 'log', 'sav', 'save', 'config', 'con', 'profile', 'ltx' ];

  /**
   * @type {AppFolders}
   */
  appFolders = null;

  /**
   * @type {FileSystem}
   */
  fs = null;

  /**
   * @param {AppFolders} appFolders
   * @param {FileSystem} fs
   */
  constructor(appFolders, fs) {
    this.appFolders = appFolders;
    this.fs         = fs;
  }

  /**
   * @return {{}}
   */
  getDirs() {
    let result      = {};
    let symlinksDir = this.fs.basename(this.appFolders.getGamesSymlinksDir());

    this.fs.glob(this.appFolders.getGamesDir() + '/*').forEach((path) => {
      let name = this.fs.basename(path);

      if (name !== symlinksDir && this.fs.isDirectory(path)) {
        if (this.fs.isSymbolicLink(path) && this.fs.exists(this.appFolders.getGamesSymlinksDir() + '/' + name)) {
          result[name] = true;
        } else if (!this.fs.isSymbolicLink(path)) {
          result[name] = false;
        }
      }
    });

    return result;
  }

  /**
   * @param {string} folder
   * @return {boolean}
   */
  cloneDir(folder) {
    folder = _.trim(folder, '/');

    if (!folder || !this.fs.exists(this.appFolders.getGamesDir() + `/${folder}`)) {
      return false;
    }

    let symlinks  = this.appFolders.getSavesSymlinksDir();
    let _symlinks = this.appFolders.getGamesSymlinksDir();
    let games     = this.appFolders.getGamesDir();

    let pathIn  = `${games}/${folder}`;
    let pathOut = `${symlinks}/` + this.fs.relativePath(pathIn, _symlinks);

    this.fs.mkdir(pathOut);

    this.fs.glob(`${pathIn}/*`).forEach(path => {
      if (this.fs.isDirectory(path)) {
        this.cloneDir(this.fs.relativePath(path, games));
      } else {
        let ext  = this.fs.extension(path).toLowerCase();
        let dest = `${symlinks}/` + this.fs.relativePath(path, _symlinks);

        if (this.extensions.indexOf(ext) !== -1) {
          this.fs.cp(path, dest);
        } else {
          this.fs.ln(this.fs.relativePath(path), dest);
        }
      }
    });

    return true;
  }

  /**
   * @param {string} folder
   * @return {boolean}
   */
  replace(folder) {
    folder = _.trim(folder, '/');

    if (!folder || !this.fs.exists(this.appFolders.getGamesDir() + `/${folder}`)) {
      return false;
    }

    let symlinks  = this.appFolders.getSavesSymlinksDir();
    let _symlinks = this.appFolders.getGamesSymlinksDir();
    let games     = this.appFolders.getGamesDir();

    if (!this.fs.exists(symlinks)) {
      this.fs.mkdir(symlinks);
    }
    if (!this.fs.exists(_symlinks)) {
      this.fs.mkdir(_symlinks);
    }

    this.fs.mv(`${games}/${folder}`, `${_symlinks}/${folder}`);
    this.cloneDir(this.fs.relativePath(`${_symlinks}/${folder}`, games));
    this.fs.lnOfRoot(`${symlinks}/${folder}`, `${games}/${folder}`);

    return true;
  }

  /**
   * @param {string} folder
   * @return {boolean}
   */
  revert(folder) {
    folder = _.trim(folder, '/');

    if (!folder || !this.fs.exists(this.appFolders.getGamesSymlinksDir() + `/${folder}`)) {
      return false;
    }

    let symlinks  = this.appFolders.getSavesSymlinksDir();
    let _symlinks = this.appFolders.getGamesSymlinksDir();
    let games     = this.appFolders.getGamesDir();

    if (this.fs.exists(`${games}/${folder}`)) {
      this.fs.rm(`${games}/${folder}`);
    }
    if (this.fs.exists(`${symlinks}/${folder}`)) {
      this.fs.rm(`${symlinks}/${folder}`);
    }

    this.fs.mv(`${_symlinks}/${folder}`, `${games}/${folder}`);

    return true;
  }
}