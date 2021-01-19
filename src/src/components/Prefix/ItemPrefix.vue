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
          <span v-if="status.dxvk" class="label label-inverse m-r-5">
            dxvk<span v-if="status.dxvk_version">: {{ status.dxvk_version }}</span>
          </span>
        </p>
      </div>

      <div class="table-detail item-point__button-block">
        <PopupEditPrefix :prefix="status.prefix"/>
        <br>
        <PopupRecreatePrefix/>
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