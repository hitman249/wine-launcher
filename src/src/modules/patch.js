import _      from "lodash";
import Utils  from "./utils";
import Prefix from "./prefix";

export default class Patch {

    /**
     * @type {string|null}
     */
    path = null;

    /**
     * @type {number}
     */
    sort = 500;

    /**
     * @type {object}
     */
    config = null;

    /**
     * @type {boolean}
     */
    created = false;

    /**
     * @type {string}
     */
    defaultPathDir = '/patch';

    /**
     * @type {string}
     */
    defaultFile = '/patch.json';

    /**
     * @type {number}
     */
    static patchIndex = 0;

    /**
     * @param {string|null?} path
     * @param {Prefix?} prefix
     */
    constructor(path = null, prefix = null) {
        this.path   = path;
        this.prefix = prefix || (window.app ? window.app.getPrefix() : new Prefix());
        this.fs     = this.prefix.getFileSystem();

        this.loadConfig();
    }

    /**
     * @return {string}
     */
    getPath() {
        if (null === this.path) {
            // eslint-disable-next-line
            while (true) {
                let fullPathDir = this.prefix.getPatchesDir() + `${this.defaultPathDir}${Patch.patchIndex++}`;

                if (!this.fs.exists(fullPathDir)) {
                    return fullPathDir;
                }
            }
        }

        return this.path;
    }

    /**
     * @return {string}
     */
    getPathFile() {
        return this.getPath() + this.defaultFile;
    }

    /**
     * @return {string}
     */
    getCode() {
        return this.fs.basename(_.head(this.getPath().split('/patch.json')));
    }

    loadConfig() {
        if (!this.config && this.path && this.fs.exists(this.path)) {
            this.created = true;
            this.config  = Utils.jsonDecode(this.fs.fileGetContents(this.path));
        }

        if (!this.config) {
            this.config = this.getDefaultConfig();
        }

        if (!this.path) {
            this.path = this.getPath();
        }

        this.sort = _.get(this.config, 'sort', 500);
    }

    getDefaultConfig() {
        return {
            name:    'Patch',
            version: '1.0.0',
            arch:    this.prefix.getWineArch(),
            sort:    500,
            size:    0,
        };
    }

    /**
     * @return {boolean}
     */
    isCreated() {
        return this.created;
    }

    /**
     * @returns {Object}
     */
    getConfig() {
        return this.config;
    }

    /**
     * @return {boolean}
     */
    save() {
        if (!this.path || !this.config) {
            return false;
        }

        if (!this.fs.exists(this.path)) {
            this.fs.mkdir(this.path);
        }

        this.fs.filePutContents(this.getPathFile(), Utils.jsonEncode(this.config));

        return true;
    }

    /**
     * @returns {Object}
     */
    getFlatConfig() {
        return _.cloneDeep(this.getConfig());
    }

    /**
     * @param {Object} config
     */
    setFlatConfig(config) {
        Object.keys(config).forEach((path) => {
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
}