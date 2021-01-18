<template>
  <div>
    <div class="card-box">
      <div class="panel-body">
        <h4>Wine Launcher</h4>
        <template v-if="remote_version">
          <ButtonLoading v-if="(remote_version !== version)" :title="$t('labels.update')"
                         :promiseCallback="updateSelf"/>

          <p class="text-muted m-t-10">
                        <span v-if="(remote_version === version)" class="label label-success">
                            {{ $t('update.latest') }}
                        </span>
            <span v-else class="label label-warning">{{ $t('update.found') }}</span>
          </p>
        </template>
        <p class="text-muted">
          {{ $t('update.local-version') }}: {{ version }}
          <br>

          <template v-if="remote_version && (remote_version !== version)">
            {{ $t('update.current-version') }}: {{ remote_version }}
          </template>
        </p>
      </div>
    </div>
    <div class="card-box" v-if="dxvk_enabled">
      <div class="panel-body">
        <h4>DXVK</h4>
        <template v-if="remote_dxvk_version">
          <ButtonLoading v-if="(remote_dxvk_version !== dxvk_version)" :title="$t('labels.update')"
                         :promiseCallback="updateDxvk"/>

          <p class="text-muted m-t-10">
                        <span v-if="(remote_dxvk_version === dxvk_version)" class="label label-success">
                            {{ $t('update.latest') }}
                        </span>
            <span v-else class="label label-warning">{{ $t('update.found') }}</span>
          </p>
        </template>
        <p class="text-muted">
          {{ $t('update.local-version') }}: {{ dxvk_version }}
          <br>

          <template v-if="remote_dxvk_version && (remote_dxvk_version !== dxvk_version)">
            {{ $t('update.current-version') }}: {{ remote_dxvk_version }}
            <br>
          </template>
        </p>
      </div>
    </div>
    <div class="card-box" v-if="vkd3dProton_enabled">
      <div class="panel-body">
        <h4>VKD3D Proton</h4>
        <template v-if="remote_vkd3dProton_version">
          <ButtonLoading v-if="(remote_vkd3dProton_version !== vkd3dProton_version)" :title="$t('labels.update')"
                         :promiseCallback="updateDxvk"/>

          <p class="text-muted m-t-10">
                        <span v-if="(remote_vkd3dProton_version === vkd3dProton_version)" class="label label-success">
                            {{ $t('update.latest') }}
                        </span>
            <span v-else class="label label-warning">{{ $t('update.found') }}</span>
          </p>
        </template>
        <p class="text-muted">
          {{ $t('update.local-version') }}: {{ vkd3dProton_version }}
          <br>

          <template v-if="remote_vkd3dProton_version && (remote_vkd3dProton_version !== vkd3dProton_version)">
            {{ $t('update.current-version') }}: {{ remote_vkd3dProton_version }}
            <br>
          </template>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import action        from "../store/action";
import ButtonLoading from "../components/UI/ButtonLoading";

const { remote } = require('electron');

export default {
  name:       'Update',
  components: {
    ButtonLoading,
  },
  data() {
    return {
      remote_version:             null,
      dxvk_version:               null,
      remote_dxvk_version:        null,
      vkd3dProton_version:        null,
      remote_vkd3dProton_version: null,
    };
  },
  mounted() {
    this.dxvk_version        = window.app.getDxvk().getLocalVersion();
    this.vkd3dProton_version = window.app.getVkd3dProton().getLocalVersion();

    window.app.getUpdate().getRemoteVersion().then((version) => {
      this.remote_version = version;
    });

    window.app.getDxvk().getRemoteVersion().then((version) => {
      this.remote_dxvk_version = version;
    });

    window.app.getVkd3dProton().getRemoteVersion().then((version) => {
      this.remote_vkd3dProton_version = version;
    });
  },
  methods:    {
    openUrl(url) {
      remote.shell.openExternal(url);
    },
    updateDxvk() {
      let dxvk = window.app.getDxvk();

      return dxvk.updateForce().then(() => {
        this.dxvk_version        = dxvk.getLocalVersion();
        this.remote_dxvk_version = String(this.dxvk_version);

        this.$store.commit(action.get('prefix').CLEAR);

        return this.$store.dispatch(action.get('prefix').LOAD);
      });
    },
    updateVkd3dProton() {
      let vkd3dProton = window.app.getVkd3dProton();

      return vkd3dProton.updateForce().then(() => {
        this.vkd3dProton_version        = vkd3dProton.getLocalVersion();
        this.remote_vkd3dProton_version = String(this.vkd3dProton_version);

        this.$store.commit(action.get('prefix').CLEAR);

        return this.$store.dispatch(action.get('prefix').LOAD);
      });
    },
    updateSelf() {
      return window.app.getUpdate().updateSelf();
    },
  },
  computed:   {
    version() {
      return window.app.getUpdate().getVersion();
    },
    dxvk_enabled() {
      return window.app.getPrefix().isDxvk();
    },
    vkd3dProton_enabled() {
      return window.app.getPrefix().isVkd3dProton();
    },
  },
}
</script>

<style lang="less" scoped>
.link {
  cursor: pointer;
}
</style>