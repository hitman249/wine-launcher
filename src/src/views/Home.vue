<template>
    <div class="row">
        <div class="col-lg-12">
            <GameItem v-for="config in info.configs" :key="config.code" :config="config"/>
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
                info: this.$store.state.games.info,
            };
        },
        mounted() {
            this.$store.dispatch(action.get('games').LOAD);
        },
        methods:    {},
    }
</script>
