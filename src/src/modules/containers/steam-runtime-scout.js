import AppFolders from "../app-folders";
import FileSystem from "../file-system";
import Network from "../network";
import System from "../system";
import Command from "../command";
import SteamRuntimeSoldier from "./steam-runtime-soldier";

export default class SteamRuntimeScout {
  /**
   * @type {string}
   */
  url = 'steam://install/1070560';

  /**
   * @type {string}
   */
  version = 'Ubuntu 12.04';

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
   * @type {SteamRuntimeSoldier}
   */
  soldier = null;

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

    this.soldier = new SteamRuntimeSoldier(appFolders, fs, network, system, command);
  }

  /**
   * @returns {string}
   */
  getName() {
    return 'scout';
  }

  /**
   * @returns {string}
   */
  getPath() {
    return this.system.getHomeDir() + '/.steam/steam/steamapps/common/SteamLinuxRuntime';
  }

  /**
   * @returns {boolean}
   */
  check() {
    return this.fs.exists(this.getPath()) && this.soldier.check();
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
    return this.soldier.install().then(() => {
      if (this.check() || !Boolean(this.command.exec('command -v steam'))) {
        return Promise.resolve();
      }

      this.command.exec(`steam ${this.url} &`);

      return Promise.resolve();
    });
  }

  /**
   * @param {string} cmd
   */
  run(cmd) {
    return `"${this.getPath()}/run-in-scout-on-soldier" -- ${cmd}`;
  }
}