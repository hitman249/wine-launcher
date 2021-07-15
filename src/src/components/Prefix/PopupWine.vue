<template>
  <div>
    <button class="btn item-point__button btn-custom waves-effect waves-light" @click="open"
            onclick="return false">
      <span>{{ $t('labels.update') }}</span>
      <i class="fa fa-angle-right m-l-10"></i>
    </button>

    <div :id="id" class="modal-demo">
      <button type="button" class="close" @click="cancel">
        <span>&times;</span><span class="sr-only">{{ $t('labels.close') }}</span>
      </button>
      <h4 class="custom-modal-title">
        {{ $t('prefix.wine-update') }}
      </h4>
      <div class="custom-modal-text text-left">
        <template v-if="popup_opened && false === wine.downloading">

          <FileList :items="items" :selected.sync="selected" ref="files"/>

          <div class="form-group text-center m-t-40">
            <button :disabled="!selected || 'file' !== selected.type" type="button" @click="save"
                    class="btn btn-default waves-effect waves-light">
              {{ $t('labels.save') }}
            </button>
            <button type="button" class="btn btn-danger waves-effect waves-light m-l-10"
                    @click="cancel">
              {{ $t('labels.cancel') }}
            </button>
          </div>
        </template>
        <template v-else>
          <div class="form-group m-b-30 text-center">
            <h4 class="m-t-20"><b>{{ wine.downloading_title }}</b></h4>
          </div>
        </template>
      </div>
    </div>

  </div>
</template>

<script>
import action        from '../../store/action';
import AbstractPopup from "../UI/AbstractPopup";
import FileList      from "../UI/FileList";

export default {
  mixins:     [ AbstractPopup ],
  components: {
    FileList,
  },
  name:       "PopupWine",
  data() {
    return {
      id:       action.id,
      wine:     this.$store.state.wine,
      items:    [
                  window.app.getKron4ek().getElement(),
                  window.app.getPlayOnLinux().getElement(),
                  window.app.getLutris().getElement(),
                  window.app.getWineGE().getElement(),
                  window.app.getProtonGE().getElement(),
                  window.app.getProtonTKG().getElement(),
                  window.app.getProtonTkgGardotd426().getElement(),
                  window.app.getWineScLug().getElement(),
                  window.app.getWineRunnerSc().getElement(),
                  window.app.getSteam().getElement(),
                ].filter(n => n),
      selected: null,
    };
  },
  methods:    {
    onContentOpened() {
      this.popup_opened = true;
      this.$nextTick(() => {
        if (this.$refs.files) {
          this.$refs.files.bindScroll();
        }
      });
    },
    onContentClosed() {
      this.popup_opened = false;
      if (this.$refs.files) {
        this.$refs.files.unbindScroll();
      }
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
      this.$store.dispatch(action.get('wine').UPDATE, this.selected).then(() => this.cancel());
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
</style>