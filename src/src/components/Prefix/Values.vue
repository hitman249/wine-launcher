<template>
    <table class="table table-condensed m-0">
        <thead>
        <tr>
            <th>Path</th>
        </tr>
        </thead>

        <tbody>

        <tr v-for="(value, key) in values" :key="key">
            <td>
                <input type="text" parsley-type="text" placeholder="" class="form-control" :value="value"
                       @change="onChange({ value, key }, $event)">
            </td>
        </tr>

        </tbody>
    </table>
</template>

<script>
    export default {
        name:    "Values",
        props:   {
            items: Array,
        },
        data() {
            return {
                values: (this.items || []).filter(s => s).concat(['']),
            };
        },
        methods: {
            onChange(item, element) {
                this.values[item.key] = element.target.value;
                this.filterItems();
            },
            filterItems() {
                this.$set(this, 'values', (this.values || []).filter(s => s).concat(['']));
                this.updateProps();
            },
            updateProps() {
                this.$emit('update:items', (this.values || []).filter(s => s));
            },
        }
    }
</script>

<style lang="less" scoped>

</style>