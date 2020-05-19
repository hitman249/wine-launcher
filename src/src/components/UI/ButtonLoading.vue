<template>
    <button :id="id" class="ladda-button btn btn-default" data-style="expand-left" @click="click" onclick="return false">
        {{title}}
    </button>
</template>

<script>
    import action from '../../store/action';

    export default {
        components: {},
        props:      [
            'title',
            'promiseCallback',
        ],
        name:       'ButtonLoading',
        data() {
            return {
                id:  action.id,
                btn: null,
            };
        },
        mounted() {
            this.btn = Ladda.create(document.querySelector(`#${this.id}`));
        },
        methods:    {
            click() {
                if (!this.promiseCallback) {
                    return;
                }

                this.btn.start();
                this.promiseCallback().then(() => this.btn.stop());
            },
        },
        watch:      {},
        beforeDestroy() {
            if (this.btn) {
                this.btn.stop();
            }
        },
    }
</script>

<style lang="less" scoped>

</style>