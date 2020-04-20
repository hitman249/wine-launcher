<template>
    <form :id="id" class="form-horizontal" role="form" data-parsley-validate novalidate onsubmit="return false">
        <div class="form-group" v-for="(field, key) in elements" :key="key" :class="{'has-error': !!validated[key]}">
            <template v-if="field.full_size">
                <div :class="fullSizeClass.left"></div>
                <div :class="fullSizeClass.right">
                    <component v-if="has(field, 'component')" :is="field.component" v-bind.sync="field.props"/>
                    <Info v-else-if="has(field, 'info')" :value.sync="item[key]"/>
                </div>
            </template>
            <template v-else-if="!has(field, 'hr')">
                <label :for="id + key" class="control-label" :class="leftClass">
                    {{field.name}} {{field.required ? '*' : ''}}
                    <ButtonInfo v-if="field.description" :field="field"/>
                </label>
                <div :class="rightClass">
                    <div v-if="has(field, 'bool')" class="checkbox">
                        <input :id="id + key + '_bool'" type="checkbox" v-model="item[key]">
                        <label :for="id + key + '_bool'"></label>
                    </div>
                    <InputView v-else-if="has(field, 'view')" :value.sync="item[key]"/>
                    <Info v-else-if="has(field, 'info')" :value.sync="item[key]"/>
                    <input v-else-if="has(field, 'file')" type="file" class="filestyle" data-icon="true"
                           data-btnClass="btn-white" :accept="field.accept" @change="changeFile(key, $event)">
                    <OnlySelect v-else-if="has(field, 'windows_version')" class="m-b-0"
                                :selected.sync="item[key]"
                                :items="getWindowsVersion()"/>
                    <OnlySelect v-else-if="has(field, 'arch')" class="m-b-0"
                                :selected.sync="item[key]"
                                :items="getArch()"/>
                    <OnlySelect v-else-if="has(field, 'directDrawRenderer')" class="m-b-0"
                                :selected.sync="item[key]"
                                :items="getDirectDrawRenderer()"/>
                    <OnlySelect v-else-if="has(field, 'offscreenRenderingMode')" class="m-b-0"
                                :selected.sync="item[key]"
                                :items="getOffscreenRenderingMode()"/>
                    <OnlySelect v-else-if="has(field, 'commands')" class="m-b-0"
                                :selected.sync="item[key]"
                                :items="getCommands()"/>
                    <OnlySelect v-else-if="has(field, 'overrides')" class="m-b-0"
                                :selected.sync="item[key]"
                                :items="getOverrides()"/>
                    <OnlySelect v-else-if="has(field, 'select')" class="m-b-0"
                                :selected.sync="item[key]"
                                :items="field.items"/>
                    <FileSelect v-else-if="has(field, 'file_select')" :value.sync="item[key]" :path="field.path"/>
                    <IsoSelect v-else-if="has(field, 'iso_select')" :value.sync="item[key]"/>
                    <LibrarySelect v-else-if="has(field, 'lib_select')" :value.sync="item[key]"/>
                    <component v-else-if="has(field, 'component')" :is="field.component" v-bind.sync="field.props"/>
                    <TextField v-else-if="has(field, 'textarea')" :id="key" :value.sync="item[key]"/>
                    <input v-else-if="has(field, 'password')" :id="key" type="password" class="form-control"
                           v-model="item[key]">
                    <input v-else type="text" :required="field.required" parsley-type="text" placeholder=""
                           class="form-control" v-model="item[key]">
                </div>
            </template>
            <template v-else>
                <div :class="leftClass"></div>
                <div class="m-t-10" :class="rightClass">
                    <h4 class="header-title"><b>{{field.name}}</b></h4>
                    <p class="text-muted m-b-20 font-13">{{field.description}}</p>
                </div>
            </template>
        </div>
    </form>
</template>

<script>
    import action        from '../../store/action';
    import relations     from '../../helpers/relations';
    import collects      from "../../helpers/collects";
    import OnlySelect    from './OnlySelect.vue';
    import TextField     from './TextField.vue';
    import InputView     from "./InputView.vue";
    import Info          from "./Info";
    import ButtonInfo    from "./ButtonInfo";
    import FileSelect    from "./FileSelect";
    import IsoSelect     from "./IsoSelect";
    import LibrarySelect from "./LibrarySelect";

    export default {
        components: {
            Info,
            OnlySelect,
            TextField,
            InputView,
            ButtonInfo,
            FileSelect,
            IsoSelect,
            LibrarySelect,
        },
        props:      {
            item:      Object,
            fields:    Object,
            validated: Object,
            styles:    Object,
        },
        name:       'Form',
        data() {
            return {
                id: action.id,
            };
        },
        mounted() {
            $(":file").filestyle({ input: true, btnClass: 'btn-default', text: 'Выбрать' });
        },
        methods:    {
            relation(field) {
                return relations.relation(field, this.fields, this.item);
            },
            has(item, can) {
                if (Array.isArray(can)) {
                    return can.indexOf(item.type) !== -1;
                }

                return can === item.type;
            },
            changeFile(key, event) {
                if (!event.target.files || event.target.files.length <= 0) {
                    return;
                }

                let sizeLimit = 1024 * 1024 * 100; // 100 Mb
                let field     = this.fields[key];
                let file      = event.target.files[0];

                if (!field.return_body) {
                    this.$set(this.item, key, file);
                    return;
                }

                if (typeof window.FileReader !== 'function' || file.size > sizeLimit) {
                    this.$set(this.item, key, { file, body: undefined });
                    return;
                }

                let fileReader = new FileReader();

                fileReader.onload  = () => {
                    this.$set(this.item, key, { file, body: new Uint8Array(fileReader.result) });
                };
                fileReader.onerror = () => {
                    this.$set(this.item, key, { file, body: undefined });
                };

                fileReader.readAsArrayBuffer(file);
            },
            getWindowsVersion() {
                return collects.getToSelect('windowsVersion');
            },
            getDirectDrawRenderer() {
                return collects.getToSelect('directDrawRenderer');
            },
            getOffscreenRenderingMode() {
                return collects.getToSelect('offscreenRenderingMode');
            },
            getArch() {
                return collects.getToSelect('arch');
            },
            getCommands() {
                return collects.getToSelect('commands');
            },
            getOverrides() {
                return collects.getToSelect('overrides');
            },
        },
        computed:   {
            leftClass() {
                if (this.styles && this.styles.left) {
                    return this.styles.left;
                }

                return 'col-sm-4';
            },
            rightClass() {
                if (this.styles && this.styles.right) {
                    return this.styles.right;
                }

                return 'col-sm-5';
            },
            fullSizeClass() {
                if (this.styles && this.styles.full_size) {
                    return {
                        left:  this.styles.full_size.left || '',
                        right: this.styles.full_size.right || '',
                    };
                }

                return {
                    left:  '',
                    right: 'col-sm-12',
                };
            },
            elements() {
                let fields = {};

                Object.keys(this.fields).forEach((field) => {
                    if (this.relation(field)) {
                        fields[field] = this.fields[field];
                    }
                });

                return fields;
            },
        },
        watch:      {},
        beforeDestroy() {},
    }
</script>

<style lang="less" scoped>
</style>