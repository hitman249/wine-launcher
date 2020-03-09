<template>
    <textarea class="form-control" rows="5" v-model="text"></textarea>
</template>

<script>
    import action from '../../store/action';

    export default {
        components: {},
        props:      {
            value: String,
        },
        name:       'TextField',
        data() {
            return {
                id:   action.id,
                text: String(this.value || ''),
            };
        },
        mounted() {
        },
        methods:    {},
        watch:      {
            text(value) {
                this.$emit('update:value', value);
            }
        },
        beforeDestroy() {
        },
    }
</script>

<style lang="less" scoped>

</style>