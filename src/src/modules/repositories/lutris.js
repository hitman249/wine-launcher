import _          from "lodash";
import AppFolders from "../app-folders";
import FileSystem from "../file-system";
import Network    from "../network";

export default class Lutris {
  /**
   * @type {string}
   */
  url = 'https://lutris.net/api/runners?format=json&search=wine';

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
      name:   'Lutris',
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
        let items  = _.get(data, 'results[0].versions', []);
        let groups = _.groupBy(items, 'architecture');
        let result = [];

        Object.keys(groups).forEach((folder) => {
          result.push({
            name:   folder,
            type:   'dir',
            nested: _.reverse(groups[folder].map(item => ({
              name:     item.version,
              type:     'file',
              download: () => this.download(item.url)
            }))),
          });
        });

        this.data = result;
      });
    }

    return promise.then(() => this.data);
  }

  /**
   * @param {string} url
   */
  download(url) {
    let cacheDir = this.appFolders.getCacheDir();
    let filename = this.fs.basename(url);

    return this.network.download(url, `${cacheDir}/${filename}`).then(() => filename);
  }
}