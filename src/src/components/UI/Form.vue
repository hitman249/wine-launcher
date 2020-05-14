<template>
    <form class="form-horizontal" role="form" data-parsley-validate novalidate onsubmit="return false"
          :class="{'form-inner': styles.inner }">
        <template v-if="tabsMode">
            <ul class="nav nav-tabs tabs" :id="id">
                <li class="tab" v-for="(tab, name) in groups" :key="name" :id="getPopoverId(name)"
                    :class="{active: tab.active}"
                    @click="setTab(name, $event)" onclick="return false" :data-content="tab.popover"
                    data-container="body"
                    data-trigger="focus" data-placement="top">
                    <a :href="'#'+name" data-toggle="tab" :aria-expanded="tab.active" :class="{active: tab.active}"
                       onclick="return false">
                        <span class="visible-xs"><i class=""></i></span>
                        <span class="hidden-xs">{{tab.name}}<Badge v-if="changesTab[name]" :status="'danger'"/></span>
                    </a>
                </li>
            </ul>
            <div class="tab-content" :style="{'min-height': minHeight}">
                <div class="tab-pane" :id="name" v-for="(tab, name) in groups"
                     :class="{active: tab.active, show: tab.active}"
                     :key="name">
                    <FormItems :item.sync="item" :fields="tab.fields" :styles="tab.styles" :validated="validated"/>
                </div>
            </div>
        </template>
        <template v-else>
            <FormItems :item.sync="item" :fields="fields" :styles="styles" :validated="validated"/>
        </template>
    </form>
</template>

<script>
    import action     from '../../store/action';
    import utils      from "../../modules/utils";
    import Validators from '../../helpers/validators';
    import Relations  from '../../helpers/relations';
    import Badge      from '../../components/UI/Badge.vue';
    import FormItems  from './FormItems.vue';

    export default {
        components: {
            Badge,
            FormItems,
        },
        props:      {
            item:      Object,
            fields:    Object,
            tabs:      Object,
            styles:    Object,
            guide:     Boolean,
            minHeight: String,
        },
        name:       'Form',
        data() {
            return {
                id:              action.id,
                groups:          this.getTabs(),
                mobile:          false,
                validated:       {},
                timeout_popover: null,
            };
        },
        mounted() {
            this.selectLastTab();
            window.addEventListener('resize', this.onResize);
            this.init();
            this.onResize({ target: window });
        },
        methods:    {
            init() {
                if (this.styles.inner) {
                    return;
                }

                let tabs = $(`#${this.id}`).closest('form').find('ul.nav-tabs');

                if (tabs.length <= 0) {
                    return;
                }

                tabs.each((i, tab) => {
                    let item = $(tab);
                    if (item.is(':not(.load):visible')) {
                        item.tabs();
                        item.addClass('load');
                    }
                });
            },
            selectLastTab() {
                if (!this.tabs || Object.keys(this.tabs).length <= 0) {
                    return;
                }

                if (this.item && !this.item.id) {
                    return;
                }

                let current = this.$store.state.forms.current_tab[this.keyForm];

                if (current) {
                    this.setTab(current);
                    this.$nextTick(() => this.init());
                }
            },
            getTabs() {
                if (!this.tabs || Object.keys(this.tabs).length <= 0) {
                    return null;
                }

                let tabs  = {};
                let first = false;

                Object.keys(this.tabs).forEach((tabField) => {
                    let tabName   = ('object' === typeof this.tabs[tabField]) ? this.tabs[tabField].name : this.tabs[tabField];
                    let tabStyles = ('object' === typeof this.tabs[tabField]) ? this.tabs[tabField].styles : this.styles;
                    let fields    = {};

                    Object.keys(this.fields).forEach((field) => {
                        if (tabField === this.fields[field].tab) {
                            fields[field] = this.fields[field];
                        }
                    });

                    tabs[tabField] = {
                        name:    tabName,
                        styles:  tabStyles,
                        active:  !first,
                        popover: `${this.$t('forms.fill-section')} "${this.tabs[tabField]}".`,
                        fields,
                    };

                    first = true;
                });

                return tabs;
            },
            has(item, can) {
                if (Array.isArray(can)) {
                    return can.indexOf(item.type) !== -1;
                }

                return can === item.type;
            },
            onResize(e) {
                let width = e.target.innerWidth;

                if (768 >= width && !this.mobile) {
                    this.mobile = true;
                    this.$nextTick(() => {
                        this.init();
                    });
                } else if (768 < width && this.mobile) {
                    this.mobile = false;
                    this.$nextTick(() => {
                        this.init();
                    });
                }
            },
            validate() {
                let fields = {};

                Object.keys(this.fields).forEach((field) => {
                    if (Relations.relation(field, this.fields, this.item)) {
                        fields[field] = this.fields[field];
                    }
                });

                let validated = Validators.validate(fields, this.item);
                this.$set(this, 'validated', validated);

                return this.validated;
            },
            resetValidate() {
                this.$set(this, 'validated', {});
            },
            notifyError(title = '', description = this.$t('forms.validation-error')) {
                action.notifyError(title, description);
            },
            notifySuccess(title = '', description = this.$t('forms.validation-success')) {
                action.notifySuccess(title, description);
            },
            setActiveTab(name) {
                Object.keys(this.groups).forEach((index) => {
                    if (name === index) {
                        if (!this.groups[index].active) {
                            this.groups[index].active = true;
                        }
                    } else {
                        if (this.groups[index].active) {
                            this.groups[index].active = false;
                        }
                    }
                });

                this.$set(this.$store.state.forms.current_tab, this.keyForm, name);

                this.$nextTick(() => this.init());
            },
            setTab(name, e) {
                if (!this.guide) {
                    return this.setActiveTab(name);
                }

                this.clearPopovers();

                let status = this.check(name);

                if (true === status) {
                    this.setActiveTab(name);
                } else {
                    this.setPopover(status);
                    e.stopPropagation();
                }
            },
            check(name) {
                let validated = Object.keys(Validators.validate(this.fields, this.item));
                let status    = true;
                let exit      = false;

                Object.keys(this.groups).forEach((tabName) => {
                    if (true === exit || true !== status) {
                        return;
                    }

                    if (tabName === name) {
                        exit = true;
                        return;
                    }

                    let fields = Object.keys(this.groups[tabName].fields);
                    let diff   = _.difference(validated, fields);

                    if (validated.length !== diff.length) {
                        status = tabName;
                    }
                });

                return status;
            },
            getPopoverId(name) {
                return `${name}_popover_${this.keyForm}`;
            },
            setPopover(name) {
                let id = this.getPopoverId(name);

                if ($(`#${id}[aria-describedby]`).length > 0) {
                    return;
                }

                $(`#${id}`)
                    .popover('destroy')
                    .popover('show')
                    .off('hidden.bs.popover')
                    .on('hidden.bs.popover', () => this.clearPopovers(id));

                if (null !== this.timeout_popover) {
                    clearTimeout(this.timeout_popover);
                }
                this.timeout_popover = setTimeout(() => {
                    this.clearPopovers(id);
                    this.timeout_popover = null;
                    let popovers         = document.querySelector('.popover');
                    if (popovers) {
                        popovers.remove();
                    }
                }, 5000);
            },
            clearPopovers(id = null) {
                if ($('body > .popover').length <= 0) {
                    return;
                }
                if (null === id) {
                    Object.keys(this.tabs).forEach((name) => {
                        let popover = $(`#${this.getPopoverId(name)}[aria-describedby]`);
                        if (popover.length > 0) {
                            popover.popover('destroy');
                        }
                    });
                } else {
                    let popover = $(`#${id}[aria-describedby]`);
                    if (popover.length > 0) {
                        popover.popover('destroy');
                    }
                }
            },
        },
        computed:   {
            tabsMode() {
                return this.groups && !this.mobile;
            },
            changesTab() {
                let tabs        = {};
                let errorFields = Object.keys(this.validated);

                if (!this.groups) {
                    return tabs;
                }

                Object.keys(this.groups).forEach((tabName) => {
                    tabs[tabName] = false;
                    errorFields.forEach((errorField) => {
                        if (false === tabs[tabName] && Object.keys(this.groups[tabName].fields).indexOf(errorField) !== -1) {
                            tabs[tabName] = true;
                        }
                    });
                });

                return tabs;
            },
            keyForm() {
                return 'key_' + utils.hashCode(JSON.stringify({
                    tabs:   this.tabs ? Object.keys(this.tabs) : null,
                    fields: this.fields ? Object.keys(this.fields) : null,
                    styles: this.styles,
                    item:   this.item ? Object.keys(this.item) : null,
                }));
            },
        },
        watch:      {},
        beforeDestroy() {
            window.removeEventListener('resize', this.onResize);
        },
    }
</script>

<style lang="less" scoped>
    .form-inner {
        margin: -30px;
        margin-bottom: -60px;
        padding: 0;

        .tab-content {
            box-shadow: none;
            -webkit-box-shadow: none;
            margin-bottom: 0;
            padding-bottom: 5px;
        }

        ul {
            background: #2b333b;
        }
    }
</style>