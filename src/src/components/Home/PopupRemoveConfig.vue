<template>
  <li>
    <a @click="open" onclick="return false">
      {{ $t('labels.delete') }}
    </a>

    <div :id="id" class="modal-demo">
      <button type="button" class="close" @click="cancel">
        <span>&times;</span><span class="sr-only">{{ $t('labels.close') }}</span>
      </button>
      <h4 class="custom-modal-title">
        {{ $t('labels.delete') }} "{{ config.name }}"?
      </h4>
      <div class="custom-modal-text text-left">
        <form role="form">
          <br>
          <Form :fields="getFields()" :item.sync="item"
                :styles="{left: 'col-sm-8', right: 'col-sm-2'}" ref="form"/>

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

  </li>
</template>

<script>
import action from '../../store/action';
import Form   from "../UI/Form";

export default {
  components: {
    Form,
  },
  name:       "PopupRemoveConfig",
  props:      {
    config: Object,
  },
  data() {
    return {
      id:   action.id,
      item: {
        'remove.files': false,
      },
    };
  },
  methods:    {
    remove() {
      this.config.config.delete(this.item['remove.files']);
      return this.reload();
    },
    open() {
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
      this.remove().then(() => this.cancel());
    },
    cancel() {
      return Custombox.modal.close();
    },
    reload() {
      return this.$store.dispatch(action.get('games').RELOAD);
    },
    getFields() {
      let fields = {};
      return Object.assign(fields, {
        'remove.files': {
          name:     this.$t('game.remove-files'),
          type:     'bool',
          required: false,
        },
      });
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