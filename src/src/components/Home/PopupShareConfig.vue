<template>
  <div>
    <button class="btn item-point__button btn-custom waves-effect waves-light" @click="open" onclick="return false">
      <span>{{ $t('labels.share') }}</span>
      <i class="fa fa-angle-right m-l-10"></i>
    </button>

    <div :id="id" class="modal-demo">
      <button type="button" class="close" @click="cancel">
        <span>&times;</span><span class="sr-only">{{ $t('labels.close') }}</span>
      </button>
      <h4 class="custom-modal-title">
        {{ $t('labels.share') }}
      </h4>
      <div class="custom-modal-text text-left">
        <form role="form">
          <div class="form-group m-b-30 text-center">
            <h4 class="m-t-20">
              <b>
                {{ $t('labels.share') }} "{{ config.name }}"?
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

export default {
  components: {},
  name:       "PopupShareConfig",
  props:      {
    config: Object,
  },
  data() {
    return {
      id: action.id,
    };
  },
  methods:    {
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
      return this.config.config.sendToServer().then(() => this.cancel());
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
</style>