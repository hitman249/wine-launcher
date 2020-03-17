import action from "./action";

export default {
    namespaced: true,
    state:      {
        items: [],
    },
    mutations:  {
        [action.LOAD](state, items) {
            state.items = _.sortBy(items, ['status', 'type', 'name']);
        },
    },
    actions:    {
        [action.LOAD]({ commit, state }) {
            if (state.items.length > 0) {
                return;
            }

            let diagnostics = window.app.getDiagnostics();

            setTimeout(() => {
                let items = [];
                diagnostics.each('apps', item => items.push(item));
                diagnostics.each('fonts', item => items.push(item));
                diagnostics.each('libs', item => items.push(item));
                commit(action.LOAD, items);
            }, 100);
        },
    },
};