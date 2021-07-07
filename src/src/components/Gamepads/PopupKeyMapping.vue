<template>
  <div :id="id" class="modal-demo">
    <button type="button" class="close" @click="cancel">
      <span>&times;</span><span class="sr-only">{{ $t('labels.close') }}</span>
    </button>
    <h4 class="custom-modal-title">
      {{ title }}
      <span class="label label-inverse">
        {{ item && (Number(item.index) + 1) }}
      </span>
    </h4>
    <div class="custom-modal-text text-left" v-if="popup_opened">
      <div class="form-group text-center" style="display: flex; justify-content: center;">
        <FormItems :item.sync="item" :fields="fields" :validated="validated" style="width: 170px;"
                   class="m-b-0 m-t-10"/>
      </div>
      <div class="form-group text-center m-t-10">
        <button type="button" @click="save" class="btn btn-default waves-effect waves-light">
          {{ $t('labels.save') }}
        </button>
        <button type="button" class="btn btn-danger waves-effect waves-light m-l-10" @click="cancel">
          {{ $t('labels.cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import action        from '../../store/action';
import AbstractPopup from "../UI/AbstractPopup";
import Validators    from '../../helpers/validators';
import Relations     from '../../helpers/relations';
import Mouse         from "../../modules/gamepads/mouse";
import KeyMapping    from "../../modules/gamepads/key-mapping";
import Gamepad       from "../../modules/gamepads/gamepad";
import FormItems     from '../UI/FormItems.vue';

export default {
  mixins:     [ AbstractPopup ],
  components: {
    FormItems,
  },
  name:       "PopupKeyMapping",
  data() {
    return {
      id:         action.id,
      fields:     this.getFields(),
      validated:  {},
      item:       {},
      mouseSpeed: {
        min: 1,
        max: 10,
      }
    };
  },
  methods:    {
    onContentOpened() {
      this.popup_opened = true;
    },
    onContentClosed() {
      this.popup_opened = false;
    },

    /**
     * @param {{gamepadIndex: number, mappingIndex: number, type: string, index: number, value: string}} item
     */
    open(item) {
      this.resetValidate();

      let cloneItem         = action.cloneObject(item);
      let [ value, value2 ] = cloneItem.value.split('|');

      if (window.app.getMouse().isMouseXY(value)) {
        cloneItem.value  = value;
        cloneItem.value3 = Number(value2);
      } else {
        cloneItem.value  = value;
        cloneItem.value2 = value2;
      }

      this.$set(this, 'item', cloneItem);
      this.$set(this, 'fields', this.getFields());

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
      let validate = this.validate();

      if (Object.keys(validate).length > 0) {
        return;
      }

      let gamepad = /** @type {Gamepad} */  window.app.getGamepads().getGamepadByIndex(this.item.gamepadIndex);

      if (gamepad) {
        let mapping = /** @type {KeyMapping} */ gamepad.getMapping();

        if (mapping) {
          mapping.setKey(this.item.mappingIndex, this.getType(), this.item.index, this.getBuildValue());
          mapping.save();
          window.app.getGamepads().update();
        }
      }

      this.cancel();
    },
    cancel() {
      return Custombox.modal.close();
    },
    getFields() {
      let mouse = window.app.getMouse();

      return {
        'value':  {
          name:      'Key',
          type:      'select2',
          required:  true,
          full_size: true,
          items:     this.getKeys(),
        },
        'value2': {
          name:       'Key',
          type:       'select2',
          required:   true,
          full_size:  true,
          relations:  'key_mapping_no_mouse:value,key_mapping_only_axes:type',
          validators: 'key_mapping_no_mouse',
          items:      this.getKeys().filter((item) => !mouse.isMouseXY(item.id)),
        },
        'value3': {
          name:       'Speed',
          type:       'slider',
          required:   false,
          props:      this.mouseSpeed,
          full_size:  true,
          relations:  'key_mapping_mouse:value,key_mapping_only_axes:type',
          validators: 'integer',
        },
      };
    },
    validate() {
      let fields = {};

      Object.keys(this.fields).forEach((field) => {
        if (Relations.relation(field, this.fields, this.item)) {
          fields[field] = this.fields[field];
        }
      });

      let validated = Validators.validate(fields, this.item);
      this.$set(this, 'validated', validated);

      return this.validated;
    },
    resetValidate() {
      this.$set(this, 'validated', {});
    },
    getKeys() {
      let mouse = window.app.getMouse();

      return window.app.getKeyboard().getKeys().map((key) => ({ id: key, text: key }))
        .filter((item) => {
          if (KeyMapping.BUTTONS === this.getType()) {
            return !mouse.isMouseXY(item.id);
          }

          return true;
        });
    },
    getType() {
      if (this.item && Object.keys(this.item).length > 0) {
        return this.item.type;
      }

      return KeyMapping.BUTTONS
    },
    getBuildValue() {
      if (KeyMapping.BUTTONS === this.getType()) {
        return this.item.value;
      }

      if (window.app.getMouse().isMouseXY(this.item.value)) {
        return [ this.item.value, this.item.value3 ].join('|');
      }

      return [ this.item.value, this.item.value2 ].join('|');
    }
  },
  computed:   {
    isAxes() {
      return this.item && 'axes' === this.getType();
    },
    title() {
      return this.isAxes ? 'Axes mapping' : 'Button mapping';
    }
  }
}
</script>

<style lang="less" scoped>
.modal-demo {
  width: 300px;
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
</style>