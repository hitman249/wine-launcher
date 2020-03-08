import Vue   from 'vue';
import Vuex  from 'vuex';
import games from "./store/games";
import menu  from "./store/menu";
import wine  from "./store/wine";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        games,
        menu,
        wine,
    },
});
