import action from "./action";

export default {
    namespaced: true,
    state:      {
        items:             [],
        created:           false,
        creating_snapshot: false,
    },
    mutations:  {
        [action.LOAD](state, patches) {
            state.items   = patches;
            state.created = Boolean(state.items.find((patch) => false === patch.patch.isCreated()));
        },
        [action.SAVE](state, flag) {
            state.creating_snapshot = flag;
        },
        [action.CLEAR](state) {
            state.items             = [];
            state.created           = false;
            state.creating_snapshot = false;
        },
    },
    actions:    {
        [action.LOAD]({ commit, state }) {
            if (state.items.length > 0) {
                return;
            }

            let fs = window.app.getFileSystem();

            let patches = window.app.getPatches().findPatches()
                .map((patch) => Object.assign({}, { patch, code: patch.getCode() }, patch.getFlatConfig()))
                .map((patch) => {
                    patch.size_formatted = fs.convertBytes(patch.size);
                    return patch;
                });

            commit(action.LOAD, patches);
        },
        [action.SAVE]({ commit, dispatch }, { patch, item }) {
            let creating_snapshot = !patch.isSaved();
            commit(action.SAVE, creating_snapshot);

            patch.setFlatConfig(item);
            patch.save();

            let snapshot = new Promise((resolve) => {
                if (creating_snapshot) {
                    setTimeout(() => {
                        window.app.getSnapshot().createBefore();
                        resolve();
                    }, 500);
                } else {
                    resolve();
                }
            });

            return snapshot.then(() => {
                commit(action.CLEAR);
                return dispatch(action.LOAD);
            });
        },
        [action.RUN]({ commit, dispatch, state }, { patch, item }) {
            let promise = Promise.resolve();

            if ('cfg' === item.action) {
                promise = window.app.getWine().cfg();
            }
            if ('fm' === item.action) {
                promise = window.app.getWine().fm();
            }
            if ('winetricks' === item.action) {
                promise = window.app.getWine().winetricks(...item.winetricks.split(' ').filter(s => s));
            }
            if ('install' === item.action) {
                promise = new Promise((resolve) => {
                    let wine      = window.app.getWine();
                    let fs        = window.app.getFileSystem();
                    let prefix    = window.app.getPrefix();
                    let dir       = fs.dirname(item.file);
                    let cache     = `${prefix.getCacheDir()}/install`;
                    let cacheWine = `${prefix.getWinePrefixCacheDir()}/install/${fs.basename(item.file)}`;

                    if (!fs.exists(item.file)) {
                        return resolve();
                    }

                    if (fs.exists(cache)) {
                        fs.rm(cache);
                    }

                    fs.ln(dir, cache);

                    if (fs.exists(cacheWine)) {
                        return wine.runFile(cacheWine);
                    }

                    return resolve();
                });
            }
            if ('build' === item.action) {
                commit(action.SAVE, true);
                patch.setConfigValue('created', true);
                patch.save();

                promise = new Promise((resolve) => {
                    setTimeout(() => {
                        let snapshot = window.app.getSnapshot();
                        snapshot.createAfter();
                        snapshot.moveToPatch(patch);
                        resolve();
                    }, 500);
                }).then(() => {
                    commit(action.CLEAR);
                    return dispatch(action.LOAD);
                });
            }

            return promise;
        },
    },
};