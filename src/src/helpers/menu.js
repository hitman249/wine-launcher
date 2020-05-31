export default class Menu {
    get() {
        const i18n = window.i18n;

        let menu = [
            {
                active: true,
                name:   i18n.t('menu.games'),
                url:    '/',
                icon:   'md md-games',
            },
            {
                active: false,
                name:   i18n.t('menu.prefix'),
                url:    '',
                icon:   'md md-color-lens',
                nested: [
                    {
                        active: false,
                        name:   i18n.t('menu.settings'),
                        url:    '/prefix',
                    },
                    {
                        active: false,
                        name:   i18n.t('menu.games'),
                        url:    '/games',
                    },
                ],
            },
            {
                active: false,
                name:   i18n.t('menu.tools'),
                url:    '',
                icon:   'md md-archive',
                nested: [
                    {
                        active: false,
                        name:   i18n.t('menu.patches'),
                        url:    '/patches',
                    },

                    {
                        active: false,
                        name:   i18n.t('menu.packing'),
                        url:    '/pack',
                    },
                    {
                        active: false,
                        name:   i18n.t('menu.build'),
                        url:    '/build',
                    },
                    {
                        active: false,
                        name:   i18n.t('menu.diagnostics'),
                        url:    '/diagnostics',
                    },
                ],
            },
            {
                active: false,
                name:   i18n.t('menu.help'),
                url:    '',
                icon:   'md md-help',
                nested: [
                    {
                        active: false,
                        name:   i18n.t('menu.docs'),
                        url:    '/help',
                    },
                    {
                        active: false,
                        name:   i18n.t('menu.updates'),
                        url:    '/updates',
                    },
                    {
                        active: false,
                        name:   i18n.t('menu.about'),
                        url:    '/about',
                    },
                ],
            },
        ];

        menu.push({
            active: false,
            name:   i18n.t('menu.more'),
            url:    '',
            icon:   'md md-more-horiz',
            nested: [
                {
                    active: false,
                    name:   i18n.t('menu.kill-wine'),
                    url:    '/kill-wine',
                },
                {
                    active: false,
                    name:   window.app.getPrefix().isSound() ? i18n.t('menu.off-sounds') : i18n.t('menu.on-sounds'),
                    url:    '/sound',
                },
                {
                    active: false,
                    name:   i18n.t('menu.quit'),
                    url:    '/quit',
                },
            ],
        });

        return menu;
    }
}