import action from "./action";
import api    from "../api";

export default {
  namespaced: true,
  state:      {
    store_items:       [],
    items:             [],
    created:           false,
    creating_snapshot: false,
    running:           false,
    spawn:             null,
  },
  mutations:  {
    [action.LOAD](state, { patches, store_items }) {
      let keysStore   = store_items.map(patch => patch.code);
      let keysPatches = patches.map(patch => patch.code);

      state.store_items = store_items.map(patch => {
        patch.is_install = keysPatches.includes(patch.code);
        return patch;
      });
      state.items       = patches.map(patch => {
        patch.is_shared = keysStore.includes(patch.code);
        return patch;
      });
      state.created     = Boolean(state.items.find((patch) => false === patch.patch.isCreated()));
    },
    [action.SAVE](state, flag) {
      state.creating_snapshot = flag;
    },
    [action.CLEAR](state) {
      state.items             = [];
      state.store_items       = [];
      state.created           = false;
      state.creating_snapshot = false;
    },
    [action.RUNNING](state, status) {
      state.running = status;
    },
    [action.SPAWN](state, spawn) {
      state.spawn = spawn;
    },
  },
  actions:    {
    [action.LOAD]({ commit, state }) {
      if (state.items.length > 0) {
        return;
      }

      const prepare = (items) => {
        return items.map((patch) => Object.assign({}, { patch, code: patch.getCode() }, patch.getFlatConfig()))
          .map((patch) => {
            patch.size_formatted = fs.convertBytes(patch.size);
            return patch;
          });
      };

      let fs = window.app.getFileSystem();

      let patches   = window.app.getPatches().findPatches();
      let myPatches = window.app.getMyPatches().findPatches();

      commit(action.LOAD, { patches: prepare(patches), store_items: prepare(myPatches) });
    },
    [action.SAVE]({ commit, dispatch }, { patch, item }) {
      let creating_snapshot = !patch.isSaved();
      commit(action.SAVE, creating_snapshot);

      patch.setFlatConfig(item);
      patch.save();

      let snapshot = new Promise((resolve) => {
        if (creating_snapshot) {
          setTimeout(() => {
            window.app.getSnapshot().createBefore();
            resolve();
          }, 500);
        } else {
          resolve();
        }
      });

      return snapshot.then(() => {
        commit(action.CLEAR);
        return dispatch(action.LOAD);
      });
    },
    [action.RUN]({ commit, dispatch }, { patch, item }) {
      let promise = Promise.resolve();

      commit(action.RUNNING, true);
      api.commit(action.get('logs').CLEAR);

      promise = new Promise(resolve => {
        setTimeout(() => {
          let promise = Promise.resolve();

          if ('cfg' === item.action) {
            promise = promise.then(() => window.app.getWine().cfg());
          }
          if ('fm' === item.action) {
            promise = promise.then(() => window.app.getWine().fm(spawn => commit(action.SPAWN, spawn)))
              .then(() => {
                commit(action.SPAWN, null);
              });
          }
          if ('regedit' === item.action) {
            promise = promise.then(() => window.app.getWine().regOnly());
          }
          if ('winetricks' === item.action) {
            promise = promise.then(() => window.app.getWine().winetricks(...item.winetricks.split(' ').filter(s => s)));
          }
          if ('install' === item.action) {
            promise = promise.then(() => new Promise((resolve) => {
              let wine      = window.app.getWine();
              let fs        = window.app.getFileSystem();
              let prefix    = window.app.getPrefix();
              let dir       = fs.dirname(item.file);
              let cache     = `${prefix.getCacheDir()}/install`;
              let cacheWine = `${prefix.getWinePrefixCacheDir()}/install/${fs.basename(item.file)}`;

              if (!fs.exists(item.file)) {
                return resolve();
              }

              if (fs.exists(cache)) {
                fs.rm(cache);
              }

              fs.ln(dir, cache);

              if (fs.exists(cacheWine)) {
                return wine.runFile(cacheWine, item.arguments || '', spawn => commit(action.SPAWN, spawn))
                  .then(() => {
                    commit(action.SPAWN, null);
                    resolve();
                  });
              }

              return resolve();
            }));
          }
          if ('iso' === item.action) {
            promise = promise.then(() => new Promise((resolve) => {
              let wine = window.app.getWine();
              let fs   = window.app.getFileSystem();

              if (!fs.exists(item.iso_file)) {
                return resolve();
              }

              return wine.runFile(item.iso_file, item.arguments || '', spawn => commit(action.SPAWN, spawn))
                .then(() => {
                  commit(action.SPAWN, null);
                  resolve();
                });
            }));
          }
          if ('register' === item.action) {
            promise = promise.then(() => new Promise((resolve) => {
              let wine     = window.app.getWine();
              let fs       = window.app.getFileSystem();
              let prefix   = window.app.getPrefix();
              let filename = fs.basename(item.library).toLowerCase();
              let system32 = prefix.getSystem32();
              let system64 = prefix.getSystem64();

              if (!system64 && 'wine64' === item.arch) {
                return resolve();
              }

              if (!fs.exists(item.library)) {
                return resolve();
              }

              let path = `${system32}/${filename}`;

              if ('wine64' === item.arch) {
                path = `${system64}/${filename}`;
              }

              if (fs.exists(path)) {
                fs.rm(path);
              }

              fs.cp(item.library, path);

              if (item.registry) {
                wine.regsvr32(filename);
              }

              wine.run('reg', 'add', 'HKEY_CURRENT_USER\\Software\\Wine\\DllOverrides', '/v', `*${filename}`, '/d', _.trim(item.override), '/f');

              return resolve();
            }));
          }

          promise.then(() => commit(action.RUNNING, false)).then(resolve);
        }, 500);
      });

      if ('build' === item.action) {
        commit(action.SAVE, true);
        patch.setConfigValue('created', true);
        patch.save();

        promise = new Promise((resolve) => {
          setTimeout(() => {
            let snapshot = window.app.getSnapshot();
            snapshot.createAfter();
            snapshot.moveToPatch(patch);
            patch.save();
            resolve();
          }, 500);
        }).then(() => {
          commit(action.CLEAR);
          return dispatch(action.LOAD).then(() => commit(action.RUNNING, false));
        });
      }

      return promise;
    },
    [action.REMOVE]({ commit, dispatch }, item) {
      if (!item || !item.patch) {
        return;
      }

      item.patch.remove();
      commit(action.CLEAR);

      return dispatch(action.LOAD);
    },
    [action.APPEND]({ commit, dispatch }, { item, type }) {
      if (!item || !item.patch || !type) {
        return;
      }

      let result = false;

      if ('install' === type) {
        result = window.app.getPatches().append(item.patch);
      } else if ('save' === type) {
        result = window.app.getMyPatches().append(item.patch);
      }

      commit(action.CLEAR);

      return dispatch(action.LOAD).then(() => result);
    },
  },
};