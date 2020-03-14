<template>
    <div class="row">
        <div class="col-lg-12">
            <ItemNewPatch/>
        </div>
    </div>
</template>

<script>
    import action       from "../store/action";
    import ItemNewPatch from "../components/Patches/ItemNewPatch";

    export default {
        name:       'Patches',
        components: {
            ItemNewPatch
        },
        data() {
            return {
                patches: this.$store.state.patches,
            };
        },
        mounted() {
            this.$store.dispatch(action.get('patches').LOAD);
        },
        methods:    {},
    }
</script>
