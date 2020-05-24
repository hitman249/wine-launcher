import Prefix     from "./prefix";
import FileSystem from "./file-system";
import Network    from "./network";

export default class ProtonTKG {
    /**
     * @type {string}
     */
    url = 'https://api.github.com/repos/Frogging-Family/wine-tkg-git/releases';

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
            name:   'Proton TKG',
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
                this.data = data.map((item) => ({
                    name:     item.tag_name,
                    type:     'file',
                    download: () => {
                        let asset = _.find(item.assets, (item) => _.startsWith(item.name, 'proton'));
                        let url   = asset.browser_download_url;
                        return this.download(url);
                    },
                }));
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