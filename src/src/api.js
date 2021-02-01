import Vue from 'vue';
import _   from "lodash";

const { remote }   = require('electron');
const fetch        = remote.getGlobal('fetch');
const fs           = remote.getGlobal('fs');
const FormData     = remote.getGlobal('formData');
// const Blob         = remote.getGlobal('blob');
const path         = require('path');
const cookieParser = require('cookie');

export default new class Api {
  /**
   * @type {string}
   */
  static SERVER_URL = 'http://wine.hostronavt.ru';

  /**
   * @type {Vue}
   */
  static VUE = null;

  options = {
    headers: {
      cookie:       '__test=4da27e6b5554d76c0e747adef4caa680',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/71.0.3578.80 Chrome/71.0.3578.80 Safari/537.36',
    },
  };

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

  createConfig(params = {}) {
    return this._get(Api.ROUTE.CONFIG_CREATE, params);
  }

  test(params = {}) {
    return this._post(Api.ROUTE.TEST, params);
  }

  image(id) {
    return this._blob(`${Api.ROUTE.IMAGE}/${id}`);
  }

  /**
   * @param {string} route
   * @param {Object} params
   * @returns {Promise<Object>}
   * @private
   */
  _post(route, params = {}) {
    let form = this.getParams(params);

    return new Promise((resolve, reject) => {
      let request = fetch(`${Api.SERVER_URL}/${route}`, {
        method:  'POST',
        headers: Object.assign({}, this.options.headers, form.getHeaders()),
        body:    form,
      });

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
    let url     = new URL(`${Api.SERVER_URL}/${route}`);
    let form    = this.convertDates(params);
    let headers = {};

    Object.keys(form).forEach(key => url.searchParams.append(key, form[key]));

    return new Promise((resolve, reject) => {
      let request = fetch(url, {
        method:  'GET',
        headers: Object.assign(headers, this.options.headers)
      });

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
      if (200 === data.status) {
        data.json().then(result => {
          if ('success' === result.status) {
            resolve(result);
          } else {
            reject({ status: 'error', message: 'Error request.', data: result })
          }
        });
      } else {
        if (data) {
          data.json().then(result => reject({ status: 'error', message: 'Error request.', data: result }));
        } else {
          reject({ status: 'error', message: 'Error request.' });
        }
      }
    }, data => {
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
    let form    = this.convertDates(params);
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
  getParams(params = {}) {
    let data = new FormData();
    let pad  = (value) => _.padStart(value, 2, '0');

    Object.keys(params).forEach((key) => {
      if (typeof params[key] === 'object' && !Array.isArray(params[key]) && !(params[key] instanceof File)) {
        data.append(key, JSON.stringify(params[key]));
      } else if (Array.isArray(params[key])) {
        params[key].forEach((value) => {
          data.append(`${key}[]`, value);
        });
      } else if (params[key] instanceof Date) {
        data.append(key, `${params[key].getFullYear()}-${pad(params[key].getMonth() + 1)}-${pad(params[key].getDate())}`);
      } else {
        data.append(key, params[key]);
      }
    });

    return data;
  }

  /**
   * @param params
   * @returns {Object}
   * @private
   */
  convertDates(params = {}) {
    let result = {};
    let pad    = (value) => _.padStart(value, 2, '0');

    Object.keys(params).forEach((key) => {
      if (params[key] instanceof Date) {
        result[key] = `${params[key].getFullYear()}-${pad(params[key].getMonth() + 1)}-${pad(params[key].getDate())}`;
      } else {
        result[key] = params[key];
      }
    });

    return result;
  }

  static ROUTE = {
    TEST:          'test',
    IMAGE:         'image',
    CONFIG_CREATE: 'api/config/create',
    CONFIG_SELECT: 'api/config/select',
  };
}