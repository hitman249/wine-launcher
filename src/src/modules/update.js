import Prefix     from "./prefix";
import FileSystem from "./file-system";
import Network    from "./network";

export default class Update {

    version = '1.3.8';

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
     * @returns {Promise}
     */
    downloadWinetricks() {
        let url  = 'https://raw.githubusercontent.com/Winetricks/winetricks/master/src/winetricks';
        let path = this.prefix.getWinetricksFile();

        if (this.fs.exists(path)) {
            let createAt  = this.fs.getCreateDate(path);
            let currentAt = new Date();

            if (createAt && ((currentAt.getTime() - createAt.getTime()) / 1000) > 86400) {
                return this.network.download(url, path);
            }
        } else {
            return this.network.download(url, path);
        }

        return Promise.resolve();
    }

    /**
     * @returns {Promise}
     */
    downloadSquashfuse() {
        let url  = this.network.getRepo('/squashfuse');
        let path = this.prefix.getSquashfuseFile();

        if (!this.fs.exists(path)) {
            return this.network.download(url, path);
        }

        return Promise.resolve();
    }

    /**
     * @return {string}
     */
    getVersion() {
        return this.version;
    }
}