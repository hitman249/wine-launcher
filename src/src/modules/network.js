import _ from "lodash";

const dns           = require('dns');
const { remote }    = require('electron');
const fetch         = remote.getGlobal('fetch');
const fs            = remote.getGlobal('fs');
const path          = require('path');
const cookieParser  = require('cookie');
const child_process = require('child_process');

export default class Network {

    /**
     * @type {string}
     */
    repository = 'https://raw.githubusercontent.com/hitman249/wine-launcher/master';

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
     * @param {string|string[]} cookie
     * @return {{}}
     */
    cookieParse(cookie) {
        if (Array.isArray(cookie)) {
            let result = {};
            _.forEach(cookie, (line) => {
                result = Object.assign(result, cookieParser.parse(line));
            });

            return result;
        }

        return cookieParser.parse(cookie);
    }

    /**
     * @param {{}} cookie
     * @return {string}
     */
    cookieStringify(cookie) {
        return _.map(cookie, (value, name) => cookieParser.serialize(name, value)).join('; ');
    }

    /**
     * @param {{}} headers
     * @return {{}}
     */
    headersParse(headers) {
        let result = {};
        headers.forEach((value, key) => { result[key] = value; });

        return result;
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
            .then((res) => {
                return new Promise((resolve, reject) => {
                    const fileStream = fs.createWriteStream(
                        filepath, { mode: this.fileSettings.mode, autoClose: true }
                    );

                    res.body.on('end', resolve);
                    fileStream.on('error', reject);
                    res.body.pipe(fileStream);
                });
            });
    }

    /**
     * @returns {Promise}
     */
    isConnected() {
        return new Promise((resolve, reject) => {
            if (null !== this.connected) {
                return this.connected ? resolve() : reject();
            }

            dns.lookupService('8.8.8.8', 53, (err, hostname, service) => {
                this.connected = !err;
                return this.connected ? resolve() : reject();
            });
        });
    }

    /**
     * @param {string} postfix
     * @returns {string}
     */
    getRepo(postfix = '') {
        return this.repository + postfix;
    }

    /**
     * @param {string} url
     * @param {string} filepath
     * @returns {Promise}
     */
    downloadTarGz(url, filepath) {
        return this.download(url, filepath).then(() => {
            try {
                if (fs.existsSync(filepath)) {
                    child_process.execSync(`tar -xzf "${filepath}" -C "${path.dirname(filepath)}"`);
                }

                if (fs.existsSync(filepath)) {
                    fs.unlinkSync(filepath);
                }
            } catch (e) {
            }
        });
    }
}