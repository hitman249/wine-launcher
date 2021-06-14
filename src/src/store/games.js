import Utils  from "../modules/utils";
import action from "./action";
import api    from "../api";

export default {
  namespaced: true,
  state:      {
    configs: [],
    full:    false,
  },
  mutations:  {
    [action.LOAD](state, { configs, prefix }) {
      let _configs = (configs || []);
      let games    = (window.app.getCommand().getArguments()['game'] || []);

      if (state.full) {
        games = [];
      } else if (games.length === 0) {
        state.full = true;
      }

      state.configs = _configs.filter((config) => games.length === 0 || games.indexOf(config.getCode()) !== -1).map(config => ({
        name:        config.getGameName(),
        description: config.getGameDescription(),
        version:     config.getGameVersion(),
        time:        config.getGameTime(),
        code:        config.getCode(),
        icon:        config.getGameIcon() ? 'local:/' + config.getGameIcon() + '?t=' + api.currentTime : '',
        iconHeight:  config.getIconHeight(),
        background:  config.getGameBackground() ? 'local:/' + config.getGameBackground() + '?t=' + api.currentTime : '',
        esync:       config.isEsync(),
        fsync:       config.isFsync(),
        pulse:       config.isPulse(),
        csmt:        config.isCsmt(),
        window:      config.isWindow(),
        icons:       config.getIcon().findIcons().map(s => ({ path: s, truncate: Utils.startTruncate(s, 50) })),
        startAt:     null,
        launched:    false,
        config,
        prefix,
      }));

      if (!state.full) {
        state.full = state.configs.length === _configs.length;
      }

      if (false === state.full || _configs.length === 1) {
        window.document.title = state.configs[0].name;

        let icon = state.configs[0].config.getGameIcon();

        if (icon) {
          try {
            window.require('electron').remote.getCurrentWindow().setIcon(icon);
          } catch (e) {
          }
        }
      } else {
        window.document.title = 'Wine Launcher';
        let icon              = window.process.resourcesPath + '/app.asar/build/icons/512.png';

        try {
          window.require('electron').remote.getCurrentWindow().setIcon(icon);
        } catch (e) {
        }
      }
    },
    [action.PLAY](state, config) {
      state.configs = state.configs.map(item => {
        if (item.code === config.code) {
          item.launched = true;
          item.startAt  = api.currentTime;
        }

        return item;
      });
    },
    [action.STOP](state, config) {
      state.configs = state.configs.map(item => {
        if (item.code === config.code) {
          item.launched = false;

          if (item.startAt) {
            item.time = item.time + (api.currentTime - item.startAt);
            item.config.setConfigValue('app.time', item.time);
            item.config.save();
          }
        }

        return item;
      });
    },
    [action.CLEAR](state) {
      state.configs = [];
    },
    [action.FULL](state, enable) {
      state.full = enable;
    },
  },
  actions:    {
    [action.LOAD]({ commit, state }) {
      if (state.configs.length > 0) {
        return;
      }

      commit(action.LOAD, { configs: window.app.getConfig().findConfigs(), prefix: window.app.getPrefix() });
    },
    [action.PLAY]({ commit, dispatch }, { config, mode }) {
      commit(action.PLAY, config);

      window.app.createTask(config.config)
        .run(mode, spawn => config.config.setProcess(spawn))
        .then(() => dispatch(action.STOP, config));
    },
    [action.STOP]({ commit }, config) {
      commit(action.STOP, config);
      let args      = window.app.getCommand().getArguments();
      let autostart = args['autostart'];
      let hide      = args['hide'];

      if (undefined !== autostart && undefined !== hide) {
        window.app.getSystem().closeApp();
      }
    },
    [action.SAVE]({ commit, dispatch }, { config, item }) {
      if (!window.app.getFileSystem().exists(config.path)) {
        commit(action.FULL, true);
      }

      config.saveImages();
      config.setFlatConfig(item);
      config.save();
      config.getIcon().extractIcon();
      config.getIcon().extract();

      commit(action.CLEAR);

      return dispatch(action.LOAD);
    },
    [action.APPEND]({ commit, dispatch }, { config, item }) {

      let startBy = item.autostart && item.mode ? item.mode : null;

      config.getIcon().create(item.menu, item.desktop, startBy, item.hide);

      commit(action.CLEAR);
      return dispatch(action.LOAD);
    },
    [action.REMOVE]({ commit, dispatch }, { config }) {

      config.getIcon().remove();

      commit(action.CLEAR);
      return dispatch(action.LOAD);
    },
    [action.FULL]({ commit, dispatch }) {
      commit(action.FULL, true);
      commit(action.CLEAR);
      return dispatch(action.LOAD);
    },
    [action.RELOAD]({ dispatch }) {
      return dispatch(action.FULL);
    },
  },
};