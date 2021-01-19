import Prefix     from "./prefix";
import System     from "./system";
import FileSystem from "./file-system";
import Monitor    from "./monitor";

export default class Replaces {

  /**
   * @type {Prefix}
   */
  prefix = null;

  /**
   * @type {System}
   */
  system = null;

  /**
   * @type {FileSystem}
   */
  fs = null;

  /**
   * @type {Monitor}
   */
  monitor = null;

  /**
   * @param {Prefix} prefix
   * @param {System} system
   * @param {FileSystem} fs
   * @param {Monitor} monitor
   */
  constructor(prefix, system, fs, monitor) {
    this.prefix  = prefix;
    this.system  = system;
    this.fs      = fs;
    this.monitor = monitor;
  }

  /**
   * @return {{"{HOSTNAME}": string, "{DRIVE_C}": string, "{WIDTH}": string, "{DOSDEVICES}": string, "{PREFIX}": string, "{ROOT_DIR}": string, "{HEIGHT}": string, "{USER}": string}}
   */
  getReplaces() {
    return {
      '{WIDTH}':      this.monitor.getWidth(),
      '{HEIGHT}':     this.monitor.getHeight(),
      '{USER}':       this.system.getUserName(),
      '{HOSTNAME}':   this.system.getHostname(),
      '{PREFIX}':     this.prefix.getWinePrefix(),
      '{DRIVE_C}':    this.prefix.getWineDriveC(),
      '{DOSDEVICES}': this.prefix.getWineDosDevices(),
      '{ROOT_DIR}':   this.prefix.getRootDir(),
    };
  }

  /**
   * @param {string} text
   * @return {string}
   */
  replaceByString(text) {
    let replaces = this.getReplaces();

    Object.keys(replaces).forEach((search) => {
      text = text.split(search).join(replaces[search]);
    });

    return text;
  }

  /**
   * @param {string} path
   * @param {boolean} backup
   * @return {boolean}
   */
  replaceByFile(path, backup = false) {
    if (backup) {
      let backupPath = `${path}.backup`;

      if (!this.fs.exists(backupPath)) {
        this.fs.cp(path, backupPath);
      }

      if (this.fs.exists(backupPath)) {
        let text = this.fs.fileGetContents(backupPath, true);
        this.fs.filePutContents(path, this.replaceByString(text));

        return true;
      }
    } else if (this.fs.exists(path)) {
      let text = this.fs.fileGetContents(path, true);
      this.fs.filePutContents(path, this.replaceByString(text));

      return true;
    }

    return false;
  }

  /**
   * @param {string} text
   * @return {string}
   */
  replaceToTemplateByString(text) {
    let username = this.system.getUserName();
    let hostname = this.system.getUserName();
    let replaces = {
      [this.prefix.getRootDir()]: '{ROOT_DIR}',

      [`'${username}'`]:   "'{USER}'",
      [`"${username}"`]:   '"{USER}"',
      [`/${username}/`]:   '/{USER}/',
      [`\\${username}\\`]: '\\{USER}\\',

      [`'${hostname}'`]:   "'{HOSTNAME}'",
      [`"${hostname}"`]:   '"{HOSTNAME}"',
      [`/${hostname}/`]:   '/{HOSTNAME}/',
      [`\\${hostname}\\`]: '\\{HOSTNAME}\\',
    };

    Object.keys(replaces).forEach((search) => {
      text = text.split(search).join(replaces[search]);
    });

    return text;
  }
}