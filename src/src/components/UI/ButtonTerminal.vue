<template>
  <i class="fa fa-terminal" :title="$t('labels.console')" @click="open"></i>
</template>

<script>
import action from "../../store/action";

export default {
  components: {},
  props:      {},
  name:       'Logs',
  data() {
    return {
      id: action.id,
    };
  },
  mounted() {
  },
  methods:    {
    open() {
      this.$store.dispatch(action.get('logs').START);
    },
  },
  watch:      {},
  beforeDestroy() {
  },
}
</script>

<style lang="less" scoped>
i {
  position: absolute;
  top: 14px;
  right: 50px;
  font-size: 18px;
  font-weight: bold;
  border: solid 1px;
  border-radius: 3px;
  padding: 2px 4px;
  transition: all 500ms ease;
  cursor: pointer;

  &:hover {
    color: #fff;
    background-color: #ffbd4a;
    border-color: #ffbd4a;
  }
}
</style>