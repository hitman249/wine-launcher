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
  import Header from "./components/Header/Header";

  export default {
    name: 'App',
    components: {
      Header,
    },
  }
</script>

<style lang="less" scoped>
  .container {
    max-width: 850px;
  }
</style>
