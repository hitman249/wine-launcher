<template>
  <div class="row db-items">
    <div class="col-lg-12">
      <input type="text" :placeholder="$t('labels.search')" class="form-control" v-model="q" autocomplete="off">
      <br>
      <Throbber v-if="loading"/>
      <ItemSearch v-for="item in items" :key="item.id" :item="item" :type="'search'"/>
      <Pagination v-if="!loading" :type="'search'"/>
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
  name:       'Search',
  components: {
    ItemSearch,
    Throbber,
    Pagination,
  },
  data() {
    return {
      q:              String(this.$store.state.search.q) || '',
      search:         this.$store.state.search,
      searchDebounce: _.debounce(() => this.searchImmediate(), 1000),
    };
  },
  mounted() {
    this.getPage(String(this.$store.state.search.page), String(this.$store.state.search.q));
  },
  methods:    {
    searchImmediate() {
      this.getPage('1', String(this.q));
    },
    getPage(page = '1', q = '') {
      this.$store.commit(action.get('search').LOADING);

      this.$nextTick(() => {
        this.$store.dispatch(action.get('search').LOAD, { page, q });
      });
    },
  },
  computed:   {
    loading() {
      return null === this.search.items;
    },
    items() {
      return this.loading ? [] : this.search.items.data;
    },
  },
  watch:      {
    q() {
      this.searchDebounce();
    },
  },
}
</script>
