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

        if (null !== path && this.fs.exists(path) && !this.fs.exists(this.getPathFile())) {
            this.setConfigValue('name', this.fs.basename(path));
            this.setConfigValue('created', true);
            this.save();
        }
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
                    this.path = fullPathDir;
                    return this.path;
                }
            }
        }

        return this.path;
    }

    /**
     * @return {string[]}
     */
    getRegistryFiles() {
        let path = this.getPath();

        if (!this.fs.exists(path)) {
            return [];
        }

        return Utils.natsort(this.fs.glob(path + '/*.reg'));
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
        let file = this.getPathFile();

        if (!this.config && this.fs.exists(file)) {
            this.config = Utils.jsonDecode(this.fs.fileGetContents(file));
        }

        if (!this.config) {
            this.config = this.getDefaultConfig();
        }

        this.sort = _.get(this.config, 'sort', 500);
    }

    getDefaultConfig() {
        return {
            active:  true,
            name:    'Patch',
            version: '1.0.0',
            arch:    this.prefix.getWineArch(),
            sort:    500,
            size:    0,
            created: false,
        };
    }

    /**
     * @return {boolean}
     */
    isCreated() {
        return _.get(this.config, 'created', true);
    }

    /**
     * @return {boolean}
     */
    isSaved() {
        return this.fs.exists(this.getPathFile());
    }

    /**
     * @return {boolean}
     */
    isActive() {
        return _.get(this.config, 'active', true);
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

        let size = this.fs.getDirectorySize(this.getPath()) - this.fs.size(this.getPathFile());
        this.setConfigValue('size', size);

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