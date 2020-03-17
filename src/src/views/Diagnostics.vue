<template>
    <div class="row">
        <div class="col-lg-12">

        </div>
    </div>
</template>

<script>
    import action from "../store/action";

    export default {
        name:       'Diagnostics',
        components: {},
        data() {
            return {
                diagnostics: this.$store.state.diagnostics,
            };
        },
        mounted() {
            this.$store.dispatch(action.get('diagnostics').LOAD);
        },
        methods:    {},
    }
</script>
