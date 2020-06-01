<template>
    <div class="row">
        <div class="col-lg-12">
            <ItemNewGame v-if="!games.configs.length"/>
            <ItemGame v-for="config in games.configs" :key="config.code" :config="config" :icon="true"/>
        </div>
    </div>
</template>

<script>
    import action      from "../store/action";
    import ItemNewGame from "../components/Prefix/ItemNewGame";
    import ItemGame    from "../components/Home/ItemGame";

    export default {
        name:       'Icons',
        components: {
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
