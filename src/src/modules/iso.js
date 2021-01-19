import action     from "../store/action";
import Utils      from "./utils";
import FileSystem from "./file-system";
import Prefix     from "./prefix";
import Command    from "./command";
import Update     from "./update";
import System     from "./system";
import Wine       from "./wine";

export default class Iso {
  /**
   * @type {boolean}
   */
  mounted = false;

  /**
   * @type {string|null}
   */
  image = null;

  /**
   * @type {string|null}
   */
  folder = null;

  /**
   * @type {string|null}
   */
  folderMounted = null;

  /**
   * @type {Prefix}
   */
  prefix = null;

  /**
   * @type {Command}
   */
  command = null;

  /**
   * @type {FileSystem}
   */
  fs = null;

  /**
   * @type {Update}
   */
  update = null;

  /**
   * @type {System}
   */
  system = null;

  /**
   * @type {Wine}
   */
  wine = null;

  /**
   * @param {Prefix} prefix
   * @param {Command} command
   * @param {FileSystem} fs
   * @param {Update} update
   * @param {System} system
   * @param {Wine} wine
   * @param {string} image
   */
  constructor(prefix, command, fs, update, system, wine, image) {
    this.prefix        = prefix;
    this.command       = command;
    this.fs            = fs;
    this.update        = update;
    this.system        = system;
    this.wine          = wine;
    this.image         = image;
    this.folder        = this.prefix.getWineDosDevices() + '/d:';
    this.folderMounted = this.prefix.getCacheDir() + '/iso';

    this.system.registerShutdownFunction(() => {
      let start = false;

      if (this.isMounted()) {
        start = true;
      }

      return this.unmount().then(() => {
        if (start) {
          if (this.isMounted()) {
            action.notifyError('Размонтирование: ' + this.fs.basename(this.image), 'Ошибка');
          } else {
            action.notifySuccess('Размонтирование: ' + this.fs.basename(this.image), 'Успешно');
          }
        }
      });
    });
  }

  /**
   * @return {boolean}
   */
  isMounted() {
    return this.mounted;
  }

  /**
   * @return {Promise}
   */
  mount() {
    if (!this.fs.exists(this.image) || this.isMounted()) {
      return Promise.resolve();
    }

    return this.unmount().then(() => {
      if (this.isMounted()) {
        return;
      }

      if (this.fs.exists(this.image) && !this.fs.exists(this.folderMounted)) {
        this.fs.mkdir(this.folderMounted);
      }

      this.wine.run('reg', 'add', 'HKEY_LOCAL_MACHINE\\Software\\Wine\\Drives', '/v', 'd:', '/d', 'cdrom', '/f');

      this.mounted = true;

      return this.fuseiso().then(() => this.fs.lnOfRoot(this.folderMounted, this.folder));
    });
  }

  /**
   * @return {Promise}
   */
  unmount() {
    if (this.fs.exists(this.folder)) {
      this.fs.rm(this.folder);
    }

    this.wine.run('reg', 'delete', 'HKEY_LOCAL_MACHINE\\Software\\Wine\\Drives', '/v', 'd:', '/f');

    if (!this.fs.exists(this.image) || !this.fs.exists(this.folderMounted)) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let i = 0;

      let iterator = () => {
        if (i++ >= 9) {
          return resolve();
        }

        if (!this.isMounted() || (this.isMounted() && !this.fs.exists(this.folderMounted))) {
          if (this.fs.exists(this.folderMounted)) {
            this.fs.rm(this.folderMounted);
          }

          this.mounted = false;
          return resolve();
        }

        if (this.fs.exists(this.folderMounted)) {
          this.command.run('fusermount -u ' + Utils.quote(this.folderMounted));
          this.fs.rm(this.folderMounted);

          if (this.fs.exists(this.folder)) {
            this.fs.rm(this.folder);
          }
        } else {
          this.mounted = false;
          return resolve();
        }

        return Utils.sleep(1000).then(() => iterator());
      };

      return iterator();
    });
  }

  /**
   * @return {Promise}
   */
  fuseiso() {
    return this.update.downloadFuseiso().then(() => {
      let fuseiso = Utils.quote(this.prefix.getFuseisoFile());
      let image   = Utils.quote(this.image);
      let dir     = Utils.quote(this.folderMounted);

      return this.command.run(`${fuseiso} -p ${image} ${dir}`);
    });
  }

  /**
   * @return {number}
   */
  size() {
    if (this.isMounted()) {
      return this.fs.size(this.image);
    }

    return this.fs.size(this.folderMounted);
  }

  /**
   * @return {string}
   */
  getFolder() {
    return this.folder;
  }

  /**
   * @return {string}
   */
  getFolderMounted() {
    return this.folderMounted;
  }

  /**
   * @return {string}
   */
  getImageFile() {
    return this.image;
  }

  /**
   * @param {string} folder
   * @return {boolean}
   */
  cloneDir(folder = 'iso') {
    let cacheDir = this.prefix.getCacheDir();
    let pathIn   = `${cacheDir}/${folder}`;
    let pathOut  = `${cacheDir}/install`;
    let postfix  = this.fs.relativePath(pathIn, `${cacheDir}/iso`);

    if (!this.fs.exists(`${pathOut}/${postfix}`)) {
      this.fs.mkdir(`${pathOut}/${postfix}`);
    }

    this.fs.glob(`${pathIn}/*`).forEach(path => {
      if (this.fs.isDirectory(path)) {
        this.cloneDir(this.fs.relativePath(path, cacheDir));
      } else {
        let dest = `${pathOut}/` + this.fs.relativePath(path, `${cacheDir}/iso`);
        this.fs.ln(this.fs.relativePath(path), dest);
      }
    });

    return true;
  }
}