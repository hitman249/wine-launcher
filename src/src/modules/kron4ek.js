import Prefix     from "./prefix";
import FileSystem from "./file-system";
import Network    from "./network";

export default class Kron4ek {
  /**
   * @type {string}
   */
  url = 'https://api.github.com/repos/Kron4ek/Wine-Builds/releases';

  data = null;

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
  getList() {
    let promise = Promise.resolve();

    if (null === this.data) {
      promise = this.network.getJSON(this.url).then((data) => {
        let items = [];

        data.forEach((release) => {
          release.assets.forEach((item) => {
            items.push({
              name:     item.name.replace('wine-', '').replace('.tar.xz', ''),
              type:     'file',
              download: () => {
                return this.download(item.browser_download_url);
              },
            });
          });
        });

        this.data = items;
      });
    }

    return promise.then(() => this.data);
  }

  /**
   * @param {string} url
   * @return Promise<string>
   */
  download(url) {
    let cacheDir = this.prefix.getCacheDir();
    let filename = this.fs.basename(url);

    return this.network.download(url, `${cacheDir}/${filename}`).then(() => filename);
  }
}