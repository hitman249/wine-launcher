import AppFolders from "../app-folders";
import FileSystem from "../file-system";
import Network from "../network";
import System from "../system";
import Prefix from "../prefix";
import Command from "../command";
import BottlesDevs from "./bottles-devs";
import SteamRuntimeScout from "./steam-runtime-scout";
import SteamRuntimeSoldier from "./steam-runtime-soldier";
import SteamRuntimeSniper from "./steam-runtime-sniper";

export default class FacadeContainer {
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
   * @type {Prefix}
   */
  prefix = null;

  /**
   * @type {Command}
   */
  command = null;

  /**
   * @type {SteamRuntimeScout | SteamRuntimeSoldier | SteamRuntimeSniper | BottlesDevs}
   */
  container = null;

  /**
   * @param {AppFolders} appFolders
   * @param {FileSystem} fs
   * @param {Network} network
   * @param {System} system
   * @param {Prefix} prefix
   * @param {Command} command
   */
  constructor(appFolders, fs, network, system, prefix, command) {
    this.appFolders = appFolders;
    this.fs         = fs;
    this.network    = network;
    this.system     = system;
    this.prefix     = prefix;
    this.command    = command;
  }

  /**
   * @returns {SteamRuntimeScout|SteamRuntimeSoldier|SteamRuntimeSniper|BottlesDevs|undefined}
   */
  getContainer() {
    if (null !== this.container && this.container.getName() === this.prefix.getWineContainer()) {
      return this.container;
    }

    switch (this.prefix.getWineContainer()) {
      case '':
        this.clear();
        return;
      case 'bottlesdev':
        this.container = new BottlesDevs(this.appFolders, this.fs, this.network, this.system, this.command);
        break;
      case 'scout':
        this.container = new SteamRuntimeScout(this.appFolders, this.fs, this.network, this.system, this.command);
        break;
      case 'soldier':
        this.container = new SteamRuntimeSoldier(this.appFolders, this.fs, this.network, this.system, this.command);
        break;
      case 'sniper':
        this.container = new SteamRuntimeSniper(this.appFolders, this.fs, this.network, this.system, this.command);
        break;
    }

    return null !== this.container ? this.container : undefined;
  }

  clear() {
    this.container = null;
  }

  /**
   * @returns {string|undefined}
   */
  getName() {
    let container = this.getContainer();

    if (!container) {
      return;
    }

    return container.getName();
  }

  /**
   * @returns {boolean}
   */
  check() {
    let container = this.getContainer();

    if (!container) {
      return true;
    }

    return container.check();
  }

  /**
   * @returns {Promise<void>}
   */
  install() {
    let container = this.getContainer();

    if (!container) {
      return Promise.resolve();
    }

    return container.install();
  }

  /**
   * @returns {boolean}
   */
  isSupportLdLibraryPath() {
    let container = this.getContainer();

    if (!container) {
      return true;
    }

    return container.isSupportLdLibraryPath();
  }

  /**
   * @param {string} cmd
   * @returns {string}
   */
  run(cmd) {
    let container = this.getContainer();

    if (!container) {
      return cmd;
    }

    return container.run(cmd);
  }
}