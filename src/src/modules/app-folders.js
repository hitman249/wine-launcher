import FileSystem from "./file-system";
import Utils      from "./utils";

const path = require('path');

export default class AppFolders {

  /**
   * @type {string[]}
   */
  folders = [];

  /**
   * @type {FileSystem}
   */
  fs = null;

  rootDir          = null;
  binDir           = '/bin';
  winetricksFile   = '/bin/winetricks';
  squashfuseFile   = '/bin/squashfuse';
  dosboxFile       = '/bin/dosbox';
  fuseisoFile      = '/bin/fuseiso';
  libsDir          = '/bin/libs/i386';
  libs64Dir        = '/bin/libs/x86-64';
  shareDir         = '/bin/share';
  dataDir          = '/data';
  gamesDir         = '/data/games';
  gamesSymlinksDir = '/data/games/_symlinks';
  gamesFile        = '/data/games.squashfs';
  savesDir         = '/data/saves';
  savesFoldersFile = '/data/saves/folders.json';
  savesSymlinksDir = '/data/saves/symlinks';
  configsDir       = '/data/configs';
  dxvkConfFile     = '/data/configs/dxvk.conf';
  dosboxConfFile   = '/data/configs/dosbox.conf';
  dosboxRuLangFile = '/data/configs/russian.txt';
  vkBasaltConfFile = '/data/configs/vkBasalt.conf';
  cacheDir         = '/data/cache';
  implicitLayerDir = '/data/cache/implicit_layer.d';
  runPidFile       = '/data/cache/run.pid';
  resolutionsFile  = '/data/cache/resolutions.json';
  logsDir          = '/data/logs';
  logFileManager   = '/data/logs/filemanager.log';
  logFileConfig    = '/data/logs/config.log';
  logFileProton    = '/data/logs/proton.log';
  logFileVkBasalt  = '/data/logs/vkBasalt.log';
  patchesDir       = '/data/patches';
  buildDir         = '/build';
  wineDir          = '/wine';
  wineFile         = '/wine.squashfs';
  protonFile       = '/wine/proton';

  constructor() {
    this.fs      = new FileSystem(this);
    this.folders = [
      this.getRootDir(),
      this.getBinDir(),
      this.getDataDir(),
      this.getLogsDir(),
      this.getCacheDir(),
      this.getConfigsDir(),
      this.getLibsDir(),
      this.getLibs64Dir(),
      this.getShareDir(),
      this.getGamesDir(),
      this.getGamesSymlinksDir(),
      this.getSavesDir(),
      this.getSavesSymlinksDir(),
      this.getPatchesDir(),
    ];
  }

  /**
   * @return {FileSystem}
   */
  getFileSystem() {
    return this.fs;
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

    let prefix      = window.app.getPrefix();
    let config      = Utils.jsonEncode(prefix.getConfig());
    let saveFolders = prefix.getDefaultSaveFolders();

    this.fs.filePutContents(prefix.getPath(), config);

    Object.keys(saveFolders).forEach(folder => this.fs.mkdir(`${this.getSavesDir()}/${folder}`));

    this.fs.filePutContents(this.getSavesFoldersFile(), Utils.jsonEncode(saveFolders));
  }

  /**
   * @returns {boolean}
   */
  isCreated() {
    return this.fs.exists(this.getDataDir()) && this.fs.exists(this.getBinDir());
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

  getStartFilename() {
    return 'start';
  }

  getStartFile() {
    const rootDir = this.getRootDir();
    let path      = `${rootDir}/${this.getStartFilename()}`;

    if (this.fs.exists(path)) {
      return path;
    }

    return `${this.getBinDir()}/${this.getStartFilename()}`;
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

  getWineDir() {
    return this.getRootDir() + this.wineDir;
  }

  getWineFile() {
    return this.getRootDir() + this.wineFile;
  }

  getProtonFile() {
    return this.getRootDir() + this.protonFile;
  }

  getConfigsDir() {
    return this.getRootDir() + this.configsDir;
  }

  getLogsDir() {
    return this.getRootDir() + this.logsDir;
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

  getDosboxConfFile() {
    return this.getRootDir() + this.dosboxConfFile;
  }

  getDosboxRuLangFile() {
    return this.getRootDir() + this.dosboxRuLangFile;
  }

  getVkBasaltConfFile() {
    return this.getRootDir() + this.vkBasaltConfFile;
  }

  getRunPidFile() {
    return this.getRootDir() + this.runPidFile;
  }

  getBuildDir() {
    return this.getRootDir() + this.buildDir;
  }

  getWinetricksFile() {
    return this.getRootDir() + this.winetricksFile;
  }

  getSquashfuseFile() {
    return this.getRootDir() + this.squashfuseFile;
  }

  getDosboxFile() {
    return this.getRootDir() + this.dosboxFile;
  }

  getFuseisoFile() {
    return this.getRootDir() + this.fuseisoFile;
  }

  getResolutionsFile() {
    return this.getRootDir() + this.resolutionsFile;
  }
}