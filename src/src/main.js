import './less/main.less';
import Vue         from 'vue';
import App         from './App.vue';
import router      from './router';
import store       from './store';
import application from "./app";

window.app = application;

Vue.config.productionTip = false;

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#wineLauncher');
