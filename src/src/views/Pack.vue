<template>
  <div class="row">
    <div class="col-lg-12">
      <ItemWine v-if="pack.wine" :item="pack.wine"/>
      <ItemGames v-if="pack.games" :item="pack.games"/>
    </div>
  </div>
</template>

<script>
import action    from "../store/action";
import ItemWine  from "../components/Pack/ItemWine";
import ItemGames from "../components/Pack/ItemGames";

export default {
  name:       'Pack',
  components: {
    ItemWine,
    ItemGames,
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
