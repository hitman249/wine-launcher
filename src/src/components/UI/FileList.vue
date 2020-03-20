<template>
    <div>
        <ol class="breadcrumb">
            <li>
                <a v-if="0 !== history.length" href="#" onclick="return false" @click="clearHistory">Repositories</a>
                <template v-else>Repositories</template>
            </li>
            <li v-for="(link, index) in history" :key="link.name">
                <a v-if="index < (history.length-1)" href="#" onclick="return false" @click="setHistoryFrom(link)">{{link.name}}</a>
                <template v-else>{{link.name}}</template>
            </li>
        </ol>
        <div :id="id">
            <table class="table table-condensed m-0 table-info">
                <tbody>

                <tr v-if="!isEmptyHistory()" @click="backHistory">
                    <td class="table-info__icon"><i class="md md-folder"></i></td>
                    <td>..</td>
                </tr>

                <tr v-for="item in files" :key="item.name" :class="{active: item === selected}" @click="click(item)">
                    <td class="table-info__icon">
                        <i v-if="'file' === item.type" class="fa fa-file-archive-o"></i>
                        <i v-if="'dir' === item.type" class="md md-folder"></i>
                    </td>
                    <td>
                        {{item.name}}
                    </td>
                </tr>

                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
    import action from "../../store/action";

    export default {
        name:    "FileList",
        props:   {
            items: Array,
        },
        data() {
            return {
                id:       action.id,
                loading:  false,
                selected: null,
                history:  [],
                files:    this.items || [],
            };
        },
        methods: {
            bindScroll() {
                this.clearHistory();

                $(`#${this.id}`).slimScroll({
                    height:    '300px',
                    position:  'right',
                    size:      "5px",
                    color:     '#98a6ad',
                    wheelStep: 10,
                });
            },
            unbindScroll() {
                $(`#${this.id}`).slimScroll({ destroy: true });
            },
            click(item) {
                if (this.loading) {
                    return;
                }

                this.selected = item;

                if ('dir' === item.type) {
                    if ('function' === typeof item.nested) {
                        this.loading = true;
                        item.nested().then(items => {
                            this.loading = false;
                            item.nested  = items;
                            this.addHistory({ files: item.nested, name: this.selected.name });
                            this.$set(this, 'files', item.nested);
                        }, () => { this.loading = false; });
                    } else if (Array.isArray(item.nested)) {
                        this.addHistory({ files: item.nested, name: this.selected.name });
                        this.$set(this, 'files', item.nested);
                    }
                }
            },

            isEmptyHistory() {
                return 0 === this.history.length;
            },

            addHistory(files) {
                this.history.push(files);
            },

            backHistory() {
                if (this.isEmptyHistory()) {
                    return;
                }

                this.history.pop();

                if (this.isEmptyHistory()) {
                    this.selected = null;
                    this.$set(this, 'files', this.items);
                    return;
                }

                let end       = this.history[this.history.length - 1];
                this.selected = null;
                this.$set(this, 'files', end.files);
            },

            setHistoryFrom(item) {
                let result = [];
                let find   = false;

                this.history.forEach((state) => {
                    if (!find && state !== item) {
                        result.push(state);
                    } else {
                        if (state === item) {
                            result.push(state);
                        }
                        find = true;
                    }
                });

                this.selected = null;
                this.$set(this, 'history', result);
                this.$set(this, 'files', item.files);
            },

            clearHistory() {
                this.history  = [];
                this.files    = this.items;
                this.selected = null;
            },
        },
    }
</script>

<style lang="less" scoped>
    .table-info {
        & > tbody > tr {
            cursor: pointer;

            &:hover {
                background-color: rgba(255, 255, 255, 0.05);
            }
        }

        user-select: none; /* standard syntax */
        -webkit-user-select: none; /* webkit (safari, chrome) browsers */
        -moz-user-select: none; /* mozilla browsers */
        -khtml-user-select: none; /* webkit (konqueror) browsers */
        -ms-user-select: none; /* IE10+ */
    }

    .table-info__icon {
        width: 25px;
        padding-left: 10px;

        .md {
            font-size: 17px;
        }

        .fa {
            margin-left: 2px;
        }
    }
</style>