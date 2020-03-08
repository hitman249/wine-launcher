import action from "./action";

export default {
    namespaced: true,
    state:      {
        items: [
            {
                active: true,
                name:   'Игры',
                url:    '/',
                icon:   'md md-games',
            },
            {
                active: false,
                name:   'Префикс',
                url:    '/prefix',
                icon:   'md md-color-lens',
            },
            {
                active: false,
                name:   'Инструменты',
                url:    '/tools',
                icon:   'md md-archive',
            },
            {
                active: false,
                name:   'Обновления',
                url:    '/updates',
                icon:   'md md-cloud',
            },
        ],
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
            });
        },
    },
    actions:    {
        [action.ROUTE_CHANGED]({ commit }) {
            commit(action.ROUTE_CHANGED);
        },
    },
};