import action from "./action";

export default {
    namespaced: true,
    state:      {
        status:            {},
        loaded:            false,
        recreating:        false,
        downloading:       false,
        downloading_title: 'Скачивание...',
    },
    mutations:  {
        [action.LOAD](state, status) {
            state.status = status;
            state.loaded = true;
        },
        [action.CLEAR](state) {
            state.status      = {};
            state.recreating  = false;
            state.loaded      = false;
            state.downloading = false;
            app.getWine().clear();
        },
        [action.PREFIX_RECREATE](state) {
            state.recreating = true;
        },
        [action.UPDATE](state, title) {
            state.downloading       = true;
            state.downloading_title = title;
        },
    },
    actions:    {
        [action.LOAD]({ commit, state }) {
            if (Object.keys(state.status).length > 0) {
                return;
            }

            let wine   = app.getWine();
            let prefix = app.getPrefix();

            let result = {
                arch:           prefix.getWineArch(),
                wine_version:   wine.getVersion(),
                prefix_version: prefix.getWinePrefixInfo('version'),
                libs:           wine.getMissingLibs(),
            };

            commit(action.LOAD, result);
        },
        [action.PREFIX_RECREATE]({ commit, dispatch }) {
            return new Promise((resolve) => {
                commit(action.PREFIX_RECREATE);

                setTimeout(() => {
                    app.getWinePrefix().reCreate();
                    commit(action.CLEAR);
                    dispatch(action.LOAD).then(() => resolve());
                }, 500);
            });
        },
        [action.UPDATE]({ commit, dispatch }, item) {
            if (!item || 'file' !== item.type || !item.download) {
                return;
            }

            commit(action.UPDATE, 'Скачивание...');

            return item.download().then((filename) => {
                commit(action.UPDATE, 'Извлечение...');

                return new Promise((resolve) => {
                    setTimeout(() => {
                        let prefix = app.getPrefix();
                        let fs     = app.getFileSystem();
                        let path   = `${prefix.getCacheDir()}/${filename}`;

                        if (fs.exists(path)) {
                            fs.unpack(path, prefix.getWineDir());
                        }

                        commit(action.CLEAR);
                        dispatch(action.LOAD).then(() => resolve());
                    }, 500);
                });
            });
        },
    },
};