const path = require('path');
import FileSystem from "./file-system";
import Utils      from "./utils";

export default class Config {
    /**
     * @type {FileSystem}
     */
    fs = null;

    /**
     * @type {string}
     */
    path = null;

    /**
     * @type {object}
     */
    config = null;

    rootDir          = null;
    binDir           = '/bin';
    libsDir          = '/bin/libs/i386';
    libs64Dir        = '/bin/libs/x86-64';
    dataDir          = '/data';
    gamesDir         = '/data/games';
    gamesSymlinksDir = '/data/games/symlinks';
    gamesFile        = '/data/games.squashfs';
    savesDir         = '/data/saves';
    savesSymlinksDir = '/data/saves/symlinks';
    configsDir       = '/data/configs';
    configFile       = '/data/configs/game.json';
    dxvkConfFile     = '/data/configs/dxvk.conf';
    cacheDir         = '/data/cache';
    logsDir          = '/data/logs';
    patchApplyDir    = '/data/patches/apply';
    patchAutoDir     = '/data/patches/auto';
    wineDir          = '/wine';
    wineFile         = '/wine.squashfs';
    wineEnv          = {
        'WINEDEBUG':        '-all',
        'WINEARCH':         'win32',
        'WINEDLLOVERRIDES': '', // 'winemenubuilder.exe=d;nvapi,nvapi64,mscoree,mshtml='
        'WINEPREFIX':       '/prefix',
        'DRIVE_C':          '/prefix/drive_c',
        'WINE':             '/wine/bin/wine',
        'WINE64':           '/wine/bin/wine64',
        'REGEDIT':          '/wine/bin/wine\" \"regedit',
        'REGEDIT64':        '/wine/bin/wine64\" \"regedit',
        'WINEBOOT':         '/wine/bin/wine\" \"wineboot',
        'WINEFILE':         '/wine/bin/wine\" \"winefile',
        'WINECFG':          '/wine/bin/wine\" \"winecfg',
        'WINETASKMGR':      '/wine/bin/wine\" \"taskmgr',
        'WINEUNINSTALLER':  '/wine/bin/wine\" \"uninstaller',
        'WINEPROGRAM':      '/wine/bin/wine\" \"progman',
        'WINESERVER':       '/wine/bin/wineserver',
    };

    /**
     * @param {string|null?} filepath
     */
    constructor(filepath = null) {
        this.path = filepath;
        this.fs   = new FileSystem();

        this.loadConfig();
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

    getSavesSymlinksDir() {
        return this.getRootDir() + this.savesSymlinksDir;
    }

    getCacheDir() {
        return this.getRootDir() + this.cacheDir;
    }

    getConfigsDir() {
        return this.getRootDir() + this.configsDir;
    }

    getConfigFile() {
        return this.path || this.getRootDir() + this.configFile;
    }

    getLogsDir() {
        return this.getRootDir() + this.logsDir;
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

    getWineDir() {
        return this.getRootDir() + this.wineDir;
    }

    getWineFile() {
        return this.getRootDir() + this.wineFile;
    }

    loadConfig() {
        if (this.path && this.fs.exists(this.path)) {
            this.config = Utils.jsonDecode(this.fs.fileGetContents(this.path));
        }

        if (!this.config) {
            this.config = this.getDefaultConfig();
        }
    }

    getDefaultConfig() {
        return {
            app:      {
                path:            'Program Files/The Super Game',
                additional_path: '',
                exe:             'Game.exe',
                cmd:             '-language=russian',
                name:            'The Super Game: Deluxe Edition',
                description:     'Game description',
                version:         '1.0.0',
            },
            wine:     {
                WINEARCH:         'win32',
                WINEDLLOVERRIDES: '',
                WINEDEBUG:        '-all',
            },
            window:   {
                enable:     false,
                resolution: '800x600',
            },
            export:   {
                WINEESYNC:   1,
                PBA_DISABLE: 1,
            },
            script:   {
                autoupdate: false,
                winver:     'win7', // Windows version (win10, win7, winxp, win2k).
                sandbox:    true,
                csmt:       true,
                pulse:      true,
                fixres:     true,
            },
            libs:     {
                dxvk:          {
                    install:    true,
                    autoupdate: true,
                },
                dumbxinputemu: {
                    install:    true,
                    autoupdate: true,
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

    /**
     * @returns {Object}
     */
    getConfig() {
        return this.config;
    }

    getWineBoot() {
        return this.getRootDir() + this.wineEnv.WINEBOOT;
    }

    getWineServer() {
        return this.getRootDir() + this.wineEnv.WINESERVER;
    }

    getWineDebug() {
        return this.wineEnv.WINEDEBUG;
    }

    getWineArch() {
        return this.wineEnv.WINEARCH;
    }

    getWineDllOverrides() {
        return this.wineEnv.WINEDLLOVERRIDES;
    }

    getWinePrefix() {
        return this.getRootDir() + this.wineEnv.WINEPREFIX;
    }

    getWineDriveC() {
        return this.getRootDir() + this.wineEnv.DRIVE_C;
    }

    getWineBin() {
        return this.getRootDir() + this.wineEnv.WINE;
    }

    getWine64Bin() {
        return this.getRootDir() + this.wineEnv.WINE64;
    }

    getWineRegedit() {
        return this.getRootDir() + this.wineEnv.REGEDIT;
    }

    getWineRegedit64() {
        return this.getRootDir() + this.wineEnv.REGEDIT64;
    }

    getWineFileManager() {
        return this.getRootDir() + this.wineEnv.WINEFILE;
    }

    getWineCfg() {
        return this.getRootDir() + this.wineEnv.WINECFG;
    }

    getWineTaskManager() {
        return this.getRootDir() + this.wineEnv.WINETASKMGR;
    }

    getWineUninstaller() {
        return this.getRootDir() + this.wineEnv.WINEUNINSTALLER;
    }

    getWineProgram() {
        return this.getRootDir() + this.wineEnv.WINEPROGRAM;
    }
}