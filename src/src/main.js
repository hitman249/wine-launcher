import './less/main.less';
import Vue         from 'vue';
import App         from './App.vue';
import router      from './router';
import store       from './store';
import { sync }    from 'vuex-router-sync';
import api         from './api';
import application from "./app";

sync(store, router);

window.app = application;

Vue.config.productionTip = false;

let vue = new Vue({
    router,
    store,
    render: h => h(App)
});

api.use(vue);

vue.$mount('#wineLauncher');
