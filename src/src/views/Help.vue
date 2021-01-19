<template>
  <div class="panel-group panel-group-joined" id="help" v-html="$t('help.html')"></div>
</template>

<script>
export default {
  name:       'Help',
  components: {},
  data() {
    return {};
  },
  mounted() {
  },
  methods:    {},
  computed:   {},
}
</script>

<style lang="less" scoped>
.tr-title td {
  &:first-child {
    font-weight: bold;
  }

  padding-right: 10px;
  vertical-align: top;
  padding-bottom: 10px;
  padding-top: 10px;
}
</style>