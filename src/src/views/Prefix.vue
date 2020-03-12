<template>
    <div class="row">
        <div class="col-lg-12">
            <ItemNewGame/>
            <ItemWine v-if="wine.loaded" :status="wine.status"/>
            <ItemPrefix v-if="prefix.loaded" :status="prefix.status"/>
            <ItemGame v-for="config in games.configs" :key="config.code" :config="config" :edit="true"/>
        </div>
    </div>
</template>

<script>
    import action      from "../store/action";
    import ItemWine    from "../components/Prefix/ItemWine";
    import ItemGame    from "../components/Home/ItemGame";
    import ItemPrefix  from "../components/Prefix/ItemPrefix";
    import ItemNewGame from "../components/Prefix/ItemNewGame";

    export default {
        name:       'Prefix',
        components: {
            ItemWine,
            ItemGame,
            ItemPrefix,
            ItemNewGame,
        },
        data() {
            return {
                wine:   this.$store.state.wine,
                games:  this.$store.state.games,
                prefix: this.$store.state.prefix,
            };
        },
        mounted() {
            this.$store.dispatch(action.get('wine').LOAD);
            this.$store.dispatch(action.get('prefix').LOAD);
            this.$store.dispatch(action.get('games').LOAD);
        },
        methods:    {},
    }
</script>
