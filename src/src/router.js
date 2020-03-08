import Vue       from 'vue';
import VueRouter from 'vue-router';
import Home      from './views/Home.vue'
import Prefix    from "./views/Prefix";

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
];

export default new VueRouter({ routes });
