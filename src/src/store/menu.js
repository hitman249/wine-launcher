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
                url:    '',
                icon:   'md md-color-lens',
                nested: [
                    {
                        active: false,
                        name:   'Настройки',
                        url:    '/prefix',
                    },
                    {
                        active: false,
                        name:   'Игры',
                        url:    '/games',
                    },
                ],
            },
            {
                active: false,
                name:   'Инструменты',
                url:    '',
                icon:   'md md-archive',
                nested: [
                    {
                        active: false,
                        name:   'Патчи',
                        url:    '/patches',
                    },
                ],
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
        },
    },
    actions:    {
        [action.ROUTE_CHANGED]({ commit }) {
            commit(action.ROUTE_CHANGED);
        },
    },
};