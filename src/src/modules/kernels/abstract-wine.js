import _           from "lodash";
import Utils       from "../utils";
import WineCommand from "../wine-command";
import FileSystem  from "../file-system";
import Update      from "../update";
import AppFolders  from "../app-folders";
import System      from "../system";
import Config      from "../config";
import Prefix      from "../prefix";

const version_compare = require('locutus/php/info/version_compare');

export default class AbstractWine {
  /**
   * @type {AppFolders}
   */
  appFolders = null;

  /**
   * @type {WineCommand}
   */
  command = null;

  /**
   * @type {FileSystem}
   */
  fs = null;

  /**
   * @type {Update}
   */
  update = null;

  /**
   * @type {System}
   */
  system = null;

  /**
   * @type {Config}
   */
  config = null;

  /**
   * @type {Prefix}
   */
  prefix = null;

  /**
   * @type {{}}
   */
  ENV;

  dir     = '/wine';
  wineDir = '';

  prefixDir     = '/prefix';
  winePrefixDir = '';

  wineDosDevicesDir  = '/dosdevices';
  winePrefixSystem32 = '/drive_c/windows/system32';
  winePrefixSystem64 = '/drive_c/windows/syswow64';
  winePrefixLogsDir  = '/drive_c/logs';
  dxvkConfPrefixFile = '/drive_c/dxvk.conf';
  winePrefixInfoDir  = '/drive_c/info';
  winePrefixCacheDir = '/drive_c/cache';

  /**
   * @param {AppFolders} appFolders
   * @param {FileSystem} fs
   * @param {Update} update
   * @param {System} system
   * @param {Prefix} prefix
   */
  constructor(appFolders, fs, update, system, prefix) {
    this.appFolders = appFolders;
    this.fs         = fs;
    this.update     = update;
    this.system     = system;
    this.prefix     = prefix;
    this.command    = window.app.createWineCommand(this);

    this.init();
  }

  init() {}

  /**
   * @param {Config} config
   */
  setConfig(config) {
    this.config  = config;
    this.command = window.app.createWineCommand(this, this.config);
  }

  /**
   * @return {Wine|Proton}
   */
  clone() {
    return _.cloneDeep(this);
  }

  getEnv() {
    if (this.isUsedSystemWine()) {
      return Object.assign({}, this.ENV, {
        'WINEDEBUG':        '-all',
        'WINEARCH':         'win64',
        'WINEDLLOVERRIDES': this.makeWineDllOverrides(), // 'winemenubuilder.exe=d;nvapi,nvapi64,mscoree,mshtml='
        'WINEPREFIX':       '/prefix',
        'DRIVE_C':          '/prefix/drive_c',
        'WINE':             'wine',
        'WINE64':           'wine64',
        'REGEDIT':          'wine" "regedit',
        'REGEDIT64':        'wine64" "regedit',
        'REGSVR32':         'wine" "regsvr32',
        'REGSVR64':         'wine64" "regsvr32',
        'WINEBOOT':         'wineboot',
        'WINEFILE':         'winefile',
        'WINECFG':          'winecfg',
        'WINETASKMGR':      'wine" "taskmgr',
        'WINEUNINSTALLER':  'wine" "uninstaller',
        'WINEPROGRAM':      'wine" "progman',
        'WINESERVER':       'wineserver',
      });
    }

    return {
      'WINEDEBUG':        '-all',
      'WINEARCH':         'win64',
      'WINEDLLOVERRIDES': this.makeWineDllOverrides(), // 'winemenubuilder.exe=d;nvapi,nvapi64,mscoree,mshtml='
      'WINEPREFIX':       this.prefixDir + this.winePrefixDir,
      'DRIVE_C':          this.prefixDir + this.winePrefixDir + '/drive_c',
      'WINE':             this.dir + this.wineDir + '/bin/wine',
      'WINE64':           this.dir + this.wineDir + '/bin/wine64',
      'REGEDIT':          this.dir + this.wineDir + '/bin/wine" "regedit',
      'REGEDIT64':        this.dir + this.wineDir + '/bin/wine64" "regedit',
      'REGSVR32':         this.dir + this.wineDir + '/bin/wine" "regsvr32',
      'REGSVR64':         this.dir + this.wineDir + '/bin/wine64" "regsvr32',
      'WINEBOOT':         this.dir + this.wineDir + '/bin/wine" "wineboot',
      'WINEFILE':         this.dir + this.wineDir + '/bin/wine" "winefile',
      'WINECFG':          this.dir + this.wineDir + '/bin/wine" "winecfg',
      'WINETASKMGR':      this.dir + this.wineDir + '/bin/wine" "taskmgr',
      'WINEUNINSTALLER':  this.dir + this.wineDir + '/bin/wine" "uninstaller',
      'WINEPROGRAM':      this.dir + this.wineDir + '/bin/wine" "progman',
      'WINESERVER':       this.dir + this.wineDir + '/bin/wineserver',
    };
  }

  makeWineDllOverrides() {
    let path = [];

    if (this.prefix.isFixesMono()) {
      path.push('mscoree=');
    }

    if (this.prefix.isFixesGecko()) {
      path.push('mshtml=');
    }

    if (this.prefix.isFixesWineMenuBuilder()) {
      path.push('winemenubuilder.exe=d');
    }

    if (this.prefix.isFixesGStreamer()) {
      path.push('winegstreamer=');
    }

    return path.join(';');
  }

  loadWineEnv() {
    this.ENV = Object.assign({}, this.ENV, this.getEnv());
    this.setWineArch(this.prefix.getArch());
  }

  getDriveC() {
    return this.appFolders.getRootDir() + this.ENV.DRIVE_C;
  }

  getDosDevices() {
    return this.getWinePrefix() + this.wineDosDevicesDir;
  }

  getPrefix() {
    return this.appFolders.getRootDir() + this.prefixDir;
  }

  getWinePrefix() {
    return this.getPrefix() + this.winePrefixDir;
  }

  getWineBin() {
    if (!_.startsWith(this.ENV.WINE, '/')) {
      return this.ENV.WINE;
    }

    return this.appFolders.getRootDir() + this.ENV.WINE;
  }

  getWine64Bin() {
    if (!_.startsWith(this.ENV.WINE64, '/')) {
      return this.ENV.WINE64;
    }

    return this.appFolders.getRootDir() + this.ENV.WINE64;
  }

  isWine64BinExist() {
    let path = this.getWine64Bin();

    if ('wine64' === path) {
      return Boolean(this.command.exec('command -v wine64'));
    }

    return this.fs.exists(this.getWine64Bin());
  }

  getRegedit() {
    if (!_.startsWith(this.ENV.REGEDIT, '/')) {
      return this.ENV.REGEDIT;
    }

    return this.appFolders.getRootDir() + this.ENV.REGEDIT;
  }

  getRegedit64() {
    if (!_.startsWith(this.ENV.REGEDIT64, '/')) {
      return this.ENV.REGEDIT64;
    }

    return this.appFolders.getRootDir() + this.ENV.REGEDIT64;
  }

  getRegsvr32() {
    if (!_.startsWith(this.ENV.REGSVR32, '/')) {
      return this.ENV.REGSVR32;
    }

    return this.appFolders.getRootDir() + this.ENV.REGSVR32;
  }

  getRegsvr64() {
    if (!_.startsWith(this.ENV.REGSVR64, '/')) {
      return this.ENV.REGSVR64;
    }

    return this.appFolders.getRootDir() + this.ENV.REGSVR64;
  }

  getFileManager() {
    if (!_.startsWith(this.ENV.WINEFILE, '/')) {
      return this.ENV.WINEFILE;
    }

    return this.appFolders.getRootDir() + this.ENV.WINEFILE;
  }

  getWineCfg() {
    if (!_.startsWith(this.ENV.WINECFG, '/')) {
      return this.ENV.WINECFG;
    }

    return this.appFolders.getRootDir() + this.ENV.WINECFG;
  }

  getTaskManager() {
    if (!_.startsWith(this.ENV.WINETASKMGR, '/')) {
      return this.ENV.WINETASKMGR;
    }

    return this.appFolders.getRootDir() + this.ENV.WINETASKMGR;
  }

  getUninstaller() {
    if (!_.startsWith(this.ENV.WINEUNINSTALLER, '/')) {
      return this.ENV.WINEUNINSTALLER;
    }

    return this.appFolders.getRootDir() + this.ENV.WINEUNINSTALLER;
  }

  getWineProgram() {
    if (!_.startsWith(this.ENV.WINEPROGRAM, '/')) {
      return this.ENV.WINEPROGRAM;
    }

    return this.appFolders.getRootDir() + this.ENV.WINEPROGRAM;
  }

  getDir() {
    return this.appFolders.getRootDir() + this.dir;
  }

  getWineDir() {
    return this.getDir() + this.wineDir;
  }

  getWineBoot() {
    if (!_.startsWith(this.ENV.WINEBOOT, '/')) {
      return this.ENV.WINEBOOT;
    }

    return this.appFolders.getRootDir() + this.ENV.WINEBOOT;
  }

  getWineServer() {
    if (!_.startsWith(this.ENV.WINESERVER, '/')) {
      return this.ENV.WINESERVER;
    }

    return this.appFolders.getRootDir() + this.ENV.WINESERVER;
  }

  getWineDebug() {
    return this.ENV.WINEDEBUG;
  }

  setWineDebug(value) {
    this.ENV.WINEDEBUG = value;
  }

  getWineArch() {
    return this.ENV.WINEARCH;
  }

  setWineArch(value) {
    this.ENV.WINEARCH = value;
  }

  getWineDllOverrides() {
    return this.ENV.WINEDLLOVERRIDES;
  }

  getSystem32() {
    if ('win32' === this.getWineArch()) {
      return this.getWinePrefix() + this.winePrefixSystem32;
    }

    return this.getWinePrefix() + this.winePrefixSystem64;
  }

  getSystem64() {
    if ('win64' === this.getWineArch()) {
      return this.getWinePrefix() + this.winePrefixSystem32;
    }

    return '';
  }


  /**
   * @return {string[]}
   */
  getWineLibDirs() {
    let wineDir = this.getWineDir();
    let homeDir = this.system.getHomeDir();

    return [
      `${wineDir}/lib`,
      `${wineDir}/lib/wine`,
      `${wineDir}/lib/wine/x86_64-unix`,
      `${wineDir}/lib/wine/i386-unix`,
      `${wineDir}/lib32`,
      `${wineDir}/lib32/wine`,
      `${wineDir}/lib32/wine/i386-unix`,
      `${wineDir}/lib64`,
      `${wineDir}/lib64/wine`,
      `${wineDir}/lib64/wine/x86_64-unix`,
      `${homeDir}/.local/share/Steam/ubuntu12_32/video`,
      `${homeDir}/.local/share/Steam/ubuntu12_32/steam-runtime/lib/i386-linux-gnu`,
      `${homeDir}/.local/share/Steam/ubuntu12_32/steam-runtime/lib/x86_64-linux-gnu`,
      `${homeDir}/.local/share/Steam/ubuntu12_32/steam-runtime/usr/lib/x86_64-linux-gnu`,
      `${homeDir}/.local/share/Steam/ubuntu12_64/video`,
      `${homeDir}/.local/share/Steam/ubuntu12_64/steam-runtime-heavy/lib/x86_64-linux-gnu`,
      `${homeDir}/.local/share/Steam/ubuntu12_64/steam-runtime-heavy/usr/lib/x86_64-linux-gnu`,
    ].filter(path => this.fs.exists(path));
  }

  /**
   * @return {string}
   */
  getMinGlibcVersion() {
    return window.app.getCache().remember('wine.glibc', () => {
      let value = null;

      this.getWineLibDirs().forEach((path) => {
        if (this.fs.exists(path)) {
          this.command.exec(`objdump -T "${path}"/*.so* | grep GLIBC_`).split("\n").forEach((line) => {
            let lineVersion = _.trim(_.get(line.split('GLIBC_'), '[1]', '').split(' ')[0], ' ()');

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
    let wine         = this.appFolders.getRootDir() + this.dir + this.wineDir + '/bin/wine';
    let wine64       = this.appFolders.getRootDir() + this.dir + this.wineDir + '/bin/wine64';
    let glibcVersion = this.system.getGlibcVersion();

    if (!this.fs.exists(wine) && !this.fs.exists(wine64)) {
      return true;
    }

    if (version_compare(glibcVersion, this.getMinGlibcVersion(), '<')) {
      return true;
    }

    return false;
  }

  getWinePrefixLogsDir() {
    return this.getWinePrefix() + this.winePrefixLogsDir;
  }

  getWinePrefixDxvkConfFile() {
    return this.getWinePrefix() + this.dxvkConfPrefixFile;
  }

  getWinePrefixInfoDir() {
    return this.getWinePrefix() + this.winePrefixInfoDir;
  }

  getWinePrefixCacheDir() {
    return this.getWinePrefix() + this.winePrefixCacheDir;
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
}