<template>
    <div class="row">
        <div class="col-lg-12">
            <div class="grid-structure" v-if="!games.configs.length">
                <div class="grid-container">
                    * {{ $t('home.to-install') }}
                    <router-link to="/patches">{{ $t('home.new-patch') }}</router-link>
                    {{ $t('home.and-select') }} <code>{{ $t('home.operations-install') }}</code>
                    <br>
                    * {{ $t('home.install-to-games') }} <code>./data/games</code>
                    <br>
                    * {{ $t('home.before-label') }}
                    <router-link to="/games">{{ $t('home.label') }}</router-link>
                    <br>
                    * {{ $t('home.more') }}
                    <router-link to="/help">{{ $t('home.info') }}</router-link>
                </div>
            </div>

            <PopupAppImageLauncher ref="AppImageLauncher"/>
            <ItemNewGame v-if="!games.configs.length"/>
            <ItemGame v-for="config in games.configs" :key="config.code" :config="config" :edit="false"/>
        </div>
    </div>
</template>

<script>
    import action                from "../store/action";
    import ItemGame              from "../components/Home/ItemGame";
    import ItemNewGame           from "../components/Prefix/ItemNewGame";
    import PopupAppImageLauncher from "../components/Home/PopupAppImageLauncher";

    export default {
        name:       'Home',
        components: {
            ItemGame,
            ItemNewGame,
            PopupAppImageLauncher,
        },
        data() {
            return {
                games: this.$store.state.games,
            };
        },
        mounted() {
            this.$store.dispatch(action.get('games').LOAD);
            this.$store.dispatch(action.get('prefix').LOAD);
        },
        methods:    {},
    }
</script>

<style lang="less" scoped>
    .grid-structure {
        border: 2px solid #ffbd4a;
        margin-bottom: 10px;
        border-radius: 5px;
    }

    .grid-container {
        padding: 20px;
        margin: 0;
    }
</style>