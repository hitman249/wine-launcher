import action from "./action";

export default {
    namespaced: true,
    state:      {
        items: [],
    },
    mutations:  {
        [action.LOAD](state, items) {

        },
    },
    actions:    {
        [action.LOAD]({ commit, state }) {
            if (state.items.length > 0) {
                return;
            }
        },
    },
};