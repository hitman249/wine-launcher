<template>
  <input type="text" :id="id">
</template>

<script>
import action from '../../store/action';

export default {
  components: {},
  props:      {
    min:     Number,
    max:     Number,
    current: Number,
  },
  name:       'Slider',
  data() {
    return {
      id: action.id,
    };
  },
  mounted() {
    this.reinit();
  },
  methods:    {
    reinit() {
      let currentSlider = $(`#${this.id}`).data("ionRangeSlider");

      if (currentSlider) {
        currentSlider.update({ from: this.current || 0, min: this.min || 0, max: this.max || 100 });
        currentSlider.destroy();
      }

      $(`#${this.id}`).ionRangeSlider({
        grid:     true,
        step:     1,
        grid_num: 4,
        min:      this.min || 0,
        max:      this.max || 100,
        from:     this.current || 0,
        onFinish: (data) => {
          this.$emit('update:current', data.from);
        },
      });
    }
  },
  watch:      {
    current() {
      this.reinit();
    },
  },
  beforeDestroy() {
    let currentSlider = $(`#${this.id}`).data("ionRangeSlider");

    if (currentSlider) {
      currentSlider.destroy();
    }
  },
}
</script>

<style lang="less" scoped>

</style>