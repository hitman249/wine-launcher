import Vue         from 'vue';
import VueRouter   from 'vue-router';
import Home        from './views/Home.vue'
import Prefix      from "./views/Prefix";
import PrefixGames from "./views/PrefixGames";
import Patches     from "./views/Patches";
import Diagnostics from "./views/Diagnostics";
import Pack        from "./views/Pack";
import Build       from "./views/Build";
import About       from "./views/About";
import Help        from "./views/Help";

Vue.use(VueRouter);

const routes = [
    {
        path:      '/',
        name:      'Home',
        component: Home
    },
    {
        path:      '/prefix',
        name:      'Prefix',
        component: Prefix
    },
    {
        path:      '/games',
        name:      'PrefixGames',
        component: PrefixGames
    },
    {
        path:      '/patches',
        name:      'Patches',
        component: Patches
    },
    {
        path:      '/diagnostics',
        name:      'Diagnostics',
        component: Diagnostics
    },
    {
        path:      '/pack',
        name:      'Pack',
        component: Pack
    },
    {
        path:      '/build',
        name:      'Build',
        component: Build
    },
    {
        path:      '/about',
        name:      'About',
        component: About
    },
    {
        path:      '/help',
        name:      'Help',
        component: Help
    },
];

export default new VueRouter({ routes });
