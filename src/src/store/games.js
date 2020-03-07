import action from "./action";
import api    from "../api";

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
                time:        config.getGameTime(),
                code:        config.getCode(),
                icon:        'local:/' + config.getGameIcon(),
                background:  'local:/' + config.getGameBackground(),
                startAt:     null,
                launched:    false,
                config,
            }));
        },
        [action.PLAY](state, config) {
            state.info.configs = state.info.configs.map(item => {
                if (item.code === config.code) {
                    item.launched = true;
                    item.startAt  = api.currentTime;
                }

                return item;
            });
        },
        [action.STOP](state, config) {
            state.info.configs = state.info.configs.map(item => {
                if (item.code === config.code) {
                    item.launched = false;

                    if (item.startAt) {
                        item.time = item.time + (api.currentTime - item.startAt);
                        item.config.setConfigValue('app.time', item.time);
                        item.config.save();
                    }
                }

                return item;
            });
        },
    },
    actions:    {
        [action.LOAD]({ commit }) {
            commit(action.LOAD, app.getConfig().findConfigs());
        },
        [action.PLAY]({ commit, dispatch }, config) {
            commit(action.PLAY, config);

            setTimeout(() => { dispatch(action.STOP, config); }, 5000);
        },
        [action.STOP]({ commit }, config) {
            commit(action.STOP, config);
        },
    },
};