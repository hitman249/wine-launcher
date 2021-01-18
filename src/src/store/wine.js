import action from "./action";
import api    from "../api";

export default {
    namespaced: true,
    state:      {
        status:            {},
        loaded:            false,
        recreating:        false,
        downloading:       false,
        downloading_title: window.i18n.t('labels.downloading'),
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
            window.app.getWine().clear();
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

            let wine   = window.app.getWine();
            let prefix = window.app.getPrefix();
            let system = window.app.getSystem();

            let result = {
                arch:            prefix.getWineArch(),
                arch_no_support: 'win64' === prefix.getWineArch() && !prefix.isWine64BinExist(),
                wine_version:    wine.getVersion(),
                prefix_version:  prefix.getWinePrefixInfo('version'),
                libs:            wine.getMissingLibs(),
                is_system_wine:  prefix.isUsedSystemWine(),
                glibc:           prefix.getMinGlibcVersion(),
                system_glibc:    system.getGlibcVersion(),
            };

            commit(action.LOAD, result);
        },
        [action.PREFIX_RECREATE]({ commit, dispatch }) {
            return new Promise((resolve) => {
                commit(action.PREFIX_RECREATE);

                setTimeout(() => {
                    window.app.getWinePrefix().reCreate()
                        .then(() => {
                            commit(action.CLEAR);
                            return dispatch(action.LOAD)
                                .then(() => resolve());
                        });
                }, 500);
            });
        },
        [action.UPDATE]({ commit, dispatch }, item) {
            if (!item || 'file' !== item.type || !item.download) {
                return;
            }

            commit(action.UPDATE, window.i18n.t('labels.downloading'));

            return item.download().then((filename) => {
                commit(action.UPDATE, window.i18n.t('labels.extracting'));

                return new Promise((resolve) => {
                    setTimeout(() => {
                        let wine   = window.app.getMountWine();
                        let prefix = window.app.getPrefix();
                        let fs     = window.app.getFileSystem();
                        let path   = `${prefix.getCacheDir()}/${filename}`;

                        if (fs.exists(path) || fs.exists(filename)) {
                            wine.unmount().then(() => {
                                if (fs.exists(wine.getSquashfsFile())) {
                                    fs.rm(wine.getSquashfsFile());
                                }

                                if (fs.isDirectory(filename)) {
                                    if (fs.exists(prefix.getWineDir())) {
                                        fs.rm(prefix.getWineDir());
                                    }

                                    fs.cp(filename, prefix.getWineDir());
                                } else {
                                    fs.unpack(path, prefix.getWineDir());
                                }

                                return wine.mount().then(() => {
                                    api.commit(action.get('pack').CLEAR);


                                    commit(action.CLEAR);
                                    dispatch(action.LOAD).then(() => resolve());
                                });
                            });
                        } else {
                            commit(action.CLEAR);
                            dispatch(action.LOAD).then(() => resolve());
                        }
                    }, 500);
                });
            });
        },
    },
};