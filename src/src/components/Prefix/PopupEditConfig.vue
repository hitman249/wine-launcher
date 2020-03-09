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
                id:           action.id,
                popup_opened: false,
                wine:         this.$store.state.wine,
                item:         {},
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
                        tab:               'main',
                        name:              'Название игры',
                        description_title: 'Пример',
                        description:       'The Super Game: Deluxe Edition',
                        type:              'text',
                        required:          true,
                    },
                    'app.version':     {
                        tab:               'main',
                        name:              'Версия игры',
                        description_title: 'Пример',
                        description:       '1.0.0',
                        type:              'text',
                        required:          true,
                    },
                    'app.description': {
                        tab:      'main',
                        name:     'Описание игры',
                        type:     'text',
                        required: false,
                    },
                    'app.sort':        {
                        tab:               'main',
                        name:              'Сортировка',
                        description_title: 'Пример',
                        description:       '500',
                        type:              'text',
                        required:          true,
                        validators:        'integer',
                    },

                    'app.path':            {
                        tab:               'path',
                        name:              'Папка с играми',
                        description_title: 'По умолчанию',
                        description:       'Games',
                        type:              'text',
                        required:          true,
                    },
                    'app.additional_path': {
                        tab:               'path',
                        name:              'Путь до папки с ".exe" файлом',
                        description_title: 'Пример',
                        description:       'The Super Game/bin',
                        type:              'text',
                        required:          true,
                    },
                    'app.exe':             {
                        tab:               'path',
                        name:              'Имя файла',
                        description_title: 'Пример',
                        description:       'Game.exe',
                        type:              'text',
                        required:          true,
                    },
                    'app.arguments':       {
                        tab:               'path',
                        name:              'Аргументы',
                        description_title: 'Пример',
                        description:       '-language=russian',
                        type:              'text',
                        required:          true,
                    },

                    'script.winver':     {
                        tab:         'settings',
                        name:        'Версия Windows',
                        description: '',
                        type:        'windows_version',
                        required:    true,
                    },
                    'script.sandbox':    {
                        tab:         'settings',
                        name:        'Sandbox mode',
                        description: 'Изолировать префикс от системы',
                        type:        'bool',
                        required:    false,
                    },
                    'script.pulse':      {
                        tab:         'settings',
                        name:        'PulseAudio',
                        description: 'Использовать PulseAudio если установлен',
                        type:        'bool',
                        required:    false,
                    },
                    'script.csmt':       {
                        tab:         'settings',
                        name:        'CSMT',
                        description: 'Direct3D в отдельном потоке. Увеличивает производительность.',
                        type:        'bool',
                        required:    false,
                    },
                    'script.fixres':     {
                        tab:               'settings',
                        name:              'Fix разрешения',
                        description_title: '',
                        description:       'После завершения игры восстанавливает разрешение экрана',
                        type:              'bool',
                        required:          false,
                    },
                    'window.enable':     {
                        tab:               'settings',
                        name:              'Запускать в окне',
                        description_title: '',
                        description:       '',
                        type:              'bool',
                        required:          false,
                    },
                    'window.resolution': {
                        tab:               'settings',
                        name:              'Разрешение',
                        description_title: 'Пример',
                        description:       '"auto" или "800x600"',
                        type:              'text',
                        required:          true,
                        relations:         'no_fullscreen:window.enable',
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