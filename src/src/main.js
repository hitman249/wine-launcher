import './less/main.less';
import Vue         from 'vue';
import i18n        from './i18n';
import App         from './App.vue';
import application from "./app";
import api         from './api';
import { sync }    from 'vuex-router-sync';
import store       from './store';
import router      from './router';

sync(store, router);

window.app = application;

Vue.config.productionTip = false;

window.onload = () => {
    let system     = window.app.getSystem();
    let preloading = document.getElementById('preloading');
    let p          = preloading.getElementsByTagName('p')[0];

    if (system.isRoot()) {
        p.innerHTML = window.i18n.t('app.start-only-root');
        return;
    }

    window.app.initialize().then(() => {
        preloading.remove();

        let vue = new Vue({
            router,
            store,
            i18n,
            render: h => h(App)
        });

        api.use(vue);

        vue.$mount('#wineLauncher');
    });
};
