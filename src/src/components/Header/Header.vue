<template>
  <header id="topnav">
    <div class="navbar-custom">
      <div class="container">
        <div id="navigation">

          <ul class="navigation-menu">

            <li class="has-submenu" v-for="link in menu.items" :key="link.icon"
                :class="{active: link.active}">
              <a v-if="!link.url" href="#" onclick="return false;">
                <i :class="[link.icon]"></i>{{ link.name }}
              </a>
              <router-link v-else :to="{ path: link.url }">
                <i :class="link.icon"></i> {{ link.name }}
              </router-link>

              <ul v-if="link.nested" class="submenu">
                <li v-for="(link, index) in link.nested" :key="index" :class="{ active: link.active }">
                  <router-link :to="{ path: link.url }">{{ link.name }}</router-link>
                </li>
              </ul>
            </li>

          </ul>

        </div>

        <Language/>
      </div>
    </div>
  </header>
</template>

<script>
import action   from "../../store/action";
import Language from "../UI/Language";

export default {
  components: {
    Language,
  },
  name:       "Header",
  data() {
    return {
      menu: this.$store.state.menu,
    };
  },
  watch:      {
    '$route': function () {
      this.$store.dispatch(action.get('menu').ROUTE_CHANGED);
    },
  },
}
</script>

<style lang="less" scoped>
.container {
  max-width: 800px;
  position: relative;
}
</style>