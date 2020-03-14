import action from "./action";
import api    from "../api";

export default {
    namespaced: true,
    state:      {
        items: [],
    },
    mutations:  {},
    actions:    {
        [action.LOAD]({ commit, state }) {

        },
    },
};