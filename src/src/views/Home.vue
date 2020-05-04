<template>
    <div class="row">
        <div class="col-lg-12">
            <div class="grid-structure" v-if="!games.configs.length">
                <div class="grid-container">
                    * Чтобы установить игру создайте
                    <router-link to="/patches">новый патч</router-link>
                    и выберите <code>Операции > Установить приложение</code>
                    <br>
                    * Уже установленные игры можно просто переместить в папку <code>./data/games</code>
                    <br>
                    * После установки создайте к игре
                    <router-link to="/games">ярлык</router-link>
                    <br>
                    * Больше информации можно прочитать в
                    <router-link to="/help">справке</router-link>
                </div>
            </div>

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
            this.$store.dispatch(action.get('prefix').LOAD);
        },
        methods:    {},
    }
</script>

<style lang="less" scoped>
    .grid-structure {
        border: 2px solid #ffbd4a;
        margin-bottom: 20px;
    }

    .grid-container {
        padding: 20px;
        margin: 0;
    }
</style>