import Command    from "./command";
import AppFolders from "./app-folders";
import FileSystem from "./file-system";
import Prefix     from "./prefix";
import Utils      from "./utils";
import Wine       from "./kernels/wine";
import Proton     from "./kernels/proton";

const child_process = require('child_process');

export default class WineCommand extends Command {

  /**
   * @type {number[]}
   */
  static watches = [];

  /**
   * @type {AppFolders}
   */
  appFolders = null;

  /**
   * @type {FileSystem}
   */
  fs = null;

  /**
   * @type {Prefix}
   */
  prefix = null;

  /**
   * @type {Config}
   */
  config = null;

  /**
   * @type {Wine|Proton}
   */
  wine = null;

  /**
   * @param {AppFolders} appFolders
   * @param {FileSystem} fs
   * @param {Prefix} prefix
   * @param {Wine|Proton} wine
   * @param {?Config} config
   */
  constructor(appFolders, fs, prefix, wine = null, config = null) {
    super();

    this.appFolders = appFolders;
    this.fs         = fs;
    this.prefix     = prefix;
    this.wine       = wine;
    this.config     = config;
  }

  /**
   * @return {Wine|Proton}
   */
  getKernel() {
    if (null !== this.wine) {
      return this.wine;
    }

    return window.app.getKernel();
  }

  /**
   * @param {string} cmd
   * @param {boolean} useExports
   * @returns {string}
   */
  run(cmd, useExports = false) {
    return this.exec(this.cast(cmd, useExports));
  }

  /**
   * @param {string} cmd
   * @param {boolean} useExports
   * @returns {Buffer}
   */
  runOfBuffer(cmd, useExports = false) {
    return this.execOfBuffer(this.cast(cmd, useExports));
  }

  /**
   * @param {string} cmd
   * @param {Function} callable
   * @param {Function} spawnObject
   * @param {boolean} useExports
   * @param {boolean} watchProcess
   * @returns {Promise}
   */
  watch(cmd, callable = () => null, spawnObject = () => null, useExports = false, watchProcess = false) {
    return new Promise((resolve) => {
      let runCmd = this.cast(cmd, useExports);
      callable(`[Wine Launcher] Run command:\n${runCmd}\n\n`, 'stdout');

      let watch    = child_process.spawn('sh', [ '-c', runCmd ], { detached: useExports });
      let groupPid = -watch.pid;
      let startPid = watch.pid;

      while (startPid) {
        WineCommand.watches.push(startPid);
        startPid = Number(this.exec(`ps -o pid= --ppid ${startPid}`));
      }

      const customResolve = () => {
        WineCommand.watches = WineCommand.watches.filter(pid => pid !== watch.pid);

        if (useExports || watchProcess) {
          try {
            let wine        = this.getKernel();
            let processList = wine.processList();
            let pids        = _.difference(Object.keys(processList).map(s => Number(s)), WineCommand.watches);
            let nextPid     = pids.length > 0 ? pids[0] : 0;

            if (nextPid) {
              WineCommand.watches.push(nextPid);
              callable(`[Wine Launcher] Next watch process: "${processList[nextPid]}"\n`, 'stdout');

              const wait = (pid) => {
                if (!this.fs.exists(`/proc/${pid}`)) {
                  return customResolve();
                }

                return Utils.sleep(1000).then(() => wait(pid));
              };

              return wait(nextPid);
            } else {
              window.process.kill(groupPid);
            }
          } catch (e) {
          }
        }

        return resolve();
      };

      watch.stdout.on('data', (data) => callable(data.toString(), 'stdout'));
      watch.stderr.on('data', (data) => callable(data.toString(), 'stderr'));

      watch.on('close', () => customResolve());
      watch.on('exit', () => customResolve());

      spawnObject(watch);
    });
  }

  /**
   * @param {string} cmd
   * @param {boolean} useExports
   * @return {string}
   */
  cast(cmd, useExports = false) {
    let wine   = this.getKernel();
    let driver = window.app.getDriver();
    let container = window.app.getFacadeContainer();

    let exported = {
      VK_LAYER_PATH:                    `$VK_LAYER_PATH:${this.appFolders.getCacheImplicitLayerDir()}`,
      XDG_CACHE_HOME:                   this.appFolders.getCacheDir(),
      WINE:                             wine.getWineBin(),
      WINE64:                           wine.getWine64Bin(),
      WINEPREFIX:                       wine.getWinePrefix(),
      WINESERVER:                       wine.getWineServer(),
      WINEARCH:                         wine.getWineArch(),
      WINEDEBUG:                        wine.getWineDebug(),
      WINESTART:                        'C:\\windows\\command\\start.exe',
      WINEDLLOVERRIDES:                 wine.getWineDllOverrides(),
      SteamAppId:                       '',
      SteamGameId:                      '',
      STEAM_COMPAT_CLIENT_INSTALL_PATH: wine.getPrefix(),
      STEAM_COMPAT_DATA_PATH:           wine.getPrefix(),
    };

    if (container.isSupportLdLibraryPath()) {
      exported['LD_LIBRARY_PATH'] = `${this.appFolders.getLibsDir()}:${this.appFolders.getLibs64Dir()}`;
    }

    let gst = [
      wine.getWineDir() + '/lib/gstreamer-1.0',
      wine.getWineDir() + '/lib64/gstreamer-1.0'
    ].filter(path => this.fs.exists(path));

    if (gst.length > 0) {
      exported.GST_PLUGIN_SYSTEM_PATH_1_0 = gst.join(':');
    }

    let wineLibDirs = wine.getWineLibDirs();

    if (wineLibDirs.length > 0) {
      exported.WINEDLLPATH = wineLibDirs.join(':');
      if (container.isSupportLdLibraryPath()) {
        exported['LD_LIBRARY_PATH'] += ':' + exported.WINEDLLPATH;
      }
    }

    let prefixCmd = '';

    let locale = this.getLocale();

    if (locale) {
      exported.LC_ALL = locale;
    }

    if (this.prefix.isDxvk()) {
      exported.DXVK_CONFIG_FILE      = wine.getWinePrefixDxvkConfFile();
      exported.DXVK_STATE_CACHE_PATH = wine.getWinePrefixCacheDir();
      exported.DXVK_LOG_PATH         = wine.getWinePrefixLogsDir();
    }

    if (useExports) {
      let disabled  = [];
      let builtin   = [];
      let preloaded = [];
      let vkLayers  = [];

      if (this.config) {
        prefixCmd = this.config.getPrefixCmd();

        let exportEsync = this.config.isExportEsync();
        let esync       = this.config.isConfigEsync();

        if (null === exportEsync && esync) {
          exported.WINEESYNC = 1;
        }

        let exportFsync = this.config.isExportFsync();
        let fsync       = this.config.isConfigFsync();

        if (null === exportFsync && fsync) {
          exported.WINEFSYNC = 1;
        }

        let exportDlsym = this.config.isExportMangoHudDlsym();
        let dlsym       = this.config.isConfigMangoHudDlsym();

        if (null === exportDlsym && dlsym) {
          exported.MANGOHUD_DLSYM = 1;
        }

        let exportACO = this.config.isExportACO();
        let aco       = this.config.isConfigACO();

        if (null === exportACO && aco && !driver.isDefaultACO()) {
          exported.RADV_PERFTEST = 'aco';
        }

        let exportSSM = this.config.isExportSSM();
        let ssm       = this.config.isConfigSSM();

        if (null === exportSSM && ssm) {
          exported.STAGING_SHARED_MEMORY = 1;
        }

        let exportSWC = this.config.isExportSWC();
        let swc       = this.config.isConfigSWC();

        if (null === exportSWC && swc) {
          exported.STAGING_WRITECOPY = 1;
        }

        let exportLargeAddressAware = this.config.isExportLargeAddressAware();
        let largeAddressAware       = this.config.isConfigLargeAddressAware();

        if (null === exportLargeAddressAware && largeAddressAware) {
          exported.WINE_LARGE_ADDRESS_AWARE = 1;
        }

        if (this.config.isDisableNvapi()) {
          disabled = disabled.concat([ 'nvapi', 'nvapi64', 'nvcuda', 'nvcuda64' ]);
        }

        if (this.config.isNoD3D9()) {
          builtin.push('d3d9');
        }

        if (this.config.isNoD3D10()) {
          if (this.config.isNoD3D11()) {
            builtin.push('dxgi');
          }

          builtin = builtin.concat([ 'd3d10', 'd3d10_1', 'd3d10core' ]);
        }

        if (this.config.isNoD3D11()) {
          if (this.config.isNoD3D10()) {
            builtin.push('dxgi');
          }

          builtin.push('d3d11');
        }

        if (this.prefix.isVkBasalt() && this.prefix.isVkBasaltLib() && ((this.config.existExportsVkBasalt() && this.config.isVkBasalt()) || !this.config.existExportsVkBasalt())) {
          exported.ENABLE_VKBASALT      = 1;
          exported.VKBASALT_CONFIG_FILE = this.appFolders.getVkBasaltConfFile();
          exported.VKBASALT_SHADER_PATH = this.appFolders.getShareDir() + '/vkBasalt/shader';
          exported.VKBASALT_LOG_FILE    = this.appFolders.getLogFileVkBasalt();

          let vkBasalt = window.app.getVkBasalt();

          vkLayers.push(vkBasalt.getLayer32().layer.name);
          vkLayers.push(vkBasalt.getLayer64().layer.name);
        }

        if (this.prefix.isMangoHud() && this.prefix.isMangoHudLib() && (this.config.existExportsMangoHud() && this.config.isMangoHud())) {
          let mangoHud = window.app.getMangoHud();

          vkLayers.push(mangoHud.getLayer32().layer.name);
          vkLayers.push(mangoHud.getLayer64().layer.name);

          if ('opengl' === this.config.getRenderAPI()) {
            if ('win32' === wine.getWineArch()) {
              preloaded.push(this.fs.basename(this.prefix.getMangoHudLibDlsumPath('win32')));
              preloaded.push(this.fs.basename(this.prefix.getMangoHudLibPath('win32')));
            }
            if ('win64' === wine.getWineArch()) {
              preloaded.push(this.fs.basename(this.prefix.getMangoHudLibDlsumPath('win64')));
              preloaded.push(this.fs.basename(this.prefix.getMangoHudLibPath('win64')));
            }
          }
        }

        if (wine.isAmdFsr() && this.config.isFsr()) {
          exported.WINE_FULLSCREEN_FSR          = 1;
          exported.WINE_FULLSCREEN_FSR_STRENGTH = this.config.getFsr();
        }

        let driver = window.app.getDriver();

        if (driver.getVersion().driver === 'nvidia') {
          exported['__NV_PRIME_RENDER_OFFLOAD']      = 1;
          exported['__GLX_VENDOR_LIBRARY_NAME']      = 'nvidia';
          exported['__GL_SYNC_TO_VBLANK']            = 0;
          exported['__GL_SHADER_DISK_CACHE_PATH']    = this.appFolders.getCacheDir();
          exported['__GL_SHADER_DISK_CACHE_SIZE']    = 512 * 1024 * 1024;
          exported['__GL_THREADED_OPTIMIZATIONS']    = 0;
          exported['__GL_SHARPEN_IGNORE_FILM_GRAIN'] = 0;
          exported['__GL_LOG_MAX_ANISO']             = 0;
          exported['__GL_ALLOW_FXAA_USAGE']          = 0;
          exported['__GL_SHARPEN_ENABLE']            = 0;
          exported['__GL_SHARPEN_VALUE']             = 0;
        } else {
          exported['vblank_mode']   = 0;
          exported['mesa_glthread'] = 'true';

          if (this.config.isOverrideMesaOpenGL()) {
            exported['MESA_GL_VERSION_OVERRIDE'] = driver.getOpenGLVersion();
          }
        }

        let configExports = this.config.getConfigExports();

        Object.keys(configExports).forEach((field) => {
          exported[field] = configExports[field];
        });
      }

      if (disabled.length > 0 || builtin.length > 0) {
        let overrides = exported.WINEDLLOVERRIDES.split(';').filter(s => s);

        if (disabled.length > 0) {
          overrides.push(`${_.uniq(disabled).join(',')}=`);
        }

        if (builtin.length > 0) {
          overrides.push(`${_.uniq(builtin).join(',')}=b`);
        }

        exported.WINEDLLOVERRIDES = overrides.join(';');
      }

      if (preloaded.length > 0) {
        exported.LD_PRELOAD = '$LD_PRELOAD:' + preloaded.join(':');
      }

      if (vkLayers.length > 0) {
        exported.VK_INSTANCE_LAYERS = '$VK_INSTANCE_LAYERS:' + vkLayers.join(':');
      }
    }

    if (container.isSupportLdLibraryPath()) {
      exported['LD_LIBRARY_PATH'] += ':$LD_LIBRARY_PATH';
    }

    let env = Object.keys(exported).map((field) => `${field}="${exported[field]}"`).join(' ');

    if (env) {
      env = 'export ' + env;
    }

    return container.run(
      `${prefixCmd} sh -c "${this.addSlashes(`${env} && cd "${this.appFolders.getRootDir()}" && ${cmd}`)}"`
        .split('\u0000').join('')
    );
  }
}