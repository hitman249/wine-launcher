import action from "./action";

export default {
  namespaced: true,
  state:      {
    items: [],
    info:  [],
  },
  mutations:  {
    [action.LOAD](state, { items, info }) {
      if (items) {
        state.items = _.sortBy(items, [ 'status', 'type', 'name' ]);
      }

      if (info) {
        state.info = info;
      }
    },
  },
  actions:    {
    [action.LOAD]({ commit, state }) {
      if (state.items.length > 0) {
        return;
      }

      let system  = window.app.getSystem();
      let driver  = window.app.getDriver();
      let version = driver.getVersion();

      let info = [
        {
          name:  'CPU',
          type:  'cpu',
          value: system.getCPU(),
        },
        {
          name:  'GPU',
          type:  'gpu',
          value: driver.getName(),
        },
        {
          name:  'GPU driver',
          type:  'driver',
          info:  version.info || '',
          value: [ version.vendor, version.driver, version.version, version.mesa ].filter(v => v).join(', '),
        },
        {
          name:  'Distr',
          type:  'distr',
          value: system.getDistrName(),
        },
        {
          name:  'Linux Kernel',
          type:  'kernel',
          value: system.getLinuxVersion(),
        },
        {
          name:  'Arch',
          type:  'arch',
          value: system.getArch(),
        },
        {
          name:  'Glibc',
          type:  'glibc',
          value: system.getGlibcVersion(),
        },
        {
          name:  'X.Org',
          type:  'xorg',
          value: system.getXorgVersion(),
        },
        {
          name:  'Xrandr',
          type:  'xrandr',
          value: system.getXrandrVersion(),
        },
        {
          name:  'vm.max_map_count',
          type:  'max_map_count',
          value: system.getVmMaxMapCount(),
        },
        {
          name:  'Ulimit Soft',
          type:  'ulimit_soft',
          value: system.getUlimitSoft(),
        },
        {
          name:  'Ulimit Hard',
          type:  'ulimit_hard',
          value: system.getUlimitHard(),
        },
      ];

      commit(action.LOAD, { info });

      let diagnostics = window.app.getDiagnostics();

      setTimeout(() => {
        let items = [];
        diagnostics.each('apps', item => items.push(item));
        diagnostics.each('fonts', item => items.push(item));
        diagnostics.each('libs', item => items.push(item));
        commit(action.LOAD, { items });
      }, 100);
    },
  },
};