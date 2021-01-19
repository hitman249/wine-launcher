<template>
  <div class="logs-wrapper">
    <div class="logs-background" :class="{__black: logs.black}" @click="close"></div>
    <div class="logs" ref="logs">
      <h4 class="logs-header">{{ $t('labels.console') }}</h4>
      <button type="button" class="close" @click="close">
        <span>×</span>
        <span class="sr-only">{{ $t('labels.close') }}</span>
      </button>
      <div :id="id" class="logs-wrap">{{ logs.logs }}</div>
    </div>
  </div>
</template>

<script>
import action from "../../store/action";

export default {
  components: {},
  props:      {},
  name:       'Logs',
  data() {
    return {
      id:   action.id,
      logs: this.$store.state.logs,
    };
  },
  mounted() {
    this.bindScroll();
  },
  methods:    {
    bindScroll() {
      $(`#${this.id}`).slimScroll({
        height:    `${this.$refs.logs.offsetHeight - 52}px`,
        position:  'right',
        size:      "5px",
        color:     '#98a6ad',
        wheelStep: 10,
        start:     'bottom',
      });
    },
    unbindScroll() {
      $(`#${this.id}`).slimScroll({ destroy: true });
    },
    close() {
      this.$store.dispatch(action.get('logs').STOP);
    },
  },
  watch:      {
    'logs.logs'() {
      this.$nextTick(() => {
        let element = $(`#${this.id}`);
        element.slimScroll({
          scrollTo: element[0].scrollHeight
        });
      });
    }
  },
  beforeDestroy() {
    this.unbindScroll();
  },
}
</script>

<style lang="less" scoped>
.logs-wrapper {
  position: fixed;
  display: block;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  margin: auto;
}

.logs-background {
  position: absolute;
  display: block;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  margin: auto;

  &.__black {
    background-color: rgb(0, 0, 0);
    opacity: 0.48;
  }
}

.logs {
  display: block;
  position: absolute;
  left: 20px;
  bottom: 20px;
  top: 20px;
  right: 20px;
  margin: auto;
  min-height: 500px;
  height: calc(60vh - 40px);
  width: calc(100vw - 40px);
  max-width: 800px;
  background-color: #36404a;
  z-index: 10001;
}

.logs-wrap {
  display: block;
  height: 100%;
  white-space: pre-wrap;
  font-family: monospace;
  unicode-bidi: embed;
  overflow-x: hidden;
  padding: 10px;

  &:before, &:after {
    display: block;
    content: '';
    position: absolute;
    width: calc(100% + 20px);
    height: 50px;
    background-image: url('../../assets/images/shadow.png');
    background-size: 100% 70%;
    background-repeat: no-repeat;
    pointer-events: none;
    margin-left: -20px;
    margin-top: -20px;
  }

  &:after {
    transform: rotate(180deg);
    bottom: 0;
  }
}

.logs-header {
  padding: 15px 25px 15px 25px;
  line-height: 22px;
  font-size: 18px;
  background-color: #2b333b;
  color: #ffffff;
  text-align: left;
  margin: 0;
}

.close {
  position: absolute;
  top: 15px;
  right: 25px;
  color: #eeeeee;
}
</style>