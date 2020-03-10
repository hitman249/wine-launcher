import _          from "lodash";
import FileSystem from "./file-system";
import Utils      from "./utils";

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

    defaultFile = '/data/configs/game.json';

    /**
     * @param {string|null?} filepath
     */
    constructor(filepath = null) {
        this.path   = filepath;
        this.prefix = app.getPrefix();
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
        return this.path || this.prefix.getRootDir() + this.defaultFile;
    }

    getCode() {
        return this.fs.basename(this.path).split('.')[0];
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

    getGameIcon() {
        let path = `${this.prefix.getConfigsDir()}/${this.getCode()}/icon.png`;

        if (this.fs.exists(path)) {
            return path;
        }

        return '';
    }

    getGameBackground() {
        let exts = ['.jpg', '.png', '.jpeg'];
        let path = `${this.prefix.getConfigsDir()}/${this.getCode()}/background`;

        let ext = exts.find((ext) => this.fs.exists(`${path}${ext}`));

        if (ext) {
            return `${path}${ext}`;
        }

        return '';
    }

    loadConfig() {
        if (null === this.path) {
            let config = _.head(this.findConfigs());
            if (config) {
                this.path   = config.path;
                this.config = config.getConfig();
            }
        }
        if (!this.config && this.path && this.fs.exists(this.path)) {
            this.config = Utils.jsonDecode(this.fs.fileGetContents(this.path));
        }

        if (!this.config) {
            this.config = this.getDefaultConfig();
        }

        this.sort = _.get(this.config, 'app.sort', 500);
    }

    getDefaultConfig() {
        return {
            app:    {
                additional_path: 'The Super Game',
                exe:             'Game.exe',
                arguments:       '-language=russian',
                name:            'The Super Game: Deluxe Edition',
                description:     'Game description',
                version:         '1.0.0',
                sort:            500,
                time:            0,
            },
            export: {
                WINEESYNC:   1,
                PBA_DISABLE: 1,
            },
            wine:   {
                csmt:  true,
                pulse: true,
            },
            window: {
                enable:     false,
                resolution: '800x600',
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
        return Boolean(_.get(this.config, 'export.WINEESYNC'));
    }

    /**
     * @return {boolean}
     */
    isPba() {
        return !_.get(this.config, 'export.PBA_DISABLE');
    }

    /**
     * @return {boolean}
     */
    isCsmt() {
        return Boolean(_.get(this.config, 'wine.csmt'));
    }

    /**
     * @return {boolean}
     */
    isPulse() {
        return Boolean(_.get(this.config, 'wine.pulse'));
    }

    /**
     * @return {{}}
     */
    getConfigExports() {
        return _.get(this.config, 'export', {});
    }
}