<template>
    <div class="row">
        <div class="col-lg-12">
            <Wine :status="wine.status"/>
        </div>
    </div>
</template>

<script>
    import action from "../store/action";
    import Wine   from "../components/Prefix/Wine";

    export default {
        name:       'Prefix',
        components: {
            Wine,
        },
        data() {
            return {
                wine: this.$store.state.wine,
            };
        },
        mounted() {
            this.$store.dispatch(action.get('wine').LOAD);
        },
        methods:    {
        },
    }
</script>
