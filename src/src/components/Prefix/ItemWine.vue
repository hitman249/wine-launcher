<template>
  <div class="item-point card-box m-b-10" @mouseenter="hover">
    <div class="item-point__background"></div>

    <div class="table-box opport-box">
      <div class="table-detail">
        <div class="member-info">
          <h4 class="m-t-15">
            <b>Wine</b>
            <span v-if="status.is_system_wine" class="label label-inverse system-wine">{{ $t('prefix.system') }}</span>
          </h4>
          <p class="text-dark">
            <span class="text-muted">{{ status.wine_version }}</span>
          </p>
          <p class="text-dark">
            <span class="text-muted"></span>
          </p>
        </div>
      </div>

      <div class="table-detail item-point__info">
        <p v-if="status.libs.length > 0" class="text-dark m-b-10">
          <span class="label label-inverse">{{ $t('prefix.missing-libs') }}:</span><br>
          <code v-for="lib in status.libs" :key="lib" class="tag">{{ lib }}</code>
        </p>
        <p v-if="status.is_system_wine && status.glibc" class="text-dark m-b-5">
          <span class="label label-custom blink">{{ $t('prefix.glibc') }} {{ status.glibc }}</span>
        </p>
        <p v-if="status.wine_version !== status.prefix_version" class="text-dark m-b-5">
          <span class="label label-custom blink">{{ $t('prefix.wine-not-support') }}</span>
        </p>
        <p v-if="status.arch_no_support" class="text-dark m-b-5">
          <span class="label label-custom blink">{{ $t('prefix.win64-not-support') }}</span>
        </p>
      </div>

      <div class="table-detail item-point__button-block">
        <PopupWine/>
      </div>
    </div>
  </div>
</template>

<script>
import PopupWine from "./PopupWine";
import Collects  from "../../helpers/collects";

export default {
  name:       "ItemWine",
  props:      {
    status: Object,
  },
  components: {
    PopupWine,
  },
  methods:    {
    getArch() {
      return Collects.arch[this.status.arch];
    },
    hover() {
      window.app.getAudioButton().hover();
    },
  }
}
</script>

<style lang="less" scoped>
.item-point__info {
  text-align: left;
}

.member-info {
  word-break: break-all;
  overflow-wrap: break-word;
  word-wrap: break-word;

  p {
    white-space: unset;
  }
}

.label-custom {
  color: #f05050;
  border: 1px solid #f05050;
  transition: all 300ms ease;
}

.blink {
  animation: blink-animation 1.5s steps(10, start) infinite;
}

.system-wine {
  position: relative;
  left: 10px;
  font-size: 11px;
}

@keyframes blink-animation {
  50% {
    color: #ffbd4a;
    border: 1px solid #ffbd4a;
  }
}
</style>