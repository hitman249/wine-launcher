import action from "./action";

export default {
  namespaced: true,
  state:      {
    packing: false,
  },
  mutations:  {
    [action.PACK](state) {
      state.packing = true;
    },
    [action.CLEAR](state) {
      state.packing = false;
    },
  },
  actions:    {
    [action.PACK]({ commit }) {
      commit(action.PACK);

      return new Promise(resolve => {
        setTimeout(() => {
          let promise = Promise.resolve();
          let build   = window.app.getBuild();

          build.build();

          promise
            .then(() => {
              commit(action.CLEAR);
            })
            .then(resolve);
        }, 500);
      });
    },
  },
};