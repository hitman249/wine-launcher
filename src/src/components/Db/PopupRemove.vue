<template>
  <div>
    <button class="btn item-point__button btn-custom waves-effect waves-light" @click="open" onclick="return false">
      <span>{{ $t('labels.delete') }}</span>
      <i class="fa fa-angle-right m-l-10"></i>
    </button>

    <div :id="id" class="modal-demo">
      <button type="button" class="close" @click="cancel">
        <span>&times;</span><span class="sr-only">{{ $t('labels.close') }}</span>
      </button>
      <h4 class="custom-modal-title">
        {{ $t('search.delete') }}
      </h4>
      <div class="custom-modal-text text-left">
        <form role="form">
          <div class="form-group m-b-30 text-center">
            <h4 class="m-t-20">
              <b>
                {{ $t('labels.delete') }} "{{ item.name }}"?
              </b>
            </h4>
          </div>

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

  </div>
</template>

<script>
import action from '../../store/action';
import api    from "../../api";

export default {
  components: {},
  name:       "PopupRemove",
  props:      {
    item:  Object,
    type:  String,
    model: String,
  },
  data() {
    return {
      id: action.id,
    };
  },
  methods:    {
    remove() {
      let promise = Promise.resolve();

      if ('config' === this.model) {
        promise = api.deleteConfig(this.item.id);
      }

      return promise.then(() => this.reload());
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
      return this.remove().then(() => this.cancel());
    },
    cancel() {
      return Custombox.modal.close();
    },
    reload() {
      return this.$store.dispatch(action.get(this.type).RELOAD)
        .then(() => this.$store.commit(action.get(this.type === 'search' ? 'shared' : 'search').CLEAR));
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
</style>