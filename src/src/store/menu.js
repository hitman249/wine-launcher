import action from "./action";
import Menu   from "../helpers/menu";

export default {
    namespaced: true,
    state:      {
        items: [],
    },
    mutations:  {
        [action.ROUTE_CHANGED](state) {
            let currentUrl = window.location.hash.substring(1);

            state.items.forEach((item, index) => {
                if (item.active) {
                    state.items[index].active = false;
                }
                if (currentUrl === item.url) {
                    state.items[index].active = true;
                }

                let nested = state.items[index].nested;

                if (nested) {
                    nested.forEach((subMenu, subIndex) => {
                        if (subMenu.active) {
                            state.items[index].nested[subIndex].active = false;
                        }
                        if (currentUrl === subMenu.url) {
                            state.items[index].active                  = true;
                            state.items[index].nested[subIndex].active = true;
                        }
                    });
                }
            });

            window.app.getAudioButton().click();
        },
        [action.LOAD](state) {
            state.items = (new Menu()).get();
        },
    },
    actions:    {
        [action.ROUTE_CHANGED]({ commit }) {
            commit(action.ROUTE_CHANGED);
        },
        [action.LOAD]({ commit }) {
            commit(action.LOAD);
            commit(action.ROUTE_CHANGED);
        },
    },
};