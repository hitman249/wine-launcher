<template>
    <div>
        <button class="btn item-point__button btn-custom waves-effect waves-light" @click="open" onclick="return false">
            <span>Изменить</span>
            <i class="fa fa-angle-right m-l-10"></i>
        </button>

        <div :id="id" class="modal-demo">
            <button type="button" class="close" @click="cancel">
                <span>&times;</span><span class="sr-only">Close</span>
            </button>
            <h4 class="custom-modal-title">
                Настройки префикса
            </h4>
            <div class="custom-modal-text text-left">
                <template v-if="popup_opened">
                    <Form :fields="getFields()" :tabs="getTabs()" :item.sync="item"
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
            </div>
        </div>

    </div>
</template>

<script>
    import action from '../../store/action';
    import Form   from "../UI/Form";
    import Values from "./Values";

    export default {
        components: {
            Form,
        },
        name:       "PopupEditPrefix",
        props:      {
            prefix: Object,
        },
        data() {
            let prefix = this.prefix.getFlatConfig();

            return {
                id:           action.id,
                popup_opened: false,
                item:         prefix,
                values:       {
                    items: prefix.replaces,
                },
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
                this.item = this.prefix.getFlatConfig();
                this.item.info_replaces = `
 <table class="table table-condensed m-0">
    <thead>
    <tr>
        <th>Key</th>
        <th>Description</th>
    </tr>
    </thead>

    <tbody>

    <tr>
        <td>{WIDTH}</td>
        <td>default monitor width in pixels (number)</td>
    </tr>
    <tr>
        <td>{HEIGHT}</td>
        <td>default monitor height in pixels (number)</td>
    </tr>
    <tr>
        <td>{USER}</td>
        <td>username</td>
    </tr>
    <tr>
        <td>{DOSDEVICES}</td>
        <td>Full path to "/.../prefix/dosdevice"</td>
    </tr>
    <tr>
        <td>{DRIVE_C}</td>
        <td>Full path to "/.../prefix/drive_c"</td>
    </tr>
    <tr>
        <td>{PREFIX}</td>
        <td>Full path to "/.../prefix"</td>
    </tr>
    <tr>
        <td>{ROOT_DIR}</td>
        <td>Full path to game folder</td>
    </tr>
    <tr>
        <td>{HOSTNAME}</td>
        <td>See command: hostname</td>
    </tr>

    </tbody>
</table>
<br/>Example: data/games/game/example.conf
             `;

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
                this.item.replaces = this.values.items;

                let validated = this.$refs.form.validate();

                if (validated && Object.keys(validated).length > 0) {
                    return;
                }

                delete this.item.info_replaces;

                this.$store.dispatch(action.get('prefix').SAVE, { prefix: this.prefix, item: this.item })
                    .then(() => this.cancel());
            },
            cancel() {
                return Custombox.modal.close();
            },
            getTabs() {
                return {
                    main:     'Основное',
                    libs:     'Библиотеки',
                    fixes:    'Fixes',
                    replaces: 'Автозамена',
                };
            },
            getFields() {
                let fields = {};

                return Object.assign(fields, {
                    'app.path':             {
                        tab:               'main',
                        name:              'Папка с играми',
                        description_title: 'Пример',
                        description:       'Games',
                        type:              'text',
                        required:          true,
                    },
                    'wine.windows_version': {
                        tab:      'main',
                        name:     'Версия Windows',
                        type:     'windows_version',
                        required: true,
                    },
                    'wine.arch':            {
                        tab:      'main',
                        name:     'Архитектура',
                        type:     'arch',
                        required: true,
                    },
                    'app.sandbox':          {
                        tab:               'main',
                        name:              'Sandbox',
                        description_title: '',
                        description:       'Изолировать префикс от системы',
                        type:              'bool',
                        required:          true,
                    },
                    'app.fixres':           {
                        tab:               'main',
                        name:              'Авто-разрешение',
                        description_title: '',
                        description:       'Автоматически восстанавливать разрешение экрана',
                        type:              'bool',
                        required:          true,
                    },

                    'libs.dxvk.install':    {
                        tab:               'libs',
                        name:              'DXVK',
                        description_title: '',
                        description:       'Ускорение dx9-11 игр через Vulkan',
                        type:              'bool',
                        required:          true,
                    },
                    'libs.dxvk.autoupdate': {
                        tab:               'libs',
                        name:              'Автообновление DXVK',
                        description_title: '',
                        description:       '',
                        type:              'bool',
                        relations:         'require:libs.dxvk.install',
                        required:          true,
                    },


                    'fixes.focus':         {
                        tab:               'fixes',
                        name:              'Fix focus',
                        description_title: '',
                        description:       'Требуется для игр страдающих потерей фокуса',
                        type:              'bool',
                        required:          true,
                    },
                    'fixes.nocrashdialog': {
                        tab:               'fixes',
                        name:              'No crash dialog',
                        description_title: '',
                        description:       'Не показывать диалоги с ошибками',
                        type:              'bool',
                        required:          true,
                    },
                    'fixes.cfc':           {
                        tab:               'fixes',
                        name:              'CheckFloatConstants',
                        description_title: '',
                        description:       'Проверка диапазона с плавающей точкой в шейдерах d3d9. Помогает отобразить невидимые объекты',
                        type:              'bool',
                        required:          true,
                    },
                    'fixes.glsl':          {
                        tab:               'fixes',
                        name:              'Use GLSL shaders',
                        description_title: '',
                        description:       'Use GLSL shaders (enable) or ARB shaders (disable) (faster, but sometimes breaks)',
                        type:              'bool',
                        required:          true,
                    },
                    'fixes.ddr':           {
                        tab:      'fixes',
                        name:     'DirectDrawRenderer',
                        type:     'directDrawRenderer',
                        required: false,
                    },
                    'fixes.orm':           {
                        tab:      'fixes',
                        name:     'OffscreenRenderingMode',
                        type:     'offscreenRenderingMode',
                        required: false,
                    },

                    'info_replaces': {
                        tab:               'replaces',
                        type:              'info',
                        name:              'Use GLSL shaders',
                        description_title: '',
                        description:       'Use GLSL shaders (enable) or ARB shaders (disable) (faster, but sometimes breaks)',
                        required:          false,
                        full_size:         true,
                    },
                    'replaces':      {
                        tab:       'replaces',
                        type:      'component',
                        component: Values,
                        required:  false,
                        full_size: true,
                        props:     this.values,
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