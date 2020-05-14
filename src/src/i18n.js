import Vue     from 'vue';
import VueI18n from 'vue-i18n'
import ru      from "./locales/ru";

Vue.use(VueI18n);

window.i18n = new VueI18n({
    locale:   'ru',
    messages: {
        ru,
    },
});

export default window.i18n;