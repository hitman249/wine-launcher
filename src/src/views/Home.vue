<template>
    <div class="row">
        <div class="col-lg-12">
            <GameItem v-for="config in games.configs" :key="config.code" :config="config" :edit="false"/>
        </div>
    </div>
</template>

<script>
    import action   from "../store/action";
    import GameItem from "../components/Home/GameItem";

    export default {
        name:       'Home',
        components: {
            GameItem,
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
