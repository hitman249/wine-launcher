<template>
    <div>
        <button class="btn item-point__button btn-custom waves-effect waves-light" @click="open" onclick="return false">
            <span>{{ $t('pack.rw-dirs') }}</span>
            <i class="fa fa-angle-right m-l-10"></i>
        </button>

        <div :id="id" class="modal-demo">
            <button type="button" class="close" @click="cancel">
                <span>&times;</span><span class="sr-only">{{ $t('labels.close') }}</span>
            </button>
            <h4 class="custom-modal-title">
                {{ $t('pack.rw-dirs-full') }}
            </h4>
            <div class="custom-modal-text text-left">
                <form role="form">
                    <template v-if="popup_opened">
                        <template v-if="pack.symlinks.packing">
                            <div class="form-group m-b-30 text-center">
                                <h4 class="m-t-20"><b>{{ $t('labels.running') }}</b></h4>
                            </div>
                        </template>
                        <template v-else>
                            <Form :fields="getFields()" :tabs="getTabs()" :item.sync="item" min-height="270px"
                                  :styles="{left: 'col-sm-7', right: 'col-sm-4'}" ref="form"/>

                            <div class="form-group text-center m-t-40">
                                <button type="button" class="btn btn-default waves-effect waves-light" @click="save">
                                    {{ $t('labels.save') }}
                                </button>
                                <button type="button" class="btn btn-danger waves-effect waves-light m-l-10"
                                        @click="cancel">
                                    {{ $t('labels.cancel') }}
                                </button>
                            </div>
                        </template>
                    </template>
                </form>
            </div>
        </div>

    </div>
</template>

<script>
    import _             from "lodash";
    import action        from '../../store/action';
    import AbstractPopup from "../UI/AbstractPopup";
    import Form          from "../UI/Form";

    export default {
        mixins:     [AbstractPopup],
        components: {
            Form,
        },
        name:       "PopupGamesRewrite",
        props:      {},
        data() {
            return {
                id:   action.id,
                pack: this.$store.state.pack,
                item: {},
            };
        },
        methods:    {
            open() {
                this.item      = _.cloneDeep(this.pack.symlinks.items);
                this.item.info = this.$t('pack.forms.item-info');

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
                delete this.item.info;

                this.$store.dispatch(action.get('pack').SAVE, this.item).then(() => this.cancel());
            },
            cancel() {
                return Custombox.modal.close();
            },
            getTabs() {
                return {
                    info:     this.$t('pack.forms.info'),
                    catalogs: this.$t('pack.rw-dirs'),
                };
            },
            getFields() {
                let fields = {};

                _.forEach(this.pack.symlinks.items, (value, field) => {
                    fields[field] = {
                        tab:      'catalogs',
                        name:     field,
                        type:     'bool',
                        required: false,
                    };
                });

                return Object.assign(fields, {
                    'info': {
                        tab:       'info',
                        type:      'info',
                        full_size: true,
                    },
                });
            }
        },
        computed:   {}
    }
</script>

<style lang="less" scoped>
    .modal-demo {
        width: 700px;
    }

    .custom-modal-text {
        position: relative;

        form {
            position: relative;
        }
    }
</style>