<template>
  <div>
    <button v-if="!hideButton" class="btn item-point__button btn-custom waves-effect waves-light" @click="open"
            onclick="return false">
      <span>{{ $t('labels.edit') }}</span>
      <i class="fa fa-angle-right m-l-10"></i>
    </button>

    <div :id="id" class="modal-demo">
      <button type="button" class="close" @click="cancel">
        <span>&times;</span><span class="sr-only">{{ $t('labels.close') }}</span>
      </button>
      <h4 class="custom-modal-title">
        {{ $t('patch.settings') }}
      </h4>
      <div class="custom-modal-text text-left">
        <template v-if="popup_opened && !patches.creating_snapshot">
          <Form :fields="getFields()" :item.sync="item"
                :styles="{left: 'col-sm-4', right: 'col-sm-7'}" min-height="320px" ref="form"/>

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
        <template v-if="patches.creating_snapshot">
          <div class="form-group m-b-30 text-center">
            <h4 class="m-t-20"><b>{{ $t('labels.wait') }}<br>{{ $t('patch.creating-prefix-snapshot') }}</b>
            </h4>
          </div>
        </template>
      </div>
    </div>

  </div>
</template>

<script>
import action        from '../../store/action';
import Form          from "../UI/Form";
import AbstractPopup from "../UI/AbstractPopup";

export default {
  mixins:     [ AbstractPopup ],
  components: {
    Form,
  },
  name:       "PopupPatch",
  props:      {
    patch:      Object,
    hideButton: Boolean,
  },
  data() {
    return {
      id:      action.id,
      patches: this.$store.state.patches,
      item:    {},
    };
  },
  methods:    {
    open() {
      this.item = this.patch.getFlatConfig();

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
      let validated = this.$refs.form.validate();

      if (validated && Object.keys(validated).length > 0) {
        return;
      }

      this.$store.dispatch(action.get('patches').SAVE, { patch: this.patch, item: this.item })
        .then(() => this.cancel());
    },
    cancel() {
      return Custombox.modal.close();
    },
    getFields() {
      let fields = {};

      return Object.assign(fields, {
        'active':  {
          name:        this.$t('labels.active'),
          description: this.$t('patch.forms.active'),
          type:        'bool',
          required:    false,
        },
        'sort':    {
          name:        this.$t('labels.sort'),
          description: this.$t('patch.forms.sort'),
          type:        'text',
          required:    true,
          validators:  'integer',
        },
        'name':    {
          name:        this.$t('labels.name'),
          description: this.$t('patch.forms.name'),
          type:        'text',
          required:    true,
          validators:  'file_name',
        },
        'version': {
          name:              this.$t('labels.version'),
          description_title: this.$t('labels.example'),
          description:       '1.0.0',
          type:              'text',
          required:          true,
          validators:        'file_name',
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
    margin-top: 30px;
    margin-bottom: 45px;
    position: relative;
  }
}

.custombox-content > * {
  max-height: max-content;
}

.item-point__button {
  min-width: 110px;
}
</style>