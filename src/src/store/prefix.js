import action from "./action";

export default {
    namespaced: true,
    state:      {
        status:   {},
        loaded:   false,
        updating: false,
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
        [action.UPDATE](state, status) {
            state.updating = status;
        },
    },
    actions:    {
        [action.LOAD]({ commit, state }) {
            if (Object.keys(state.status).length > 0) {
                return;
            }

            let promise = Promise.resolve();

            let prefix = window.app.getPrefix();
            let dxvk   = window.app.getDxvk();
            let fixes  = window.app.getFixes();

            let result = {
                arch:            prefix.getWineArch(),
                windows_version: prefix.getWindowsVersion(),
                sandbox:         prefix.isSandbox(),
                dxvk:            prefix.isDxvk(),
                dxvk_version:    dxvk.getLocalVersion(),
                prefix,
            };

            return promise
                .then(() => dxvk.update())
                .then(() => fixes.update())
                .then(() => commit(action.LOAD, result));
        },
        [action.SAVE]({ commit, dispatch }, { prefix, item }) {
            prefix.setFlatConfig(item);
            prefix.save();

            commit(action.UPDATE, true);

            return new Promise(resolve => {
                setTimeout(() => {
                    let promise = Promise.resolve();

                    promise
                        .then(() => {
                            commit(action.CLEAR);
                            return dispatch(action.LOAD).then(() => commit(action.UPDATE, false));
                        })
                        .then(resolve);
                }, 500);
            });
        },
    },
};