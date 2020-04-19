<template>
    <div id="wineLauncher">
        <Header/>
        <div class="wrapper">
            <div class="container">
                <router-view/>
            </div>
        </div>
        <Logs v-if="logs.enable"/>
    </div>
</template>

<script>
    import action from "./store/action";
    import Header from "./components/Header/Header";
    import Logs   from "./components/UI/Logs";

    export default {
        name:       'App',
        components: {
            Header,
            Logs,
        },
        data() {
            return {
                logs: this.$store.state.logs,
            };
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
