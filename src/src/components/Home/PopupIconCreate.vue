<template>
    <div>
        <button class="btn item-point__button btn-custom waves-effect waves-light" @click="open" onclick="return false">
            <span>{{ $t('game.icon-create') }}</span>
            <i class="fa fa-angle-right m-l-10"></i>
        </button>

        <div :id="id" class="modal-demo">
            <button type="button" class="close" @click="cancel">
                <span>&times;</span><span class="sr-only">{{ $t('labels.close') }}</span>
            </button>
            <h4 class="custom-modal-title">
                <span class="popup__icon"><img :src="config.icon" alt=""></span>
                {{config.name}}
            </h4>
            <div class="custom-modal-text text-left">
                <template v-if="popup_opened">
                    <form role="form">
                        <Form :fields="getFields()" :item.sync="item"
                              :styles="{left: 'col-sm-7', right: 'col-sm-4'}" ref="form"/>

                        <div class="form-group text-center m-t-40">
                            <button type="button" class="btn btn-default waves-effect waves-light" @click="save">
                                {{ $t('labels.create') }}
                            </button>
                            <button type="button" class="btn btn-danger waves-effect waves-light m-l-10"
                                    @click="cancel">
                                {{ $t('labels.cancel') }}
                            </button>
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
    import Form          from "../UI/Form";

    export default {
        mixins:     [AbstractPopup],
        components: {
            Form,
        },
        name:       "PopupIconCreate",
        props:      {
            config: Object,
        },
        data() {
            return {
                id:    action.id,
                games: this.$store.state.games,
                item:  {
                    menu:      false,
                    desktop:   false,
                    autostart: false,
                    mode:      'standard',
                },
            };
        },
        methods:    {
            open() {
                this.item.menu      = false;
                this.item.desktop   = true;
                this.item.autostart = false;
                this.item.mode      = 'standard';

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
            save() {
                let validated = this.$refs.form.validate();

                if (validated && Object.keys(validated).length > 0) {
                    return;
                }

                this.$store.dispatch(action.get('games').APPEND, { config: this.config.config, item: this.item })
                    .then(() => this.cancel());
            },
            cancel() {
                return Custombox.modal.close();
            },
            getFields() {
                let fields = {};

                return Object.assign(fields, {
                    'menu':      {
                        name:       this.$t('game.add-menu'),
                        type:       'bool',
                        required:   false,
                        validators: 'or:desktop',
                    },
                    'desktop':   {
                        name:       this.$t('game.add-desktop'),
                        type:       'bool',
                        required:   false,
                        validators: 'or:menu',
                    },
                    'autostart': {
                        name:     this.$t('game.autostart'),
                        type:     'bool',
                        required: false,
                    },
                    'mode':      {
                        name:      this.$t('game.launch-mode'),
                        type:      'modes',
                        required:  true,
                        relations: 'require:autostart',
                    },
                });
            },
        },
    }
</script>

<style lang="less" scoped>
    .custom-modal-title {
        padding-left: 60px;
    }

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