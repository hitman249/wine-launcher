import Vue     from 'vue';
import VueI18n from 'vue-i18n'
import ru      from "./locales/ru";
import en      from "./locales/en";

Vue.use(VueI18n);

window.i18n = new VueI18n({
    locale:   window.app.getPrefix().getLanguage(),
    messages: {
        ru,
        en,
    },
});

export default window.i18n;