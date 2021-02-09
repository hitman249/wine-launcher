<template>
  <div class="tab-pagination" v-if="p">
    <ul class="pagination">
      <li :class="{disabled: p.prev === false || p.prev === p.current}">
        <a @click="setPage(p.prev)" :title="p.prev ? p.prev : ''"><i class="fa fa-angle-left"></i></a>
      </li>
      <li :class="{active: p.first === p.current}">
        <a @click="setPage(p.first)">{{ p.first }}</a>
      </li>

      <li v-if="p.left" @mouseenter="mouseOverLeft(true)" @mouseleave="mouseOverLeft(false)">
        <a @click="setPage(p.left)" :title="p.left">{{ leftText }}</a>
      </li>

      <li v-for="num in p.center" :class="{active: num === p.current}" :key="num">
        <a @click="setPage(num)" :title="num">{{ num }}</a>
      </li>

      <li v-if="p.right" @mouseenter="mouseOverRight(true)" @mouseleave="mouseOverRight(false)">
        <a @click="setPage(p.right)" :title="p.right">{{ rightText }}</a>
      </li>

      <li :class="{active: p.end === p.current}">
        <a @click="setPage(p.end)">{{ p.end }}</a>
      </li>

      <li :class="{disabled: p.next === false || p.next === p.current}">
        <a @click="setPage(p.next)" :title="p.next ? p.next : ''"><i class="fa fa-angle-right"></i></a>
      </li>
    </ul>
  </div>
</template>

<script>
import action from '../../store/action';

export default {
  name:       'Pagination',
  props:      [
    'type',
  ],
  data() {
    return {
      content:   this.$store.state[this.type],
      left:      false,
      leftText:  '...',
      right:     false,
      rightText: '...',
    };
  },
  methods:    {
    setPage(page) {
      if (false !== page) {
        this.$store.dispatch(action.get(this.type).LOAD, { page, q: String(this.$store.state[this.type].q) });
      }
    },
    mouseOverLeft:  function (flag) {
      this.left = flag;
      if (this.left) {
        this.leftText = this.p.left;
      } else {
        this.leftText = '...';
      }
    },
    mouseOverRight: function (flag) {
      this.right = flag;
      if (this.right) {
        this.rightText = this.p.right;
      } else {
        this.rightText = '...';
      }
    },
  },
  computed:   {
    p() {
      let current    = this.content.items.current_page,
          count      = this.content.items.total,
          countPages = Math.ceil(count / this.content.items.page_size);

      let center = _.chain([ current - 3, current - 2, current - 1, current, current + 1, current + 2, current + 3 ])
        .difference([ 1, countPages ]).sortBy().filter((n) => n > 0 && n <= countPages).value();
      let i      = center.indexOf(current);

      let getCenter = (left, right) => {
        let iMax = _.min([ i + 1, center.length - 1 ]);
        left     = _.max([ 0, i - left ]);
        right    = _.min([ center.length, (center.length - 1) <= (i + right + 1) ? center.length : (i + right + 1) ]);

        return _.chain(_.concat(_.slice(center, left, iMax), _.slice(center, i, right)))
          .filter().uniq().difference([ 1, countPages ]).sortBy().filter((n) => n > 0).take(3).value();
      };

      let centerTmp = getCenter(1, 1);
      if (centerTmp.length === 3) {
        center = centerTmp;
      } else {
        centerTmp = getCenter(2, 1);
        if (centerTmp.length === 3) {
          center = centerTmp;
        } else {
          centerTmp = getCenter(1, 2);
          if (centerTmp.length === 3) {
            center = centerTmp;
          } else {
            centerTmp = getCenter(3, 1);
            if (centerTmp.length === 3) {
              center = centerTmp;
            } else {
              centerTmp = getCenter(1, 3);
              if (centerTmp.length === 3) {
                center = centerTmp;
              } else {
                if (centerTmp.length === 3) {
                  center = centerTmp;
                }
              }
            }
          }
        }
      }

      let pagination = {
        current: current,
        prev:    (current - 1) > 0 ? current - 1 : false,
        first:   countPages < 1 ? 0 : 1,
        left:    false,
        center:  center,
        right:   false,
        end:     countPages,
        next:    (current + 1) <= countPages ? current + 1 : false,
      };

      let minCenter = _.min(pagination.center),
          maxCenter = _.max(pagination.center),
          left      = minCenter - Math.ceil((minCenter - pagination.first) / 2),
          right     = maxCenter + Math.ceil((pagination.end - maxCenter) / 2);

      if (left !== pagination.first && left !== minCenter) {
        pagination.left = left;
      }

      if (right !== pagination.end && right !== maxCenter) {
        pagination.right = right;
      }

      if (pagination.first === pagination.end) {
        return false;
      }

      return pagination;
    },
  },
  watch:      {
    pagination: {
      handler:   function () {
        this.leftText  = '...';
        this.rightText = '...';
      },
      deep:      false,
      immediate: false,
    },
  },
  components: {},
  mounted() {
  },
  beforeDestroy() {
  },
}
</script>

<style lang="less" scoped>
.pagination a {
  cursor: pointer;
}
</style>