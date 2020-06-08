<template>
    <InputAutocomplete :value.sync="input" :fetch="fetch" :fetchAll="fetchAll" :all="true"/>
</template>

<script>
    import InputAutocomplete from './InputAutocomplete.vue';

    export default {
        components: {
            InputAutocomplete,
        },
        props:      {
            value: String,
        },
        name:       'InputWinetricks',
        data() {
            return {
                input: this.value || '',
            };
        },
        mounted() {
        },
        methods:    {
            fetch(q) {
                return window.app.getWine().winetricksAllList().then((items) => {
                    return items.filter(item => item.name.includes(q));
                });
            },
            fetchAll() {
                return window.app.getWine().winetricksAllList();
            },
        },
        computed:   {},
        watch:      {
            input(value) {
                this.$emit('update:value', value);
            },
            value(value) {
                this.$set(this, 'input', value);
            },
        },
        beforeDestroy() {},
    }
</script>

<style lang="less" scoped>

</style>