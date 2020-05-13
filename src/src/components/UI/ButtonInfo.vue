<template>
    <button :id="id" @click="click"
            class="badge badge-inverse" title=""
            tabindex="-1"
            autofocus="false"
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
            click(e) {
                if (0 === e.screenX && 0 === e.screenY) {
                    // Detect Enter
                    return false;
                }

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