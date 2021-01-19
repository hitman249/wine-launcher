<template>
  <div class="bootstrap-filestyle input-group">
    <input type="text" class="form-control " placeholder="" disabled="" v-model="file" :title="file">
    <span class="group-span-filestyle input-group-btn" @click="open">
      <label class="btn btn-default m-b-0">
        <span class="buttonText">{{ $t('labels.select') }}</span>
      </label>
    </span>
  </div>
</template>

<script>
import _      from "lodash";
import action from "../../store/action";

export default {
  name:    "IsoSelect",
  props:   {
    value: String,
  },
  data() {
    const { remote } = window.require('electron');

    return {
      id:   action.id,
      remote,
      file: this.value ? String(this.value) : '',
    };
  },
  mounted() {
  },
  methods: {
    open() {
      this.remote.dialog.showOpenDialog(
        this.remote.getCurrentWindow(),
        {
          properties: [ 'openFile' ],
          filters:    [
            { name: 'Disk Images', extensions: [ 'iso', 'nrg', 'bin', 'mdf', 'img' ] },
            { name: 'All Files', extensions: [ '*' ] },
          ],
        })
        .then((result) => {
          if (false === result.canceled) {
            this.file = _.head(result.filePaths);
            this.$emit('update:value', String(this.file));
          }
        });
    }
  },
}
</script>

<style lang="less" scoped>

</style>