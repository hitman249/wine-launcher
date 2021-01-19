<template>
  <table class="table table-condensed m-0">
    <thead>
    <tr>
      <th>Key</th>
      <th>Value</th>
    </tr>
    </thead>

    <tbody>

    <tr v-for="(item, index) in items" :key="index">
      <td>
        <input type="text" parsley-type="text" placeholder="" class="form-control" :value="item.key"
               @change="onChangeKey(item, $event)">
      </td>
      <td>
        <input type="text" parsley-type="text" placeholder="" class="form-control" :value="item.value"
               @change="onChangeValue(item, $event)">
      </td>
    </tr>

    </tbody>
  </table>
</template>

<script>
export default {
  name:    "KeyValue",
  props:   {
    exports: Object,
  },
  data() {
    return {
      items: Object.keys(this.exports || {}).map(key => ({ key, value: this.exports[key] }))
               .concat([ { key: '', value: '' } ]),
    };
  },
  methods: {
    onChangeKey(item, element) {
      item.key = element.target.value;
      this.filterItems();
    },
    onChangeValue(item, element) {
      item.value = element.target.value;
      this.filterItems();
    },
    filterItems() {
      let result = {};
      this.items.forEach((item) => {
        if (item.key && undefined === result[item.key]) {
          result[item.key] = item.value;
        }
      });

      this.$set(this, 'items', Object.keys(result).map(key => ({ key, value: result[key] }))
        .concat([ { key: '', value: '' } ]));

      this.updateProps();
    },
    updateProps() {
      let result = {};
      this.items.forEach((item) => {
        if (item.key) {
          result[item.key] = item.value;
        }
      });

      this.$emit('update:exports', result);
    },
  }
}
</script>

<style lang="less" scoped>

</style>