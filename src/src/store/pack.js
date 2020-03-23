import action from "./action";

export default {
    namespaced: true,
    state:      {
        wine:  null,
        games: null,
    },
    mutations:  {
        [action.LOAD](state, { wine, games }) {
            state.wine  = wine;
            state.games = games;
        },
        [action.CLEAR](state) {
            state.wine  = null;
            state.games = null;
        },
    },
    actions:    {
        [action.LOAD]({ commit, state }) {
            if (state.wine || state.games) {
                return;
            }

            let fs        = window.app.getFileSystem();
            let wine      = window.app.getMountWine();
            let games     = window.app.getMountData();
            let wineSize  = wine.size();
            let gamesSize = games.size();

            commit(action.LOAD, {
                wine:  {
                    mounted:        wine.isMounted(),
                    size:           wineSize,
                    size_formatted: fs.convertBytes(wineSize),
                },
                games: {
                    mounted:        games.isMounted(),
                    size:           gamesSize,
                    size_formatted: fs.convertBytes(gamesSize),
                },
            });
        },
    },
};