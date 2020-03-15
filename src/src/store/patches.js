import action from "./action";

export default {
    namespaced: true,
    state:      {
        items:             [],
        created:           false,
        creating_snapshot: false,
    },
    mutations:  {
        [action.LOAD](state, patches) {
            state.items   = patches;
            state.created = Boolean(state.items.find((patch) => false === patch.patch.isCreated()));
        },
        [action.SAVE](state, flag) {
            state.creating_snapshot = flag;
        },
        [action.CLEAR](state) {
            state.items             = [];
            state.created           = false;
            state.creating_snapshot = false;
        },
    },
    actions:    {
        [action.LOAD]({ commit, state }) {
            if (state.items.length > 0) {
                return;
            }

            let patches = window.app.getPatches().findPatches()
                .map((patch) => Object.assign({}, { patch, code: patch.getCode() }, patch.getFlatConfig()));

            commit(action.LOAD, patches);
        },
        [action.SAVE]({ commit, dispatch }, { patch, item }) {
            let creating_snapshot = !patch.isSaved();
            commit(action.SAVE, creating_snapshot);

            patch.setFlatConfig(item);
            patch.save();

            let snapshot = new Promise((resolve) => {
                if (creating_snapshot) {
                    setTimeout(() => {
                        window.app.getSnapshot().createBefore();
                        resolve();
                    }, 500);
                } else {
                    resolve();
                }
            });

            return snapshot.then(() => {
                commit(action.CLEAR);
                return dispatch(action.LOAD);
            });
        },
    },
};