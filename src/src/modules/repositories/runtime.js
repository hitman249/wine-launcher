import AppFolders from "../app-folders";
import FileSystem from "../file-system";
import Network from "../network";
import Utils from "../utils";

export default class Runtime {
  /**
   * @type {string}
   */
  url = 'https://api.github.com/repos/bottlesdevs/runtime/releases';

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
      name:   'Runtime',
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
        const item = data[0];

        this.data = {
          name:     item.name || item.tag_name,
          type:     'file',
          download: () => {
            let asset = Utils.findAssetArchive(item.assets);
            let url   = asset.browser_download_url;
            return this.download(url);
          },
        };
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

  /**
   * @return {Promise<*>}
   */
  install() {
    return this.getList()
      .then((item) => item.download())
      .then((filename) => {
        let cacheDir    = this.appFolders.getCacheDir();
        let path        = `${cacheDir}/${filename}`;
        let runtimePath = `${cacheDir}/_runtime`;

        if (this.fs.exists(path)) {
          this.fs.unpack(path, runtimePath, true);
        }

        if (this.fs.exists(runtimePath)) {
          let lib32  = `${runtimePath}/runtime/lib32`;
          let i386   = `${runtimePath}/runtime/lib/i386-linux-gnu`;
          let x86_64 = `${runtimePath}/runtime/lib/x86_64-linux-gnu`;

          [lib32, i386].forEach((path) => {
            this.fs.glob(`${path}/*`)
              .forEach((path) => {
                let filename = this.fs.basename(path);
                let outPath  = `${this.appFolders.getLibsDir()}/${filename}`;

                if (this.fs.exists(path) && !this.fs.exists(outPath)) {
                  this.fs.cp(path, outPath);
                }
              });
          });

          [x86_64].forEach((path) => {
            this.fs.glob(`${path}/*`)
              .forEach((path) => {
                let filename = this.fs.basename(path);
                let outPath  = `${this.appFolders.getLibs64Dir()}/${filename}`;

                if (this.fs.exists(path) && !this.fs.exists(outPath)) {
                  this.fs.cp(path, outPath);
                }
              });
          });

          this.fs.rm(runtimePath);
        }
      });
  }

  /**
   * @param {string} field
   * @returns {*|undefined}
   */
  getInfo(field) {
    let path = this.appFolders.getShareDir() + '/' + field;

    if (this.fs.exists(path)) {
      return Utils.jsonDecode(this.fs.fileGetContents(path));
    }
  }

  /**
   * @param {string} field
   * @param {*} value
   * @returns {*|null}
   */
  setInfo(field, value) {
    let path = this.appFolders.getShareDir() + '/' + field;
    this.fs.filePutContents(path, Utils.jsonEncode(value));
  }

  update() {
    let prefix = window.app.getPrefix();

    if (prefix.isRuntime()) {
      if (this.getInfo('runtime')) {
        return;
      }

      this.setInfo('runtime', true);

      return this.install();
    }

    return Promise.resolve();
  }
}