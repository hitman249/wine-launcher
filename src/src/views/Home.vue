<template>
    <div class="row">
        <div class="col-lg-12">
            <ItemGame v-for="config in games.configs" :key="config.code" :config="config" :edit="false"/>
        </div>
    </div>
</template>

<script>
    import action   from "../store/action";
    import ItemGame from "../components/Home/ItemGame";

    export default {
        name:       'Home',
        components: {
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
