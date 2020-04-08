import _      from "lodash";
import Prefix from "./prefix";
import Config from "./config";

const child_process = require('child_process');

export default class Command {

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
     * @param {Function} callable
     * @param {Function} spawnObject
     * @param {boolean} useExports
     * @returns {Promise}
     */
    watch(cmd, callable = () => {}, spawnObject = () => {}, useExports = false) {
        return new Promise((resolve) => {
            let watch = child_process.spawn('sh', ['-c', this.cast(cmd, useExports)], { detached: useExports });

            const customResolve = () => {
                if (useExports) {
                    try {
                        window.process.kill(-watch.pid);
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
            WINE:             this.prefix.getWineBin(),
            WINE64:           this.prefix.getWine64Bin(),
            WINEPREFIX:       this.prefix.getWinePrefix(),
            WINESERVER:       this.prefix.getWineServer(),
            WINEARCH:         this.prefix.getWineArch(),
            WINEDEBUG:        this.prefix.getWineDebug(),
            WINEDLLOVERRIDES: this.prefix.getWineDllOverrides(),
            PROTON_LOG:       this.prefix.getLogFileProton(),
            XDG_CACHE_HOME:   this.prefix.getCacheDir(),
        };

        let locale = this.getLocale();

        if (locale) {
            exported.LC_ALL = locale;
        }

        if (useExports) {
            if (this.config) {
                let esync = this.config.isEsync();

                if (!esync) {
                    exported.PROTON_NO_ESYNC = 'noesync';
                }
            }

            if (this.prefix.isDxvk()) {
                exported.DXVK_CONFIG_FILE      = this.prefix.getWinePrefixDxvkConfFile();
                exported.DXVK_STATE_CACHE_PATH = this.prefix.getWinePrefixCacheDir();
                exported.DXVK_LOG_PATH         = this.prefix.getWinePrefixLogsDir();
            }

            if (exported.WINEDLLOVERRIDES.includes('nvapi')) {
                let overrides = exported.WINEDLLOVERRIDES.split(';');
                overrides.push('nvapi64,nvapi=');
                overrides.push('d3d9=n');
                exported.WINEDLLOVERRIDES = overrides.join(';');
            }

            let preloaded = [];
            let vkLayers  = [];

            if (this.prefix.isVkBasalt() && this.prefix.isVkBasaltLib()) {
                exported.ENABLE_VKBASALT      = 1;
                exported.VKBASALT_CONFIG_FILE = this.prefix.getVkBasaltConfFile();
                exported.VKBASALT_LOG_FILE    = this.prefix.getLogFileVkBasalt();

                let vkBasalt = window.app.getVkBasalt();

                vkLayers.push(vkBasalt.getLayer32().layer.name);
                vkLayers.push(vkBasalt.getLayer64().layer.name);
            }

            if (this.prefix.isMangoHud() && this.prefix.isMangoHudLib() && parseInt(this.config.getConfigValue('exports.MANGOHUD')) === 1) {
                let mangoHud = window.app.getMangoHud();

                vkLayers.push(mangoHud.getLayer32().layer.name);
                vkLayers.push(mangoHud.getLayer64().layer.name);
            }

            if (this.config) {
                let configExports = this.config.getConfigExports();

                Object.keys(configExports).forEach((field) => {
                    exported[field] = configExports[field];
                });
            }

            if (preloaded.length > 0) {
                exported.LD_PRELOAD = '$LD_PRELOAD:' + preloaded.join(':');
            }

            if (vkLayers.length > 0) {
                exported.VK_INSTANCE_LAYERS = '$VK_INSTANCE_LAYERS:' + vkLayers.join(':');
            }
        }

        let env = Object.keys(exported).map((field) => `export ${field}="${exported[field]}"`).join('; ');

        if (env) {
            env = env + ';';
        }

        return `${env} cd "${this.prefix.getRootDir()}" && ${cmd}`;
    }
}