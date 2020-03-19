<template>
    <div class="table-wrapper">
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
</template>

<script>
    import _      from "lodash";
    import action from "../../store/action";

    export default {
        name:    "FileList",
        props:   {
            items: Array,
        },
        data() {
            return {
                id:       action.id,
                selected: null,
                history:  [],
                files:    this.items || [],
            };
        },
        methods: {
            click(item) {
                this.selected = item;

                if ('dir' === item.type) {
                    if ('function' === typeof item.nested) {
                        item.nested().then(items => {
                            item.nested = items;
                            this.saveCurrentToHistory();
                            this.$set(this, 'files', item.nested);
                        });
                    } else if (Array.isArray(item.nested)) {
                        this.saveCurrentToHistory();
                        this.$set(this, 'files', item.nested);
                    }
                }
            },

            isEmptyHistory() {
                return 0 === this.history.length;
            },

            saveCurrentToHistory() {
                this.addHistory(this.files);
            },

            addHistory(files) {
                this.history.push(files);
            },

            backHistory() {
                if (this.isEmptyHistory()) {
                    return;
                }

                this.selected = null;
                this.$set(this, 'files', this.history.pop());
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

    .table-wrapper {
        overflow:  auto;
        max-height: 500px;
    }
</style>