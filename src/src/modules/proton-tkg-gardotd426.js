import Prefix     from "./prefix";
import FileSystem from "./file-system";
import Network    from "./network";
import Utils      from "./utils";

export default class ProtonTkgGardotd426 {
  /**
   * @type {string}
   */
  url = 'https://api.github.com/repos/gardotd426/proton-tkg/releases';

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
      name:   'Proton TKG: Gardotd426',
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
        this.data = data.map((item) => {
          let asset = Utils.findAssetArchive(item.assets);

          return {
            name:     asset.name,
            type:     'file',
            download: () => {
              let url   = asset.browser_download_url;
              return this.download(url);
            },
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
    let cacheDir = this.prefix.getCacheDir();
    let filename = this.fs.basename(url);

    return this.network.download(url, `${cacheDir}/${filename}`).then(() => filename);
  }
}