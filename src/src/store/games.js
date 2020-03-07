import action from "./action";

export default {
    namespaced: true,
    state:      {
        info: {
            configs: [],
        },
    },
    mutations:  {
        [action.LOAD](state, configs) {
            state.info.configs = (configs || []).map(config => ({
                name:        config.getGameName(),
                description: config.getGameDescription(),
                version:     config.getGameVersion(),
                code:        config.getCode(),
                icon:        'local:/' + config.getGameIcon(),
                background:  'local:/' + config.getGameBackground(),
                launched:    false,
                config,
            }));
        },
        [action.PLAY](state, config) {
            state.info.configs = state.info.configs.map(item => {
                if (item.code === config.code) {
                    item.launched = true;
                }

                return item;
            });
        },
        [action.STOP](state, config) {
            state.info.configs = state.info.configs.map(item => {
                if (item.code === config.code) {
                    item.launched = false;
                }

                return item;
            });
        },
    },
    actions:    {
        [action.LOAD]({ commit }) {
            commit(action.LOAD, app.getConfig().findConfigs());
        },
        [action.PLAY]({ commit }, config) {
            commit(action.PLAY, config);
        },
    },
};