<template>
  <span :id="id" class="editable">{{ value }}</span>
</template>

<script>
import action from '../../store/action';

export default {
  components: {},
  props:      [
    'value',
  ],
  name:       'InputView',
  data() {
    return {
      id: action.id,
    };
  },
  mounted() {
  },
  methods:    {},
  watch:      {},
  beforeDestroy() {
  },
}
</script>

<style lang="less" scoped>

</style>