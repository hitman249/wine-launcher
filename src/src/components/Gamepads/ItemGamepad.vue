<template>
  <div class="item-point card-box m-t-20 p-b-0" @mouseenter="hover">

    <div class="row">
      <div class="col-sm-11">
        <h5 class="m-0 p-0 m-b-10">{{ gamepad.index + 1 }}: {{ gamepad.name }}</h5>
      </div>
      <div class="col-sm-1">
        <ul class="pagination button-plus">
          <li><a @click="addMapping" onclick="return false" title="Add mapping"><i class="ion-plus"></i></a></li>
        </ul>
      </div>
    </div>

    <div v-for="(mapping, mappingKey) in gamepad.mappings" :key="mappingKey"
         class="table-box opport-box gamepad-mappings">

      <ul v-if="isManyMappings" class="pagination button-minus">
        <li><a @click="deleteMapping(mappingKey)" onclick="return false" title="Remove mapping"><i class="ion-minus"></i></a></li>
      </ul>

      <h5 class="m-0 p-0 m-b-10">Buttons</h5>
      <div v-for="(button, key) in gamepad.mappings[mappingKey].buttons" :key="'button' + key" class="gamepad-button"
           :class="{pressed: button.pressed}" @click="open(mappingKey, 'buttons', key, button.value)">
        {{ Number(key) + 1 }} <span v-if="button.value" class="label label-inverse m-l-10">{{ button.value }}</span>
      </div>

      <h5 class="m-0 p-0 m-b-10">Axes</h5>
      <div v-for="(axe, key) in gamepad.mappings[mappingKey].axes" :key="'axes' + key" class="gamepad-button"
           @click="open(mappingKey, 'axes', key, axe.value)">
        <div class="gamepad-axes-position" :style="getAxesPositionStyle(axe)"></div>
        <span style="z-index: 2;">
          <span class="text-border">{{ Number(key) + 1 }}</span>
          <span v-if="axe.value" class="label label-inverse m-l-10">{{ axe.value }}</span>
        </span>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name:       "ItemGamepad",
  props:      {
    gamepad: Object,
    mapping: Object,
    removeMapping: Object,
  },
  components: {},
  data() {
    return {};
  },
  methods:    {
    /**
     * @param {number} mappingIndex
     * @param {string} type
     * @param {number} index
     * @param {string} value
     */
    open(mappingIndex, type, index, value) {
      this.mapping.open({gamepadIndex: this.gamepad.index, mappingIndex, type, index, value});
    },
    addMapping() {
      let gamepad = /** @type {Gamepad} */  window.app.getGamepads().getGamepadByIndex(this.gamepad.index);

      if (gamepad) {
        let mapping = /** @type {KeyMapping} */ gamepad.getMapping();

        if (mapping) {
          mapping.addMapping();
          mapping.save();
          window.app.getGamepads().update();
        }
      }
    },
    /**
     * @param {number} mappingIndex
     */
    deleteMapping(mappingIndex) {
      this.removeMapping.open({gamepadIndex: this.gamepad.index, mappingIndex});
    },
    getAxesPositionStyle(axe) {
      let percent = Math.abs(axe.pressed) * 100 / 2;
      let isLeft  = (-1 === Math.sign(axe.pressed));
      let name    = isLeft ? 'right' : 'left';

      return { width: `${percent}%`, [name]: '50%' };
    },
    hover() {
      window.app.getAudioButton().hover();
    },
  },
  computed:   {
    isManyMappings() {
      if (!this.gamepad || !this.gamepad.mappings) {
        return false;
      }

      return Object.keys(this.gamepad.mappings).length > 1;
    }
  },
}
</script>

<style lang="less" scoped>
.item-point__info {
  text-align: left;
}

.tr-title td {
  padding-right: 10px;
  padding-top: 2px;
  padding-bottom: 2px;
}

.gamepad-mappings {
  color: #98a6ad;
  background: #2b333b;
  border-radius: 5px;
  margin-bottom: 10px;
  padding: 10px;
  padding-bottom: 5px;
}

.gamepad-button {
  display: inline-flex;
  position: relative;
  justify-content: center;
  align-items: center;
  height: 30px;
  min-width: 30px;
  padding: 0 10px;
  color: #98a6ad;
  background: #2b333b;
  border: 1px solid #98a6ad;
  border-radius: 3px;
  margin-right: 5px;
  margin-bottom: 5px;


  &.active {
    background: #2dc4b9;
    border: 1px solid #81c868;
  }

  &.pressed {
    color: #fff;
    background: rgb(152, 166, 173);
    border: 1px solid rgba(255, 255, 255, 0.5);
  }

  &:hover {
    border: 1px solid #ffbd4a;
    color: #ffbd4a;
    cursor: pointer;
  }
}

.gamepad-axes-position {
  display: block;
  position: absolute;
  height: 100%;
  width: 0;
  top: 0;
  background: rgb(152, 166, 173);
  z-index: 1;
}

.text-border {
  text-shadow: -1px 0 #2b333b, 0 1px #2b333b, 1px 0 #2b333b, 0 -1px #2b333b;
}

.button-plus {
  display: flex;
  position: relative;
  justify-content: flex-end;
  margin: 0 !important;
  padding: 0 !important;
  top: -10px;
  left: 10px;

  a {
    cursor: pointer;
    font-size: 10px;
    padding: 2px 7px;
  }
}

.button-minus {
  display: flex;
  position: absolute;
  justify-content: flex-end;
  margin: 0 !important;
  padding: 0 !important;
  top: 5px;
  right: 5px;

  a {
    cursor: pointer;
    font-size: 10px;
    padding: 2px 7px;
  }
}
</style>