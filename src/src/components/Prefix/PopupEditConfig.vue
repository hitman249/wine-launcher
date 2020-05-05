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
                Настройки игры
            </h4>
            <div class="custom-modal-text text-left">
                <template v-if="popup_opened">
                    <Form :fields="getFields()" :tabs="getTabs()" :item.sync="item" min-height="270px"
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
    import action        from '../../store/action';
    import Form          from "../UI/Form";
    import KeyValue      from "./KeyValue";
    import AbstractPopup from "../UI/AbstractPopup";

    export default {
        mixins:     [AbstractPopup],
        components: {
            Form,
        },
        name:       "PopupEditConfig",
        props:      {
            config:     Object,
            hideButton: Boolean,
        },
        data() {
            let config = this.config.getFlatConfig();

            return {
                id:           action.id,
                item:         config,
                keyValue:     {
                    exports: config.exports,
                },
                settingsForm: {
                    tabs:         this.getSettingTabs(),
                    fields:       this.getSettingFields(),
                    styles:       { left: 'col-sm-5', right: 'col-sm-6', inner: true },
                    'min-height': '210px',
                    item:         config,
                },
            };
        },
        methods:    {
            open() {
                this.item              = this.config.getFlatConfig();
                this.keyValue.exports  = this.item.exports;
                this.settingsForm.item = this.item;

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

                this.item.exports = this.keyValue.exports;

                Object.keys(this.getSettingFields()).forEach(field => {
                    this.item[field] = this.settingsForm.item[field];
                });

                this.$store.dispatch(action.get('games').SAVE, { config: this.config, item: this.item })
                    .then(() => this.cancel());
            },
            cancel() {
                return Custombox.modal.close();
            },

            getSettingTabs() {
                return {
                    main:        'Главные',
                    performance: 'Производительность',
                    tweaks:      'Твики',
                };
            },
            getSettingFields() {
                return {
                    'wine.render':       {
                        tab:         'main',
                        name:        'Render API',
                        description: 'Требуется для определения способа отображения счетчика FPS',
                        type:        'renderApi',
                        required:    true,
                    },
                    'wine.pulse':        {
                        tab:         'main',
                        name:        'PulseAudio',
                        description: 'Использовать PulseAudio если установлен',
                        type:        'bool',
                        required:    false,
                    },
                    'window.enable':     {
                        tab:               'main',
                        name:              'Запускать в окне',
                        description_title: '',
                        description:       '',
                        type:              'bool',
                        required:          false,
                    },
                    'window.resolution': {
                        tab:               'main',
                        name:              'Разрешение',
                        description_title: 'Пример',
                        description:       '"auto" или "800x600"',
                        type:              'text',
                        required:          true,
                        relations:         'require:window.enable',
                        validators:        'resolution',
                    },

                    'wine.csmt':  {
                        tab:         'performance',
                        name:        'CSMT',
                        description: 'Direct3D в отдельном потоке',
                        type:        'bool',
                        required:    false,
                    },
                    'wine.esync': {
                        tab:         'performance',
                        name:        'ESYNC',
                        description: 'Синхронизация через файловые дескрипторы',
                        type:        'bool',
                        required:    false,
                    },
                    'wine.fsync': {
                        tab:         'performance',
                        name:        'FSYNC',
                        description: 'Более быстрая синхронизация через файловые дескрипторы',
                        type:        'bool',
                        required:    false,
                    },
                    'wine.aco':   {
                        tab:         'performance',
                        name:        'ACO',
                        description: 'Использовать в драйвере RADV альтернативный компилятор шейдеров ACO',
                        type:        'bool',
                        required:    false,
                    },

                    'wine.laa':           {
                        tab:         'tweaks',
                        name:        'LARGE_ADDRESS_AWARE',
                        description: 'Выделять 32 битному приложению больше 2 Гб ОЗУ',
                        type:        'bool',
                        required:    false,
                    },
                    'wine.disable_nvapi': {
                        tab:               'tweaks',
                        name:              'Запретить NVAPI',
                        description_title: 'Запретить библиотеки',
                        description:       'nvapi,nvapi64,nvcuda,nvcuda64',
                        type:              'bool',
                        required:          false,
                    },
                    'wine.mangohud_dlsym': {
                        tab:               'tweaks',
                        name:              'MangoHud DLSYM',
                        description:       'Некоторым OpenGL играм это может понадобиться для правильной загрузки MangoHud',
                        type:              'bool',
                        required:          false,
                    },
                };
            },
            getTabs() {
                return {
                    main:     'Игра',
                    path:     'Папка',
                    images:   'Оформление',
                    settings: 'Настройки',
                    export:   'Export',
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

                    'app.path':       {
                        tab:               'path',
                        name:              'Путь до папки с ".exe" файлом внутри папки по умолчанию',
                        description_title: 'Пример',
                        description:       'The Super Game/bin',
                        type:              'text',
                        required:          true,
                    },
                    'app.exe':        {
                        tab:               'path',
                        name:              'Имя файла',
                        description_title: 'Пример',
                        description:       'Game.exe',
                        type:              'text',
                        required:          true,
                    },
                    'app.arguments':  {
                        tab:               'path',
                        name:              'Аргументы',
                        description_title: 'Пример',
                        description:       '-language=russian',
                        type:              'text',
                        required:          false,
                    },
                    'app.prefix_cmd': {
                        tab:               'path',
                        name:              'Префикс команда',
                        description_title: 'Пример: "{ROOT_DIR}/bin/script"',
                        description:       'Команда, которой будут переданы дальнейшие команды для запуска игры. Работают переменные из автозамены. Не забывайте брать пути до файлов в двойные кавычки.',
                        type:              'text',
                        required:          false,
                    },

                    'settings-form': {
                        tab:       'settings',
                        type:      'component',
                        component: Form,
                        required:  false,
                        full_size: true,
                        props:     this.settingsForm,
                    },

                    'icon':       {
                        tab:         'images',
                        name:        'Иконка',
                        description: 'В PNG формате',
                        type:        'file',
                        accept:      'image/png',
                        return_body: true,
                        required:    false,
                        validators:  'file_image_png',
                    },
                    'background': {
                        tab:         'images',
                        name:        'Фон',
                        description: 'В JPEG или PNG форматах',
                        type:        'file',
                        accept:      'image/jpeg,image/png,image/gif',
                        return_body: true,
                        required:    false,
                        validators:  'file_image',
                    },

                    'exports': {
                        tab:       'export',
                        type:      'component',
                        component: KeyValue,
                        required:  false,
                        full_size: true,
                        props:     this.keyValue,
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