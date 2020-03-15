<template>
    <div>
        <button v-if="!hideButton" class="btn item-point__button btn-custom waves-effect waves-light" @click="open"
                onclick="return false">
            <span>Изменить</span>
            <i class="fa fa-angle-right m-l-10"></i>
        </button>

        <div :id="id" class="modal-demo">
            <button type="button" class="close" @click="cancel">
                <span>&times;</span><span class="sr-only">Close</span>
            </button>
            <h4 class="custom-modal-title">
                Настройки патча
            </h4>
            <div class="custom-modal-text text-left">
                <template v-if="popup_opened && !patches.creating_snapshot">
                    <Form :fields="getFields()" :item.sync="item"
                          :styles="{left: 'col-sm-4', right: 'col-sm-7'}" min-height="320px" ref="form"/>

                    <div class="form-group text-center m-t-40">
                        <button type="button" class="btn btn-default waves-effect waves-light" @click="save">
                            Сохранить
                        </button>
                        <button type="button" class="btn btn-danger waves-effect waves-light m-l-10"
                                @click="cancel">
                            Отмена
                        </button>
                    </div>
                </template>
                <template v-if="patches.creating_snapshot">
                    <div class="form-group m-b-30 text-center">
                        <h4 class="m-t-20"><b>Подождите...<br>Идёт создание снимка префикса.</b></h4>
                    </div>
                </template>
            </div>
        </div>

    </div>
</template>

<script>
    import action from '../../store/action';
    import Form   from "../UI/Form";

    export default {
        components: {
            Form,
        },
        name:       "PopupPatch",
        props:      {
            patch:      Object,
            hideButton: Boolean,
        },
        data() {
            return {
                id:                action.id,
                patches:           this.$store.state.patches,
                popup_opened:      false,
                item:              {},
            };
        },
        mounted() {
            document.addEventListener('custombox:content:open', this.onContentOpened);
            document.addEventListener('custombox:content:close', this.onContentClosed);
        },
        beforeDestroy() {
            document.removeEventListener('custombox:content:open', this.onContentOpened);
            document.removeEventListener('custombox:content:close', this.onContentClosed);
        },
        methods:    {
            onContentOpened() {
                this.popup_opened = true;
            },
            onContentClosed() {
                this.popup_opened = false;
            },
            open() {
                this.item = this.patch.getFlatConfig();

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

                this.$store.dispatch(action.get('patches').SAVE, { patch: this.patch, item: this.item })
                    .then(() => this.cancel());
            },
            cancel() {
                return Custombox.modal.close();
            },
            getFields() {
                let fields = {};

                return Object.assign(fields, {
                    'active':  {
                        name:        'Активен',
                        description: 'Применять этот патч при создании префикса?',
                        type:        'bool',
                        required:    false,
                    },
                    'sort':    {
                        name:        'Сортировка',
                        description: 'Порядок в котором будут накладываться патчи, меньше - раньше, по умолчанию: 500',
                        type:        'text',
                        required:    true,
                        validators:  'integer',
                    },
                    'name':    {
                        name:              'Название',
                        description_title: 'Пример',
                        description:       '.NET Framework',
                        type:              'text',
                        required:          true,
                    },
                    'version': {
                        name:              'Версия',
                        description_title: 'Пример',
                        description:       '1.0.0',
                        type:              'text',
                        required:          true,
                    },
                });
            },
        },
        computed:   {}
    }
</script>

<style lang="less" scoped>
    .modal-demo {
        width: 700px;
        margin: auto;
    }

    .custom-modal-text {
        position: relative;

        form {
            margin-top: 30px;
            margin-bottom: 45px;
            position: relative;
        }
    }

    .custombox-content > * {
        max-height: max-content;
    }
</style>