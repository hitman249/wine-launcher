<template>
    <header id="topnav">
        <div class="navbar-custom">
            <div class="container">
                <div id="navigation">

                    <ul class="navigation-menu">

                        <li class="has-submenu" v-for="link in menu.items" :key="link.url" :class="{active: link.active}">
                            <router-link :to="{ path: link.url }">
                                <i :class="link.icon"></i> {{ link.name }}
                            </router-link>
                        </li>

                    </ul>

                </div>
            </div>
        </div>
    </header>
</template>

<script>
    import action from "../../store/action";

    export default {
        name: "Header",
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

</style>