<template>
    <div class="btn-group pull-left">
        <input ref="input" type="text" :id="id" class="form-control" v-model="input" autocomplete="off"
               @keydown.down="keyDown" @keydown.up="keyUp" @keydown.enter="keyEnter" @blur="blur">

        <ul v-if="isItems" class="dropdown-menu drop-menu-right show" @mouseenter="focusIn" @mouseleave="focusOut">
            <li v-for="(title, i) in items" :class="{active: i === index}" :key="i">
                <a @click="onClick(i)" onclick="return false">{{title}}</a>
            </li>
        </ul>
    </div>
</template>

<script>
    import action from "../../store/action";

    export default {
        components: {},
        props:      {
            value:   String,
            fetch:   Function,
            timeout: Number,
        },
        name:       'InputAutocomplete',
        data() {
            return {
                id:            action.id,
                input:         this.value || '',
                items:         [],
                index:         0,
                entered:       false,
                dropMenuFocus: false,
                fetchDebounce: _.debounce(() => {
                    if (this.entered) {
                        this.entered = false;
                        return;
                    }
                    if (this.fetch && this.input && this.input.trim()) {
                        this.fetch(this.input).then((items) => {
                            if (items && items.length > 0) {
                                this.$set(this, 'items', _.chunk(_.uniq([this.input].concat(items)), 7)[0]);
                            }
                        });
                    }
                }, this.timeout || 100),
            };
        },
        mounted() {
        },
        methods:    {
            keyEnter() {
                this.entered = true;

                if (this.isItems) {
                    this.setFromIndex(this.index);
                }
            },
            keyDown(event) {
                let max = this.items.length - 1;

                if (max > this.index) {
                    this.$set(this, 'index', this.index + 1);
                }

                event.preventDefault();
            },
            keyUp(event) {
                if (0 < this.index) {
                    this.$set(this, 'index', this.index - 1);
                }

                event.preventDefault();
            },
            onClick(index) {
                this.entered = true;
                this.setFromIndex(index);
            },
            blur() {
                if (this.isItems && false === this.dropMenuFocus) {
                    this.setFromIndex();
                }
            },
            focusIn() {
                this.dropMenuFocus = true;
            },
            focusOut() {
                this.dropMenuFocus = false;
            },
            reset() {
                this.$set(this, 'items', []);
                this.$set(this, 'index', 0);
                this.$set(this, 'dropMenuFocus', false);
            },
            setFromIndex(index = null) {
                if (null !== index) {
                    this.$set(this, 'input', this.items[index]);
                }
                this.reset();
            },
            setCursorEnd() {
                this.$nextTick(() => {
                    if (this.input) {
                        let count = this.input.length;
                        this.$refs.input.focus();
                        this.$refs.input.setSelectionRange(count, count);
                        this.$refs.input.selectionStart = count;
                        this.$refs.input.selectionEnd   = count;
                    }
                });
            },
        },
        computed:   {
            isItems() {
                return this.items.length > 1;
            },
        },
        watch:      {
            input(value) {
                this.$emit('update:value', value);
                this.reset();
                this.fetchDebounce();
            },
            value(value) {
                this.$set(this, 'input', value);
            },
        },
        beforeDestroy() {},
    }
</script>

<style lang="less" scoped>
    .btn-group {
        width: 100%;
    }

    .dropdown-menu {
        width: 100%;

        li > a {
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }
    }
</style>