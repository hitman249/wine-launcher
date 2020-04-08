import FileSystem from "./file-system";
import Utils      from "./utils";
import Prefix     from "./prefix";

export default class AppFolders {

    /**
     * @type {string[]}
     */
    folders = [];

    /**
     * @type {Prefix}
     */
    prefix = null;

    /**
     * @type {FileSystem}
     */
    fs = null;

    /**
     * @param {Prefix} prefix
     * @param {FileSystem} fs
     */
    constructor(prefix, fs) {
        this.prefix  = prefix;
        this.fs      = fs;
        this.folders = [
            prefix.getRootDir(),
            prefix.getBinDir(),
            prefix.getDataDir(),
            prefix.getLogsDir(),
            prefix.getCacheDir(),
            prefix.getConfigsDir(),
            prefix.getLibsDir(),
            prefix.getLibs64Dir(),
            prefix.getShareDir(),
            prefix.getGamesDir(),
            prefix.getGamesSymlinksDir(),
            prefix.getSavesDir(),
            prefix.getSavesSymlinksDir(),
            prefix.getPatchesDir(),
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

        let prefix = Utils.jsonEncode(this.prefix.getConfig());

        this.fs.filePutContents(this.prefix.getPath(), prefix);

        let saveFolders = this.prefix.getDefaultSaveFolders();

        Object.keys(saveFolders).forEach(folder => this.fs.mkdir(`${this.prefix.getSavesDir()}/${folder}`));

        this.fs.filePutContents(this.prefix.getSavesFoldersFile(), Utils.jsonEncode(saveFolders));
    }

    /**
     * @returns {boolean}
     */
    isCreated() {
        return this.fs.exists(this.prefix.getDataDir()) && this.fs.exists(this.prefix.getBinDir());
    }
}