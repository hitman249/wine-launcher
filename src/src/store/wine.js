import action from "./action";

export default {
    namespaced: true,
    state:      {
        status:     {},
        recreating: false,
    },
    mutations:  {
        [action.LOAD](state, status) {
            state.status = status;
        },
        [action.CLEAR](state) {
            state.status     = {};
            state.recreating = false;
        },
        [action.PREFIX_RECREATE](state) {
            state.recreating = true;
        },
    },
    actions:    {
        [action.LOAD]({ commit }) {
            let wine   = app.getWine();
            let config = app.getConfig();

            let state = {
                arch:           config.getWineArch(),
                wine_version:   wine.getVersion(),
                prefix_version: config.getWinePrefixInfo('version'),
                libs:           wine.getMissingLibs(),
            };

            commit(action.LOAD, state);
        },
        [action.PREFIX_RECREATE]({ commit, dispatch }) {
            return new Promise((resolve) => {
                commit(action.PREFIX_RECREATE);

                setTimeout(() => {
                    app.getWinePrefix().reCreate();
                    commit(action.CLEAR);
                    dispatch(action.LOAD).then(() => resolve());
                }, 1);
            });
        },
    },
};