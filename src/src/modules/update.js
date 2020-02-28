import Config     from "./config";
import Command    from "./command";
import FileSystem from "./file-system";
import Network    from "./network";
import System     from "./system";

export default class Update {

    /**
     * @type {Config}
     */
    config = null;

    /**
     * @type {Command}
     */
    command = null;

    /**
     * @type {System}
     */
    system = null;

    /**
     * @type {FileSystem}
     */
    fs = null;

    /**
     * @type {Network}
     */
    network = null;

    /**
     * @param {Config} config
     * @param {Command} command
     * @param {System} system
     * @param {FileSystem} fs
     * @param {Network} network
     */
    constructor(config, command, system, fs, network) {
        this.config  = config;
        this.command = command;
        this.system  = system;
        this.fs      = fs;
        this.network = network;
    }

    /**
     * @returns {Promise}
     */
    downloadWinetricks() {
        let url  = 'https://raw.githubusercontent.com/Winetricks/winetricks/master/src/winetricks';
        let path = this.config.getWinetricksFile();

        if (this.fs.exists(path)) {
            let createAt  = this.fs.getCreateDate(path);
            let currentAt = new Date();

            if (createAt && ((currentAt.getTime() - createAt.getTime()) / 1000) > 86400 ) {
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
        let path = this.config.getSquashfuseFile();

        if (!this.fs.exists(path)) {
            return this.network.download(url, path);
        }

        return Promise.resolve();
    }
}