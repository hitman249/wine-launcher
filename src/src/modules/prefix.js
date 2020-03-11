import _          from "lodash";
import Utils      from "./utils";
import Command    from "./command";
import System     from "./system";
import FileSystem from "./file-system";

const path            = require('path');
const version_compare = require('locutus/php/info/version_compare');

export default class Prefix {

    /**
     * @type {Command}
     */
    command = null;

    /**
     * @type {FileSystem}
     */
    fs = null;

    /**
     * @type {System}
     */
    system = null;

    rootDir            = null;
    binDir             = '/bin';
    winetricksFile     = '/bin/winetricks';
    squashfuseFile     = '/bin/squashfuse';
    libsDir            = '/bin/libs/i386';
    libs64Dir          = '/bin/libs/x86-64';
    dataDir            = '/data';
    gamesDir           = '/data/games';
    gamesSymlinksDir   = '/data/games/symlinks';
    gamesFile          = '/data/games.squashfs';
    savesDir           = '/data/saves';
    savesFoldersFile   = '/data/saves/folders.json';
    savesSymlinksDir   = '/data/saves/symlinks';
    configsDir         = '/data/configs';
    dxvkConfFile       = '/data/configs/dxvk.conf';
    cacheDir           = '/data/cache';
    winePrefixCacheDir = '/prefix/drive_c/cache';
    runPidFile         = '/data/cache/run.pid';
    resolutionsFile    = '/data/cache/resolutions.json';
    logsDir            = '/data/logs';
    winePrefixLogsDir  = '/prefix/drive_c/logs';
    logFileManager     = '/data/logs/filemanager.log';
    logProtonFile      = '/data/logs/proton.log';
    patchApplyDir      = '/data/patches/apply';
    patchAutoDir       = '/data/patches/auto';
    wineDir            = '/wine';
    wineFile           = '/wine.squashfs';
    winePrefixDir      = '/prefix';
    wineDosDevicesDir  = '/prefix/dosdevices';
    dxvkConfPrefixFile = '/prefix/drive_c/dxvk.conf';
    winePrefixInfoDir  = '/prefix/drive_c/info';
    wineLibFile        = '/wine/lib/libwine.so';

    wineEnv = {
        'WINEDEBUG':        '-all',
        'WINEARCH':         'win32',
        'WINEDLLOVERRIDES': '', // 'winemenubuilder.exe=d;nvapi,nvapi64,mscoree,mshtml='
        'WINEPREFIX':       '/prefix',
        'DRIVE_C':          '/prefix/drive_c',
        'WINE':             '/wine/bin/wine',
        'WINE64':           '/wine/bin/wine64',
        'REGEDIT':          '/wine/bin/wine" "regedit',
        'REGEDIT64':        '/wine/bin/wine64" "regedit',
        'REGSVR32':         '/wine/bin/wine" "regsvr32',
        'REGSVR64':         '/wine/bin/wine64" "regsvr32',
        'WINEBOOT':         '/wine/bin/wine" "wineboot',
        'WINEFILE':         '/wine/bin/wine" "winefile',
        'WINECFG':          '/wine/bin/wine" "winecfg',
        'WINETASKMGR':      '/wine/bin/wine" "taskmgr',
        'WINEUNINSTALLER':  '/wine/bin/wine" "uninstaller',
        'WINEPROGRAM':      '/wine/bin/wine" "progman',
        'WINESERVER':       '/wine/bin/wineserver',
    };

    /**
     * @type {string}
     */
    path = '/data/configs/prefix.json';

    /**
     * @type {{}}
     */
    config = null;

    constructor() {
        this.command = new Command(this);
        this.fs      = new FileSystem(this, this.command);
        this.system  = new System(this, this.command, this.fs);

        this.loadConfig();

        if (this.isUsedSystemWine()) {
            this.wineEnv = Object.assign({}, this.wineEnv, {
                'WINE':            'wine',
                'WINE64':          'wine64',
                'REGEDIT':         'wine" "regedit',
                'REGEDIT64':       'wine64" "regedit',
                'REGSVR32':        'wine" "regsvr32',
                'REGSVR64':        'wine64" "regsvr32',
                'WINEBOOT':        'wineboot',
                'WINEFILE':        'winefile',
                'WINECFG':         'winecfg',
                'WINETASKMGR':     'wine" "taskmgr',
                'WINEUNINSTALLER': 'wine" "uninstaller',
                'WINEPROGRAM':     'wine" "progman',
                'WINESERVER':      'wineserver',
            });
        }
    }

    loadConfig() {
        let path = this.getPath();

        if (!this.config && this.fs.exists(path)) {
            this.config = Utils.jsonDecode(this.fs.fileGetContents(path));
        }

        if (!this.config) {
            this.config = this.getDefaultConfig();
        }

        this.wineEnv.WINEARCH = _.get(this.config, 'wine.arch', this.wineEnv.WINEARCH);
    }

    /**
     * @return {boolean}
     */
    save() {
        if (!this.path || !this.config) {
            return false;
        }

        this.fs.filePutContents(this.getPath(), Utils.jsonEncode(this.config));

        return true;
    }

    getRootDir() {
        if (null !== this.rootDir) {
            return this.rootDir;
        }

        this.rootDir = path.resolve(__dirname, '../..');

        let binDir = path.resolve(this.rootDir, '..') + this.binDir;

        if (this.fs.exists(binDir)) {
            this.rootDir = path.resolve(this.rootDir, '..');
        }

        return this.rootDir;
    }

    getPath() {
        return this.getRootDir() + this.path;
    }

    getBasename() {
        return this.fs.basename(this.path);
    }

    isUsedSystemWine() {
        if (!this.fs.exists(this.getWineBin()) && !this.fs.exists(this.getWineFile())) {
            return true;
        }

        let glibcVersion = this.system.getGlibcVersion();

        return version_compare(glibcVersion, '2.23', '<');
    }

    /**
     * @return {Command}
     */
    getCommand() {
        return this.command;
    }

    /**
     * @return {FileSystem}
     */
    getFileSystem() {
        return this.fs;
    }

    /**
     * @return {System}
     */
    getSystem() {
        return this.system;
    }

    /**
     * @returns {Object}
     */
    getConfig() {
        return this.config;
    }

    /**
     * @param {string} path 'app.path'
     * @param {*} value
     */
    setConfigValue(path, value) {
        this.config = _.set(this.config, path, value);
    }

    /**
     * @param {string} path
     * @return {*|null}
     */
    getConfigValue(path) {
        return _.get(this.config, path, null);
    }

    /**
     * @returns {Object}
     */
    getFlatConfig() {
        let result = {};
        let config = _.cloneDeep(this.getConfig());

        Object.keys(config).forEach((key) => {
            let section = config[key];

            if ('replaces' === key) {
                result[key] = section;
                return;
            }

            Object.keys(section).forEach((sectionKey) => {
                let subSection = section[sectionKey];

                if ('libs' !== key) {
                    result[`${key}.${sectionKey}`] = subSection;
                } else {
                    Object.keys(subSection).forEach((subSectionKey) => {
                        result[`${key}.${sectionKey}.${subSectionKey}`] = subSection[subSectionKey];
                    });
                }
            });
        });

        return result;
    }

    /**
     * @param {Object} config
     */
    setFlatConfig(config) {
        Object.keys(config).forEach((path) => {
            this.setConfigValue(path, config[path]);
        });
    }

    getDefaultConfig() {
        return {
            app:      {
                path:       'Games',
                autoupdate: false,
                sandbox:    true,
                fixres:     true,
            },
            wine:     {
                arch:            'win32', // WINEARCH
                windows_version: 'win7',  // Windows version (win10, win7, winxp, win2k)
            },
            libs:     {
                dxvk: {
                    install:    false,
                    autoupdate: false,
                },
            },
            fixes:    {
                focus:         false, // Fix focus
                nocrashdialog: false, // No crash dialog
                cfc:           false, // CheckFloatConstants
                glsl:          true,  // Use GLSL shaders (1) or ARB shaders (0) (faster, but sometimes breaks)
                ddr:           '',    // DirectDrawRenderer ""(default), "gdi", "opengl"
                orm:           '',    // OffscreenRenderingMode ""(default), "fbo", "backbuffer"
            },
            /**
             * When creating a prefix, it searches for and replaces tags in the specified files.
             * Path relative to the position of the ./start file
             * Performed BEFORE registering * .reg files
             *
             * {WIDTH}        - default monitor width in pixels (number)
             * {HEIGHT}       - default monitor height in pixels (number)
             * {USER}         - username
             * {DOSDEVICES}   - Full path to "/.../prefix/dosdevice"
             * {DRIVE_C}      - Full path to "/.../prefix/drive_c"
             * {PREFIX}       - Full path to "/.../prefix"
             * {ROOT_DIR}     - Full path to game folder
             * {HOSTNAME}     - See command: hostname
             *
             * "data/games/game/example.conf"
             */
            replaces: [],
        };
    }


    getBinDir() {
        return this.getRootDir() + this.binDir;
    }

    getLibsDir() {
        return this.getRootDir() + this.libsDir;
    }

    getLibs64Dir() {
        return this.getRootDir() + this.libs64Dir;
    }

    getDataDir() {
        return this.getRootDir() + this.dataDir;
    }

    getGamesDir() {
        return this.getRootDir() + this.gamesDir;
    }

    getGamesSymlinksDir() {
        return this.getRootDir() + this.gamesSymlinksDir;
    }

    getGamesFile() {
        return this.getRootDir() + this.gamesFile;
    }

    getSavesDir() {
        return this.getRootDir() + this.savesDir;
    }

    getSavesFoldersFile() {
        return this.getRootDir() + this.savesFoldersFile;
    }

    getSavesSymlinksDir() {
        return this.getRootDir() + this.savesSymlinksDir;
    }

    getCacheDir() {
        return this.getRootDir() + this.cacheDir;
    }

    getWinePrefixCacheDir() {
        return this.getRootDir() + this.winePrefixCacheDir;
    }

    getConfigsDir() {
        return this.getRootDir() + this.configsDir;
    }

    getLogsDir() {
        return this.getRootDir() + this.logsDir;
    }

    getWinePrefixLogsDir() {
        return this.getRootDir() + this.winePrefixLogsDir;
    }

    getLogFileManager() {
        return this.getRootDir() + this.logFileManager;
    }

    getLogProtonFile() {
        return this.getRootDir() + this.logProtonFile;
    }

    getPatchApplyDir() {
        return this.getRootDir() + this.patchApplyDir;
    }

    getPatchAutoDir() {
        return this.getRootDir() + this.patchAutoDir;
    }

    getDxvkConfFile() {
        return this.getRootDir() + this.dxvkConfFile;
    }

    getWinePrefixDxvkConfFile() {
        return this.getRootDir() + this.dxvkConfPrefixFile;
    }

    getWineDir() {
        return this.getRootDir() + this.wineDir;
    }

    getWineLibFile() {
        return this.getRootDir() + this.wineLibFile;
    }

    getWineFile() {
        return this.getRootDir() + this.wineFile;
    }

    getRunPidFile() {
        return this.getRootDir() + this.runPidFile;
    }

    /**
     * @return {{"Local Settings": string, "Documents Public Extra": string, Documents: string, "Application Data": string, "Documents Public": string, "Documents Extra": string}}
     */
    getDefaultSaveFolders() {
        return {
            'Documents':              'users/{USER}/Documents',
            'Documents Extra':        'users/{USER}/Мои документы',
            'Documents Public':       'users/Public/Documents',
            'Documents Public Extra': 'users/Public/Мои документы',
            'Application Data':       'users/{USER}/Application Data',
            'Local Settings':         'users/{USER}/Local Settings',
        };
    }

    getWineBoot() {
        if (!_.startsWith(this.wineEnv.WINEBOOT, '/')) {
            return this.wineEnv.WINEBOOT;
        }

        return this.getRootDir() + this.wineEnv.WINEBOOT;
    }

    getWineServer() {
        if (!_.startsWith(this.wineEnv.WINESERVER, '/')) {
            return this.wineEnv.WINESERVER;
        }

        return this.getRootDir() + this.wineEnv.WINESERVER;
    }

    getWineDebug() {
        return this.wineEnv.WINEDEBUG;
    }

    setWineDebug(value) {
        this.wineEnv.WINEDEBUG = value;
    }

    getWineArch() {
        return this.wineEnv.WINEARCH;
    }

    getWineDllOverrides() {
        return this.wineEnv.WINEDLLOVERRIDES;
    }

    getWinePrefix() {
        return this.getRootDir() + this.winePrefixDir;
    }

    getGamesFolder() {
        return '/' + _.trim(_.get(this.config, 'app.path', 'Games'), '/');
    }

    getWinePrefixGameFolder() {
        return this.getWineDriveC() + this.getGamesFolder();
    }

    getWinePrefixInfoDir() {
        return this.getRootDir() + this.winePrefixInfoDir;
    }

    /**
     * @param {string} field
     * @param {*} value
     */
    setWinePrefixInfo(field, value) {
        let path = this.getWinePrefixInfoDir();

        if (!this.fs.exists(path)) {
            this.fs.mkdir(path);
        }

        this.fs.filePutContents(`${path}/${field}`, Utils.jsonEncode(value));
    }

    /**
     * @param {string} field
     * @returns {*|null}
     */
    getWinePrefixInfo(field) {
        let path = this.getWinePrefixInfoDir() + '/' + field;

        if (this.fs.exists(path)) {
            return Utils.jsonDecode(this.fs.fileGetContents(path));
        }

        return null;
    }

    getWineDriveC() {
        return this.getRootDir() + this.wineEnv.DRIVE_C;
    }

    getWineDosDevices() {
        return this.getRootDir() + this.wineDosDevicesDir;
    }

    getWineBin() {
        if (!_.startsWith(this.wineEnv.WINE, '/')) {
            return this.wineEnv.WINE;
        }

        return this.getRootDir() + this.wineEnv.WINE;
    }

    getWine64Bin() {
        if (!_.startsWith(this.wineEnv.WINE64, '/')) {
            return this.wineEnv.WINE64;
        }

        return this.getRootDir() + this.wineEnv.WINE64;
    }

    getWineRegedit() {
        if (!_.startsWith(this.wineEnv.REGEDIT, '/')) {
            return this.wineEnv.REGEDIT;
        }

        return this.getRootDir() + this.wineEnv.REGEDIT;
    }

    getWineRegedit64() {
        if (!_.startsWith(this.wineEnv.REGEDIT64, '/')) {
            return this.wineEnv.REGEDIT64;
        }

        return this.getRootDir() + this.wineEnv.REGEDIT64;
    }

    getWineRegsvr32() {
        if (!_.startsWith(this.wineEnv.REGSVR32, '/')) {
            return this.wineEnv.REGSVR32;
        }

        return this.getRootDir() + this.wineEnv.REGSVR32;
    }

    getWineRegsvr64() {
        if (!_.startsWith(this.wineEnv.REGSVR64, '/')) {
            return this.wineEnv.REGSVR64;
        }

        return this.getRootDir() + this.wineEnv.REGSVR64;
    }

    getWineFileManager() {
        if (!_.startsWith(this.wineEnv.WINEFILE, '/')) {
            return this.wineEnv.WINEFILE;
        }

        return this.getRootDir() + this.wineEnv.WINEFILE;
    }

    getWineCfg() {
        if (!_.startsWith(this.wineEnv.WINECFG, '/')) {
            return this.wineEnv.WINECFG;
        }

        return this.getRootDir() + this.wineEnv.WINECFG;
    }

    getWineTaskManager() {
        if (!_.startsWith(this.wineEnv.WINETASKMGR, '/')) {
            return this.wineEnv.WINETASKMGR;
        }

        return this.getRootDir() + this.wineEnv.WINETASKMGR;
    }

    getWineUninstaller() {
        if (!_.startsWith(this.wineEnv.WINEUNINSTALLER, '/')) {
            return this.wineEnv.WINEUNINSTALLER;
        }

        return this.getRootDir() + this.wineEnv.WINEUNINSTALLER;
    }

    getWineProgram() {
        if (!_.startsWith(this.wineEnv.WINEPROGRAM, '/')) {
            return this.wineEnv.WINEPROGRAM;
        }

        return this.getRootDir() + this.wineEnv.WINEPROGRAM;
    }

    getWinetricksFile() {
        return this.getRootDir() + this.winetricksFile;
    }

    getSquashfuseFile() {
        return this.getRootDir() + this.squashfuseFile;
    }

    getResolutionsFile() {
        return this.getRootDir() + this.resolutionsFile;
    }

    /**
     * @return {boolean}
     */
    isSandbox() {
        return Boolean(_.get(this.config, 'app.sandbox'));
    }

    /**
     * @return {boolean}
     */
    isDxvk() {
        return Boolean(_.get(this.config, 'libs.dxvk.install', false));
    }

    /**
     * @return {string}
     */
    getWindowsVersion() {
        return _.get(this.config, 'wine.windows_version', 'win7');
    }

    /**
     * @return {string[]}
     */
    getConfigReplaces() {
        return _.get(this.config, 'replaces', [])
            .map((path) => this.getRootDir() + '/' + _.trimStart(path, '/'))
            .filter((path) => this.fs.exists(path));
    }

    /**
     * @return {string[]}
     */
    getRegistryFiles() {
        let path = this.getPatchApplyDir();

        if (!this.fs.exists(path)) {
            return [];
        }

        let files = [];

        Utils.natsort(this.fs.glob(path + '/*')).forEach((dir) => {
            if (!this.fs.isDirectory(dir)) {
                return;
            }

            Utils.natsort(this.fs.glob(dir + '/*.reg')).forEach((reg) => files.push(reg));
        });

        return files;
    }
}