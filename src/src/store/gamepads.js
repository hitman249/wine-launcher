import Vue    from 'vue';
import action from "./action";

export default {
  namespaced: true,
  state:      {
    gamepads: {},
  },
  mutations:  {
    [action.UPDATE](state, { index, data }) {
      if (!data) {
        let gamepads = {};

        Object.keys(state.gamepads).forEach((key) => {
          if (`index${index}` !== `index${key}`) {
            gamepads[`index${index}`] = state.gamepads[`index${key}`];
          }
        });

        Vue.set(state, 'gamepads', gamepads);
      } else {
        Vue.set(state.gamepads, `index${index}`, data);
      }
    },
  },
  actions:    {
    [action.UPDATE]({ commit, state }, payload) {
      commit(action.UPDATE, payload);
    },
  },
};