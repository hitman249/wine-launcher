<template>
  <div class="row">
    <div class="col-lg-12">
      <ItemWine v-if="wine.loaded" :status="wine.status"/>
      <ItemPrefix v-if="prefix.loaded" :status="prefix.status"/>
    </div>
  </div>
</template>

<script>
import action     from "../store/action";
import ItemWine   from "../components/Prefix/ItemWine";
import ItemPrefix from "../components/Prefix/ItemPrefix";

export default {
  name:       'Prefix',
  components: {
    ItemWine,
    ItemPrefix,
  },
  data() {
    return {
      wine:   this.$store.state.wine,
      prefix: this.$store.state.prefix,
    };
  },
  mounted() {
    this.$store.dispatch(action.get('wine').LOAD);
    this.$store.dispatch(action.get('prefix').LOAD);
  },
  methods:    {},
}
</script>
