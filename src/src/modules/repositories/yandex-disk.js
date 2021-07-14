import _          from "lodash";
import Prefix     from "../prefix";
import FileSystem from "../file-system";
import Network    from "../network";
import Utils      from "../utils";

const { remote } = require('electron');
const fetch      = remote.getGlobal('fetch');

export default class YandexDisk {
  /**
   * @type {string}
   */
  url = 'https://yadi.sk/d/IrofgqFSqHsPu/wine_builds';

  /**
   * @type {Prefix}
   */
  prefix = null;

  /**
   * @type {FileSystem}
   */
  fs = null;

  /**
   * @type {Network}
   */
  network = null;

  /**
   * @param {Prefix} prefix
   * @param {FileSystem} fs
   * @param {Network} network
   */
  constructor(prefix, fs, network) {
    this.prefix  = prefix;
    this.fs      = fs;
    this.network = network;
  }

  /**
   * @return {{name: string, type: string, nested: (function(): Promise)}}
   */
  getElement() {
    return {
      name:   'Kron4ek',
      type:   'dir',
      nested: () => this.getList(),
    };
  }

  /**
   * @return {Promise}
   */
  getList(url = this.url) {
    let headers = {};
    let cookies = {};
    let json    = {};
    let result  = [];

    return fetch(url)
      .then((res) => {
        headers = this.network.headersParse(res.headers);
        cookies = this.network.cookieParse(res.headers.raw()['set-cookie']);
        return res.text();
      })
      .then((html) => {
        let raw = html.match(/(\<script type="application\/json".+?>)(.+?)(<\/script>)/m);

        if (raw && raw[2]) {
          json = Utils.jsonDecode(raw[2]);
        }

        let items             = _.get(json, 'resources', {});
        let lang              = _.get(json, 'environment.currentLang');
        let yandexuid         = _.get(json, 'environment.yandexuid');
        let currentResourceId = _.get(json, 'currentResourceId', null);
        items                 = _.filter(items, (item) => item.parent === currentResourceId);

        items.sort((a, b) => {
          if (a.type === 'dir' || b.type === 'dir') {
            return 0;
          }
          if (a.modified === b.modified) {
            return 0;
          }

          return parseInt(a.modified) < parseInt(b.modified) ? 1 : -1;
        });

        _.forEach(items, (value) => {
          let item = {
            name: value.name,
            type: value.type,
          };

          if ('dir' === item.type) {
            item.nested = () => this.getList(_.get(value, 'meta.short_url'));
          }
          if ('file' === item.type) {
            item.download = () => {
              let data = {
                cookie: { yandexuid, lang, tld: lang },
                post:   { hash: value.path, sk: _.get(json, 'environment.sk') },
              };

              return this.getFileUrl(data).then((url) => this.download(url, value.name));
            }
          }

          result.push(item);
        });

        return result;
      });
  }

  /**
   * @param {{cookie: *, post: *}} data
   * @return {Promise<string>}
   */
  getFileUrl(data) {
    let url     = 'https://yadi.sk/public/api/download-url';
    let options = {
      method:  'POST',
      body:    JSON.stringify(data.post),
      headers: {
        'User-Agent':   'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/71.0.3578.80 Chrome/71.0.3578.80 Safari/537.36',
        'Content-Type': 'text/plain',
        'Host':         'yadi.sk',
        'Origin':       'https://yadi.sk',
        cookie:         this.network.cookieStringify(data.cookie),
      },
    };

    return fetch(url, options)
      .then(data => data.json()).then(data => _.get(data, 'data.url'));
  }

  /**
   * @param {string} url
   * @param {string} filename
   */
  download(url, filename) {
    let cacheDir = this.prefix.getCacheDir();
    return this.network.download(url, `${cacheDir}/${filename}`).then(() => filename);
  }
}