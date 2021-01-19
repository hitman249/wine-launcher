<template>
  <div class="row">
    <div class="col-lg-12">
      <ItemBuild v-if="pack.wine" :item="pack.wine"/>
    </div>
  </div>
</template>

<script>
import action    from "../store/action";
import ItemBuild from "../components/Build/ItemBuild";

export default {
  name:       'Build',
  components: {
    ItemBuild
  },
  data() {
    return {
      pack: this.$store.state.pack,
    };
  },
  mounted() {
    this.$store.dispatch(action.get('pack').LOAD);
  },
  methods:    {},
}
</script>
