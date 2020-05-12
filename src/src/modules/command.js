import _      from "lodash";
import Prefix from "./prefix";
import Config from "./config";
import Utils  from "./utils";

const child_process = require('child_process');

export default class Command {

    /**
     * @type {number[]}
     */
    static watches = [];

    /**
     * @type {Prefix}
     */
    prefix = null;

    /**
     * @type {Config}
     */
    config = null;

    /**
     * @type {string|null}
     */
    locale = null;

    /**
     * @param {Prefix} prefix
     * @param {Config?} config
     */
    constructor(prefix, config = null) {
        this.prefix = prefix;
        this.config = config;
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
     * @return {string}
     */
    exec(cmd) {
        try {
            return child_process.execSync(cmd).toString().trim();
        } catch (e) {
            return e.stdout.toString().trim();
        }
    }

    /**
     * @param {string} cmd
     * @return {Buffer}
     */
    execOfBuffer(cmd) {
        try {
            return child_process.execSync(cmd);
        } catch (e) {
            return e.stdout;
        }
    }

    /**
     * @param {string} cmd
     * @param {Function} callable
     * @param {Function} spawnObject
     * @param {boolean} useExports
     * @param {boolean} watchProcess
     * @returns {Promise}
     */
    watch(cmd, callable = () => {}, spawnObject = () => {}, useExports = false, watchProcess = false) {
        return new Promise((resolve) => {
            let runCmd = this.cast(cmd, useExports);
            callable(`[Wine Launcher] Run command:\n${runCmd}\n\n`, 'stdout');

            let watch    = child_process.spawn('sh', ['-c', runCmd], { detached: useExports });
            let groupPid = -watch.pid;
            let startPid = watch.pid;

            while (startPid) {
                Command.watches.push(startPid);
                startPid = Number(this.exec(`ps -o pid= --ppid ${startPid}`));
            }

            let wine = window.app.getWine();
            let fs   = window.app.getFileSystem();

            const customResolve = () => {
                Command.watches = Command.watches.filter(pid => pid !== watch.pid);

                if (useExports || watchProcess) {
                    try {
                        let processList = wine.processList();
                        let pids        = _.difference(Object.keys(processList).map(s => Number(s)), Command.watches);
                        let nextPid     = pids.length > 0 ? pids[0] : 0;

                        if (nextPid) {
                            Command.watches.push(nextPid);
                            callable(`[Wine Launcher] Next watch process: "${processList[nextPid]}"\n`, 'stdout');

                            const wait = (pid) => {
                                if (!fs.exists(`/proc/${pid}`)) {
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
     * @return {string}
     */
    getLocale() {
        if (null !== this.locale) {
            return this.locale;
        }

        let locale = window.process.env.LC_ALL;

        if (locale) {
            this.locale = locale;
            return this.locale;
        }

        let counts = {};

        child_process.execSync('locale').toString().trim().split('\n').map(s => s.trim())
            .forEach((line) => {
                let [field, value] = line.split('=').map(s => _.trim(s.trim(), '"'));

                if (!value) {
                    return;
                }

                if (undefined === counts[value]) {
                    counts[value] = 0;
                } else {
                    counts[value] += 1;
                }
            });

        locale = _.maxBy(Object.keys(counts).map(locale => ({ locale, c: counts[locale] })), 'c');

        if (locale) {
            this.locale = locale.locale;
        }

        return this.locale;
    }

    /**
     * @param {string} cmd
     * @param {boolean} useExports
     * @return {string}
     */
    cast(cmd, useExports = false) {
        let exported = {
            LD_LIBRARY_PATH:  `$LD_LIBRARY_PATH:${this.prefix.getLibsDir()}:${this.prefix.getLibs64Dir()}`,
            VK_LAYER_PATH:    `$VK_LAYER_PATH:${this.prefix.getCacheImplicitLayerDir()}`,
            XDG_CACHE_HOME:   this.prefix.getCacheDir(),
            WINE:             this.prefix.getWineBin(),
            WINE64:           this.prefix.getWine64Bin(),
            WINEPREFIX:       this.prefix.getWinePrefix(),
            WINESERVER:       this.prefix.getWineServer(),
            WINEARCH:         this.prefix.getWineArch(),
            WINEDEBUG:        this.prefix.getWineDebug(),
            WINESTART:        'C:\\windows\\command\\start.exe',
            WINEDLLOVERRIDES: this.prefix.getWineDllOverrides(),
        };

        let gst = [
            this.prefix.getWineDir() + '/lib/gstreamer-1.0',
            this.prefix.getWineDir() + '/lib64/gstreamer-1.0'
        ].filter(path => this.prefix.fs.exists(path));

        if (gst.length > 0) {
            exported.GST_PLUGIN_SYSTEM_PATH_1_0 = gst.join(':');
        }

        let wine = [
            this.prefix.getWineDir() + '/lib/wine',
            this.prefix.getWineDir() + '/lib64/wine'
        ].filter(path => this.prefix.fs.exists(path));

        if (wine.length > 0) {
            exported.WINEDLLPATH = wine.join(':');
            exported.LD_LIBRARY_PATH += ':' + exported.WINEDLLPATH;
        }

        let prefixCmd = '';

        let locale = this.getLocale();

        if (locale) {
            exported.LC_ALL = locale;
        }

        if (this.prefix.isDxvk()) {
            exported.DXVK_CONFIG_FILE      = this.prefix.getWinePrefixDxvkConfFile();
            exported.DXVK_STATE_CACHE_PATH = this.prefix.getWinePrefixCacheDir();
            exported.DXVK_LOG_PATH         = this.prefix.getWinePrefixLogsDir();
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

                if (null === exportACO && aco) {
                    exported.RADV_PERFTEST = 'aco';
                }

                let exportLargeAddressAware = this.config.isExportLargeAddressAware();
                let largeAddressAware       = this.config.isConfigLargeAddressAware();

                if (null === exportLargeAddressAware && largeAddressAware) {
                    exported.WINE_LARGE_ADDRESS_AWARE = 1;
                }

                if (this.config.isDisableNvapi()) {
                    disabled = disabled.concat(['nvapi', 'nvapi64', 'nvcuda', 'nvcuda64']);
                }

                if (this.config.isNoD3D9()) {
                    builtin.push('d3d9');
                }

                if (this.config.isNoD3D10()) {
                    if (this.config.isNoD3D11()) {
                        builtin.push('dxgi');
                    }

                    builtin = builtin.concat(['d3d10', 'd3d10_1', 'd3d10core']);
                }

                if (this.config.isNoD3D11()) {
                    if (this.config.isNoD3D10()) {
                        builtin.push('dxgi');
                    }

                    builtin.push('d3d11');
                }

                if (this.prefix.isVkBasalt() && this.prefix.isVkBasaltLib() && this.config.isVkBasalt()) {
                    exported.ENABLE_VKBASALT      = 1;
                    exported.VKBASALT_CONFIG_FILE = this.prefix.getVkBasaltConfFile();
                    exported.VKBASALT_SHADER_PATH = this.prefix.getShareDir() + '/vkBasalt/shader';
                    exported.VKBASALT_LOG_FILE    = this.prefix.getLogFileVkBasalt();

                    let vkBasalt = window.app.getVkBasalt();

                    vkLayers.push(vkBasalt.getLayer32().layer.name);
                    vkLayers.push(vkBasalt.getLayer64().layer.name);
                }

                if (this.prefix.isMangoHud() && this.prefix.isMangoHudLib() && this.config.isMangoHud()) {
                    let mangoHud = window.app.getMangoHud();

                    vkLayers.push(mangoHud.getLayer32().layer.name);
                    vkLayers.push(mangoHud.getLayer64().layer.name);

                    if ('opengl' === this.config.getRenderAPI()) {
                        if ('win32' === this.prefix.getWineArch()) {
                            preloaded.push(this.prefix.getMangoHudLibDlsumPath('win32'));
                            preloaded.push(this.prefix.getMangoHudLibPath('win32'));
                        }
                        if ('win64' === this.prefix.getWineArch()) {
                            preloaded.push(this.prefix.getMangoHudLibDlsumPath('win64'));
                            preloaded.push(this.prefix.getMangoHudLibPath('win64'));
                        }
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

        let env = Object.keys(exported).map((field) => `${field}="${exported[field]}"`).join(' ');

        if (env) {
            env = 'export ' + env;
        }

        return `${prefixCmd} sh -c "${this.addSlashes(`${env} && cd "${this.prefix.getRootDir()}" && ${cmd}`)}"`
            .split('\u0000').join('');
    }

    /**
     * @param {string} cmd
     * @return {string}
     */
    addSlashes(cmd) {
        return cmd.split('\\').join('\\\\').split('"').join('\\"');
    }
}