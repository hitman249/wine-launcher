import Vue         from 'vue';
import Vuex        from 'vuex';
import games       from "./store/games";
import menu        from "./store/menu";
import wine        from "./store/wine";
import forms       from "./store/forms";
import prefix      from "./store/prefix";
import patches     from "./store/patches";
import diagnostics from "./store/diagnostics";
import pack        from "./store/pack";
import build       from "./store/build";
import logs        from "./store/logs";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        games,
        menu,
        wine,
        forms,
        prefix,
        patches,
        diagnostics,
        pack,
        build,
        logs,
    },
});
