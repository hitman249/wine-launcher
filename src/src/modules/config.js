import _          from "lodash";
import FileSystem from "./file-system";
import Utils      from "./utils";
import Prefix     from "./prefix";

export default class Config {

    /**
     * @type {Prefix}
     */
    prefix = null;

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

    /**
     * @type {number}
     */
    sort = 500;

    /**
     * @type {string}
     */
    defaultFile = '/data/configs/game.json';

    /**
     * @type {null}
     */
    process = null;

    /**
     * @type {number}
     */
    static fileIndex = 0;

    /**
     * @param {string|null?} filepath
     * @param {Prefix?} prefix
     */
    constructor(filepath = null, prefix = null) {
        this.path   = filepath;
        this.prefix = prefix || (window.app ? window.app.getPrefix() : new Prefix());
        this.fs     = this.prefix.getFileSystem();

        this.loadConfig();
    }

    /**
     * @return {Config[]}
     */
    findConfigs() {
        let prefixFilename = this.prefix.getBasename();

        return _.sortBy(
            this.fs
                .glob(this.prefix.getConfigsDir() + '/*.json')
                .filter(path => prefixFilename !== this.fs.basename(path))
                .map(path => new Config(path)),
            'sort'
        );
    }

    getPath() {
        if (null === this.path) {
            // eslint-disable-next-line
            while (true) {
                let path     = this.defaultFile.split('.json').join(`${Config.fileIndex++}.json`);
                let fullPath = this.prefix.getRootDir() + path;

                if (!this.fs.exists(fullPath)) {
                    return fullPath;
                }
            }
        }

        return this.path;
    }

    getCode() {
        return _.head(this.fs.basename(this.path).split('.'));
    }

    getGameName() {
        return _.get(this.config, 'app.name', 'Empty name');
    }

    getGameDescription() {
        return _.get(this.config, 'app.description', '');
    }

    getGameVersion() {
        return _.get(this.config, 'app.version', '');
    }

    getGameTime() {
        return _.get(this.config, 'app.time', 0);
    }

    getGamePath() {
        return '/' + _.trim(_.get(this.config, 'app.path', ''), '/');
    }

    getGameExe() {
        return _.get(this.config, 'app.exe', '');
    }

    getGameArguments() {
        return _.get(this.config, 'app.arguments', '');
    }

    getImagesPath() {
        return `${this.prefix.getConfigsDir()}/${this.getCode()}`;
    }

    getGameIcon() {
        let path = `${this.getImagesPath()}/icon.png`;

        if (this.fs.exists(path)) {
            return path;
        }

        return '';
    }

    getGameBackground() {
        let exts = ['.jpg', '.png', '.jpeg'];
        let path = `${this.getImagesPath()}/background`;

        let ext = exts.find((ext) => this.fs.exists(`${path}${ext}`));

        if (ext) {
            return `${path}${ext}`;
        }

        return '';
    }

    loadConfig() {
        if (!this.config && this.path && this.fs.exists(this.path)) {
            this.config = Utils.jsonDecode(this.fs.fileGetContents(this.path));
        }

        if (!this.config) {
            this.config = this.getDefaultConfig();
        }

        if (!this.path) {
            this.path = this.getPath();
        }

        this.sort = _.get(this.config, 'app.sort', 500);
    }

    getDefaultConfig() {
        return {
            app:     {
                path:        'The Super Game',
                exe:         'Game.exe',
                arguments:   '-language=russian',
                name:        'The Super Game: Deluxe Edition',
                description: 'Game description',
                version:     '1.0.0',
                sort:        500,
                time:        0,
            },
            exports: {
                WINEESYNC:                1,
                WINEFSYNC:                1,
                PBA_DISABLE:              1,
                WINE_LARGE_ADDRESS_AWARE: 1,
            },
            wine:    {
                csmt:  true,
                pulse: true,
            },
            window:  {
                enable:     false,
                resolution: 'auto',
            },
        };
    }

    /**
     * @returns {Object}
     */
    getConfig() {
        return this.config;
    }

    /**
     * @returns {Object}
     */
    getFlatConfig() {
        let result = {};
        let config = _.cloneDeep(this.getConfig());

        Object.keys(config).forEach((key) => {
            let section = config[key];

            if ('exports' === key) {
                result[key] = section;
                return;
            }

            Object.keys(section).forEach((sectionKey) => {
                result[`${key}.${sectionKey}`] = section[sectionKey];
            });
        });

        return result;
    }

    /**
     * @param {Object} config
     */
    setFlatConfig(config) {
        Object.keys(config).forEach((path) => {
            if ('icon' === path || 'background' === path) {
                let file = config[path];

                if (undefined !== file.body) {
                    let ext        = _.toLower(_.last(file.file.name.split('.')));
                    let imagesPath = this.getImagesPath();

                    if (!this.fs.exists(imagesPath)) {
                        this.fs.mkdir(imagesPath);
                    }

                    this.fs.glob(`${imagesPath}/${path}.*`).forEach(image => this.fs.rm(image));

                    this.fs.filePutContents(`${imagesPath}/${path}.${ext}`, file.body);
                }

                return;
            }

            this.setConfigValue(path, config[path]);
        });
    }

    /**
     * @param {string} path 'app.time'
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
     * @return {boolean}
     */
    save() {
        if (!this.path || !this.config) {
            return false;
        }

        this.fs.filePutContents(this.path, Utils.jsonEncode(this.config));

        return true;
    }

    /**
     * @return {boolean}
     */
    isEsync() {
        return parseInt(_.get(this.config, 'exports.WINEESYNC', 0)) === 1;
    }

    /**
     * @return {boolean}
     */
    isFsync() {
        return parseInt(_.get(this.config, 'exports.WINEFSYNC', 0)) === 1;
    }

    /**
     * @return {boolean}
     */
    isPba() {
        return parseInt(_.get(this.config, 'exports.PBA_DISABLE', 0)) === 0;
    }

    /**
     * @return {boolean}
     */
    isCsmt() {
        return Boolean(_.get(this.config, 'wine.csmt', false));
    }

    /**
     * @return {boolean}
     */
    isPulse() {
        return Boolean(_.get(this.config, 'wine.pulse', false));
    }

    /**
     * @return {boolean}
     */
    isWindow() {
        return Boolean(_.get(this.config, 'window.enable', false));
    }

    /**
     * @return {{}}
     */
    getConfigExports() {
        return _.get(this.config, 'exports', {});
    }

    setProcess(spawn) {
        this.process = spawn;
    }

    killProcess() {
        if (this.process) {
            window.process.kill(-this.process.pid);
            this.process = null;
        }
    }
}