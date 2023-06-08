<template>
  <li>
    <a @click="open" onclick="return false">
      {{ $t('labels.edit') }}
    </a>

    <div :id="id" class="modal-demo">
      <button type="button" class="close" @click="cancel">
        <span>&times;</span><span class="sr-only">{{ $t('labels.close') }}</span>
      </button>
      <h4 class="custom-modal-title">
        {{ $t('prefix.settings-prefix') }}
      </h4>
      <div class="custom-modal-text text-left">
        <template v-if="popup_opened">
          <template v-if="statePrefix.updating">
            <div class="form-group m-b-30 text-center">
              <h4 class="m-t-20"><b>{{ $t('labels.running') }}</b></h4>
            </div>
          </template>
          <template v-else>
            <Form :fields="getFields()" :tabs="getTabs()" :item.sync="item"
                  :styles="{left: 'col-sm-5', right: 'col-sm-6'}" min-height="320px" ref="form"/>

            <div class="form-group text-center m-t-40">
              <button type="button" class="btn btn-default waves-effect waves-light" @click="save">
                {{ $t('labels.save') }}
              </button>
              <button type="button" class="btn btn-danger waves-effect waves-light m-l-10"
                      @click="cancel">
                {{ $t('labels.cancel') }}
              </button>
            </div>
          </template>
        </template>
      </div>
    </div>

  </li>
</template>

<script>
import action        from '../../store/action';
import Form          from "../UI/Form";
import Values        from "./Values";
import AbstractPopup from "../UI/AbstractPopup";

export default {
  mixins:     [ AbstractPopup ],
  components: {
    Form,
  },
  name:       "PopupEditPrefix",
  props:      {
    prefix: Object,
  },
  data() {
    let prefix = this.prefix.getFlatConfig();

    return {
      statePrefix: this.$store.state.prefix,
      id:          action.id,
      item:        prefix,
      values:      {
        items: prefix.replaces,
      },
      fixesForm:   {
        tabs:         this.getFixesTabs(),
        fields:       this.getFixesFields(),
        styles:       { left: 'col-sm-5', right: 'col-sm-6', inner: true },
        'min-height': '210px',
        item:         prefix,
      },
    };
  },
  methods:    {
    open() {
      this.item               = this.prefix.getFlatConfig();
      this.fixesForm.item     = this.item;
      this.item.info_replaces = `
 <table class="table table-condensed m-0">
  <thead>
    <tr>
      <th>Key</th>
      <th>Description</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>{WIDTH}</td>
      <td>default monitor width in pixels (number)</td>
    </tr>
    <tr>
      <td>{HEIGHT}</td>
      <td>default monitor height in pixels (number)</td>
    </tr>
    <tr>
      <td>{USER}</td>
      <td>username</td>
    </tr>
    <tr>
      <td>{DOSDEVICES}</td>
      <td>Full path to "/.../prefix/dosdevice"</td>
    </tr>
    <tr>
      <td>{DRIVE_C}</td>
      <td>Full path to "/.../prefix/drive_c"</td>
    </tr>
    <tr>
      <td>{PREFIX}</td>
      <td>Full path to "/.../prefix"</td>
    </tr>
    <tr>
      <td>{ROOT_DIR}</td>
      <td>Full path to game folder</td>
    </tr>
    <tr>
      <td>{HOSTNAME}</td>
      <td>See command: hostname</td>
    </tr>
  </tbody>
</table>
<br/>Example: data/games/game/example.conf
`;

      new Custombox.modal({
        content: {
          effect: 'fadein',
          target: `#${this.id}`,
        },
        loader:  {
          active: false,
        },
      }).open();
    },
    save() {
      this.item.replaces = this.values.items;

      Object.keys(this.getFixesFields()).forEach(field => {
        this.item[field] = this.fixesForm.item[field];
      });

      let validated = this.$refs.form.validate();

      if (validated && Object.keys(validated).length > 0) {
        return;
      }

      delete this.item.info_replaces;

      this.$store.dispatch(action.get('prefix').SAVE, { prefix: this.prefix, item: this.item })
        .then(() => this.cancel());
    },
    cancel() {
      return Custombox.modal.close();
    },
    getFixesTabs() {
      return {
        wine:   'Wine',
        render: 'Render',
        prefix: 'Prefix',
      };
    },
    getFixesFields() {
      return {
        'fixes.nocrashdialog':     {
          tab:               'wine',
          name:              'No crash dialog',
          description_title: '',
          description:       this.$t('prefix.form-prefix.nocrashdialog'),
          type:              'bool',
          required:          false,
        },
        'fixes.focus':             {
          tab:               'wine',
          name:              'Fix focus',
          description_title: '',
          description:       this.$t('prefix.form-prefix.focus'),
          type:              'bool',
          required:          true,
        },
        'fixes.MouseWarpOverride': {
          tab:      'wine',
          name:     'MouseWarpOverride',
          type:     'mouseWarpOverride',
          required: false,
        },

        'fixes.cfc':  {
          tab:               'render',
          name:              'CheckFloatConstants',
          description_title: '',
          description:       this.$t('prefix.form-prefix.cfc'),
          type:              'bool',
          required:          false,
        },
        'fixes.glsl': {
          tab:               'render',
          name:              'Use GLSL shaders',
          description_title: '',
          description:       'Use GLSL shaders (enable) or ARB shaders (disable) (faster, but sometimes breaks)',
          type:              'bool',
          required:          false,
        },
        'fixes.ddr':  {
          tab:      'render',
          name:     'DirectDrawRenderer',
          type:     'directDrawRenderer',
          required: false,
        },
        'fixes.orm':  {
          tab:      'render',
          name:     'OffscreenRenderingMode',
          type:     'offscreenRenderingMode',
          required: false,
        },
        'fixes.mono':  {
          tab:         'prefix',
          name:        'Disable Mono',
          description: this.$t('prefix.form-prefix.mono'),
          type:        'bool',
          required:    false,
        },
        'fixes.gecko':  {
          tab:         'prefix',
          name:        'Disable Gecko',
          description: this.$t('prefix.form-prefix.gecko'),
          type:        'bool',
          required:    false,
        },
        'fixes.gstreamer':  {
          tab:         'prefix',
          name:        'Disable GStreamer',
          description: this.$t('prefix.form-prefix.gstreamer'),
          type:        'bool',
          required:    false,
        },
        'fixes.winemenubuilder':  {
          tab:         'prefix',
          name:        'Disable WineMenuBuilder',
          description: this.$t('prefix.form-prefix.winemenubuilder'),
          type:        'bool',
          required:    false,
        },
      };
    },
    getTabs() {
      return {
        main:     this.$t('prefix.form-prefix.main'),
        libs:     this.$t('prefix.form-prefix.libs'),
        fixes:    this.$t('prefix.form-prefix.fixes'),
        system:   this.$t('prefix.form-prefix.system'),
        replaces: this.$t('prefix.form-prefix.replace'),
      };
    },
    getFields() {
      let fields = {};

      return Object.assign(fields, {
        'app.path':             {
          tab:               'main',
          name:              this.$t('prefix.form-prefix.path'),
          description_title: this.$t('labels.example'),
          description:       'Games',
          type:              'text',
          required:          true,
        },
        'wine.windows_version': {
          tab:      'main',
          name:     this.$t('prefix.form-prefix.windows-version'),
          type:     'windows_version',
          required: true,
        },
        'wine.arch':            {
          tab:      'main',
          name:     this.$t('labels.arch'),
          type:     'archFiltered',
          required: true,
        },


        'app.sandbox':    {
          tab:               'system',
          name:              'Sandbox',
          description_title: '',
          description:       this.$t('prefix.form-prefix.sandbox-desc'),
          type:              'bool',
          required:          false,
        },
        'app.fixres':     {
          tab:               'system',
          name:              this.$t('prefix.form-prefix.fixres'),
          description_title: '',
          description:       this.$t('prefix.form-prefix.fixres-desc'),
          type:              'bool',
          required:          false,
        },
        'app.compositor': {
          tab:               'system',
          name:              this.$t('prefix.form-prefix.disable-effects'),
          description_title: '',
          description:       this.$t('prefix.form-prefix.disable-effects-desc'),
          type:              'bool',
          required:          false,
        },


        'libs.dxvk.install':            {
          tab:               'libs',
          name:              'DXVK',
          description_title: '',
          description:       this.$t('prefix.form-prefix.dxvk-desc'),
          type:              'bool',
          required:          false,
        },
        'libs.dxvk.autoupdate':         {
          tab:               'libs',
          name:              this.$t('prefix.form-prefix.update-dxvk-desc'),
          description_title: '',
          description:       '',
          type:              'bool',
          relations:         'require:libs.dxvk.install',
          required:          false,
        },
        'libs.vkd3d-proton.install':    {
          tab:               'libs',
          name:              'VKD3D Proton',
          description_title: '',
          description:       this.$t('prefix.form-prefix.vkd3d-proton-desc'),
          type:              'bool',
          required:          false,
        },
        'libs.vkd3d-proton.autoupdate': {
          tab:               'libs',
          name:              this.$t('prefix.form-prefix.update-vkd3d-proton-desc'),
          description_title: '',
          description:       '',
          type:              'bool',
          relations:         'require:libs.vkd3d-proton.install',
          required:          false,
        },
        'libs.mf.install':              {
          tab:         'libs',
          name:        'Media Foundation',
          description: this.$t('prefix.form-prefix.mf-desc'),
          type:        'bool',
          relations:   'arch64:wine.arch',
          required:    false,
        },
        'libs.mangohud.install':        {
          tab:               'libs',
          name:              'MangoHud',
          description_title: '',
          description:       this.$t('prefix.form-prefix.mangohud-desc'),
          type:              'bool',
          required:          false,
        },
        'libs.vkbasalt.install':        {
          tab:               'libs',
          name:              'VkBasalt',
          description_title: '',
          description:       this.$t('prefix.form-prefix.vkbasalt-desc'),
          type:              'bool',
          required:          false,
        },

        'fixes-form': {
          tab:       'fixes',
          type:      'component',
          component: Form,
          required:  false,
          full_size: true,
          props:     this.fixesForm,
        },

        'info_replaces': {
          tab:               'replaces',
          type:              'info',
          name:              'Use GLSL shaders',
          description_title: '',
          description:       'Use GLSL shaders (enable) or ARB shaders (disable) (faster, but sometimes breaks)',
          required:          false,
          full_size:         true,
        },
        'replaces':      {
          tab:       'replaces',
          type:      'component',
          component: Values,
          required:  false,
          full_size: true,
          props:     this.values,
        },
      });
    },
  },
  computed:   {}
}
</script>

<style lang="less" scoped>
.modal-demo {
  width: 700px;
  margin: auto;
}

.custom-modal-text {
  position: relative;

  form {
    position: relative;
  }
}

.custombox-content > * {
  max-height: max-content;
}

a {
  cursor: pointer;
}
</style>