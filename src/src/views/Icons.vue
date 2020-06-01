<template>
    <div class="row">
        <div class="col-lg-12">
            <ItemNewGame v-if="!configs.length"/>
            <ItemGame v-for="config in configs" :key="config.code" :config="config" :icon="true"/>

            <div v-if="configs.length === 0 && games.configs.length > 0" class="card-box">
                <div class="panel-body">
                    <h4>{{ $t('game.icon-load') }}</h4>

                    <p class="text-muted">
                        {{ $t('game.icon-load-desc') }}
                    </p>
                </div>
            </div>
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
        computed:   {
            configs() {
                return this.games.configs.filter((config) => Boolean(config.icon));
            },
        },
    }
</script>
