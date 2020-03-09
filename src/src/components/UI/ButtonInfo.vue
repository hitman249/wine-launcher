<template>
    <button :id="id" @click="click"
            class="badge badge-inverse" title=""
            data-container="body"
            data-placement="right"
            data-toggle="popover"
            :data-content="field.description"
            :data-original-title="field.description_title">?
    </button>
</template>

<script>
    import action from "../../store/action";

    export default {
        components: {},
        props:      {
            field: Object,
        },
        name:       'ButtonInfo',
        data() {
            return {
                id: action.id,
            };
        },
        mounted() {
        },
        methods:    {
            click() {
                let popover = $(`#${this.id}`).popover('show');

                const once = (element) => {
                    element = $(element.target);

                    if (element.is(`#${this.id}`)) {
                        $(document).one('click', once);
                        return;
                    }

                    if (element.closest('.popover').length > 0) {
                        $(document).one('click', once);
                        return;
                    }

                    if (popover) {
                        popover.popover('hide');
                    }
                };

                $(document).one('click', once);
            }
        },
        watch:      {},
        beforeDestroy() {
        },
    }
</script>

<style lang="less" scoped>
</style>