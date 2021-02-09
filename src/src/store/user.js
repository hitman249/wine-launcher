import action from "./action";
import api    from "../api";

export default {
  namespaced: true,
  state:      {
    info: {},
  },
  mutations:  {
    [action.LOAD](state, info) {
      if (Object.keys(state.info).length > 0) {
        return;
      }

      state.info = info;
    },
  },
  actions:    {
    [action.LOAD]({ commit, state }) {
      if (Object.keys(state.info).length > 0) {
        return;
      }

      return api.user().then(info => commit(action.LOAD, info));
    },
  },
};