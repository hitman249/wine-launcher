<template>
  <li>
    <a @click="open" onclick="return false">
      {{ $t('prefix.recreate') }}
    </a>

    <div :id="id" class="modal-demo">
      <button type="button" class="close" @click="cancel">
        <span>&times;</span><span class="sr-only">{{ $t('labels.close') }}</span>
      </button>
      <h4 class="custom-modal-title">
        {{ $t('prefix.prefix') }}
      </h4>
      <div class="custom-modal-text text-left">
        <form role="form">
          <template v-if="wine.recreating">
            <div class="form-group m-b-30 text-center">
              <h4 class="m-t-20"><b>{{ $t('labels.running') }}</b></h4>
            </div>
          </template>
          <template v-else>
            <div class="form-group m-b-30 text-center">
              <h4 class="m-t-20"><b>{{ $t('prefix.recreate-prefix') }}</b></h4>
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
          </template>
        </form>
      </div>
    </div>

  </li>
</template>

<script>
import action from '../../store/action';

export default {
  components: {},
  name:       "PopupRecreatePrefix",
  props:      {},
  data() {
    return {
      id:   action.id,
      wine: this.$store.state.wine,
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
      this.$store.dispatch(action.get('wine').PREFIX_RECREATE).then(() => this.cancel());
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

a {
  cursor: pointer;
}
</style>