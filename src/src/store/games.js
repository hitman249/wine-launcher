import action from "./action";
import api    from "../api";

export default {
    namespaced: true,
    state:      {
        configs: [],
    },
    mutations:  {
        [action.LOAD](state, configs) {
            state.configs = (configs || []).map(config => ({
                name:            config.getGameName(),
                description:     config.getGameDescription(),
                version:         config.getGameVersion(),
                time:            config.getGameTime(),
                code:            config.getCode(),
                icon:            'local:/' + config.getGameIcon(),
                background:      'local:/' + config.getGameBackground(),
                arch:            config.getWineArch(),
                dxvk:            config.isDxvk(),
                windows_version: config.getWindowsVersion(),
                startAt:         null,
                launched:        false,
                config,
            }));
        },
        [action.PLAY](state, config) {
            state.configs = state.configs.map(item => {
                if (item.code === config.code) {
                    item.launched = true;
                    item.startAt  = api.currentTime;
                }

                return item;
            });
        },
        [action.STOP](state, config) {
            state.configs = state.configs.map(item => {
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
        [action.LOAD]({ commit, state }) {
            if (state.configs.length > 0) {
                return;
            }

            commit(action.LOAD, app.getConfig().findConfigs());
        },
        [action.PLAY]({ commit, dispatch }, { config, mode }) {
            commit(action.PLAY, config);

            app.createTask(config.config)
                .run(mode)
                .then(() => dispatch(action.STOP, config));
        },
        [action.STOP]({ commit }, config) {
            commit(action.STOP, config);
        },
    },
};