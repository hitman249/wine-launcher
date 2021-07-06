<template>
  <div>
    <div class="row">
      <div class="col-sm-3">
        <button type="button" class="btn btn-warning btn-custom waves-effect waves-light" @click="goBack">
          <span class="btn-label"><i class="fa fa-arrow-left"></i></span>{{ $t('labels.back') }}
        </button>
        <PopupKeyMapping ref="mapping"/>
        <PopupRemoveKeyMapping ref="removeMapping"/>
      </div>
      <div class="col-sm-9">
        <h4>{{ gameTitle }}</h4>
      </div>
    </div>
    <div class="row">
      <div class="col-lg-12">
        <ItemGamepad v-for="(gamepad) in items" :gamepad="gamepad" :mapping="$refs.mapping"
                     :removeMapping="$refs.removeMapping" :key="gamepad.index"/>
      </div>
    </div>
  </div>
</template>

<script>
import ItemGamepad           from "../components/Gamepads/ItemGamepad";
import PopupKeyMapping       from "../components/Gamepads/PopupKeyMapping";
import PopupRemoveKeyMapping from "../components/Gamepads/PopupRemoveKeyMapping";

export default {
  name:       'Gamepads',
  components: {
    ItemGamepad,
    PopupKeyMapping,
    PopupRemoveKeyMapping,
  },
  data() {
    return {
      gamepads: this.$store.state.gamepads,
    };
  },
  mounted() {
    window.app.getGamepads().update();
  },
  beforeDestroy() {
    window.app.getGamepads().stubPressEvents(false);
  },
  computed:   {
    gameTitle() {
      return window.app.getGamepads().getConfig().getGameName();
    },
    items() {
      let gamepads = {};

      Object.keys(this.gamepads.gamepads).forEach((key) => {
        let item = this.gamepads.gamepads[key];

        if (item) {
          gamepads[key] = item;
        }
      });

      return gamepads;
    },
  },
  methods:    {
    goBack() {
      window.history.length > 1 ? this.$router.go(-1) : this.$router.push('/')
    }
  },
}
</script>
