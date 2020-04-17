<template>
  <div id="wineLauncher">
    <Header/>
    <div class="wrapper">
      <div class="container">
        <router-view/>
      </div>
    </div>
  </div>
</template>

<script>
  import action from "./store/action";
  import Header from "./components/Header/Header";

  export default {
    name: 'App',
    components: {
      Header,
    },
    mounted() {
      this.$store.dispatch(action.get('menu').LOAD);
    },
  }
</script>

<style lang="less" scoped>
  .container {
    max-width: 800px;
  }
</style>
