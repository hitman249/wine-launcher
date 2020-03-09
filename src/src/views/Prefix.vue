<template>
    <div class="row">
        <div class="col-lg-12">
            <Wine :status="wine.status"/>
            <GameItem v-for="config in games.configs" :key="config.code" :config="config" :edit="true"/>
        </div>
    </div>
</template>

<script>
    import action   from "../store/action";
    import Wine     from "../components/Prefix/Wine";
    import GameItem from "../components/Home/GameItem";

    export default {
        name:       'Prefix',
        components: {
            Wine,
            GameItem,
        },
        data() {
            return {
                wine:  this.$store.state.wine,
                games: this.$store.state.games,
            };
        },
        mounted() {
            this.$store.dispatch(action.get('wine').LOAD);
            this.$store.dispatch(action.get('games').LOAD);
        },
        methods:    {},
    }
</script>
