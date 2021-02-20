<template>
  <div class="row db-items">
    <div class="col-lg-12">
      <input type="text" :placeholder="$t('labels.search')" class="form-control" v-model="q" autocomplete="off">
      <br>
      <Throbber v-if="loading"/>
      <ItemSearch v-for="item in items" :key="item.id" :item="item" :type="'shared'"/>
      <Pagination v-if="!loading" :type="'shared'"/>
      <div v-if="!loading && items.length === 0" class="card-box">
        <div class="panel-body">
          <h4>{{ $t('search.not-found') }}</h4>
          <p class="text-muted">{{ $t('search.not-found-desc') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import action     from "../store/action";
import ItemSearch from "../components/Db/ItemSearch";
import Throbber   from "../components/UI/Throbber";
import Pagination from "../components/Db/Pagination";

export default {
  name:       'Shared',
  components: {
    ItemSearch,
    Throbber,
    Pagination,
  },
  data() {
    return {
      q:              String(this.$store.state.shared.q) || '',
      shared:         this.$store.state.shared,
      sharedDebounce: _.debounce(() => this.sharedImmediate(), 1000),
    };
  },
  mounted() {
    this.getPage(String(this.$store.state.shared.page), String(this.$store.state.shared.q));
  },
  methods:    {
    sharedImmediate() {
      this.getPage('1', String(this.q));
    },
    getPage(page = '1', q = '') {
      this.$store.commit(action.get('shared').LOADING);

      this.$nextTick(() => {
        this.$store.dispatch(action.get('shared').LOAD, { page, q });
      });
    },
  },
  computed:   {
    loading() {
      return null === this.shared.items;
    },
    items() {
      return this.loading ? [] : this.shared.items.data;
    },
  },
  watch:      {
    q() {
      this.sharedDebounce();
    },
  },
}
</script>
