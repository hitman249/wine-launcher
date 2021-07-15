import AppFolders from "../app-folders";
import FileSystem from "../file-system";
import Network    from "../network";

export default class WineRunnerSc {
  /**
   * @type {string}
   */
  url = 'https://api.github.com/repos/snatella/wine-runner-sc/releases';

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
      name:   'Wine builds for Star Citizen: snatella',
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
        data.forEach((item) => {
          item.assets.forEach((asset) => {
            if ((_.startsWith(asset.name, 'wine') || _.startsWith(asset.name, 'proton')) && _.endsWith(asset.name, '.tgz')) {
              items.push({
                name:     '(' + item.tag_name + ') ' + asset.name,
                type:     'file',
                download: () => {
                  let url = asset.browser_download_url;
                  return this.download(url);
                },
              });
            }
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
    let cacheDir = this.appFolders.getCacheDir();
    let filename = this.fs.basename(url);

    return this.network.download(url, `${cacheDir}/${filename}`).then(() => filename);
  }
}