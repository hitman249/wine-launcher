import _          from "lodash";
import AppFolders from "../app-folders";
import FileSystem from "../file-system";
import Network    from "../network";
import System     from "../system";
import VDF        from "simple-vdf";

export default class Steam {
  /**
   * @type {string}
   */
  path = '/.steam/steam/config/config.vdf';

  /**
   * @type {object|null}
   */
  data = null;

  /**
   * @type {AppFolders}
   */
  appFolders = null;

  /**
   * @type {FileSystem}
   */
  fs = null;

  /**
   * @type {Network}
   */
  network = null;

  /**
   * @type {System}
   */
  system = null;

  /**
   * @param {AppFolders} appFolders
   * @param {FileSystem} fs
   * @param {Network} network
   * @param {System} system
   */
  constructor(appFolders, fs, network, system) {
    this.appFolders = appFolders;
    this.fs         = fs;
    this.network    = network;
    this.system     = system;
  }

  /**
   * @return {string}
   */
  getConfigPath() {
    return '/home/' + this.system.getUserName() + this.path;
  }

  /**
   * @return {{}}
   */
  getConfig() {
    let path = this.getConfigPath();

    if (!this.fs.exists(path)) {
      return {};
    }

    return VDF.parse(this.fs.fileGetContents(path));
  }

  /**
   * @return {string[]}
   */
  getSteamLibraryPaths() {
    let paths = [
      '/home/' + this.system.getUserName() + '/SteamLibrary',
      '/home/' + this.system.getUserName() + '/.local/Steam',
      '/home/' + this.system.getUserName() + '/.steam/steam',
    ];

    for (let i = 1; ; i++) {
      let path = _.get(this.getConfig(), 'InstallConfigStore.Software.Valve.Steam.BaseInstallFolder_' + i, '');

      if (!path) {
        break;
      }

      paths.push(path);
    }

    return _.filter(_.uniq(paths), path => this.fs.exists(path));
  }

  findProtons() {
    if (null !== this.data) {
      return this.data;
    }

    let paths = this.getSteamLibraryPaths();

    if (paths.length === 0) {
      return [];
    }

    let protons = [];

    paths.forEach((path) => {
      this.fs.glob(`${path}/steamapps/common/*`).forEach((path) => {
        if (this.fs.exists(`${path}/dist/bin`)) {
          protons.push({
            name:     this.fs.basename(path),
            type:     'file',
            download: () => Promise.resolve(`${path}/dist`),
          });
        }
      });
    });

    this.data = protons.reverse();

    return this.data;
  }

  /**
   * @return {{name: string, type: string, nested: (function(): Promise)}}
   */
  getElement() {
    let protons = this.findProtons();

    if (protons.length === 0) {
      return null;
    }

    return {
      name:   'Steam',
      type:   'dir',
      nested: () => this.getList(),
    };
  }

  /**
   * @return {Promise}
   */
  getList() {
    let promise = Promise.resolve();

    if (null === this.data) {
      promise = promise.then(() => {
        this.data = this.findProtons()
      });
    }

    return promise.then(() => this.data);
  }
}