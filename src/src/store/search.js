import _      from "lodash";
import action from "./action";
import api    from "../api";
import Search from "../helpers/search";

export default {
  namespaced: true,
  state:      {
    q:     '',
    page:  '1',
    pages: {},
    items: null,
  },
  mutations:  {
    [action.LOAD](state, { q, page, data, prefix }) {
      let pageId          = String(page);
      state.q             = q;
      state.page          = pageId;
      state.pages[pageId] = Search.prepareData(data, prefix);
    },
    [action.CLEAR](state) {
      state.q     = '';
      state.page  = 1;
      state.pages = {};
      state.items = null;
    },
    [action.RELOAD](state) {
      state.q     = '';
      state.page  = 1;
      state.pages = {};
    },
    [action.SET_PAGE](state, page) {
      state.page  = String(page);
      state.items = state.pages[String(page)];
    },
    [action.LOADING](state) {
      state.items = null;
    },
  },
  actions:    {
    [action.LOAD]({ commit, state }, { page = '1', q = '' }) {
      if (null !== _.get(state.pages, page, null) && state.q === q) {
        commit(action.SET_PAGE, page);
        return;
      }

      return this.dispatch(action.get('user').LOAD, {}).then(() => {
        let prefix = window.app.getPrefix();

        return api.selectConfig(q, page)
          .then(data => {
            if (state.q !== q) {
              commit(action.CLEAR);
            }

            return data;
          })
          .then(data => commit(action.LOAD, { q, page, data, prefix }))
          .then(() => commit(action.SET_PAGE, page));
      });
    },
    [action.RELOAD]({ commit, dispatch, state }) {
      let page = String(state.page);
      let q    = String(state.q);

      commit(action.RELOAD);

      return dispatch(action.LOAD, { page, q });
    },
  },
};