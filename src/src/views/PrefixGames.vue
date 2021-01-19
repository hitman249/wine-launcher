<template>
  <div class="row">
    <div class="col-lg-12">
      <ItemNewGame/>
      <ItemGame v-for="config in games.configs" :key="config.code" :config="config" :edit="true"/>
      <ItemFullList v-if="!games.full"/>
    </div>
  </div>
</template>

<script>
import action       from "../store/action";
import ItemNewGame  from "../components/Prefix/ItemNewGame";
import ItemGame     from "../components/Home/ItemGame";
import ItemFullList from "../components/Home/ItemFullList";

export default {
  name:       'PrefixGames',
  components: {
    ItemFullList,
    ItemNewGame,
    ItemGame,
  },
  data() {
    return {
      games: this.$store.state.games,
    };
  },
  mounted() {
    this.$store.dispatch(action.get('games').LOAD);
  },
  methods:    {},
}
</script>
