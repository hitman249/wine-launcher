import FileSystem from "./modules/file-system";
import AppFolders from "./modules/app-folders";
import Config     from "./modules/config";
import Wine       from "./modules/wine";
import Command    from "./modules/command";
import System     from "./modules/system";
import Driver     from "./modules/driver";
import Network    from "./modules/network";
import Update     from "./modules/update";
import Monitor    from "./modules/monitor";
import Replaces   from "./modules/replaces";
import Patch      from "./modules/patch";
import Registry   from "./modules/registry";
import Utils      from "./modules/utils";

class App {

    CONFIG      = new Config();
    COMMAND     = new Command(this.CONFIG);
    FILE_SYSTEM = new FileSystem(this.CONFIG);
    NETWORK     = new Network(this.CONFIG);
    APP_FOLDERS = new AppFolders(this.CONFIG, this.FILE_SYSTEM);
    WINE        = new Wine(this.CONFIG, this.COMMAND, this.FILE_SYSTEM);
    SYSTEM      = new System(this.CONFIG, this.COMMAND, this.FILE_SYSTEM);
    DRIVER      = new Driver(this.CONFIG, this.COMMAND, this.SYSTEM, this.FILE_SYSTEM);
    UPDATE      = new Update(this.CONFIG, this.COMMAND, this.SYSTEM, this.FILE_SYSTEM, this.NETWORK);
    MONITOR     = new Monitor(this.CONFIG, this.COMMAND, this.SYSTEM, this.FILE_SYSTEM, this.WINE);
    REPLACES    = new Replaces(this.CONFIG, this.COMMAND, this.SYSTEM, this.FILE_SYSTEM, this.MONITOR);
    PATCH       = new Patch(this.CONFIG, this.COMMAND, this.SYSTEM, this.FILE_SYSTEM);
    REGISTRY    = new Registry(this.CONFIG, this.COMMAND, this.SYSTEM, this.FILE_SYSTEM, this.REPLACES, this.WINE);
    UTILS       = Utils;

    constructor() {
        this.getAppFolders().create();
    }

    /**
     * @returns {FileSystem}
     */
    getFileSystem() {
        return this.FILE_SYSTEM;
    }

    /**
     * @returns {Config}
     */
    getConfig() {
        return this.CONFIG;
    }

    /**
     * @returns {Command}
     */
    getCommand() {
        return this.COMMAND;
    }

    /**
     * @returns {AppFolders}
     */
    getAppFolders() {
        return this.APP_FOLDERS;
    }

    /**
     * @returns {Wine}
     */
    getWine() {
        return this.WINE;
    }

    /**
     * @returns {System}
     */
    getSystem() {
        return this.SYSTEM;
    }

    /**
     * @returns {Driver}
     */
    getDriver() {
        return this.DRIVER;
    }

    /**
     * @returns {Network}
     */
    getNetwork() {
        return this.NETWORK;
    }

    /**
     * @returns {Update}
     */
    getUpdate() {
        return this.UPDATE;
    }

    /**
     * @returns {Monitor}
     */
    getMonitor() {
        return this.MONITOR;
    }

    /**
     * @returns {Replaces}
     */
    getReplaces() {
        return this.REPLACES;
    }

    /**
     * @returns {Patch}
     */
    getPatch() {
        return this.PATCH;
    }

    /**
     * @returns {Registry}
     */
    getRegistry() {
        return this.REGISTRY;
    }

    /**
     * @returns {Utils}
     */
    getUtils() {
        return this.UTILS;
    }
}

export default new App();