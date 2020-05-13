<template>
    <div class="row">
        <div class="col-lg-12">
            <ItemNewPatch v-if="!patches.created"/>
            <ItemPatch v-for="patch in patches.items" :key="patch.code" :patch="patch"/>
        </div>
    </div>
</template>

<script>
    import action       from "../store/action";
    import ItemNewPatch from "../components/Patches/ItemNewPatch";
    import ItemPatch    from "../components/Patches/ItemPatch";

    export default {
        name:       'Patches',
        components: {
            ItemNewPatch,
            ItemPatch,
        },
        data() {
            return {
                patches: this.$store.state.patches,
            };
        },
        mounted() {
            this.$store.dispatch(action.get('patches').LOAD);
            window.app.getWine().winetricksAllList();
        },
        methods:    {},
    }
</script>
