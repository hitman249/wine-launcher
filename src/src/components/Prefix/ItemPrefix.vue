<template>
  <div class="item-point card-box m-b-10" @mouseenter="hover">
    <div class="item-point__background"></div>

    <div class="table-box opport-box">
      <div class="table-detail">
        <div class="member-info">
          <h4 class="m-t-15"><b>Prefix</b></h4>
          <p class="text-dark">
            <span class="text-muted">{{ getWindowVersion() }} <br> {{ getArch() }}</span>
          </p>
          <p class="text-dark">
            <span class="text-muted"></span>
          </p>
        </div>
      </div>

      <div class="table-detail item-point__info">
        <p class="text-dark m-b-5">
          <span v-if="status.sandbox" class="label label-inverse m-r-5">sandbox</span>
          <span v-if="status.focus" class="label label-inverse m-r-5">focus</span>
          <span v-if="status.dxvk" class="label label-inverse m-r-5">
            dxvk<span v-if="status.dxvk_version">: {{ status.dxvk_version }}</span>
          </span>
          <span v-if="status.vkd3d" class="label label-inverse m-r-5">
            vkd3d<span v-if="status.vkd3d_version">: {{ status.vkd3d_version }}</span>
          </span>
          <span v-if="status.mf" class="label label-inverse m-r-5">mf</span>
          <span v-if="status.mangohud" class="label label-inverse m-r-5">mangohud</span>
          <span v-if="status.vkbasalt" class="label label-inverse m-r-5">vkbasalt</span>
        </p>
      </div>

      <div class="table-detail item-point__button-block">
        <div class="btn-group">
          <button type="button" class="btn item-point__button btn-custom waves-effect waves-light  dropdown-toggle"
                  data-toggle="dropdown" aria-expanded="false">
            {{ $t('labels.action') }} <span class="caret"></span>
          </button>
          <ul class="dropdown-menu" role="menu">
            <PopupEditPrefix :prefix="status.prefix"/>
            <PopupRecreatePrefix/>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Collects            from "../../helpers/collects";
import PopupRecreatePrefix from "./PopupRecreatePrefix";
import PopupEditPrefix     from "./PopupEditPrefix";

export default {
  name:       "ItemWine",
  props:      {
    status: Object,
  },
  components: {
    PopupEditPrefix,
    PopupRecreatePrefix,
  },
  methods:    {
    getWindowVersion() {
      return Collects.windowsVersion[this.status.windows_version];
    },
    getArch() {
      return Collects.arch[this.status.arch];
    },
    hover() {
      window.app.getAudioButton().hover();
    },
  },
  computed:   {}
}
</script>

<style lang="less" scoped>
.item-point__info {
  text-align: center;
}
</style>