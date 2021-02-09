import Vue     from 'vue';
import VueI18n from 'vue-i18n'
import ru      from "./locales/ru";
import en      from "./locales/en";

Vue.use(VueI18n);

let prefix = window.app.getPrefix();
prefix.loadConfig();

window.i18n = new VueI18n({
  locale:   prefix.getLanguage(),
  messages: {
    ru,
    en,
  },
});

export default window.i18n;