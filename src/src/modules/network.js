const fetch            = require('node-fetch');
const fs               = require('fs');
const { promisify }    = require('util');
const writeFilePromise = promisify(fs.writeFile);
const dns              = require('dns');

export default class Network {

    /**
     * @type {Config}
     */
    config = null;

    /**
     * @type {boolean|null}
     */
    connected = null;

    fileSettings = {
        flags:     'w',
        encoding:  'utf8',
        fd:        null,
        mode:      0o755,
        autoClose: false,
    };

    options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/71.0.3578.80 Chrome/71.0.3578.80 Safari/537.36',
        },
    };

    /**
     * @param {Config} config
     */
    constructor(config) {
        this.config  = config;
    }

    /**
     * @param {string} url
     * @returns {Promise}
     */
    get(url) {
        return this.isConnected()
            .then(() => fetch(url, this.options))
            .then(response => response.text());
    }

    /**
     * @param {string} url
     * @returns {Promise}
     */
    getJSON(url) {
        return this.isConnected()
            .then(() => fetch(url, this.options))
            .then(response => response.json());
    }

    /**
     * @param {string} url
     * @param {string} filepath
     * @returns {Promise}
     */
    download(url, filepath) {
        return this.isConnected()
            .then(() => fetch(url, this.options))
            .then(response => response.arrayBuffer())
            .then(buffer => writeFilePromise(filepath, Buffer.from(buffer), { mode: this.fileSettings.mode }));
    }

    /**
     * @returns {Promise}
     */
    isConnected() {
        return new Promise(((resolve, reject) => {
            if (null !== this.connected) {
                return this.connected ? resolve() : reject();
            }

            dns.lookupService('8.8.8.8', 53, (err, hostname, service) => {
                this.connected = !err;
                return this.connected ? resolve() : reject();
            });
        }));
    }
}