import action from "./action";

export default {
    namespaced: true,
    state:      {
        items: [],
    },
    mutations:  {
        [action.LOAD](state, item) {
            state.items.push(item);
        },
    },
    actions:    {
        [action.LOAD]({ commit, state }) {
            if (state.items.length > 0) {
                return;
            }

            let diagnostics = window.app.getDiagnostics();

            diagnostics.each('apps', (item) => {
                commit(action.LOAD, item);
            });
            diagnostics.each('fonts', (item) => {
                commit(action.LOAD, item);
            });
            diagnostics.each('libs', (item) => {
                commit(action.LOAD, item);
            });
        },
    },
};