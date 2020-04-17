export default class Menu {
    get() {
        let menu = [
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

                    {
                        active: false,
                        name:   'Упаковка',
                        url:    '/pack',
                    },
                    {
                        active: false,
                        name:   'Сборка',
                        url:    '/build',
                    },
                    {
                        active: false,
                        name:   'Диагностика',
                        url:    '/diagnostics',
                    },
                ],
            },
            {
                active: false,
                name:   'Помощь',
                url:    '',
                icon:   'md md-help',
                nested: [
                    {
                        active: false,
                        name:   'Обновления',
                        url:    '/updates',
                    },
                    {
                        active: false,
                        name:   'Справка',
                        url:    '/help',
                    },
                    {
                        active: false,
                        name:   'О программе',
                        url:    '/about',
                    },
                ],
            },
        ];

        menu.push({
            active: false,
            name:   'Ещё',
            url:    '',
            icon:   'md md-more-horiz',
            nested: [
                {
                    active: false,
                    name:   window.app.getPrefix().isSound() ? 'Выключить звуки' : 'Включить звуки',
                    url:    '/sound',
                },
                {
                    active: false,
                    name:   'Выход',
                    url:    '/quit',
                },
            ],
        });

        return menu;
    }
}