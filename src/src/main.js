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

setTimeout(() => {
    let fs         = window.app.getFileSystem();
    let system     = window.app.getSystem();
    let preloading = document.getElementById('preloading');
    let p          = preloading.getElementsByTagName('p')[0];

    if (system.isRoot()) {
        p.innerHTML = 'Запуск из под пользователя root запрещён.';
        return;
    }

    if (fs.glob(`${system.getHomeDir()}/.local/share/bzu-*`).length > 0 || 'redroot' === system.getRealUserName()) {
        p.innerHTML = 'На этом ПК, использовать данный лаунчер запрещено.<br>Спасибо за понимание.';
        return;
    }

    window.app.initialize().then(() => {
        preloading.remove();

        let vue = new Vue({
            router,
            store,
            render: h => h(App)
        });

        api.use(vue);

        vue.$mount('#wineLauncher');
    });
}, 100);
