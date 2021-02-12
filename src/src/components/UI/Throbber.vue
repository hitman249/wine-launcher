<template>
  <div class="throbber">
    <div class="throbber__block">
      <div class="sk-swing">
        <div class="sk-swing-dot"></div>
        <div class="sk-swing-dot"></div>
      </div>
    </div>
    <div class="throbber__title m-t-40">
      <div class="card-box">
        <p class="text-muted m-0">
          {{ $t('labels.loading') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  props:      {},
  name:       'Throbber',
  data() {
    return {};
  },
  mounted() {
  },
  methods:    {},
  watch:      {},
  beforeDestroy() {
  },
}
</script>

<style lang="less" scoped>
.card-box {
  padding: 5px 50px;
  margin: 0;
}
</style>