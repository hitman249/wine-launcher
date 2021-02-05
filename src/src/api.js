import Vue   from 'vue';
import _     from "lodash";
import Utils from "./modules/utils";

const { remote } = require('electron');
const fetch      = remote.getGlobal('fetch');
const FormData   = remote.getGlobal('formData');

export default new class Api {
  /**
   * @type {string}
   */
  static SERVER_URL = 'http://wine.hostronavt.ru';

  /**
   * @type {Vue}
   */
  static VUE = null;

  static request = {};

  options = {
    headers: {
      cookie:       '__test=4da27e6b5554d76c0e747adef4caa680',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/71.0.3578.80 Chrome/71.0.3578.80 Safari/537.36',
    },
  };

  requestReset() {
    Api.request = {
      url:     '',
      method:  '',
      headers: {},
      params:  {},
      form:    {},
      data:    {},
      result:  {},
    };
  }

  request() {
    return Api.request;
  }

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

  /**
   * @param {Object} params
   * @return {Promise<Object>}
   */
  createConfig(params = {}) {
    return this._post(Api.ROUTE.CONFIG_CREATE, params);
  }

  /**
   * @param {number} id
   * @param {Object} params
   * @return {Promise<Object>}
   */
  updateConfig(id, params = {}) {
    return this._post(`${Api.ROUTE.CONFIG_UPDATE}/${id}`, params);
  }

  /**
   * @param {number} id
   * @return {Promise<boolean>}
   */
  deleteConfig(id) {
    return this._post(`${Api.ROUTE.CONFIG_DELETE}/${id}`).then(() => true, () => false);
  }

  /**
   * @param {string} search
   * @return {Promise<boolean>}
   */
  selectConfig(search) {
    return this._post(Api.ROUTE.CONFIG_SELECT, { q: search });
  }

  /**
   * @param {number} id
   * @return {Promise<boolean>}
   */
  likeConfig(id) {
    return this._post(`${Api.ROUTE.LIKE_CONFIG}/${id}`).then(() => true, () => false);
  }

  /**
   * @param {number} id
   * @return {Promise<boolean>}
   */
  unlikeConfig(id) {
    return this._post(`${Api.ROUTE.UNLIKE_CONFIG}/${id}`).then(() => true, () => false);
  }

  /**
   * @param {number} id
   * @return {Promise<boolean>}
   */
  likeImage(id) {
    return this._post(`${Api.ROUTE.LIKE_IMAGE}/${id}`).then(() => true, () => false);
  }

  /**
   * @param {number} id
   * @return {Promise<boolean>}
   */
  unlikeImage(id) {
    return this._post(`${Api.ROUTE.UNLIKE_IMAGE}/${id}`).then(() => true, () => false);
  }

  /**
   * @param {number} id
   * @return {Promise<Object>}
   */
  image(id) {
    return this._blob(`${Api.ROUTE.IMAGE}/${id}.jpeg`);
  }

  /**
   * @param {string} route
   * @param {Object} params
   * @returns {Promise<Object>}
   * @private
   */
  _post(route, params = {}) {
    this.requestReset();
    let form = this._getParams(params);

    return new Promise((resolve, reject) => {
      let headers = Object.assign({}, this.options.headers, form.getHeaders());
      let request = fetch(`${Api.SERVER_URL}/${route}`, {
        method: 'POST',
        headers,
        body:   form,
      });

      Api.request.url     = `${Api.SERVER_URL}/${route}`;
      Api.request.method  = 'POST';
      Api.request.headers = headers;
      Api.request.params  = params;
      Api.request.form    = form;

      return this._getResponse(request, resolve, reject);
    });
  }

  /**
   * @param {string} route
   * @param {Object} params
   * @returns {Promise<Object>}
   * @private
   */
  _get(route, params = {}) {
    this.requestReset();

    let url     = new URL(`${Api.SERVER_URL}/${route}`);
    let form    = this._convertDates(params);
    let headers = Object.assign({}, this.options.headers);

    Object.keys(form).forEach(key => url.searchParams.append(key, form[key]));

    return new Promise((resolve, reject) => {
      let request = fetch(url, {
        method: 'GET',
        headers
      });

      Api.request.url     = `${Api.SERVER_URL}/${route}`;
      Api.request.method  = 'GET';
      Api.request.headers = headers;
      Api.request.params  = params;
      Api.request.form    = form;

      return this._getResponse(request, resolve, reject);
    });
  }

  /**
   * @param {Promise} request
   * @param {Function} resolve
   * @param {Function} reject
   * @return {Promise}
   * @private
   */
  _getResponse(request, resolve, reject) {
    return request.then(data => {
      Api.request.data = data;

      if (200 === data.status) {
        data.json().then(result => {
          Api.request.result = result;
          if ('success' === result.status) {
            resolve(result.data);
          } else {
            reject({ status: 'error', message: 'Error request.', data: result })
          }
        });
      } else {
        if (data) {
          let promise = Promise.resolve();

          if ((data.headers.get('content-type') || '').includes('text/html')) {
            promise = data.text();
          } else {
            promise = data.json();
          }

          promise.then(result => {
            Api.request.result = result;
            reject({ status: 'error', message: 'Error request.', data: result });
          });
        } else {
          reject({ status: 'error', message: 'Error request.' });
        }
      }
    }, data => {
      Api.request.data = data;
      reject({ status: 'error', message: 'Error request.', data });
    });
  }

  /**
   * @param {string} route
   * @param {Object} params
   * @returns {Promise<Object>}
   * @private
   */
  _blob(route, params = {}) {
    let url     = new URL(`${Api.SERVER_URL}/${route}`);
    let form    = this._convertDates(params);
    let headers = {};

    Object.keys(form).forEach(key => url.searchParams.append(key, form[key]));

    return new Promise((resolve, reject) => {
      let request = fetch(url, {
        method:  'GET',
        headers: Object.assign(headers, this.options.headers)
      });

      return request.then((data) => resolve(data.buffer()), () => reject());
    });
  }

  /**
   * @param {Object} params
   * @return {FormData}
   * @private
   */
  _getParams(params = {}) {
    let data   = new FormData();
    let pad    = (value) => _.padStart(value, 2, '0');
    let result = Object.assign({}, params, this._getCredential());

    Object.keys(result).forEach((key) => {
      if (typeof result[key] === 'object' && !Array.isArray(result[key]) && !(result[key] instanceof File || 'ReadStream' === _.get(result[key], 'constructor.name'))) {
        data.append(key, JSON.stringify(result[key]));
      } else if (Array.isArray(result[key])) {
        result[key].forEach((value) => {
          data.append(`${key}[]`, value);
        });
      } else if (result[key] instanceof Date) {
        data.append(key, `${result[key].getFullYear()}-${pad(result[key].getMonth() + 1)}-${pad(result[key].getDate())}`);
      } else {
        data.append(key, result[key]);
      }
    });

    return data;
  }

  /**
   * @param params
   * @returns {Object}
   * @private
   */
  _convertDates(params = {}) {
    let data   = {};
    let pad    = (value) => _.padStart(value, 2, '0');
    let result = Object.assign({}, params, this._getCredential());

    Object.keys(result).forEach((key) => {
      if (result[key] instanceof Date) {
        data[key] = `${result[key].getFullYear()}-${pad(result[key].getMonth() + 1)}-${pad(result[key].getDate())}`;
      } else {
        data[key] = result[key];
      }
    });

    return data;
  }

  /**
   * @return {{hashes: string[], user: string}}
   */
  _getCredential() {
    let system = app.getSystem();

    return {
      user:   system.getUserName(),
      hashes: system.getHardDriveNames().map(name => Utils.md5(name)),
    };
  }

  static ROUTE = {
    IMAGE: 'image',

    CONFIG_CREATE: 'api/config/create',
    CONFIG_UPDATE: 'api/config/update',
    CONFIG_DELETE: 'api/config/delete',
    CONFIG_SELECT: 'api/config/select',

    LIKE_CONFIG:   'api/like/config',
    UNLIKE_CONFIG: 'api/unlike/config',
    LIKE_IMAGE:    'api/like/image',
    UNLIKE_IMAGE:  'api/unlike/image',
  };
}