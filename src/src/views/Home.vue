<template>
    <div class="row">
        <div class="col-lg-12">
            <ItemNewGame v-if="!games.configs.length"/>
            <ItemGame v-for="config in games.configs" :key="config.code" :config="config" :edit="false"/>
        </div>
    </div>
</template>

<script>
    import action      from "../store/action";
    import ItemGame    from "../components/Home/ItemGame";
    import ItemNewGame from "../components/Prefix/ItemNewGame";

    export default {
        name:       'Home',
        components: {
            ItemGame,
            ItemNewGame,
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
