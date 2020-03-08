import action from "./action";

export default {
    namespaced: true,
    state:      {
        status: {},
    },
    mutations:  {
        [action.LOAD](state, status) {
            state.status = status;
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
    },
};