import api    from "../api";
import action from "./action";

export default {
  namespaced: true,
  state:      {
    wine:     null,
    games:    null,
    symlinks: null,
  },
  mutations:  {
    [action.LOAD](state, { wine, games, symlinks }) {
      state.wine     = wine;
      state.games    = games;
      state.symlinks = symlinks;
    },
    [action.CLEAR](state) {
      state.wine     = null;
      state.games    = null;
      state.symlinks = null;
    },
    [action.PACK](state, type) {
      state[type].packing = true;
    },
  },
  actions:    {
    [action.LOAD]({ commit, state }) {
      if (state.wine || state.games || state.symlinks) {
        return;
      }

      let fs        = window.app.getFileSystem();
      let wine      = window.app.getMountWine();
      let games     = window.app.getMountData();
      let wineSize  = wine.size();
      let gamesSize = games.size();

      commit(action.LOAD, {
        wine:     {
          mounted:        wine.isMounted(),
          size:           wineSize,
          size_formatted: fs.convertBytes(wineSize),
          packing:        false,
        },
        games:    {
          mounted:        games.isMounted(),
          size:           gamesSize,
          size_formatted: fs.convertBytes(gamesSize),
          packing:        false,
        },
        symlinks: {
          items:   window.app.getSymlink().getDirs(),
          packing: false,
        },
      });
    },
    [action.PACK]({ commit, dispatch, state }, type) {
      if ([ 'wine', 'games' ].indexOf(type) === -1) {
        return;
      }

      let pack  = window.app.getPack();
      let wine  = window.app.getMountWine();
      let games = window.app.getMountData();

      commit(action.PACK, type);

      return new Promise(resolve => {
        setTimeout(() => {
          let promise = Promise.resolve();

          if ('wine' === type) {
            promise = pack.pack(wine.getFolder());
          }
          if ('games' === type) {
            promise = pack.pack(games.getFolder());
          }

          promise
            .then(() => {
              api.commit(action.get('wine').CLEAR);
              commit(action.CLEAR);
              return dispatch(action.LOAD);
            })
            .then(resolve);
        }, 500);

      });
    },
    [action.UNPACK]({ commit, dispatch, state }, type) {
      if ([ 'wine', 'games' ].indexOf(type) === -1) {
        return;
      }

      let pack  = window.app.getPack();
      let wine  = window.app.getMountWine();
      let games = window.app.getMountData();

      commit(action.PACK, type);

      return new Promise(resolve => {
        setTimeout(() => {
          let promise = Promise.resolve();

          if ('wine' === type) {
            promise = pack.unpack(wine.getFolder());
          }
          if ('games' === type) {
            promise = pack.unpack(games.getFolder());
          }

          promise
            .then(() => {
              api.commit(action.get('wine').CLEAR);
              commit(action.CLEAR);
              return dispatch(action.LOAD);
            })
            .then(resolve);
        }, 500);
      });
    },
    [action.SAVE]({ commit, dispatch, state }, item) {
      if (!item || Object.keys(item) <= 0) {
        return;
      }

      commit(action.PACK, 'symlinks');

      return new Promise(resolve => {
        setTimeout(() => {
          let promise = Promise.resolve();
          let symlink = window.app.getSymlink();
          let dirs    = symlink.getDirs();

          Object.keys(item).forEach((folder) => {
            let value = item[folder];

            if (value !== dirs[folder]) {
              if (value) {
                symlink.replace(folder);
              } else {
                symlink.revert(folder);
              }
            }
          });

          promise
            .then(() => {
              commit(action.CLEAR);
              return dispatch(action.LOAD);
            })
            .then(resolve);
        }, 500);
      });
    },
  },
};