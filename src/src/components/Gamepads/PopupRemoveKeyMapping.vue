<template>
  <div :id="id" class="modal-demo">
    <button type="button" class="close" @click="cancel">
      <span>&times;</span><span class="sr-only">{{ $t('labels.close') }}</span>
    </button>
    <h4 class="custom-modal-title">
      Remove mapping?
    </h4>
    <div class="custom-modal-text text-left">
      <form role="form">
        <div class="form-group text-center m-t-40">
          <button type="button" class="btn btn-default waves-effect waves-light" @click="save">
            {{ $t('labels.yes') }}
          </button>
          <button type="button" class="btn btn-danger waves-effect waves-light m-l-10"
                  @click="cancel">
            {{ $t('labels.cancel') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import action from '../../store/action';

export default {
  components: {},
  name:       "PopupRemoveKeyMapping",
  props:      {
  },
  data() {
    return {
      id:   action.id,
      item: {},
    };
  },
  methods:    {
    remove() {

    },
    open(item) {
      let cloneItem = action.cloneObject(item);

      this.$set(this, 'item', cloneItem);

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
      if (!this.item || Object.keys(this.item).length <= 0) {
        return;
      }

      let gamepad = /** @type {Gamepad} */  window.app.getGamepads().getGamepadByIndex(this.item.gamepadIndex);

      if (gamepad) {
        let mapping = /** @type {KeyMapping} */ gamepad.getMapping();

        if (mapping) {
          mapping.removeMapping(this.item.mappingIndex);
          mapping.save();
          window.app.getGamepads().update();
        }
      }

      this.cancel();
    },
    cancel() {
      return Custombox.modal.close();
    },
  },
  computed:   {}
}
</script>

<style lang="less" scoped>
.modal-demo {
  width: 400px;
}

.custom-modal-text {
  position: relative;

  form {
    position: relative;
  }
}

.item-point__button {
  min-width: 110px;
}

a {
  cursor: pointer;
}
</style>