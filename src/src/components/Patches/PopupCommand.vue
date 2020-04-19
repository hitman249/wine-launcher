<template>
    <div>
        <button class="btn item-point__button btn-custom waves-effect waves-light" @click="open"
                onclick="return false">
            <span>Операции</span>
            <i class="fa fa-angle-right m-l-10"></i>
        </button>

        <div :id="id" class="modal-demo">
            <ButtonTerminal/>
            <button type="button" class="close" @click="cancel">
                <span>&times;</span><span class="sr-only">Close</span>
            </button>
            <h4 class="custom-modal-title">
                Настройки патча
            </h4>
            <div class="custom-modal-text text-left">
                <template v-if="popup_opened && !patches.creating_snapshot && !patches.running">
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
                <template v-else-if="patches.running">
                    <div class="form-group m-b-30 text-center">
                        <h4 class="m-t-20"><b>Выполняется...</b></h4>
                    </div>
                </template>
            </div>
        </div>

    </div>
</template>

<script>
    import action         from '../../store/action';
    import Form           from "../UI/Form";
    import AbstractPopup  from "../UI/AbstractPopup";
    import ButtonTerminal from "../UI/ButtonTerminal";

    export default {
        mixins:     [AbstractPopup],
        components: {
            Form,
            ButtonTerminal,
        },
        name:       "PopupCommand",
        props:      {
            patch: Object,
        },
        data() {
            return {
                id:      action.id,
                patches: this.$store.state.patches,
                item:    {
                    action:     'build',
                    override:   'native',
                    patch_arch: this.patch.getPatch(),
                    arch:       this.patch.getPatch(),
                    registry:   true,
                },
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
            save() {
                let validated = this.$refs.form.validate();

                if (validated && Object.keys(validated).length > 0) {
                    return;
                }

                this.$store.dispatch(action.get('patches').RUN, { patch: this.patch, item: this.item })
                    .then(() => this.cancel());
            },
            cancel() {
                return Custombox.modal.close();
            },
            getFields() {
                let fields = {};

                return Object.assign(fields, {
                    'action':     {
                        name:        'Действие',
                        description: '',
                        type:        'commands',
                        required:    false,
                    },
                    'winetricks': {
                        name:              'Аргументы',
                        description_title: 'Например',
                        description:       'd3dx9 directx9 xact',
                        type:              'text',
                        required:          true,
                        relations:         'winetricks:action',
                    },
                    'file':       {
                        name:              'Выберите файл',
                        description_title: '',
                        description:       '',
                        type:              'file_select',
                        required:          true,
                        relations:         'install:action',
                    },
                    'library':    {
                        name:              'Библиотека',
                        description_title: '',
                        description:       'Библиотека будет скопирована в папку system32 или syswow64. Форматы: dll, ocx',
                        type:              'lib_select',
                        required:          true,
                        relations:         'register:action',
                    },
                    'registry':   {
                        name:              'Регистрация',
                        description_title: '',
                        description:       'Регистрация библиотеки через механизм regsvr32',
                        type:              'bool',
                        required:          true,
                        relations:         'register:action',
                    },
                    'arch':       {
                        name:      'Архитектура',
                        type:      'arch',
                        required:  true,
                        relations: 'register:action,arch64:patch_arch',
                    },
                    'override':   {
                        name:        'Переопределение',
                        description: '',
                        type:        'overrides',
                        required:    true,
                        relations:   'register:action',
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

    .item-point__button {
        min-width: 110px;
    }
</style>