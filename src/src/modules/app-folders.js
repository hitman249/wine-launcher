import Config     from "./config";
import FileSystem from "./file-system";
import Utils      from "./utils";

export default class AppFolders {

    /**
     * @type {string[]}
     */
    folders = [];

    /**
     * @type {Config}
     */
    config = null;

    /**
     * @type {FileSystem}
     */
    fs = null;

    /**
     * @param {Config} config
     * @param {FileSystem} fs
     */
    constructor(config, fs) {
        this.config  = config;
        this.fs      = fs;
        this.folders = [
            config.getRootDir(),
            config.getBinDir(),
            config.getDataDir(),
            config.getLogsDir(),
            config.getCacheDir(),
            config.getConfigsDir(),
            config.getLibsDir(),
            config.getLibs64Dir(),
            config.getGamesDir(),
            config.getGamesSymlinksDir(),
            config.getSavesDir(),
            config.getSavesSymlinksDir(),
            config.getPatchApplyDir(),
            config.getPatchAutoDir(),
        ];
    }

    create() {
        if (this.isCreated()) {
            return false;
        }

        this.folders.forEach((path) => {
            if (!this.fs.exists(path)) {
                this.fs.mkdir(path);
            }
        });

        let config = Utils.jsonEncode(this.config.getConfig());

        this.fs.filePutContents(this.config.getConfigFile(), config);

        let saveFolders = this.config.getDefaultSaveFolders();

        Object.keys(saveFolders).forEach(folder => this.fs.mkdir(`${this.config.getSavesDir()}/${folder}`));

        this.fs.filePutContents(this.config.getSavesFoldersFile(), Utils.jsonEncode(saveFolders));
    }

    /**
     * @returns {boolean}
     */
    isCreated() {
        return this.fs.exists(this.config.getDataDir()) && this.fs.exists(this.config.getBinDir());
    }
}