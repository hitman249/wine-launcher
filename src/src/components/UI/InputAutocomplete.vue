<template>
  <div class="btn-group input-group pull-left">
    <input ref="input" type="text" class="form-control" v-model="input" autocomplete="off"
           @keydown.down="keyDown" @keydown.up="keyUp" @keydown.enter="keyEnter" @blur="blur">

    <label v-if="all" class="btn btn-default button" @click="getAll">
      <span class="buttonText">...</span>
    </label>

    <div class="dropdown-items show" :class="{hidden: !isItems}">
      <div :id="id" class="ul" @mouseenter="focusIn" @mouseleave="focusOut">
        <div class="li" v-for="(item, i) in items" :class="{active: i === index}" :key="i">
          <a @click="onClick(i)" onclick="return false" :title="item.description">
            {{ item.name }} <br><small>{{ item.description }}</small>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import action from "../../store/action";

export default {
  components: {},
  props:      {
    value:    String,
    fetch:    Function,
    fetchAll: Function,
    timeout:  Number,
    all:      Boolean,
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
              this.$set(this, 'items', _.chunk(_.uniq([ {
                name:        this.input,
                description: ''
              } ].concat(items)), 5)[0]);
            }
          });
        }
      }, this.timeout || 300),
    };
  },
  mounted() {
  },
  methods:    {
    bindScroll() {
      $(`#${this.id}`).slimScroll({
        height:    '233px',
        position:  'right',
        size:      "5px",
        color:     '#98a6ad',
        wheelStep: 3,
      });
    },
    unbindScroll() {
      let scroll = $(`#${this.id}`);
      scroll.slimScroll({ destroy: true });
      scroll[0].style.height = 'auto';
    },
    getAll() {
      if (this.fetchAll) {
        this.$refs.input.focus();
        this.$set(this, 'index', 0);
        this.$set(this, 'dropMenuFocus', false);
        this.$set(this, 'items', [ this.$t('labels.loading') ]);
        this.$nextTick(() => this.bindScroll());
        this.fetchAll().then((items) => {
          this.$set(this, 'items', items);
        });
      }
    },
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
      this.unbindScroll();
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
        this.$set(this, 'input', this.items[index].name);
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
      this.unbindScroll();
    },
    value(value) {
      this.$set(this, 'input', value);
    },
  },
  beforeDestroy() {
  },
}
</script>

<style lang="less" scoped>
.btn-group {
  width: 100%;

  input[type="text"] {
    display: inline-block;
    width: calc(100% - 45px);
  }
}

.button {
  float: none;
  height: 36px;
  width: 45px;
  overflow: hidden;
  border-radius: 3px !important;
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
}

/* Dropdown */
.dropdown-items {
  display: block;
  position: absolute;
  width: 100%;
  padding: 4px 0;
  background-color: #5f6b77;
  transition: all 300ms ease;
  -moz-transition: all 300ms ease;
  -webkit-transition: all 300ms ease;
  -o-transition: all 300ms ease;
  -ms-transition: all 300ms ease;
  border: 0;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26);
  border-radius: 3px;
  top: calc(100% + 2px);
  z-index: 2;
}

.li, .li a {
  display: block;
  width: 100%;
  cursor: default;
}

.dropdown-items .li a {
  padding: 6px 20px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 900;

  small {
    font-weight: 100;
  }
}

.dropdown-items .li a:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff !important;
}

.dropdown-items .divider {
  background-color: #98a6ad;
}

.dropdown-items .active a,
.dropdown-items .active a:hover,
.dropdown-items .active a:focus,
.dropdown-items .li a:focus,
.dropdown-items .li a:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff !important;
}

.dropup .dropdown-items {
  box-shadow: 0px -1px 5px 0 rgba(0, 0, 0, 0.26);
}

.dropdown-items .ul {
  .li a {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}
</style>