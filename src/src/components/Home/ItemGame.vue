<template>
  <div class="item-point card-box m-b-10" @mouseenter="hover">
    <div class="item-point__background">
      <img :src="config.background" alt="">
    </div>

    <div class="table-box opport-box">
      <div v-if="config.icon" class="table-detail item-point__icon">
        <img :src="config.icon" alt="img" class="m-r-15" :style="{height: `${config.iconHeight}px`}"/>
      </div>

      <div class="table-detail">
        <div class="member-info">
          <h4 class="item-point__title"><b>{{ config.name }}</b></h4>
          <template v-if="!icon">
            <p v-if="config.description" class="text-dark">
              <span class="text-muted">{{ config.description }}</span>
            </p>
            <p v-if="config.version" class="text-dark">
              <span class="text-muted">{{ config.version }}</span>
            </p>
          </template>
          <template v-if="icon && config.icons.length">
            <p class="text-dark">
              <span v-for="icon in config.icons" :key="icon.path" class="text-muted" :title="icon.path">
                  {{ icon.truncate }}<br>
              </span>
            </p>
          </template>
        </div>
      </div>

      <div v-if="!edit && !icon && time" class="table-detail time-detail">
        <p class="text-dark m-b-5">
          <b>{{ $t('game.total-time') }}</b><br/>
          <span class="label label-inverse">{{ time }}</span>
        </p>
      </div>

      <div class="table-detail item-point__button-block">

        <div v-if="edit && !icon" class="btn-group">
          <button type="button" class="btn item-point__button btn-custom waves-effect waves-light  dropdown-toggle"
                  data-toggle="dropdown" aria-expanded="false">
            {{ $t('labels.action') }} <span class="caret"></span>
          </button>
          <ul class="dropdown-menu" role="menu">
            <PopupEditConfig v-if="edit && !icon" :config="config.config"/>
            <li>
              <a @click="openGamepads" onclick="return false">
                {{ $t('labels.gamepads') }}
              </a>
            </li>
            <PopupShareConfig v-if="config.icon && config.background && edit && !icon" :config="config"/>
            <PopupRemoveConfig v-if="edit && !icon" :config="config"/>
          </ul>
        </div>

        <PopupPlay v-if="!edit && !icon" :config="config"/>
        <PopupIconCreate v-if="!edit && icon && config.icons.length === 0" :config="config"/>
        <PopupIconRemove v-if="!edit && icon && config.icons.length" :config="config"/>
      </div>
    </div>
  </div>
</template>

<script>
import PopupPlay         from "./PopupPlay";
import PopupIconCreate   from "./PopupIconCreate";
import PopupIconRemove   from "./PopupIconRemove";
import PopupEditConfig   from "../Prefix/PopupEditConfig";
import PopupRemoveConfig from "./PopupRemoveConfig";
import PopupShareConfig  from "./PopupShareConfig";
import Time              from "../../helpers/time";

export default {
  name:       "ItemGame",
  props:      {
    config: Object,
    edit:   Boolean,
    icon:   Boolean,
  },
  components: {
    PopupPlay,
    PopupIconCreate,
    PopupIconRemove,
    PopupEditConfig,
    PopupRemoveConfig,
    PopupShareConfig,
  },
  computed:   {
    time() {
      return Time.secondPrint(this.config.time);
    },
  },
  methods:    {
    hover() {
      window.app.getAudioButton().hover();
    },

    click() {
      window.app.getAudioButton().click();
    },

    openGamepads() {
      let gamepads = window.app.getGamepads();
      gamepads.stubPressEvents(true);
      gamepads.changeConfig(this.config.config);
      this.$router.push('/gamepads');
    }
  },
}
</script>

<style lang="less" scoped>
.member-info {
  h4 {
    margin: 0;
  }

  .text-dark {
    margin: 0;
  }
}

a {
  cursor: pointer;
}
</style>