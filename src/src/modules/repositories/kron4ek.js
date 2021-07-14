import _          from "lodash";
import AppFolders from "../app-folders";
import FileSystem from "../file-system";
import Network    from "../network";

export default class Kron4ek {
  /**
   * @type {string}
   */
  url = 'https://api.github.com/repos/Kron4ek/Wine-Builds/releases';

  data = null;

  /**
   * @type {AppFolders}
   */
  appFolders = null;

  /**
   * @type {FileSystem}
   */
  fs = null;

  /**
   * @type {Network}
   */
  network = null;

  /**
   * @param {AppFolders} appFolders
   * @param {FileSystem} fs
   * @param {Network} network
   */
  constructor(appFolders, fs, network) {
    this.appFolders = appFolders;
    this.fs         = fs;
    this.network    = network;
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
  getList() {
    let promise = Promise.resolve();

    if (null === this.data) {
      promise = this.network.getJSON(this.url).then((data) => {
        let items = {};
        let keys  = [];

        data.forEach((release) => {
          release.assets.forEach((item) => {
            let name    = item.name.replace('wine-', '').replace('.tar.xz', '');
            let arch    = item.name.includes('amd64') ? 'amd64' : 'x86';
            let version = name.match(/^([0-9]+\.[0-9]+-([0-9]+-|))/gm)[0];
            name        = _.trimEnd(name.replace(version, '').replace(/amd64$/, '').replace(/x86$/, ''), '-');
            version     = _.trimEnd(version, '-');

            if (!name) {
              name = 'wine';
            }

            if (undefined === items[name]) {
              items[name] = {};
            }

            if (undefined === items[name][version]) {
              items[name][version] = [];
            }

            if (!keys.includes(name)) {
              keys.push(name);
            }

            items[name][version].push({
              name:     arch,
              type:     'file',
              download: () => {
                return this.download(item.browser_download_url);
              },
            });
          });
        });

        this.data = keys.map(name => {
          let versions = items[name];
          return {
            name:   name,
            type:   'dir',
            nested: Object.keys(versions).map(version => ({
              name:   version,
              type:   'dir',
              nested: items[name][version],
            })),
          };
        });
      });
    }

    return promise.then(() => this.data);
  }

  /**
   * @param {string} url
   * @return Promise<string>
   */
  download(url) {
    let cacheDir = this.appFolders.getCacheDir();
    let filename = this.fs.basename(url);

    return this.network.download(url, `${cacheDir}/${filename}`).then(() => filename);
  }
}