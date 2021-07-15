import action from "./action";
import api    from "../api";

export default {
  namespaced: true,
  state:      {
    status:            {},
    loaded:            false,
    recreating:        false,
    downloading:       false,
    downloading_title: window.i18n.t('labels.downloading'),
  },
  mutations:  {
    [action.LOAD](state, status) {
      state.status = status;
      state.loaded = true;
    },
    [action.CLEAR](state) {
      state.status      = {};
      state.recreating  = false;
      state.loaded      = false;
      state.downloading = false;

      let prefix       = window.app.getPrefix();
      let facadeKernel = window.app.getFacadeKernel();
      let cache        = window.app.getCache();

      facadeKernel.clear();
      prefix.clear();
      cache.reset('wine');

      let wine = window.app.getKernel();
      wine.loadWineEnv();
    },
    [action.PREFIX_RECREATE](state) {
      state.recreating = true;
    },
    [action.UPDATE](state, title) {
      state.downloading       = true;
      state.downloading_title = title;
    },
  },
  actions:    {
    [action.LOAD]({ commit, state }) {
      if (Object.keys(state.status).length > 0) {
        return;
      }

      let wine   = window.app.getKernel();
      let system = window.app.getSystem();

      let result = {
        arch:            wine.getWineArch(),
        arch_no_support: 'win64' === wine.getWineArch() && !wine.isWine64BinExist(),
        wine_version:    wine.getVersion(),
        prefix_version:  wine.getWinePrefixInfo('version'),
        libs:            wine.getMissingLibs(),
        is_system_wine:  wine.isUsedSystemWine(),
        glibc:           wine.getMinGlibcVersion(),
        system_glibc:    system.getGlibcVersion(),
      };

      commit(action.LOAD, result);
    },
    [action.PREFIX_RECREATE]({ commit, dispatch }) {
      return new Promise((resolve) => {
        commit(action.PREFIX_RECREATE);

        setTimeout(() => {
          window.app.getWinePrefix().reCreate()
            .then(() => {
              commit(action.CLEAR);
              return dispatch(action.LOAD)
                .then(() => resolve());
            })
            .then(() => api.dispatch(action.get('prefix').RELOAD));
        }, 500);
      });
    },
    [action.UPDATE]({ commit, dispatch }, item) {
      if (!item || 'file' !== item.type || !item.download) {
        return;
      }

      commit(action.UPDATE, window.i18n.t('labels.downloading'));

      return item.download().then((filename) => {
        commit(action.UPDATE, window.i18n.t('labels.extracting'));

        return new Promise((resolve) => {
          setTimeout(() => {
            let appFolders = window.app.getAppFolders();
            let mountWine  = window.app.getMountWine();
            let fs         = window.app.getFileSystem();
            let path       = `${appFolders.getCacheDir()}/${filename}`;

            if (fs.exists(path) || fs.exists(filename)) {
              mountWine.unmount().then(() => {
                if (fs.exists(mountWine.getSquashfsFile())) {
                  fs.rm(mountWine.getSquashfsFile());
                }

                if (fs.isDirectory(filename)) {
                  if (fs.exists(appFolders.getWineDir())) {
                    fs.rm(appFolders.getWineDir());
                  }

                  fs.cp(filename, appFolders.getWineDir());
                } else {
                  fs.unpack(path, appFolders.getWineDir());
                }

                return mountWine.mount().then(() => {
                  api.commit(action.get('pack').CLEAR);

                  commit(action.CLEAR);
                  dispatch(action.LOAD).then(() => {
                    let wine = window.app.getKernel();
                    let bin  = wine.getWineDir() + '/bin';

                    if (fs.exists(bin)) {
                      fs.chmod(bin);
                    }

                    resolve();
                  });
                });
              });
            } else {
              commit(action.CLEAR);
              dispatch(action.LOAD).then(() => resolve());
            }
          }, 500);
        });
      });
    },
  },
};