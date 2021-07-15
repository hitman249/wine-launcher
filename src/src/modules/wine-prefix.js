import Config          from "./config";
import AppFolders      from "./app-folders";
import Prefix          from "./prefix";
import System          from "./system";
import FileSystem      from "./file-system";
import Replaces        from "./replaces";
import Utils           from "./utils";
import Registry        from "./registry";
import Patches         from "./patches";
import Dxvk            from "./dxvk";
import Fixes           from "./fixes";
import MediaFoundation from "./media-foundation";
import Vkd3dProton     from "./vkd3d-proton";
import Update          from "./update";
import Proton          from "./kernels/proton";

export default class WinePrefix {

  /**
   * @type {AppFolders}
   */
  appFolders = null;

  /**
   * @type {Prefix}
   */
  prefix = null;

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
   * @type {MediaFoundation}
   */
  mf = null;

  /**
   * @type {Vkd3dProton}
   */
  vkd3dProton = null;

  /**
   * @type {Update}
   */
  update = null;

  /**
   * @param {AppFolders} appFolders
   * @param {Prefix} prefix
   * @param {Config} config
   * @param {System} system
   * @param {FileSystem} fs
   * @param {Replaces} replaces
   * @param {Registry} registry
   * @param {Patches} patches
   * @param {Dxvk} dxvk
   * @param {Fixes} fixes
   * @param {MediaFoundation} mf
   * @param {Vkd3dProton} vkd3dProton
   * @param {Update} update
   */
  constructor(appFolders, prefix, config, system, fs, replaces, registry, patches, dxvk, fixes, mf, vkd3dProton, update) {
    this.appFolders  = appFolders;
    this.prefix      = prefix;
    this.config      = config;
    this.system      = system;
    this.fs          = fs;
    this.replaces    = replaces;
    this.registry    = registry;
    this.patches     = patches;
    this.dxvk        = dxvk;
    this.fixes       = fixes;
    this.mf          = mf;
    this.vkd3dProton = vkd3dProton;
    this.update      = update;
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
    let wine = window.app.getKernel();
    return this.fs.exists(wine.getPrefix());
  }

  /**
   * @return {Promise}
   */
  create() {
    let wine    = window.app.getKernel();
    let promise = Promise.resolve();

    let wineBinDir = wine.getWineDir() + '/bin';

    if (this.fs.exists(wineBinDir) && !this.fs.exists(this.appFolders.getWineFile())) {
      this.fs.chmod(wineBinDir);
    }

    if (!this.isCreated()) {

      if ('win64' === wine.getWineArch() && !(wine instanceof Proton)) {
        let defaultPrefix = wine.getWineDir() + '/share/default_pfx';

        if (this.fs.exists(defaultPrefix)) {
          this.fs.cp(defaultPrefix, wine.getWinePrefix(), {}, false);
        }
      }

      wine.boot();
      wine.setWinePrefixInfo('version', wine.getVersion());
      wine.setWinePrefixInfo('arch', wine.getWineArch());
      this.prefix.getConfigReplaces().forEach(path => this.replaces.replaceByFile(path, true));
      this.updateSandbox();
      this.updateSaves();
      this.updateGameFolder();
      this.updateRegs();
      this.patches.apply();
      this.updateCsmt();
      this.updatePulse();
      this.updateWindowsVersion();

      promise = this.dxvk.update()
        .then(() => this.vkd3dProton.update())
        .then(() => this.mf.update())
        .then(() => this.fixes.update())
        .then(() => this.update.moveSelf());
    }

    return promise;
  }

  /**
   * @return {Promise}
   */
  reCreate() {
    if (this.isCreated()) {
      let wine = window.app.getKernel();
      this.fs.rm(wine.getPrefix());
    }

    return this.create();
  }

  updateSandbox() {
    if (!this.prefix.isSandbox()) {
      return false;
    }

    let wine = window.app.getKernel();

    let updateTimestampPath = wine.getWinePrefix() + '/.update-timestamp';

    if (this.fs.exists(updateTimestampPath) && 'disable' === this.fs.fileGetContents(updateTimestampPath)) {
      return false;
    }

    this.fs.filePutContents(updateTimestampPath, 'disable');

    this.fs.glob(`${wine.getDosDevices()}/*`).forEach((device) => {
      let name = this.fs.basename(device);

      if ('c:' !== name) {
        this.fs.rm(device);
      }
    });

    this.fs.glob(wine.getDriveC() + '/users/' + wine.getUserName() + '/*').forEach(path => {
      if (this.fs.isSymbolicLink(path)) {
        this.fs.rm(path);
        this.fs.mkdir(path);
      }
    });

    wine.reg('/d', 'HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Desktop\\Namespace\\{9D20AAE8-0625-44B0-9CA7-71889C2254D9}');

    return true;
  }

  updateSaves() {
    let wine = window.app.getKernel();
    let path = this.appFolders.getSavesFoldersFile();

    if (!this.fs.exists(path)) {
      return false;
    }

    if (true === wine.getWinePrefixInfo('saves')) {
      return false;
    }

    wine.setWinePrefixInfo('saves', true);

    let folders = Utils.jsonDecode(this.fs.fileGetContents(path));

    Object.keys(folders).forEach((folder) => {
      let saveFolderPath   = this.appFolders.getSavesDir() + '/' + folder;
      let prefixFolderPath = wine.getDriveC() + '/' + _.trim(this.replaces.replaceByString(folders[folder]), '/');

      this.fs.lnOfRoot(saveFolderPath, prefixFolderPath);
    });

    return true;
  }

  updateGameFolder() {
    let wine      = window.app.getKernel();
    let path      = this.appFolders.getGamesDir();
    let dest      = this.prefix.getWinePrefixGameFolder();
    let logs      = this.appFolders.getLogsDir();
    let logsDest  = wine.getWinePrefixLogsDir();
    let cache     = this.appFolders.getCacheDir();
    let cacheDest = wine.getWinePrefixCacheDir();

    if (this.fs.exists(wine.getWinePrefix()) && this.fs.exists(dest)) {
      return false;
    }

    this.fs.lnOfRoot(path, dest);
    this.fs.lnOfRoot(logs, logsDest);
    this.fs.lnOfRoot(cache, cacheDest);

    return true;
  }

  updateRegs() {
    let wine = window.app.getKernel();

    if (true === wine.getWinePrefixInfo('registry')) {
      return false;
    }

    wine.setWinePrefixInfo('registry', true);

    return this.registry.apply(this.patches.getRegistryFiles());
  }

  updateCsmt() {
    let wine = window.app.getKernel();

    if (!this.fs.exists(wine.getWinePrefix()) || wine.isBlocked()) {
      return false;
    }

    let csmt = this.config.isCsmt();

    if (wine.getWinePrefixInfo('csmt') === csmt) {
      return false;
    }

    wine.setWinePrefixInfo('csmt', csmt);

    let regs = [
      "Windows Registry Editor Version 5.00\n",
      "[HKEY_CURRENT_USER\\Software\\Wine\\Direct3D]\n",
    ];

    let path = wine.getDriveC() + '/csmt.reg';

    if (csmt) {
      regs.push('"csmt"=-\n');
    } else {
      regs.push('"csmt"=dword:0\n');
    }

    this.fs.filePutContents(path, Utils.encode(regs.join('\n'), 'utf-16'));
    wine.reg(path);

    return true;
  }

  updatePulse() {
    let wine = window.app.getKernel();

    if (!this.fs.exists(wine.getWinePrefix()) || wine.isBlocked()) {
      return false;
    }

    let pulseAudio = this.system.isPulse();
    let pulse      = this.config.isPulse() && pulseAudio;

    if (wine.getWinePrefixInfo('pulse') === pulse) {
      return false;
    }

    wine.setWinePrefixInfo('pulse', pulse);

    let regs = [
      "Windows Registry Editor Version 5.00\n",
      "[HKEY_CURRENT_USER\\Software\\Wine\\Drivers]\n",
    ];

    let path = wine.getDriveC() + '/sound.reg';

    if (pulse) {
      regs.push('"Audio"="pulse"\n');
    } else {
      regs.push('"Audio"="alsa"\n');
    }

    this.fs.filePutContents(path, Utils.encode(regs.join('\n'), 'utf-16'));
    wine.reg(path);

    return true;
  }

  updateWindowsVersion() {
    let wine = window.app.getKernel();

    if (!this.fs.exists(wine.getWinePrefix()) || wine.isBlocked()) {
      return false;
    }

    let winver = this.prefix.getWindowsVersion();

    if (wine.getWinePrefixInfo('winver') === winver) {
      return false;
    }

    wine.setWinePrefixInfo('winver', winver);

    let regs = [
      "Windows Registry Editor Version 5.00\n",
    ];

    let path   = wine.getDriveC() + '/winver.reg';
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
        wine.run('reg', 'add', 'HKLM\\System\\CurrentControlSet\\Control\\ProductOptions', '/v', 'ProductType', '/d', 'WinNT', '/f');
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
        wine.run('reg', 'add', 'HKLM\\System\\CurrentControlSet\\Control\\ProductOptions', '/v', 'ProductType', '/d', 'WinNT', '/f');
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
    wine.reg(path);

    return true;
  }
}