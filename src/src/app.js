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
import WinePrefix from "./modules/wine-prefix";
import Task       from "./modules/task";
import Prefix     from "./modules/prefix";
import Snapshot   from "./modules/snapshot";

class App {

    UTILS       = Utils;
    PREFIX      = new Prefix();
    CONFIG      = new Config(null, this.PREFIX);
    COMMAND     = new Command(this.PREFIX, this.CONFIG);
    FILE_SYSTEM = new FileSystem(this.PREFIX, this.COMMAND);
    NETWORK     = new Network();
    APP_FOLDERS = new AppFolders(this.PREFIX, this.FILE_SYSTEM);
    SYSTEM      = new System(this.PREFIX, this.COMMAND, this.FILE_SYSTEM);
    DRIVER      = new Driver(this.COMMAND, this.SYSTEM, this.FILE_SYSTEM);
    UPDATE      = new Update(this.PREFIX, this.FILE_SYSTEM, this.NETWORK);
    WINE        = new Wine(this.PREFIX, this.COMMAND, this.FILE_SYSTEM, this.UPDATE);
    MONITOR     = new Monitor(this.PREFIX, this.COMMAND, this.SYSTEM, this.FILE_SYSTEM, this.WINE);
    REPLACES    = new Replaces(this.PREFIX, this.SYSTEM, this.FILE_SYSTEM, this.MONITOR);
    PATCH       = new Patch(this.PREFIX, this.COMMAND, this.SYSTEM, this.FILE_SYSTEM);
    REGISTRY    = new Registry(this.PREFIX, this.FILE_SYSTEM, this.REPLACES, this.WINE);
    WINE_PREFIX = new WinePrefix(this.PREFIX, this.CONFIG, this.SYSTEM, this.FILE_SYSTEM, this.WINE, this.REPLACES, this.REGISTRY, this.PATCH);
    SNAPSHOT    = new Snapshot(this.PREFIX, this.FILE_SYSTEM, this.REPLACES, this.WINE, this.SYSTEM);

    constructor() {
        this.getAppFolders().create();
        this.getWinePrefix().create();

        // this.getWine().winetricks('dxvk');
    }

    /**
     * @param {Config} config
     * @return {Task}
     */
    createTask(config) {
        return new Task(config, this.PREFIX, this.FILE_SYSTEM, this.MONITOR);
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

    /**
     * @returns {Prefix}
     */
    getPrefix() {
        return this.PREFIX;
    }

    /**
     * @returns {WinePrefix}
     */
    getWinePrefix() {
        return this.WINE_PREFIX;
    }

    /**
     * @return {Snapshot}
     */
    getSnapshot() {
        return this.SNAPSHOT;
    }
}

export default new App();