<template>
    <div class="row">
        <div class="col-lg-12">
            <GameItem v-for="config in getGames()" :key="config.path" :config="config"/>
        </div>
    </div>
</template>

<script>
    import GameItem from "../components/Home/GameItem";
    import Config   from "../modules/config";

    export default {
        name:       'Home',
        components: {
            GameItem,
        },
        methods: {

            /**
             * @return {Config[]}
             */
            getGames() {
                return app.getConfig().findConfigs();
            },
        },
    }
</script>
