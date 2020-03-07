<template>
    <select :id="id" class="selectpicker" ref="select" data-style="btn-warning btn-custom">
        <template v-for="item in items">
            <optgroup v-if="item.nested ? item.nested.length : false" :key="item.name" :label="item.name"
                      :disabled="item.disabled ? 'disabled' : null">
                <option v-for="option in item.nested" :key="option.id" :value="option.id"
                        :selected="isSelected(option.id)"
                        :data-icon="option.icon ? option.icon : null" :disabled="option.disabled ? 'disabled' : null"
                        v-html="option.name">
                </option>
            </optgroup>
            <option v-else-if="!Array.isArray(item.nested)" :key="item.id" :value="item.id"
                    :selected="isSelected(item.id)"
                    :data-icon="item.icon ? item.icon : null" :disabled="item.disabled ? 'disabled' : null"
                    v-html="item.name">
            </option>
        </template>
    </select>
</template>

<script>
    import action from '../../store/action';

    export default {
        name:       'OnlySelect',
        props:      [
            'items',
            'selected',
            'firstMode',
        ],
        data() {
            return {
                id:   action.id,
                init: String(this.selected) || this.firstValue().id,
            };
        },
        mounted() {
            this.$nextTick(() => {
                this.reinit();
                this.resetValue(this.init);
            });
        },
        methods:    {
            isSelected(id) {
                let selected = String(this.selected);

                if (!selected && '0' !== selected) {
                    return false;
                }

                return selected.indexOf(id) !== -1;
            },
            reinit() {
                this.clear();

                let $this = $(`#${this.id}`), $vm = this;

                $this
                    .selectpicker('destroy')
                    .selectpicker({ hideDisabled: true })
                    .off('changed.bs.select')
                    .on('changed.bs.select', (e) => {
                        let select = $(e.currentTarget);
                        let items  = select.val();
                        select.parent('.bootstrap-select').removeClass('dropup');
                        $vm.$emit('update:selected', items ? items : []);
                    });

                this.resetValue();
                this.update();
            },
            update() {
                let $this   = $(`#${this.id}`),
                    first   = this.firstValue(),
                    $select = $(`[data-id="${this.id}"]`).closest('.bootstrap-select'),
                    icon    = `glyphicon ${first.icon}`;

                $this.selectpicker('refresh');

                if ($select && $select.length > 0) {
                    $select.find('.filter-option i.glyphicon').attr('class', icon);

                    let items = this.getItems();

                    $select.find('.dropdown-menu.inner li[data-original-index]').each((index, li) => {
                        $(li).find('span.glyphicon:not(.glyphicon-ok)').attr('class', `glyphicon ${items[index].icon}`);
                    });
                }
            },
            resetValue(value = null) {
                let $this = $(`#${this.id}`),
                    first = this.firstValue();

                if (null === value) {
                    if (true !== this.firstMode) {
                        if ('' === this.selected || undefined === this.selected) {
                            value = first.id;
                        } else {
                            value = this.selected;
                        }
                    } else {
                        value = first.id;
                    }
                }

                $this.selectpicker('val', value);
                this.$refs.select.value = value;
                this.$emit('update:selected', value);
            },
            setValue(value) {
                this.$set(this, 'init', value);
                this.$emit('update:selected', value);
                this.reinit();
                this.resetValue(value);
            },
            clear() {
                let prev    = null;
                let options = $(`[data-id="${this.id}"]`).closest('.bootstrap-select');

                for (let i = 0; i < 2; i++) {
                    options.find('.dropdown-menu.inner > li')
                        .each(function () {
                            if ($(this).hasClass('disabled')) {
                                $(this).remove();
                                return;
                            }
                            if ($(this).hasClass('divider')) {
                                if (prev.hasClass('dropdown-header')) {
                                    prev.remove();
                                    $(this).remove();
                                }
                            }
                            prev = $(this);
                        });

                    if (prev && (prev.hasClass('divider') || prev.hasClass('dropdown-header'))) {
                        prev.remove();
                    }
                }
            },
            firstValue() {
                if (!this.items || this.items.length <= 0) {
                    return { id: '' };
                }
                if (this.items[0].nested) {
                    return this.items[0].nested[0];
                }

                return this.items[0];
            },
            getItems() {
                let items = [];
                this.items.forEach((item) => {
                    if (Array.isArray(item.nested)) {
                        item.nested.forEach((subItem) => items.push(subItem));
                    } else {
                        items.push(item);
                    }
                });

                return items;
            },
        },
        watch:      {
            items: {
                handler:   function () {
                    this.$nextTick(() => {
                        this.reinit();
                    });
                },
                deep:      true,
                immediate: false,
            },
        },
        beforeDestroy() {
            $(`#${this.id}`).selectpicker('destroy');
        },
        components: {},
    }
</script>

<style lang="less" scoped>

</style>