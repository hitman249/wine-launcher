import FileSystem from "./modules/file-system";
import AppFolders from "./modules/app-folders";
import Config     from "./modules/config";

class App {

    CONFIG      = new Config();
    FILE_SYSTEM = new FileSystem();
    APP_FOLDERS = new AppFolders(this.CONFIG, this.FILE_SYSTEM);

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
     * @returns {AppFolders}
     */
    getAppFolders() {
        return this.APP_FOLDERS;
    }
}

export default new App();