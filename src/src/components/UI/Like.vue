<template>
  <button class="btn btn-icon waves-effect waves-light" :class="status ? 'btn-danger' : 'btn-success'"
          @click="status ? unlike() : like()">
    <i v-if="!status" class="fa fa-thumbs-o-up"></i>
    <i v-if="status" class="fa fa-thumbs-o-down"></i>
  </button>
</template>

<script>
import api    from "../../api";
import action from "../../store/action";

export default {
  components: {},
  props:      {
    status: Boolean,
    type:   String,
    model:  String,
    item:   Object,
  },
  name:       'Like',
  data() {
    return {};
  },
  mounted() {
  },
  methods:    {
    like() {
      let promise = Promise.resolve();

      if ('config' === this.model) {
        promise = api.likeConfig(this.item.id);
      } else {
        promise = api.likeImage(this.item.id);
      }

      promise.then(() => this.reload());
    },
    unlike() {
      let promise = Promise.resolve();

      if ('config' === this.model) {
        promise = api.unlikeConfig(this.item.id);
      } else {
        promise = api.unlikeImage(this.item.id);
      }

      promise.then(() => this.reload());
    },
    reload() {
      return this.$store.dispatch(action.get(this.type).RELOAD)
        .then(() => this.$store.commit(action.get(this.type === 'search' ? 'shared' : 'search').CLEAR));
    },
  },
  watch:      {},
  beforeDestroy() {
  },
}
</script>

<style lang="less" scoped>
.btn {
  padding: 0 5px;
}
</style>