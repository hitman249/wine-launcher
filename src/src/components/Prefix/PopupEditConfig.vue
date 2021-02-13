<template>
  <li>

    <a v-if="!hideButton" @click="open" onclick="return false">
      {{ buttonOpenTitle ? buttonOpenTitle : $t('labels.edit') }}
    </a>

    <div :id="id" class="modal-demo">
      <button type="button" class="close" @click="cancel">
        <span>&times;</span><span class="sr-only">{{ $t('labels.close') }}</span>
      </button>
      <h4 class="custom-modal-title">
        {{ $t('prefix.settings-game') }}
      </h4>
      <div class="custom-modal-text text-left">
        <template v-if="popup_opened">
          <Form :fields="getFields()" :tabs="getTabs()" :item.sync="item" min-height="270px"
                :styles="{left: 'col-sm-4', right: 'col-sm-7'}" ref="form"/>

          <div class="form-group text-center m-t-40">
            <button type="button" class="btn btn-default waves-effect waves-light" @click="save">
              {{ buttonSaveTitle ? buttonSaveTitle : $t('labels.save') }}
            </button>
            <button type="button" class="btn btn-danger waves-effect waves-light m-l-10"
                    @click="cancel">
              {{ $t('labels.cancel') }}
            </button>
          </div>
        </template>
      </div>
    </div>

  </li>
</template>

<script>
import _             from "lodash";
import action        from '../../store/action';
import Form          from "../UI/Form";
import KeyValue      from "./KeyValue";
import AbstractPopup from "../UI/AbstractPopup";

export default {
  mixins:     [ AbstractPopup ],
  components: {
    Form,
  },
  name:       "PopupEditConfig",
  props:      {
    config:          Object,
    hideButton:      Boolean,
    buttonOpenTitle: String,
    buttonSaveTitle: String,
  },
  data() {
    let config = this.config.getFlatConfig();

    return {
      id:           action.id,
      item:         config,
      keyValue:     {
        exports: config.exports,
      },
      iconHeight:   {
        min: 88,
        max: 140,
      },
      settingsForm: {
        tabs:         this.getSettingTabs(),
        fields:       this.getSettingFields(),
        styles:       { left: 'col-sm-5', right: 'col-sm-6', inner: true },
        'min-height': '210px',
        item:         config,
      },
    };
  },
  methods:    {
    open() {
      this.$set(this, 'item', this.config.getFlatConfig());
      this.updateFullPath();

      this.keyValue.exports  = this.item.exports;
      this.settingsForm.item = this.item;

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
      this.item.exports = this.keyValue.exports;

      Object.keys(this.getSettingFields()).forEach(field => {
        this.item[field] = this.settingsForm.item[field];
      });

      let validated = this.$refs.form.validate();

      if (validated && Object.keys(validated).length > 0) {
        return;
      }

      this.$store.dispatch(action.get('games').SAVE, { config: this.config, item: this.item })
        .then(() => this.cancel());
    },
    cancel() {
      return Custombox.modal.close();
    },
    getSettingTabs() {
      return {
        mainSettings: this.$t('prefix.form-config.main'),
        performance:  this.$t('prefix.form-config.optimizations'),
        tweaks:       this.$t('prefix.form-config.tweaks'),
        forbidden:    this.$t('prefix.form-config.forbid'),
      };
    },
    getSettingFields() {
      return {
        'wine.render':       {
          tab:         'mainSettings',
          name:        'Render API',
          description: this.$t('prefix.form-config.render-desc'),
          type:        'renderApi',
          required:    true,
        },
        'wine.pulse':        {
          tab:         'mainSettings',
          name:        'PulseAudio',
          description: this.$t('prefix.form-config.pulse-desc'),
          type:        'bool',
          required:    false,
        },
        'window.enable':     {
          tab:               'mainSettings',
          name:              this.$t('prefix.form-config.run-in-window'),
          description_title: '',
          description:       '',
          type:              'bool',
          required:          false,
        },
        'window.resolution': {
          tab:               'mainSettings',
          name:              this.$t('labels.resolution'),
          description_title: this.$t('labels.example'),
          description:       '"auto" ' + this.$t('labels.or') + ' "800x600"',
          type:              'text',
          required:          true,
          relations:         'require:window.enable',
          validators:        'resolution',
        },

        'wine.csmt':     {
          tab:         'performance',
          name:        'CSMT',
          description: this.$t('prefix.form-config.csmt-desc'),
          type:        'bool',
          required:    false,
        },
        'wine.esync':    {
          tab:         'performance',
          name:        'ESYNC',
          description: this.$t('prefix.form-config.esync-desc'),
          type:        'bool',
          required:    false,
        },
        'wine.fsync':    {
          tab:         'performance',
          name:        'FSYNC',
          description: this.$t('prefix.form-config.fsync-desc'),
          type:        'bool',
          required:    false,
        },
        'wine.aco':      {
          tab:         'performance',
          name:        'ACO',
          description: this.$t('prefix.form-config.aco-desc'),
          type:        'bool',
          required:    false,
        },
        'wine.gamemode': {
          tab:         'performance',
          name:        'GameMode',
          description: this.$t('prefix.form-config.gamemode-desc'),
          type:        'bool',
          required:    false,
        },
        'wine.ssm':      {
          tab:         'performance',
          name:        'STAGING_SHARED_MEMORY',
          description: this.$t('prefix.form-config.ssm-desc'),
          type:        'bool',
          required:    false,
        },

        'wine.laa':               {
          tab:         'tweaks',
          name:        'LARGE_ADDRESS_AWARE',
          description: this.$t('prefix.form-config.laa-desc'),
          type:        'bool',
          required:    false,
        },
        'wine.swc':               {
          tab:         'tweaks',
          name:        'STAGING_WRITECOPY',
          description: this.$t('prefix.form-config.swc-desc'),
          type:        'bool',
          required:    false,
        },
        'wine.mangohud_dlsym':    {
          tab:         'tweaks',
          name:        'MangoHud DLSYM',
          description: this.$t('prefix.form-config.mangohud-dlsym-desc'),
          type:        'bool',
          required:    false,
        },
        'wine.mangohud_position': {
          tab:       'tweaks',
          name:      'MangoHud Position',
          type:      'mangoHudPosition',
          required:  false,
          relations: 'mangoHud',
        },

        'wine.disable_nvapi': {
          tab:               'forbidden',
          name:              this.$t('prefix.form-config.forbidden-nvapi'),
          description_title: this.$t('prefix.form-config.forbidden-libs'),
          description:       'nvapi,nvapi64,nvcuda,nvcuda64',
          type:              'bool',
          required:          false,
        },
        'wine.nod3d9':        {
          tab:         'forbidden',
          name:        this.$t('prefix.form-config.forbidden-d3d9'),
          description: this.$t('prefix.form-config.use-wined3d'),
          type:        'bool',
          required:    false,
        },
        'wine.nod3d10':       {
          tab:         'forbidden',
          name:        this.$t('prefix.form-config.forbidden-d3d10'),
          description: this.$t('prefix.form-config.use-wined3d'),
          type:        'bool',
          required:    false,
        },
        'wine.nod3d11':       {
          tab:         'forbidden',
          name:        this.$t('prefix.form-config.forbidden-d3d11'),
          description: this.$t('prefix.form-config.use-wined3d'),
          type:        'bool',
          required:    false,
        },
      };
    },
    getTabs() {
      return {
        main:     this.$t('prefix.form-config.game'),
        path:     this.$t('prefix.form-config.folder'),
        images:   this.$t('prefix.form-config.style'),
        settings: this.$t('prefix.form-config.settings'),
        export:   'Export',
      };
    },
    getFields() {
      let ico    = window.app.getSystem().isIcoSupport();
      let fields = {};

      return Object.assign(fields, {

        'app.name':        {
          tab:               'main',
          name:              this.$t('prefix.form-config.game-name'),
          description_title: this.$t('labels.example'),
          description:       'The Super Game: Deluxe Edition',
          type:              'text',
          required:          true,
        },
        'app.version':     {
          tab:               'main',
          name:              this.$t('prefix.form-config.game-version'),
          description_title: this.$t('labels.example'),
          description:       '1.0.0',
          type:              'text',
          required:          true,
        },
        'app.description': {
          tab:      'main',
          name:     this.$t('prefix.form-config.game-desc'),
          type:     'text',
          required: false,
        },
        'app.sort':        {
          tab:               'main',
          name:              this.$t('labels.sort'),
          description_title: this.$t('labels.example'),
          description:       '500',
          type:              'text',
          required:          true,
          validators:        'integer',
        },

        'tmp.path':       {
          tab:       'path',
          name:      'Полный путь',
          type:      'info',
          full_size: true,
          required:  false,
        },
        'app.path':       {
          tab:               'path',
          name:              this.$t('prefix.form-config.game-path'),
          description_title: this.$t('labels.example'),
          description:       'The Super Game/bin',
          type:              'text',
          required:          false,
        },
        'app.exe':        {
          tab:               'path',
          name:              this.$t('labels.file-name'),
          description_title: this.$t('labels.example'),
          description:       'Game.exe',
          type:              'text',
          required:          true,
        },
        'app.arguments':  {
          tab:               'path',
          name:              this.$t('labels.arguments'),
          description_title: this.$t('labels.example'),
          description:       '-language=russian',
          type:              'text',
          required:          false,
        },
        'app.prefix_cmd': {
          tab:               'path',
          name:              this.$t('prefix.form-config.prefix-cmd'),
          description_title: this.$t('labels.example') + ': "{ROOT_DIR}/bin/script"',
          description:       this.$t('prefix.form-config.prefix-cmd-desc'),
          type:              'text',
          required:          false,
        },

        'settings-form': {
          tab:       'settings',
          type:      'component',
          component: Form,
          required:  false,
          full_size: true,
          props:     this.settingsForm,
        },

        'icon':            {
          tab:         'images',
          name:        this.$t('prefix.form-config.game-icon'),
          description: ico ? this.$t('prefix.form-config.game-png-icon-desc') : this.$t('prefix.form-config.game-png-desc'),
          type:        'file',
          accept:      ico ? 'image/png,image/x-icon,image/vnd.microsoft.icon' : 'image/png',
          return_body: true,
          required:    false,
          validators:  ico ? 'file_image_png|file_icon' : 'file_image_png',
        },
        'background':      {
          tab:         'images',
          name:        this.$t('prefix.form-config.background'),
          description: this.$t('prefix.form-config.background-desc'),
          type:        'file',
          accept:      'image/jpeg,image/png,image/gif',
          return_body: true,
          required:    false,
          validators:  'file_image',
        },
        'app.icon_height': {
          tab:      'images',
          name:     this.$t('prefix.form-config.game-icon-size'),
          type:     'slider',
          required: false,
          props:    this.iconHeight,
        },

        'exports': {
          tab:       'export',
          type:      'component',
          component: KeyValue,
          required:  false,
          full_size: true,
          props:     this.keyValue,
        },
      });
    },
    updateFullPath() {
      let prefix = window.app.getPrefix();

      let path = _.get(this.item, 'app.path', '');
      let exe  = _.get(this.item, 'app.exe', '');
      let args = _.get(this.item, 'app.arguments', '');

      if (args) {
        args = `<span class="game-arguments">${args}</span>`
      }

      if (exe) {
        exe = `<span class="game-exe">${exe}</span>`
      }

      if (path) {
        path = `<span class="game-path">${path}</span>`
      }

      let fullPath = [ path, exe ].filter(n => n).join('/');

      let buildPath = _.trim(`${fullPath} ${args}`);

      this.$set(this.item, 'tmp.path', `<div class="game-full-path"><span class="game-start-path">${'C:' + prefix.getGamesFolder()}</span>/${buildPath}</div>`);
    },
  },
  computed:   {},
  watch:      {
    'item': {
      handler:   function () {
        this.updateFullPath();
      },
      deep:      true,
      immediate: true,
    },
  },
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

li {
  display: block;
}
</style>