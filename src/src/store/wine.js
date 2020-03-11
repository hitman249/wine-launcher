import action from "./action";

export default {
    namespaced: true,
    state:      {
        status:     {},
        loaded:     false,
        recreating: false,
    },
    mutations:  {
        [action.LOAD](state, status) {
            state.status = status;
            state.loaded = true;
        },
        [action.CLEAR](state) {
            state.status     = {};
            state.recreating = false;
            state.loaded     = false;
        },
        [action.PREFIX_RECREATE](state) {
            state.recreating = true;
        },
    },
    actions:    {
        [action.LOAD]({ commit, state }) {
            if (Object.keys(state.status).length > 0) {
                return;
            }

            let wine   = app.getWine();
            let config = app.getConfig();
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
                }, 1);
            });
        },
    },
};