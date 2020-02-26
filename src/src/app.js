import FileSystem from "./modules/file-system";
import AppFolders from "./modules/app-folders";
import Config     from "./modules/config";
import Wine       from "./modules/wine";
import Command    from "./modules/command";
import System     from "./modules/system";

class App {

    CONFIG      = new Config();
    COMMAND     = new Command();
    FILE_SYSTEM = new FileSystem();
    APP_FOLDERS = new AppFolders(this.CONFIG, this.FILE_SYSTEM);
    WINE        = new Wine(this.CONFIG, this.COMMAND, this.FILE_SYSTEM);
    SYSTEM      = new System(this.CONFIG, this.COMMAND, this.FILE_SYSTEM);

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
}

export default new App();