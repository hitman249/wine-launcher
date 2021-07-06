<template>
  <select :id="id" class="select2" :data-placeholder="$t('labels.select') + ' ...'"></select>
</template>

<script>
import action from "../../store/action";

export default {
  components: {},
  props:      [
    'selected',
    'data',
  ],
  name:       'OnlySelect2',
  data() {
    return {
      id:        action.id,
      recursion: false,
    };
  },
  mounted() {
    this.init();
  },
  methods:    {
    setValues(vm, select2, selected) {
      if (selected) {
        select2.val(selected);
      } else {
        select2.val(null);
      }

      this.recursion = true;
      select2.trigger('change');
      this.recursion = false;
    },
    init() {
      let vm = this, select2 = $(`#${this.id}`);

      select2
        .off('change')
        .select2({
          data: this.data || [],
        })
        .on('change', () => {
          if (this.recursion) {
            return;
          }

          let values = select2
            .select2('data')
            .map((item) => item.id);

          vm.$emit('update:selected', values[0]);
        });

      this.setValues(vm, select2, this.selected);
    },
  },
  watch:      {
    selected: {
      handler:   function (selected) {
        let vm = this, select2 = $(`#${this.id}`);
        this.setValues(vm, select2, selected);
      },
      deep:      true,
      immediate: false,
    },
    data() {
    },
  },
  destroyed() {
    $('.select2-container--open').remove();
    $(`#${this.id}.select2-hidden-accessible`).off().select2('destroy');
  },
}
</script>

<style lang="less" scoped>

</style>