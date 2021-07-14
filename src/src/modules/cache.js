import _          from "lodash";
import Utils      from "./utils";
import FileSystem from "./file-system";
import AppFolders from "./app-folders";

export default class Cache {
  /**
   * @type {AppFolders}
   */
  appFolders = null;

  /**
   * @type {FileSystem}
   */
  fs = null;

  /**
   * @type {object|null}
   */
  cache = null;

  /**
   * @type {string|null}
   */
  path = null;

  constructor(appFolders) {
    this.appFolders = appFolders;
    this.fs     = this.appFolders.getFileSystem();
    this.path   = this.appFolders.getCacheDir() + '/cache.json';
  }

  /**
   * @param {string} key
   * @param {Function} callable
   * @return {string|number|boolean|null}
   */
  remember(key, callable) {
    if (this.isset(key)) {
      return this.get(key);
    }

    let value = callable();
    this.set(key, value);

    return value;
  }

  /**
   * @param {string} key
   * @return {string|number|boolean|null}
   */
  get(key) {
    this._read();
    return _.get(this.cache, key, null);
  }

  /**
   * @param {string} key
   * @param {string|number|boolean} value
   */
  set(key, value) {
    if (null === this.cache) {
      this.cache = {};
    }

    _.set(this.cache, key, value);
    this._save();
  }

  /**
   * @param {string} key
   * @return {boolean}
   */
  isset(key) {
    this._read();
    if (null === this.cache) {
      return false;
    }

    return undefined !== _.get(this.cache, key, undefined);
  }

  /**
   * @param {string|null} key
   */
  reset(key = null) {
    if (null === key) {
      this.cache = {};
    } else {
      _.unset(this.cache, key);
    }

    this._save();
  }

  _read() {
    if (null === this.cache) {
      if (this.fs.exists(this.path)) {
        this.cache = Utils.jsonDecode(this.fs.fileGetContents(this.path));
      }
    }

    if (null === this.cache) {
      this.cache = {};
    }
  }

  _save() {
    let dir = this.appFolders.getCacheDir();

    if (!this.fs.exists(dir)) {
      this.fs.mkdir(dir);
    }

    this.fs.filePutContents(this.path, Utils.jsonEncode(this.cache || {}));
  }
}