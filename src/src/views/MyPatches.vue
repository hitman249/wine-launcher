<template>
  <div class="row">
    <div class="col-lg-12">
      <input type="text" :placeholder="$t('labels.search')" class="form-control" v-model="q" autocomplete="off">
      <br>

      <div v-if="items.length === 0" class="card-box">
        <div class="panel-body">
          <h4>{{ $t('patches.not-found') }}</h4>
          <p class="text-muted" v-html="$t('patches.not-found-desc')"></p>
        </div>
      </div>

      <ItemPatch v-for="patch in items" :key="patch.code" :patch="patch" :shared="true"/>
    </div>
  </div>
</template>

<script>
import action    from "../store/action";
import ItemPatch from "../components/Patches/ItemPatch";

export default {
  name:       'MyPatches',
  components: {
    ItemPatch,
  },
  data() {
    return {
      q:       '',
      patches: this.$store.state.patches,
    };
  },
  mounted() {
    this.$store.dispatch(action.get('wine').LOAD);
    this.$store.dispatch(action.get('patches').LOAD);
  },
  methods:    {},
  computed:   {
    items() {
      let arch = window.app.getKernel().getWineArch();

      if (!this.q) {
        return this.patches.store_items.filter((item) => item.arch === arch);
      }

      return this.patches.store_items
        .filter(item => item.arch === arch && item.name.toLowerCase().includes(this.q.toLowerCase()));
    },
  },
}
</script>
