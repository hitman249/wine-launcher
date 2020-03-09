<template>
    <div>
        <button class="btn btn-play btn-custom waves-effect waves-light" @click="open" onclick="return false">
            <span>Изменить</span>
            <i class="fa fa-angle-right m-l-10"></i>
        </button>

        <div :id="id" class="modal-demo">
            <button type="button" class="close" @click="cancel">
                <span>&times;</span><span class="sr-only">Close</span>
            </button>
            <h4 class="custom-modal-title">
                Настройки игры
            </h4>
            <div class="custom-modal-text text-left">
                <template v-if="wine.recreating">
                    <div class="form-group m-b-30 text-center">
                        <h4 class="m-t-20"><b>Выполняется...</b></h4>
                    </div>
                </template>
                <template v-else-if="popup_opened">
                    <Form :fields="getFields()" :tabs="getTabs()" :item.sync="item"
                          :styles="{left: 'col-sm-4', right: 'col-sm-7'}" ref="form"/>

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
        name:       "PopupEditConfig",
        props:      {
            config: Object,
        },
        data() {
            return {
                id:   action.id,
                popup_opened: false,
                wine: this.$store.state.wine,
                item: {},
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
                console.log(this.item);
                // this.$store.dispatch(action.get('wine').PREFIX_RECREATE).then(() => this.cancel());
            },
            cancel() {
                return Custombox.modal.close();
            },
            getTabs() {
                return {
                    main:     'Игра',
                    path:     'Папка',
                    settings: 'Настройки',
                    plugins:  'Плагины',
                    fixes:    'Fixes',
                    replaces: 'Замена',
                };
            },
            getFields() {
                let fields = {};

                return Object.assign(fields, {

                    'app.name':        {
                        tab:         'main',
                        name:        'Название игры',
                        description: 'Например: "The Super Game: Deluxe Edition"',
                        type:        'text',
                        required:    true,
                    },
                    'app.version':     {
                        tab:         'main',
                        name:        'Версия игры',
                        description: 'Например: "1.0.0"',
                        type:        'text',
                        required:    true,
                    },
                    'app.description': {
                        tab:      'main',
                        name:     'Описание игры',
                        type:     'text',
                        required: false,
                    },

                    'app.path':            {
                        tab:         'path',
                        name:        'Папка с играми',
                        description: 'По умолчанию "Games"',
                        type:        'text',
                        required:    true,
                    },
                    'app.additional_path': {
                        tab:         'path',
                        name:        'Путь до папки с ".exe" файлом',
                        description: 'Например: "The Super Game"',
                        type:        'text',
                        required:    true,
                    },
                    'app.exe':             {
                        tab:         'path',
                        name:        'Имя файла',
                        description: 'Например: "Game.exe"',
                        type:        'text',
                        required:    true,
                    },
                    'app.arguments':       {
                        tab:         'path',
                        name:        'Аргументы',
                        description: 'Например: "-language=russian"',
                        type:        'text',
                        required:    true,
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
            position: relative;
        }
    }
    .custombox-content > * {
        max-height: max-content;
    }
</style>