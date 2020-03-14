import Vue     from 'vue';
import Vuex    from 'vuex';
import games   from "./store/games";
import menu    from "./store/menu";
import wine    from "./store/wine";
import forms   from "./store/forms";
import prefix  from "./store/prefix";
import patches from "./store/patches";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        games,
        menu,
        wine,
        forms,
        prefix,
        patches,
    },
});
