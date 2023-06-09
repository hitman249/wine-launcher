import action from "./action";

export default {
  namespaced: true,
  state:      {
    status:   {},
    loaded:   false,
    updating: false,
  },
  mutations:  {
    [action.LOAD](state, status) {
      state.status = status;
      state.loaded = true;
    },
    [action.CLEAR](state) {
      state.status = {};
      state.loaded = false;
    },
    [action.UPDATE](state, status) {
      state.updating = status;
    },
  },
  actions:    {
    [action.LOAD]({ dispatch, state }) {
      if (Object.keys(state.status).length > 0) {
        return;
      }

      let promise = Promise.resolve();

      let winePrefix  = window.app.getWinePrefix();
      let dxvk        = window.app.getDxvk();
      let vkd3dProton = window.app.getVkd3dProton();
      let fixes       = window.app.getFixes();
      let mangoHud    = window.app.getMangoHud();
      let runtime     = window.app.getRuntime();
      let vkBasalt    = window.app.getVkBasalt();
      let mf          = window.app.getMediaFoundation();

      return promise
        .then(() => dxvk.update())
        .then(() => vkd3dProton.update())
        .then(() => mf.update())
        .then(() => fixes.update())
        .then(() => mangoHud.update())
        .then(() => vkBasalt.update())
        .then(() => runtime.update())
        .then(() => winePrefix.updatePulse())
        .then(() => winePrefix.updateCsmt())
        .then(() => winePrefix.updateWindowsVersion())
        .then(() => dispatch(action.RELOAD));
    },
    [action.RELOAD]({ commit }) {
      let promise = Promise.resolve();

      let wine        = window.app.getKernel();
      let prefix      = window.app.getPrefix();
      let dxvk        = window.app.getDxvk();
      let vkd3dProton = window.app.getVkd3dProton();

      commit(action.CLEAR);

      return promise
        .then(() => commit(action.LOAD, {
          dir:             'C:' + prefix.getGamesFolder(),
          arch:            wine.getWineArch(),
          windows_version: prefix.getWindowsVersion(),
          sandbox:         prefix.isSandbox(),
          dxvk:            prefix.isDxvk(),
          dxvk_version:    dxvk.getLocalVersion(),
          vkd3d:           prefix.isVkd3dProton(),
          vkd3d_version:   vkd3dProton.getLocalVersion(),
          mf:              prefix.isMediaFoundation(),
          mangohud:        prefix.isMangoHud(),
          vkbasalt:        prefix.isVkBasalt(),
          runtime:         prefix.isRuntime(),
          focus:           prefix.isFixesFocus(),
          blocked:         wine.isBlocked(),
          prefix,
        }))
        .then(() => this.commit(action.get('patches').CLEAR));
    },
    [action.SAVE]({ commit, dispatch }, { prefix, item }) {
      prefix.setFlatConfig(item);
      prefix.save();
      prefix.loadConfig();

      commit(action.UPDATE, true);

      return new Promise(resolve => {
        setTimeout(() => {
          let promise = Promise.resolve();

          promise
            .then(() => {
              commit(action.CLEAR);
              return dispatch(action.LOAD).then(() => commit(action.UPDATE, false));
            })
            .then(resolve);
        }, 500);
      });
    },
  },
};