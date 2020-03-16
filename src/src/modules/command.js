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
    constructor(prefix, config= null) {
        this.prefix = prefix;
        this.config = config;
    }

    /**
     * @param {string} cmd
     * @returns {string}
     */
    run(cmd) {
        return this.exec(this.cast(cmd));
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
     * @returns {Promise}
     */
    watch(cmd, callable = () => {}) {
        return new Promise((resolve) => {
            let watch = child_process.spawn('sh', ['-c', this.cast(cmd)]);

            watch.stdout.on('data', (data) => callable(data.toString(), 'stdout'));
            watch.stderr.on('data', (data) => callable(data.toString(), 'stderr'));

            watch.on('close', resolve);
            watch.on('exit', resolve);
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
     * @return {string}
     */
    cast(cmd) {
        let exported = {
            LD_LIBRARY_PATH:  `$LD_LIBRARY_PATH:${this.prefix.getLibsDir()}:${this.prefix.getLibs64Dir()}`,
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

        if (this.config) {
            let esync = this.config.isEsync();

            if (!esync) {
                exported.PROTON_NO_ESYNC = 'noesync';
            }
        }

        let dxvk = this.prefix.isDxvk();

        if (dxvk) {
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

        if (this.config) {
            let configExports = this.config.getConfigExports();

            Object.keys(configExports).forEach((field) => {
                exported[field] = configExports[field];
            });
        }


        let env = Object.keys(exported).map((field) => `export ${field}="${exported[field]}"`).join('; ');

        if (env) {
            env = env + ';';
        }

        return `${env} cd "${this.prefix.getRootDir()}" && ${cmd}`;
    }
}