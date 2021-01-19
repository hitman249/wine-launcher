import Vue from 'vue';

export default new class Api {
  /**
   * @type {Vue}
   */
  static VUE = null;

  /**
   * @param {Vue} vue
   */
  use(vue) {
    Api.VUE = vue;
  }

  /**
   * @returns {Vuex.Store}
   */
  store() {
    return Api.VUE.$store;
  }

  /**
   * @returns {Object}
   */
  state() {
    return this.store().state;
  }

  /**
   * @returns {null}
   */
  commit(type, payload, options) {
    return this.store().commit(type, payload, options);
  }

  /**
   * @returns {Promise}
   */
  dispatch(type, payload = {}) {
    return this.store().dispatch(type, payload);
  }

  /**
   * @returns {Vue}
   */
  vue() {
    return Api.VUE;
  }

  /**
   * @returns {VueRouter}
   */
  router() {
    return Api.VUE.$router;
  }

  /**
   * @returns {number}
   */
  get currentTime() {
    return Math.floor(Date.now() / 1000);
  }
}