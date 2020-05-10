import Config     from "./config";
import Prefix     from "./prefix";
import System     from "./system";
import FileSystem from "./file-system";
import Wine       from "./wine";
import Replaces   from "./replaces";
import Utils      from "./utils";
import Registry   from "./registry";
import Patches    from "./patches";
import Dxvk       from "./dxvk";
import Fixes      from "./fixes";

export default class WinePrefix {
    /**
     * @type {Config}
     */
    config = null;

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
     * @type {Patches}
     */
    patches = null;

    /**
     * @type {Dxvk}
     */
    dxvk = null;

    /**
     * @type {Fixes}
     */
    fixes = null;

    /**
     * @param {Prefix} prefix
     * @param {Config} config
     * @param {System} system
     * @param {FileSystem} fs
     * @param {Wine} wine
     * @param {Replaces} replaces
     * @param {Registry} registry
     * @param {Patches} patches
     * @param {Dxvk} dxvk
     * @param {Fixes} fixes
     */
    constructor(prefix, config, system, fs, wine, replaces, registry, patches, dxvk, fixes) {
        this.prefix   = prefix;
        this.config   = config;
        this.system   = system;
        this.fs       = fs;
        this.wine     = wine;
        this.replaces = replaces;
        this.registry = registry;
        this.patches  = patches;
        this.dxvk     = dxvk;
        this.fixes    = fixes;
    }

    /**
     * @param {Config} config
     */
    setConfig(config) {
        this.config = config;
    }

    /**
     * @returns {boolean}
     */
    isCreated() {
        return this.fs.exists(this.prefix.getWinePrefix());
    }

    /**
     * @return {Promise}
     */
    create() {
        let promise = Promise.resolve();

        let wineBinDir = this.prefix.getWineDir() + '/bin';

        this.system.resetUserName();

        if (this.fs.exists(wineBinDir) && !this.fs.exists(this.prefix.getWineFile())) {
            this.fs.chmod(wineBinDir);
        }

        if (!this.isCreated()) {

            if ('win64' === this.prefix.getWineArch()) {
                let defaultPrefix = this.prefix.getWineDir() + '/share/default_pfx';

                if (this.fs.exists(defaultPrefix)) {
                    this.fs.cp(defaultPrefix, this.prefix.getWinePrefix());
                }
            }

            this.wine.boot();
            this.prefix.setWinePrefixInfo('version', this.wine.getVersion());
            this.prefix.setWinePrefixInfo('arch', this.prefix.getWineArch());
            this.prefix.getConfigReplaces().forEach(path => this.replaces.replaceByFile(path, true));
            this.updateSandbox();
            this.updateSaves();
            this.updateGameFolder();
            this.updateRegs();
            this.patches.apply();
            this.updateCsmt();
            this.updatePulse();
            this.updateWindowsVersion();

            promise = this.dxvk.update().then(() => this.fixes.update());
        }

        return promise;
    }

    /**
     * @return {Promise}
     */
    reCreate() {
        if (this.isCreated()) {
            this.fs.rm(this.prefix.getWinePrefix());
        }

        return this.create();
    }

    updateSandbox() {
        if (!this.prefix.isSandbox()) {
            return false;
        }

        let updateTimestampPath = this.prefix.getWinePrefix() + '/.update-timestamp';

        if (this.fs.exists(updateTimestampPath) && 'disable' === this.fs.fileGetContents(updateTimestampPath)) {
            return false;
        }

        this.fs.filePutContents(updateTimestampPath, 'disable');

        let driveZ = this.prefix.getWineDosDevices() + '/z:';

        if (this.fs.exists(driveZ)) {
            this.fs.rm(driveZ);
        }

        this.fs.glob(this.prefix.getWineDriveC() + '/users/' + this.system.getUserName() + '/*').forEach(path => {
            if (this.fs.isSymbolicLink(path)) {
                this.fs.rm(path);
                this.fs.mkdir(path);
            }
        });

        this.wine.reg('/d', 'HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Desktop\\Namespace\\{9D20AAE8-0625-44B0-9CA7-71889C2254D9}');

        return true;
    }

    updateSaves() {
        let path = this.prefix.getSavesFoldersFile();

        if (!this.fs.exists(path)) {
            return false;
        }

        if (true === this.prefix.getWinePrefixInfo('saves')) {
            return false;
        }

        this.prefix.setWinePrefixInfo('saves', true);

        let folders = Utils.jsonDecode(this.fs.fileGetContents(path));

        Object.keys(folders).forEach((folder) => {
            let saveFolderPath   = this.prefix.getSavesDir() + '/' + folder;
            let prefixFolderPath = this.prefix.getWineDriveC() + '/' + _.trim(this.replaces.replaceByString(folders[folder]), '/');

            this.fs.lnOfRoot(saveFolderPath, prefixFolderPath);
        });

        return true;
    }

    updateGameFolder() {
        let path      = this.prefix.getGamesDir();
        let dest      = this.prefix.getWinePrefixGameFolder();
        let logs      = this.prefix.getLogsDir();
        let logsDest  = this.prefix.getWinePrefixLogsDir();
        let cache     = this.prefix.getCacheDir();
        let cacheDest = this.prefix.getWinePrefixCacheDir();

        if (this.fs.exists(this.prefix.getWinePrefix()) && this.fs.exists(dest)) {
            return false;
        }

        this.fs.lnOfRoot(path, dest);
        this.fs.lnOfRoot(logs, logsDest);
        this.fs.lnOfRoot(cache, cacheDest);

        return true;
    }

    updateRegs() {
        if (true === this.prefix.getWinePrefixInfo('registry')) {
            return false;
        }

        this.prefix.setWinePrefixInfo('registry', true);

        return this.registry.apply(this.patches.getRegistryFiles());
    }

    updateCsmt() {
        if (!this.fs.exists(this.prefix.getWinePrefix()) || this.prefix.isBlocked()) {
            return false;
        }

        let csmt = this.config.isCsmt();

        if (this.prefix.getWinePrefixInfo('csmt') === csmt) {
            return false;
        }

        this.prefix.setWinePrefixInfo('csmt', csmt);

        let regs = [
            "Windows Registry Editor Version 5.00\n",
            "[HKEY_CURRENT_USER\\Software\\Wine\\Direct3D]\n",
        ];

        let path = this.prefix.getWineDriveC() + '/csmt.reg';

        if (csmt) {
            regs.push('"csmt"=-\n');
        } else {
            regs.push('"csmt"=dword:0\n');
        }

        this.fs.filePutContents(path, Utils.encode(regs.join('\n'), 'utf-16'));
        this.wine.reg(path);

        return true;
    }

    updatePulse() {
        if (!this.fs.exists(this.prefix.getWinePrefix()) || this.prefix.isBlocked()) {
            return false;
        }

        let pulseAudio = this.system.existsCommand('pulseaudio');
        let pulse      = this.config.isPulse() && pulseAudio;

        if (this.prefix.getWinePrefixInfo('pulse') === pulse) {
            return false;
        }

        this.prefix.setWinePrefixInfo('pulse', pulse);

        let regs = [
            "Windows Registry Editor Version 5.00\n",
            "[HKEY_CURRENT_USER\\Software\\Wine\\Drivers]\n",
        ];

        let path = this.prefix.getWineDriveC() + '/sound.reg';

        if (pulse) {
            regs.push('"Audio"="pulse"\n');
        } else {
            regs.push('"Audio"="alsa"\n');
        }

        this.fs.filePutContents(path, Utils.encode(regs.join('\n'), 'utf-16'));
        this.wine.reg(path);

        return true;
    }

    updateWindowsVersion() {
        if (!this.fs.exists(this.prefix.getWinePrefix()) || this.prefix.isBlocked()) {
            return false;
        }

        let winver = this.prefix.getWindowsVersion();

        if (this.prefix.getWinePrefixInfo('winver') === winver) {
            return false;
        }

        this.prefix.setWinePrefixInfo('winver', winver);

        let regs = [
            "Windows Registry Editor Version 5.00\n",
        ];

        let path   = this.prefix.getWineDriveC() + '/winver.reg';
        let append = {};

        switch (winver) {
            case 'win2k':
                append = {
                    'HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows NT\\CurrentVersion': {
                        'CSDVersion':         'Service Pack 4',
                        'CurrentBuildNumber': '2195',
                        'CurrentVersion':     '5.0',
                    },
                    'HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Control\\Windows':     {
                        'CSDVersion': 'dword:00000400',
                    },
                };
                break;

            case 'winxp':
                append = {
                    'HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows NT\\CurrentVersion': {
                        'CSDVersion':         'Service Pack 3',
                        'CurrentBuildNumber': '2600',
                        'CurrentVersion':     '5.1',
                    },
                    'HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Control\\Windows':     {
                        'CSDVersion': 'dword:00000300',
                    },
                };
                break;

            case 'win10':
                this.wine.run('reg', 'add', 'HKLM\\System\\CurrentControlSet\\Control\\ProductOptions', '/v', 'ProductType', '/d', 'WinNT', '/f');
                append = {
                    'HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows NT\\CurrentVersion': {
                        'CSDVersion':         '',
                        'CurrentBuildNumber': '10240',
                        'CurrentVersion':     '10.0',
                    },
                    'HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Control\\Windows':     {
                        'CSDVersion': 'dword:00000300',
                    },
                };
                break;

            case 'win7':
            default:
                this.wine.run('reg', 'add', 'HKLM\\System\\CurrentControlSet\\Control\\ProductOptions', '/v', 'ProductType', '/d', 'WinNT', '/f');
                append = {
                    'HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows NT\\CurrentVersion': {
                        'CSDVersion':         'Service Pack 1',
                        'CurrentBuildNumber': '7601',
                        'CurrentVersion':     '6.1',
                    },
                    'HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Control\\Windows':     {
                        'CSDVersion': 'dword:00000100',
                    },
                };
        }

        Object.keys(append).forEach(path => {
            regs.push(`\n[${path}]\n`);

            Object.keys(append[path]).forEach(field => {
                let value = append[path][field];
                regs.push(`"${field}"="${value}"`);
            })
        });

        this.fs.filePutContents(path, Utils.encode(regs.join('\n'), 'utf-16'));
        this.wine.reg(path);

        return true;
    }
}