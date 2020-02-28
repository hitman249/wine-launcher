import _ from "lodash";

const child_process = require('child_process');

export default class Command {
    /**
     * @type {Config}
     */
    config = null;

    /**
     * @type {string|null}
     */
    locale = null;

    /**
     * @param {Config} config
     */
    constructor(config) {
        this.config = config;
    }

    /**
     * @param {string} cmd
     * @returns {string}
     */
    run(cmd) {
        return child_process.execSync(cmd).toString().trim();
    }

    /**
     * @param {string} cmd
     * @param {Function} callable
     * @returns {Promise}
     */
    watch(cmd, callable = () => {}) {
        return new Promise((resolve) => {
            let watch = child_process.spawn('sh', ['-c', cmd]);

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

        let counts  = {};
        let locales = child_process.execSync('locale').toString().trim().split('\n').map(s => s.trim())
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
            this.locale = locale;
        }

        return this.locale;
    }

    /**
     * @param {string} cmd
     * @return {string}
     */
    cast(cmd) {
        let exported = {
            LD_LIBRARY_PATH:  `$LD_LIBRARY_PATH:${this.config.getLibsDir()}:${this.config.getLibs64Dir()}`,
            WINE:             this.config.getWineBin(),
            WINE64:           this.config.getWine64Bin(),
            WINEPREFIX:       this.config.getWinePrefix(),
            WINESERVER:       this.config.getWineServer(),
            WINEARCH:         this.config.getWineArch(),
            WINEDEBUG:        this.config.getWineDebug(),
            WINEDLLOVERRIDES: this.config.getWineDllOverrides(),
            PROTON_LOG:       this.config.getLogProtonFile(),
            XDG_CACHE_HOME:   this.config.getCacheDir(),
        };

        let locale = this.getLocale();

        if (locale) {
            exported.LC_ALL = locale;
        }

        let esync = this.config.isEsync();

        if (!esync) {
            exported.PROTON_NO_ESYNC = 'noesync';
        }

        let dxvk = this.config.isDxvk();

        if (dxvk) {
            exported.DXVK_CONFIG_FILE      = this.config.getWinePrefixDxvkConfFile();
            exported.DXVK_STATE_CACHE_PATH = this.config.getWinePrefixCacheDir();
            exported.DXVK_LOG_PATH         = this.config.getWinePrefixLogsDir();
        }

        if (exported.WINEDLLOVERRIDES.includes('nvapi')) {
            let overrides = exported.WINEDLLOVERRIDES.split(';');
            overrides.push('nvapi64,nvapi=');
            overrides.push('d3d9=n');
            exported.WINEDLLOVERRIDES = overrides.join(';');
        }

        let configExports = this.config.getConfigExports();

        Object.keys(configExports).forEach((field) => {
            exported[field] = configExports[field];
        });

        let env = Object.keys(exported).map((field) => `export ${field}="${exported[field]}"`).join('; ');

        return `${env} cd "${this.config.getRootDir()}" && ${cmd}`;
    }
}