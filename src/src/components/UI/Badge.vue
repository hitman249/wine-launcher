<template>
    <span v-if="status === 'warning'" class="badge badge-warning badge-mini">&nbsp;&nbsp;&nbsp;</span>
    <span v-else-if="status === 'success'" class="badge badge-success badge-mini">&nbsp;&nbsp;&nbsp;</span>
    <span v-else-if="status === 'danger'" class="badge badge-danger badge-mini">&nbsp;&nbsp;&nbsp;</span>
</template>

<script>
    export default {
        components: {},
        props:      [
            'status'
        ],
        name:       'Badge',
        data() {
            return {};
        },
        mounted() {
        },
        methods:    {},
        watch:      {},
        beforeDestroy() {
        },
    }
</script>

<style lang="less" scoped>
    .badge-mini {
        width: 3px;
        min-width: 3px;
        overflow: hidden;
        height: 3px;
        padding: 3px;
        margin-top: -10px;
        margin-left: 5px;
        border-radius: 3px;
    }
</style>