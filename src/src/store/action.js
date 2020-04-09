import uuid from 'uuid';

/**
 * @property {string} PREFIX
 */
export default {
    LOAD:            'LOAD',
    PLAY:            'PLAY',
    STOP:            'STOP',
    CLEAR:           'CLEAR',
    SAVE:            'SAVE',
    RUN:             'RUN',
    UPDATE:          'UPDATE',
    PACK:            'PACK',
    UNPACK:          'UNPACK',
    RUNNING:         'RUNNING',
    PREFIX_RECREATE: 'PREFIX_RECREATE',
    ROUTE_CHANGED:   'ROUTE_CHANGED',

    /**
     * @return {this}
     */
    get() {
        return this.clone(this.getPath('', arguments));
    },

    /**
     * @param {string} prefix
     * @private
     */
    clone(prefix) {
        let map = {
            NAME: prefix,
        };
        Object.keys(this).forEach((key) => {
            if ('id' !== key && 'string' === typeof key) {
                map[key] = `${prefix}/${this[key]}`;
            }
        });

        return map;
    },

    /**
     * @param {string} prefix
     * @param args
     * @returns {string}
     */
    getPath(prefix, args) {
        if (args.length <= 0) {
            return prefix;
        }

        args = Array.prototype.slice.call(args);

        if (prefix) {
            args[0] = `${prefix}/${args[0]}`;
        }

        return args.join('/');
    },

    /**
     * @param module
     * @returns {{mutations: *, state: *, getters: *, actions: *, namespaced: boolean, modules: *}}
     */
    cloneStore(module) {
        let store = {
            namespaced: !!module.namespaced,
            state:      JSON.parse(JSON.stringify(module.state)),
            mutations:  {},
            actions:    {},
            getters:    {},
            modules:    {},
        };

        ['mutations', 'actions', 'getters'].forEach((type) => {
            if (module[type]) {
                Object.keys(module[type]).forEach((name) => {
                    store[type][name] = module[type][name].bind(store);
                });
            }
        });

        if (module.modules) {
            Object.keys(module.modules).forEach((name) => {
                store.modules[name] = this.cloneStore(module.modules[name]);
            });
        }

        return store;
    },

    /**
     * @param object
     * @returns {object}
     */
    cloneObject(object) {
        return _.cloneDeep(object);
    },

    /**
     * @param {string} type
     * @param {string} position
     * @param {string} title
     * @param {string} description
     */
    notify({ type = 'success', position = 'bottom right', title, description }) {
        $.Notification.notify(type, position, title, description);
    },

    /**
     * @param {string} title
     * @param {string} description
     */
    notifySuccess(title, description) {
        this.notify({ title, description });
    },

    /**
     * @param {string} title
     * @param {string} description
     */
    notifyError(title, description) {
        this.notify({ type: 'error', title, description });
    },

    /**
     * @param {string} title
     * @param {string} description
     */
    notifyWarning(title, description) {
        this.notify({ type: 'warning', title, description });
    },

    /**
     * @param {string} title
     * @param {string} description
     */
    notifyInfo(title, description) {
        this.notify({ type: 'info', title, description });
    },

    /**
     * @param {string} title
     * @param {string} description
     */
    notifyCustom(title, description) {
        this.notify({ type: 'custom', title, description });
    },

    get id() {
        return `id_${uuid.v4()}`.split('-').join('_');
    },
}