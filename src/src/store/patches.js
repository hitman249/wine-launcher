import action from "./action";

export default {
    namespaced: true,
    state:      {
        items:             [],
        created:           false,
        creating_snapshot: false,
        running:           false,
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
        [action.RUNNING](state, status) {
            state.running = status;
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
        [action.RUN]({ commit, dispatch }, { patch, item }) {
            let promise = Promise.resolve();

            commit(action.RUNNING, true);

            promise = new Promise(resolve => {
                setTimeout(() => {
                    let promise = Promise.resolve();

                    if ('cfg' === item.action) {
                        promise = promise.then(() => window.app.getWine().cfg());
                    }
                    if ('fm' === item.action) {
                        promise = promise.then(() => window.app.getWine().fm());
                    }
                    if ('regedit' === item.action) {
                        promise = promise.then(() => window.app.getWine().regOnly());
                    }
                    if ('winetricks' === item.action) {
                        promise = promise.then(() => window.app.getWine().winetricks(...item.winetricks.split(' ').filter(s => s)));
                    }
                    if ('install' === item.action) {
                        promise = promise.then(() => new Promise((resolve) => {
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
                                return wine.runFile(cacheWine).then(() => resolve());
                            }

                            return resolve();
                        }));
                    }

                    if ('register' === item.action) {
                        promise = promise.then(() => new Promise((resolve) => {
                            let wine     = window.app.getWine();
                            let fs       = window.app.getFileSystem();
                            let prefix   = window.app.getPrefix();
                            let filename = fs.basename(item.library).toLowerCase();
                            let system32 = prefix.getSystem32();
                            let system64 = prefix.getSystem64();

                            if (!system64 && 'wine64' === item.arch) {
                                return resolve();
                            }

                            if (!fs.exists(item.library)) {
                                return resolve();
                            }

                            let path = `${system32}/${filename}`;

                            if ('wine64' === item.arch) {
                                path = `${system64}/${filename}`;
                            }

                            if (fs.exists(path)) {
                                fs.rm(path);
                            }

                            fs.cp(item.library, path);

                            if (item.registry) {
                                wine.regsvr32(filename);
                            }

                            wine.run('reg', 'add', 'HKEY_CURRENT_USER\\Software\\Wine\\DllOverrides', '/v', `*${filename}`, '/d', _.trim(item.override), '/f');

                            return resolve();
                        }));
                    }

                    promise.then(() => commit(action.RUNNING, false)).then(resolve);
                }, 500);
            });

            if ('build' === item.action) {
                commit(action.SAVE, true);
                patch.setConfigValue('created', true);
                patch.save();

                promise = new Promise((resolve) => {
                    setTimeout(() => {
                        let snapshot = window.app.getSnapshot();
                        snapshot.createAfter();
                        snapshot.moveToPatch(patch);
                        patch.save();
                        resolve();
                    }, 500);
                }).then(() => {
                    commit(action.CLEAR);
                    return dispatch(action.LOAD).then(() => commit(action.RUNNING, false));
                });
            }

            return promise;
        },
        [action.REMOVE]({ commit, dispatch }, item) {
            if (!item || !item.patch) {
                return;
            }

            item.patch.remove();
            commit(action.CLEAR);

            return dispatch(action.LOAD);
        },
    },
};