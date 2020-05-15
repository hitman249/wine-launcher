import './less/main.less';
import Vue         from 'vue';
import application from "./app";
import i18n        from './i18n';
import App         from './App.vue';
import api         from './api';
import { sync }    from 'vuex-router-sync';
import store       from './store';
import router      from './router';

sync(store, router);

Vue.config.productionTip = false;

window.onload = () => {
    let system     = application.getSystem();
    let preloading = document.getElementById('preloading');
    let p          = preloading.getElementsByTagName('p')[0];

    if (system.isRoot()) {
        p.innerHTML = window.i18n.t('app.start-only-root');
        return;
    }

    application.initialize().then(() => {
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
