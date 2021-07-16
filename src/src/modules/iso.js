import action     from "../store/action";
import Utils      from "./utils";
import FileSystem from "./file-system";
import AppFolders from "./app-folders";
import Command    from "./command";
import Update     from "./update";
import System     from "./system";

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
   * @type {AppFolders}
   */
  appFolders = null;

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
   * @param {AppFolders} appFolders
   * @param {Command} command
   * @param {FileSystem} fs
   * @param {Update} update
   * @param {System} system
   * @param {string} image
   */
  constructor(appFolders, command, fs, update, system, image) {
    let wine = window.app.getKernel();

    this.appFolders    = appFolders;
    this.command       = command;
    this.fs            = fs;
    this.update        = update;
    this.system        = system;
    this.image         = image;
    this.folder        = wine.getDosDevices() + '/d:';
    this.folderMounted = this.appFolders.getCacheDir() + '/iso';

    this.system.registerShutdownFunction(() => {
      let start = false;

      if (this.isMounted()) {
        start = true;
      }

      return this.unmount().then(() => {
        if (start) {
          if (this.isMounted()) {
            action.notifyError(window.i18n.t('app.unmount') + ': ' + this.fs.basename(this.image), window.i18n.t('app.error'));
          } else {
            action.notifySuccess(window.i18n.t('app.unmount') + ': ' + this.fs.basename(this.image), window.i18n.t('app.success'));
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

      let wine = window.app.getKernel();

      wine.run('reg', 'add', 'HKEY_LOCAL_MACHINE\\Software\\Wine\\Drives', '/v', 'd:', '/d', 'cdrom', '/f');

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

    let wine = window.app.getKernel();

    wine.run('reg', 'delete', 'HKEY_LOCAL_MACHINE\\Software\\Wine\\Drives', '/v', 'd:', '/f');

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
          this.command.exec('fusermount -u ' + Utils.quote(this.folderMounted));
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
      let fuseiso = Utils.quote(this.appFolders.getFuseisoFile());
      let image   = Utils.quote(this.image);
      let dir     = Utils.quote(this.folderMounted);

      return this.command.exec(`${fuseiso} -p ${image} ${dir}`);
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
    let cacheDir = this.appFolders.getCacheDir();
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