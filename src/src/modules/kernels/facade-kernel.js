import AppFolders from "../app-folders";
import FileSystem from "../file-system";
import Update     from "../update";
import Prefix     from "../prefix";
import System     from "../system";
import Wine       from "./wine";
import Proton     from "./proton";

export default class FacadeKernel {
  /**
   * @type {AppFolders}
   */
  appFolders = null;

  /**
   * @type {Update}
   */
  update = null;

  /**
   * @type {Prefix}
   */
  prefix = null;

  /**
   * @type {System}
   */
  system = null;

  /**
   * @type {Wine|Proton}
   */
  kernel = null;

  /**
   * @param {AppFolders} appFolders
   * @param {FileSystem} fs
   * @param {Update} update
   * @param {Prefix} prefix
   * @param {System} system
   */
  constructor(appFolders, fs, update, prefix, system) {
    this.appFolders = appFolders;
    this.fs         = fs;
    this.update     = update;
    this.prefix     = prefix;
    this.system     = system;
  }

  /**
   * @return {Wine|Proton}
   */
  getKernel() {
    if (null === this.kernel) {
      this.kernel = this.checkOfProton()
        ? new Proton(this.appFolders, this.fs, this.update, this.system, this.prefix)
        : new Wine(this.appFolders, this.fs, this.update, this.system, this.prefix);
    }

    return this.kernel;
  }

  /**
   * @return {boolean}
   */
  checkOfProton() {
    let protonFile = this.appFolders.getProtonFile();

    if (!this.fs.exists(protonFile)) {
      return false;
    }

    return this.fs.isFile(protonFile);
  }

  clear() {
    delete this.kernel;
    this.kernel = null;
  }
}