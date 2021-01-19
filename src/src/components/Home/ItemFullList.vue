<template>
  <div class="item-point card-box m-b-10" @click="open" @mouseenter="hover">
    <div class="item-point__background"></div>

    <div class="table-box opport-box">
      <div class="table-detail">
        <div class="member-info text-center">
          <h4><b>{{ $t('labels.more') }}</b></h4>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import action from "../../store/action";

export default {
  name:       "ItemFullList",
  components: {},
  data() {
    return {
      config: null,
    };
  },
  methods:    {
    open() {
      this.$store.dispatch(action.get('games').FULL);
    },
    hover() {
      window.app.getAudioButton().hover();
    },
  },
  computed:   {}
}
</script>

<style lang="less" scoped>
.item-point {
  cursor: pointer;
  padding-top: 5px;
  padding-bottom: 5px;

  h4 {
    transition: all 300ms ease-in-out;
  }

  &:hover {
    h4 {
      color: #ffbd4a;
    }
  }
}
</style>