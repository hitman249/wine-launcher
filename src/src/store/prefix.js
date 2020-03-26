import action from "./action";

export default {
    namespaced: true,
    state:      {
        status: {},
        loaded: false,
    },
    mutations:  {
        [action.LOAD](state, status) {
            state.status = status;
            state.loaded = true;
        },
        [action.CLEAR](state) {
            state.status = {};
            state.loaded = false;
        },
    },
    actions:    {
        [action.LOAD]({ commit, state }) {
            if (Object.keys(state.status).length > 0) {
                return;
            }

            let prefix = window.app.getPrefix();
            let dxvk   = window.app.getDxvk();

            let result = {
                arch:            prefix.getWineArch(),
                windows_version: prefix.getWindowsVersion(),
                sandbox:         prefix.isSandbox(),
                dxvk:            prefix.isDxvk(),
                dxvk_version:    dxvk.getLocalVersion(),
                prefix,
            };

            commit(action.LOAD, result);
        },
        [action.SAVE]({ commit, dispatch }, { prefix, item }) {
            prefix.setFlatConfig(item);
            prefix.save();

            commit(action.CLEAR);

            return dispatch(action.LOAD);
        },
    },
};