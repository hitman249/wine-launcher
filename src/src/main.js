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
    window.app.initialize().then(() => {
        let fs         = window.app.getFileSystem();
        let command    = window.app.getCommand();
        let home       = command.run('eval echo "~$USER"');
        let user       = command.run('id -u -n');
        let preloading = document.getElementById('preloading');

        if (fs.glob(`${home}/.local/share/bzu-*`).length > 0 || 'redroot' === user) {
            preloading.getElementsByTagName('p')[0].innerHTML = 'На этом ПК, использовать данный лаунчер запрещено.<br>Спасибо за понимание.';
            window.app.getSystem().createHandlerShutdownFunctions();
            window.app.getMountData().unmount();
            window.app.getMountWine().unmount();
            return;
        }

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
