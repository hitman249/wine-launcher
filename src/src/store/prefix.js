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
        [action.CLEAR](state) {
            state.status = {};
        },
    },
    actions:    {
        [action.LOAD]({ commit, state }) {
            if (Object.keys(state.status).length > 0) {
                return;
            }

            let prefix = app.getPrefix();

            let result = {
                arch:            prefix.getWineArch(),
                windows_version: prefix.getWindowsVersion(),
                sandbox:         prefix.isSandbox(),
                dxvk:            prefix.isDxvk(),
                prefix,
            };

            commit(action.LOAD, result);
        },
    },
};