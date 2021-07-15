import _          from "lodash";
import Utils      from "./utils";
import Prefix     from "./prefix";
import FileSystem from "./file-system";
import AppFolders from "./app-folders";

export default class Patch {

  /**
   * @type {string|null}
   */
  path = null;

  /**
   * @type {number}
   */
  sort = 500;

  /**
   * @type {number}
   */
  createdAt = 0;

  /**
   * @type {string}
   */
  name = '';

  /**
   * @type {object}
   */
  config = null;

  /**
   * @type {string}
   */
  defaultFile = '/patch.json';

  /**
   * @type {number}
   */
  static patchIndex = 0;

  /**
   * @type {Prefix}
   */
  prefix = null;

  /**
   * @type {AppFolders}
   */
  appFolders = null;

  /**
   * @type {FileSystem}
   */
  fs = null;

  /**
   * @param {string|null?} path
   * @param {AppFolders?} appFolders
   */
  constructor(path = null, appFolders = null) {
    this.path       = path;
    this.appFolders = appFolders || window.app.getAppFolders();
    this.fs         = this.appFolders.getFileSystem();

    this.loadConfig();

    if (null !== path && this.fs.exists(path) && !this.fs.exists(this.getPathFile())) {
      this.setConfigValue('name', this.fs.basename(path));
      this.setConfigValue('created', true);
      this.save();
    }
  }

  /**
   * @return {string}
   */
  getPath() {
    if (null === this.path) {
      // eslint-disable-next-line
      while (true) {
        let fullPathDir = this.appFolders.getPatchesDir() + `/${this.getNameFolder()}`;

        if (!this.fs.exists(fullPathDir)) {
          this.path = fullPathDir;
          return this.path;
        }

        fullPathDir = this.appFolders.getPatchesDir() + `/${this.getNameFolder(Patch.patchIndex++)}`;

        if (!this.fs.exists(fullPathDir)) {
          this.path = fullPathDir;
          return this.path;
        }
      }
    }

    return this.path;
  }

  /**
   * @return {string[]}
   */
  getRegistryFiles() {
    let path = this.getPath();

    if (!this.fs.exists(path)) {
      return [];
    }

    return Utils.natsort(this.fs.glob(path + '/*.reg'));
  }

  /**
   * @return {string}
   */
  getPathFile() {
    return this.getPath() + this.defaultFile;
  }

  /**
   * @return {string}
   */
  getCode() {
    return this.fs.basename(_.head(this.getPath().split('/patch.json')));
  }

  loadConfig() {
    let file = this.getPathFile();

    if (!this.config && this.fs.exists(file)) {
      this.config = Utils.jsonDecode(this.fs.fileGetContents(file));
    }

    if (!this.config) {
      this.config = this.getDefaultConfig();
    }

    this.sort      = _.get(this.config, 'sort', 500);
    this.createdAt = _.get(this.config, 'createdAt', 0);
    this.name      = _.get(this.config, 'name', '');
  }

  /**
   * @return {string}
   */
  getArch() {
    let wine = window.app.getKernel();
    return _.get(this.config, 'arch', wine.getWineArch());
  }

  getDefaultConfig() {
    let wine = window.app.getKernel();

    return {
      active:    true,
      name:      'patch',
      version:   '1.0.0',
      arch:      wine.getWineArch(),
      sort:      500,
      size:      0,
      created:   false,
      createdAt: new Date().getTime(),
    };
  }

  /**
   * @return {boolean}
   */
  isCreated() {
    return _.get(this.config, 'created', true);
  }

  /**
   * @return {boolean}
   */
  isSaved() {
    return this.fs.exists(this.getPathFile());
  }

  /**
   * @return {boolean}
   */
  isActive() {
    return _.get(this.config, 'active', true);
  }

  /**
   * @returns {Object}
   */
  getConfig() {
    return this.config;
  }

  /**
   * @return {boolean}
   */
  save() {
    if (!this.path || !this.config) {
      return false;
    }

    if (!this.fs.exists(this.path)) {
      this.fs.mkdir(this.path);
    }

    let name     = this.getConfigValue('name');
    let path     = this.getPath();
    let basename = this.fs.basename(this.getPath());

    let size = this.fs.getDirectorySize(path) - this.fs.size(this.getPathFile());
    this.setConfigValue('size', size);

    this.fs.filePutContents(this.getPathFile(), Utils.jsonEncode(this.config));

    if (!basename.includes(name)) {
      this.path   = null;
      let newPath = this.getPath();
      if (!this.fs.exists(newPath)) {
        this.fs.mv(path, newPath);
      }
    }

    return true;
  }

  remove() {
    let path = this.getPath();

    if (this.fs.exists(path)) {
      this.fs.rm(path);
    }
  }

  /**
   * @returns {Object}
   */
  getFlatConfig() {
    return _.cloneDeep(this.getConfig());
  }

  /**
   * @param {Object} config
   */
  setFlatConfig(config) {
    Object.keys(config).forEach((path) => {
      this.setConfigValue(path, config[path]);
    });
  }

  /**
   * @param {string} path 'app.time'
   * @param {*} value
   */
  setConfigValue(path, value) {
    this.config = _.set(this.config, path, value);
  }

  /**
   * @param {string} path
   * @return {*|null}
   */
  getConfigValue(path) {
    return _.get(this.config, path, null);
  }

  /**
   * @return {string}
   */
  getNameFolder(index = '') {
    let name    = this.getConfigValue('name');
    let version = this.getConfigValue('version');
    let arch    = 'win64' === this.getConfigValue('arch') ? 'x86_64' : 'x86';

    return `${name}${'1.0.0' === version ? '' : '-' + version}${index ? '-' + index : ''}-${arch}`;
  }
}