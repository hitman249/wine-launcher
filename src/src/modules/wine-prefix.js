import Config     from "./config";
import Command    from "./command";
import System     from "./system";
import FileSystem from "./file-system";
import Monitor    from "./monitor";
import Wine       from "./wine";
import Replaces   from "./replaces";
import Utils      from "./utils";
import Registry   from "./registry";

export default class WinePrefix {
    /**
     * @type {Config}
     */
    config = null;

    /**
     * @type {Command}
     */
    command = null;

    /**
     * @type {System}
     */
    system = null;

    /**
     * @type {FileSystem}
     */
    fs = null;

    /**
     * @type {Wine}
     */
    wine = null;

    /**
     * @type {Replaces}
     */
    replaces = null;

    /**
     * @type {Registry}
     */
    registry = null;

    /**
     * @param {Config} config
     * @param {Command} command
     * @param {System} system
     * @param {FileSystem} fs
     * @param {Wine} wine
     * @param {Replaces} replaces
     * @param {Registry} registry
     */
    constructor(config, command, system, fs,  wine, replaces, registry) {
        this.config   = config;
        this.command  = command;
        this.system   = system;
        this.fs       = fs;
        this.wine     = wine;
        this.replaces = replaces;
        this.registry = registry;
    }

    /**
     * @returns {boolean}
     */
    isCreated() {
        return this.fs.exists(this.config.getWinePrefix());
    }

    create() {
        let wineBinDir = this.config.getWineDir() + '/bin';

        if (this.fs.exists(wineBinDir)) {
            this.fs.chmod(wineBinDir);
        }

        if (!this.isCreated()) {
            this.wine.boot();
            this.config.setWinePrefixInfo('version', this.wine.getVersion());
            this.config.getConfigReplaces().forEach(path => this.replaces.replaceByFile(path, true));
            this.updateSandbox();
            this.updateSaves();
            this.updateGameFolder();
            this.updateRegs();
        }
    }

    updateSandbox() {
        if (!this.config.isSandbox()) {
            return false;
        }

        let updateTimestampPath = this.config.getWinePrefix() + '/.update-timestamp';

        if (this.fs.exists(updateTimestampPath)) {
            return false;
        }

        this.fs.filePutContents(updateTimestampPath, 'disable');

        let driveZ = this.config.getWineDosDevices() + '/z:';

        if (this.fs.exists(driveZ)) {
            this.fs.rm(driveZ);
        }

        this.fs.glob(this.config.getWineDriveC() + '/users/' + this.system.getUserName() + '/*').forEach(path => {
            if (this.fs.isSymbolicLink(path)) {
                this.fs.rm(path);
                this.fs.mkdir(path);
            }
        });

        this.wine.reg('/d', 'HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Desktop\\Namespace\\{9D20AAE8-0625-44B0-9CA7-71889C2254D9}');

        return true;
    }

    updateSaves() {
        let path = this.config.getSavesFoldersFile();

        if (!this.fs.exists(path)) {
            return false;
        }

        if (true === this.config.getWinePrefixInfo('saves')) {
            return false;
        }

        this.config.setWinePrefixInfo('saves', true);

        let folders = Utils.jsonDecode(this.fs.fileGetContents(path));

        Object.keys(folders).forEach((folder) => {
            let saveFolderPath   = this.config.getSavesDir() + '/' + folder;
            let prefixFolderPath = this.config.getWineDriveC() + '/' + _.trim(this.replaces.replaceByString(folders[folder]), '/');

            this.fs.lnOfRoot(saveFolderPath, prefixFolderPath);
        });

        return true;
    }

    updateGameFolder() {
        let path = this.config.getGamesDir();
        let dest = this.config.getWinePrefixGameFolder();

        if (this.fs.exists(this.config.getWinePrefix()) && this.fs.exists(dest)) {
            return false;
        }

        this.fs.lnOfRoot(path, dest);

        return true;
    }

    updateRegs() {
        if (true === this.config.getWinePrefixInfo('registry')) {
            return false;
        }

        this.config.setWinePrefixInfo('registry', true);

        return this.registry.apply(this.config.getRegistryFiles());
    }
}