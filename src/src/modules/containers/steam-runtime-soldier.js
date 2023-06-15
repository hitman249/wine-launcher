import AppFolders from "../app-folders";
import FileSystem from "../file-system";
import Network from "../network";
import System from "../system";
import Command from "../command";

export default class SteamRuntimeSoldier {
  /**
   * @type {string}
   */
  url = 'steam://install/1391110';

  /**
   * @type {string}
   */
  version = 'Debian 10';

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
   * @type {Command}
   */
  command = null;

  /**
   * @param {AppFolders} appFolders
   * @param {FileSystem} fs
   * @param {Network} network
   * @param {System} system
   * @param {Command} command
   */
  constructor(appFolders, fs, network, system, command) {
    this.appFolders = appFolders;
    this.fs         = fs;
    this.network    = network;
    this.system     = system;
    this.command    = command;
  }

  /**
   * @returns {string}
   */
  getName() {
    return 'soldier';
  }

  /**
   * @returns {string}
   */
  getPath() {
    return this.system.getHomeDir() + '/.steam/steam/steamapps/common/SteamLinuxRuntime_soldier';
  }

  /**
   * @returns {boolean}
   */
  check() {
    return this.fs.exists(this.getPath());
  }

  /**
   * @returns {boolean}
   */
  isSupportLdLibraryPath() {
    return false;
  }

  /**
   * @returns {Promise<void>}
   */
  install() {
    if (this.check() || !Boolean(this.command.exec('command -v steam'))) {
      return Promise.resolve();
    }

    this.command.exec(`steam ${this.url} &`);

    return Promise.resolve();
  }

  /**
   * @param {string} cmd
   */
  run(cmd) {
    return `"${this.getPath()}/run" -- ${cmd}`;
  }
}