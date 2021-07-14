import action     from "../store/action";
import Utils      from "./utils";
import FileSystem from "./file-system";
import AppFolders from "./app-folders";
import Command    from "./command";
import Update     from "./update";
import System     from "./system";

export default class Mount {
  /**
   * @type {boolean}
   */
  mounted = false;

  /**
   * @type {string|null}
   */
  folder = null;

  /**
   * @type {string|null}
   */
  squashfs = null;

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
   * @param {string} folder
   */
  constructor(appFolders, command, fs, update, system, folder) {
    this.appFolders = appFolders;
    this.command    = command;
    this.fs         = fs;
    this.update     = update;
    this.system     = system;
    this.folder     = folder;
    this.squashfs   = `${this.folder}.squashfs`;

    this.system.registerShutdownFunction(() => {
      let start = false;

      if (this.isMounted()) {
        start = true;
        action.notifyCustom(window.i18n.t('app.unmount') + ': ' + this.fs.basename(this.folder), window.i18n.t('app.in-progress'));
      }

      return this.unmount().then(() => {
        if (start) {
          if (this.isMounted()) {
            action.notifyError(window.i18n.t('app.unmount') + ': ' + this.fs.basename(this.folder), window.i18n.t('app.error'));
          } else {
            action.notifySuccess(window.i18n.t('app.unmount') + ': ' + this.fs.basename(this.folder), window.i18n.t('app.success'));
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
    if (!this.fs.exists(this.squashfs) || this.isMounted()) {
      return Promise.resolve();
    }

    return this.unmount().then(() => {
      if (this.isMounted()) {
        return;
      }

      if (!this.fs.exists(this.folder)) {
        this.fs.mkdir(this.folder);
      }

      this.mounted = true;

      return this.squashfuse();
    });
  }

  /**
   * @return {Promise}
   */
  unmount() {
    if (!this.fs.exists(this.squashfs) || !this.fs.exists(this.folder)) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let i = 0;

      let iterator = () => {
        if (i++ >= 9) {
          return resolve();
        }

        if (!this.isMounted() || (this.isMounted() && !this.fs.exists(this.folder))) {
          this.mounted = false;
          return resolve();
        }

        if (this.fs.exists(this.folder)) {
          this.command.exec('fusermount -u ' + Utils.quote(this.folder));
          this.fs.rm(this.folder);
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
  squashfuse() {
    return this.update.downloadSquashfuse().then(() => {
      let squashfuse = Utils.quote(this.appFolders.getSquashfuseFile());
      let image      = Utils.quote(this.squashfs);
      let dir        = Utils.quote(this.folder);

      return this.command.exec(`${squashfuse} ${image} ${dir}`);
    });
  }

  /**
   * @return {number}
   */
  size() {
    if (this.isMounted()) {
      return this.fs.size(this.squashfs);
    }

    return this.fs.size(this.folder);
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
  getSquashfsFile() {
    return this.squashfs;
  }
}