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
  fuseisoFile        = '/bin/fuseiso';
  libsDir            = '/bin/libs/i386';
  libs64Dir          = '/bin/libs/x86-64';
  shareDir           = '/bin/share';
  dataDir            = '/data';
  gamesDir           = '/data/games';
  gamesSymlinksDir   = '/data/games/_symlinks';
  gamesFile          = '/data/games.squashfs';
  savesDir           = '/data/saves';
  savesFoldersFile   = '/data/saves/folders.json';
  savesSymlinksDir   = '/data/saves/symlinks';
  configsDir         = '/data/configs';
  dxvkConfFile       = '/data/configs/dxvk.conf';
  vkBasaltConfFile   = '/data/configs/vkBasalt.conf';
  cacheDir           = '/data/cache';
  implicitLayerDir   = '/data/cache/implicit_layer.d';
  winePrefixCacheDir = '/prefix/drive_c/cache';
  runPidFile         = '/data/cache/run.pid';
  resolutionsFile    = '/data/cache/resolutions.json';
  logsDir            = '/data/logs';
  winePrefixLogsDir  = '/prefix/drive_c/logs';
  logFileManager     = '/data/logs/filemanager.log';
  logFileConfig      = '/data/logs/config.log';
  logFileProton      = '/data/logs/proton.log';
  logFileVkBasalt    = '/data/logs/vkBasalt.log';
  patchesDir         = '/data/patches';
  wineDir            = '/wine';
  wineFile           = '/wine.squashfs';
  winePrefixDir      = '/prefix';
  wineDosDevicesDir  = '/prefix/dosdevices';
  dxvkConfPrefixFile = '/prefix/drive_c/dxvk.conf';
  winePrefixInfoDir  = '/prefix/drive_c/info';
  winePrefixSystem32 = '/prefix/drive_c/windows/system32';
  winePrefixSystem64 = '/prefix/drive_c/windows/syswow64';
  wineLibFile        = '/wine/lib/libwine.so';
  buildDir           = '/build';

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
  }

  getWineEnv() {
    if (this.isUsedSystemWine()) {
      return Object.assign({}, this.wineEnv, {
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

    return {
      'WINE':            '/wine/bin/wine',
      'WINE64':          '/wine/bin/wine64',
      'REGEDIT':         '/wine/bin/wine" "regedit',
      'REGEDIT64':       '/wine/bin/wine64" "regedit',
      'REGSVR32':        '/wine/bin/wine" "regsvr32',
      'REGSVR64':        '/wine/bin/wine64" "regsvr32',
      'WINEBOOT':        '/wine/bin/wine" "wineboot',
      'WINEFILE':        '/wine/bin/wine" "winefile',
      'WINECFG':         '/wine/bin/wine" "winecfg',
      'WINETASKMGR':     '/wine/bin/wine" "taskmgr',
      'WINEUNINSTALLER': '/wine/bin/wine" "uninstaller',
      'WINEPROGRAM':     '/wine/bin/wine" "progman',
      'WINESERVER':      '/wine/bin/wineserver',
    };
  }

  loadWineEnv() {
    this.wineEnv = Object.assign({}, this.wineEnv, this.getWineEnv());
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

    let startFile = window.process.env.APPIMAGE;

    if (undefined === startFile) {
      startFile = path.resolve(__dirname);
    }

    this.rootDir = path.resolve(startFile, '..');

    const binDir  = path.resolve(this.rootDir, '..') + this.binDir;
    const dataDir = path.resolve(this.rootDir, '..') + this.dataDir;

    if (this.fs.exists(binDir) && this.fs.exists(dataDir)) {
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

  /**
   * @return {string}
   */
  getMinGlibcVersion() {
    return window.app.getCache().remember('wine.glibc', () => {
      let value     = null;
      let wineDir   = this.getWineDir();
      let lib       = `${wineDir}/lib`;
      let libWine   = `${wineDir}/lib/wine`;
      let lib64     = `${wineDir}/lib64`;
      let lib64Wine = `${wineDir}/lib64/wine`;

      [ lib, libWine, lib64, lib64Wine ].forEach((path) => {
        if (this.fs.exists(path)) {
          this.command.run(`objdump -T "${path}"/*.so* | grep GLIBC_`).split("\n").forEach((line) => {
            let lineVersion = _.get(line.split('GLIBC_'), '[1]', '').split(' ')[0];

            if (!value) {
              value = lineVersion;
              return;
            }

            if (version_compare(value, lineVersion, '<')) {
              value = lineVersion;
            }
          });
        }
      });

      return value;
    });
  }

  /**
   * @return {boolean}
   */
  isUsedSystemWine() {
    let wine         = this.getRootDir() + '/wine/bin/wine';
    let wine64       = this.getRootDir() + '/wine/bin/wine64';
    let glibcVersion = this.system.getGlibcVersion();

    if (!this.fs.exists(wine) && !this.fs.exists(wine64)) {
      return true;
    }

    if (version_compare(glibcVersion, this.getMinGlibcVersion(), '<')) {
      return true;
    }

    return false;
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
        compositor: false,
        sound:      true,
      },
      wine:     {
        arch:            'win32', // WINEARCH
        windows_version: 'win7',  // Windows version (win10, win7, winxp, win2k)
      },
      libs:     {
        dxvk:           {
          install:    false,
          autoupdate: false,
        },
        'vkd3d-proton': {
          install:    false,
          autoupdate: false,
        },
        mf:             {
          install: false,
        },
        mangohud:       {
          install: false,
        },
        vkbasalt:       {
          install: false,
        },
      },
      fixes:    {
        focus:             false,    // Fix focus
        nocrashdialog:     false,    // No crash dialog
        cfc:               false,    // CheckFloatConstants
        glsl:              true,     // Use GLSL shaders (1) or ARB shaders (0) (faster, but sometimes breaks)
        ddr:               '',       // DirectDrawRenderer ""(default), "gdi", "opengl"
        orm:               '',       // OffscreenRenderingMode ""(default), "fbo", "backbuffer"
        MouseWarpOverride: 'enable', // OffscreenRenderingMode "enable"(default), "disable", "force"
      },
      /**
       * When creating a prefix, it searches for and replaces tags in the specified files.
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

  getSystem32() {
    if ('win32' === this.getWineArch()) {
      return this.getRootDir() + this.winePrefixSystem32;
    }

    return this.getRootDir() + this.winePrefixSystem64;
  }

  getSystem64() {
    if ('win64' === this.getWineArch()) {
      return this.getRootDir() + this.winePrefixSystem32;
    }

    return '';
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

  getShareDir() {
    return this.getRootDir() + this.shareDir;
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

  getCacheImplicitLayerDir() {
    return this.getRootDir() + this.implicitLayerDir;
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

  getLogFileProton() {
    return this.getRootDir() + this.logFileProton;
  }

  getLogFileVkBasalt() {
    return this.getRootDir() + this.logFileVkBasalt;
  }

  getLogFileConfig() {
    return this.getRootDir() + this.logFileConfig;
  }

  getPatchesDir() {
    return this.getRootDir() + this.patchesDir;
  }

  getDxvkConfFile() {
    return this.getRootDir() + this.dxvkConfFile;
  }

  getVkBasaltConfFile() {
    return this.getRootDir() + this.vkBasaltConfFile;
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

  getBuildDir() {
    return this.getRootDir() + this.buildDir;
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

  /**
   * @return {boolean}
   */
  isBlocked() {
    let arch = this.getWinePrefixInfo('arch');
    return null !== arch && arch !== this.getWineArch();
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

  isWine64BinExist() {
    let path = this.getWine64Bin();

    if ('wine64' === path) {
      return Boolean(this.command.exec('command -v wine64'));
    }

    return this.fs.exists(this.getWine64Bin());
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

  getFuseisoFile() {
    return this.getRootDir() + this.fuseisoFile;
  }

  getResolutionsFile() {
    return this.getRootDir() + this.resolutionsFile;
  }

  setSound(enable) {
    this.setConfigValue('app.sound', enable);
  }

  /**
   * @return {boolean}
   */
  isSound() {
    return Boolean(_.get(this.config, 'app.sound'));
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
  isDisableCompositor() {
    return Boolean(_.get(this.config, 'app.compositor'));
  }

  /**
   * @return {boolean}
   */
  isDxvk() {
    return Boolean(_.get(this.config, 'libs.dxvk.install', false));
  }

  /**
   * @return {boolean}
   */
  isVkd3dProton() {
    return Boolean(_.get(this.config, 'libs.vkd3d-proton.install', false));
  }

  /**
   * @return {boolean}
   */
  isMediaFoundation() {
    return Boolean(_.get(this.config, 'libs.mf.install', false));
  }

  /**
   * @return {boolean}
   */
  isDxvkAutoupdate() {
    return Boolean(_.get(this.config, 'libs.dxvk.autoupdate', false));
  }

  /**
   * @return {boolean}
   */
  isVkd3dProtonAutoupdate() {
    return Boolean(_.get(this.config, 'libs.vkd3d-proton.autoupdate', false));
  }

  /**
   * @return {boolean}
   */
  isMangoHud() {
    return Boolean(_.get(this.config, 'libs.mangohud.install', false));
  }

  /**
   * @return {boolean}
   */
  isVkBasalt() {
    return Boolean(_.get(this.config, 'libs.vkbasalt.install', false));
  }

  /**
   * @return {string}
   */
  getMangoHudLibPath(arch = this.getWineArch()) {
    if ('win32' === arch) {
      return this.getLibsDir() + '/libMangoHud.so';
    }
    if ('win64' === arch) {
      return this.getLibs64Dir() + '/libMangoHud.so';
    }

    return 'libMangoHud.so';
  }

  /**
   * @return {string}
   */
  getMangoHudLibDlsumPath(arch = this.getWineArch()) {
    if ('win32' === arch) {
      return this.getLibsDir() + '/libMangoHud_dlsym.so';
    }
    if ('win64' === arch) {
      return this.getLibs64Dir() + '/libMangoHud_dlsym.so';
    }

    return 'libMangoHud_dlsym.so';
  }

  /**
   * @return {string}
   */
  getVkBasaltLibPath(arch = this.getWineArch()) {
    if ('win32' === arch) {
      return this.getLibsDir() + '/libvkbasalt32.so';
    }
    if ('win64' === arch) {
      return this.getLibs64Dir() + '/libvkbasalt64.so';
    }

    return 'libvkbasalt32.so';
  }

  /**
   * @return {boolean}
   */
  isMangoHudLib() {
    if (this.getWineArch() === 'win32') {
      return this.fs.exists(this.getMangoHudLibPath('win32')) && this.fs.exists(this.getMangoHudLibDlsumPath('win32'));
    }
    if (this.getWineArch() === 'win64') {
      return this.fs.exists(this.getMangoHudLibPath('win64')) && this.fs.exists(this.getMangoHudLibDlsumPath('win64'));
    }

    return false;
  }

  /**
   * @return {boolean}
   */
  isVkBasaltLib() {
    if (this.getWineArch() === 'win32') {
      return this.fs.exists(this.getVkBasaltLibPath('win32'));
    }
    if (this.getWineArch() === 'win64') {
      return this.fs.exists(this.getVkBasaltLibPath('win64'));
    }

    return false;
  }

  /**
   * @return {string}
   */
  getWindowsVersion() {
    return _.get(this.config, 'wine.windows_version', 'win7');
  }

  /**
   * @return {boolean}
   */
  isFixesFocus() {
    return _.get(this.config, 'fixes.focus', false);
  }

  /**
   * @return {boolean}
   */
  isFixesNoCrashDialog() {
    return _.get(this.config, 'fixes.nocrashdialog', false);
  }

  /**
   * @return {boolean}
   */
  isFixesCfc() {
    return _.get(this.config, 'fixes.cfc', false);
  }

  /**
   * @return {boolean}
   */
  isFixesGlsl() {
    return _.get(this.config, 'fixes.glsl', false);
  }

  /**
   * @return {string}
   */
  getFixesDdr() {
    return _.get(this.config, 'fixes.ddr', '');
  }

  /**
   * @return {string}
   */
  getFixesOrm() {
    return _.get(this.config, 'fixes.orm', '');
  }

  /**
   * @return {string}
   */
  getFixesMouseWarpOverride() {
    return _.get(this.config, 'fixes.MouseWarpOverride', 'enable');
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
   * @return {string}
   */
  getLanguage() {
    let support = [ 'ru', 'en' ];
    let auto    = this.command.getLocale().substr(0, 2);
    let find    = support.filter(lang => lang === auto);

    return _.get(this.config, 'app.language', find.length > 0 ? find[0] : 'en');
  }

  /**
   * @param {string} lang
   */
  setLanguage(lang) {
    this.setConfigValue('app.language', lang);
  }

  clear() {
  }
}
