<template>
  <div class="flex-grid-center">
    <Button1 v-if="1 === index" :title="title" :description="description" @mouseenter="hover" @click="click"/>
    <Button2 v-if="2 === index" :title="title" :description="description" @mouseenter="hover" @click="click"/>
    <Button3 v-if="3 === index" :title="title" :description="description" @mouseenter="hover" @click="click"/>
    <Button4 v-if="4 === index" :title="title" :description="description" @mouseenter="hover" @click="click"/>
  </div>
</template>

<script>
import Button1 from "./Button1";
import Button2 from "./Button2";
import Button3 from "./Button3";
import Button4 from "./Button4";
import Utils   from "../../modules/utils";

export default {
  components: {
    Button1,
    Button2,
    Button3,
    Button4,
  },
  name:       "Funding",
  props:      {
    title:       String,
    description: String,
  },
  data() {
    return {
      index: Utils.rand(1, 4),
    };
  },
  methods:    {
    hover() {
      window.app.getAudioButton().hover();
    },
    click() {
      window.app.getAudioButton().click();
      this.$emit('click');
    }
  },
  computed:   {}
}
</script>

<style lang="less" scoped>
.flex-grid-center {
  display: flex;
  justify-content: center;
  margin: 20px 0;
  margin-top: 40px;
  margin-bottom: 0;
}
</style>