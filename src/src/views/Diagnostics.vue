<template>
    <div class="row">
        <div class="col-lg-12">
            <table class="table table-condensed m-0">
                <thead>
                <tr>
                    <th>Key</th>
                    <th>Description</th>
                </tr>
                </thead>

                <tbody>

                <tr v-for="item in diagnostics.items" :key="item.name">
                    <td>{{item.name}}</td>
                    <td>{{item.status}}</td>
                </tr>

                </tbody>
            </table>
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
