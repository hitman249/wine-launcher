import action from "./action";

export default {
    namespaced: true,
    state:      {
        items: [],
    },
    mutations:  {
        [action.LOAD](state, patches) {
            state.items = patches;
        },
        [action.CLEAR](state) {
            state.items = [];
        },
    },
    actions:    {
        [action.LOAD]({ commit, state }) {
            if (state.items.length > 0) {
                return;
            }

            let patches = window.app.getPatches().findPatches()
                .map((patch) => Object.assign({}, { patch }, patch.getFlatConfig()));

            commit(action.LOAD, patches);
        },
        [action.SAVE]({ commit, dispatch }, { patch, item }) {
            patch.setFlatConfig(item);
            patch.save();

            commit(action.CLEAR);

            return dispatch(action.LOAD);
        },
    },
};