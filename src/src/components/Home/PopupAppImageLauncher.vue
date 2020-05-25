<template>
    <div class="hidden">
        <div :id="id" class="modal-demo">
            <button type="button" class="close" @click="cancel">
                <span>&times;</span><span class="sr-only">{{ $t('labels.close') }}</span>
            </button>
            <h4 class="custom-modal-title">
                {{ $t('app.warning') }}!
            </h4>
            <div class="custom-modal-text text-left">
                <template v-if="popup_opened">
                    <form role="form">
                        <div class="form-group m-b-30 text-center">
                            <h4 class="m-t-20">
                                <b v-html="$t('home.AppImageLauncher')"></b>
                            </h4>

                            <div class="form-group text-center m-t-40">
                                <button type="button" class="btn btn-danger waves-effect waves-light m-l-10"
                                        @click="cancel">
                                    {{ $t('labels.close') }}
                                </button>
                            </div>
                        </div>
                    </form>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
    import action        from '../../store/action';
    import AbstractPopup from "../UI/AbstractPopup";

    export default {
        mixins:     [AbstractPopup],
        components: {},
        name:       "PopupAppImageLauncher",
        props:      {
            title:   String,
            message: String,
        },
        data() {
            return {
                id: action.id,
            };
        },
        methods:    {
            open() {
                new Custombox.modal({
                    content: {
                        effect: 'fadein',
                        target: `#${this.id}`,
                    },
                    loader:  {
                        active: false,
                    },
                }).open();
            },
            cancel() {
                return Custombox.modal.close();
            },
        },
    }
</script>

<style lang="less" scoped>
    .modal-demo {
        width: 500px;
    }

    .custom-modal-text {
        position: relative;

        form {
            position: relative;
        }
    }
</style>