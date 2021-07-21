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
        let items = {
          wine:    {
            x86_64: [],
            x86:    [],
          },
          staging: {
            x86_64: [],
            x86:    [],
          },
          tkg:     {
            x86_64: [],
            x86:    [],
          },
          proton:  {
            x86_64: [],
            x86:    [],
          },
        };

        data.forEach((release) => {
          release.assets.forEach((item) => {
            let arch = item.name.includes('amd64') ? 'x86_64' : 'x86';
            let name = item.name.replace('wine-', '').replace('.tar.xz', '').replace('-amd64', '').replace('-x86', '');

            let file = {
              name:     name,
              type:     'file',
              download: () => {
                return this.download(item.browser_download_url);
              },
            };

            if (item.name.includes('-proton-')) {
              file.name = _.trimEnd(file.name.replace('proton', '').replace('--', '-'), '-');
              items.proton[arch].push(file);
            } else if (item.name.includes('-tkg-')) {
              file.name = _.trimEnd(file.name.replace('staging-tkg', '').replace('tkg-staging', '').replace('-staging'), '-');
              items.tkg[arch].push(file);
            } else if (item.name.includes('-staging-')) {
              file.name = _.trimEnd(file.name.replace('-staging', ''), '-');
              items.staging[arch].push(file);
            } else {
              items.wine[arch].push(file);
            }
          });
        });

        this.data = Object.keys(items).map(name => {
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