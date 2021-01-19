import action from "./action";

export default {
  namespaced: true,
  state:      {
    enable: false,
    black:  false,
    logs:   '',
  },
  mutations:  {
    [action.STOP](state) {
      state.enable = false;
      state.black  = false;
    },
    [action.START](state, black = false) {
      state.enable = true;
      state.black  = black;
    },
    [action.CLEAR](state) {
      state.enable = false;
      state.logs   = '';
    },
    [action.APPEND](state, line) {
      state.logs += line;
    },
  },
  actions:    {
    [action.START]({ commit }, black = false) {
      commit(action.START, black);
    },
    [action.STOP]({ commit }) {
      commit(action.STOP);
    },
    [action.APPEND]({ commit }, line) {
      commit(action.APPEND, line);
    },
  },
};