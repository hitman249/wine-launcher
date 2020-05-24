import _          from "lodash";
import Utils      from "./utils";
import Prefix     from "./prefix";
import FileSystem from "./file-system";
import Network    from "./network";

const child_process = require('child_process');

export default class Update {

    version = '1.4.11';

    /**
     * @type {string}
     */
    api = 'https://api.github.com/repos/hitman249/wine-launcher/releases';

    /**
     * @type {object|null}
     */
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
     * @returns {Promise}
     */
    downloadWinetricks() {
        let url  = 'https://raw.githubusercontent.com/Winetricks/winetricks/master/src/winetricks';
        let path = this.prefix.getWinetricksFile();
        let log  = this.prefix.getLogsDir() + `/winetricks-list-all.log`;

        if (this.fs.exists(path)) {
            let createAt  = this.fs.getCreateDate(path);
            let currentAt = new Date();

            if (createAt && ((currentAt.getTime() - createAt.getTime()) / 1000) > 86400) {
                if (this.fs.exists(log)) {
                    this.fs.rm(log);
                }

                return this.network.download(url, path);
            }
        } else {
            if (this.fs.exists(log)) {
                this.fs.rm(log);
            }

            return this.network.download(url, path);
        }

        return Promise.resolve();
    }

    /**
     * @returns {Promise}
     */
    downloadSquashfuse() {
        let url  = this.network.getRepo('/bin/squashfuse');
        let path = this.prefix.getSquashfuseFile();

        if (!this.fs.exists(path)) {
            return this.network.download(url, path);
        }

        return Promise.resolve();
    }

    /**
     * @returns {Promise}
     */
    downloadFuseiso() {
        let url  = this.network.getRepo('/bin/fuseiso');
        let path = this.prefix.getFuseisoFile();

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

    /**
     * @return {Promise<string>}
     */
    getRemoteVersion() {
        let promise = Promise.resolve();

        if (this.data) {
            promise = promise.then(() => this.data);
        } else {
            promise = promise.then(() => this.network.getJSON(this.api)).then((data) => {
                this.data = data;
                return data;
            });
        }

        return promise.then((data) => {
            let last = _.head(data);
            return _.trimStart(last.tag_name, 'v');
        });
    }

    /**
     * @return {Promise<void>}
     */
    updateSelf() {
        let startFile        = this.prefix.getBinDir() + '/start';
        let updateFile       = this.prefix.getCacheDir() + '/start';
        let updateScriptFile = this.prefix.getCacheDir() + '/update.sh';

        if (!this.fs.exists(startFile)) {
            startFile = this.prefix.getRootDir() + '/start';
        }

        if (!this.fs.exists(startFile)) {
            return Promise.resolve();
        }

        if (this.fs.exists(updateFile)) {
            this.fs.rm(updateFile);
        }

        const updateScript = `#!/usr/bin/env sh

processPid=${window.process.pid}
startFile="${startFile}"
updateFile="${updateFile}"
iterator=0

while [ "$(ps -p $processPid -o comm=)" != "" ]; do
  sleep 1
  iterator=$((iterator + 1))

  if [ $iterator -gt 120 ]; then
    echo "Error update, exit."
    exit
  fi

  echo "Waiting for process to complete"
done

rm -rf "$startFile"
mv "$updateFile" "$startFile"
chmod +x "$startFile"

"$startFile" &
rm -rf "${updateScriptFile}"`;

        let promise = this.getRemoteVersion().then(() => this.data);

        return promise.then((data) => {
            let last = _.head(data);
            last     = _.head(last.assets);

            return this.network.download(last.browser_download_url, updateFile)
                .then(() => {
                    this.fs.filePutContents(updateScriptFile, updateScript);
                    this.fs.chmod(updateScriptFile);

                    try {
                        const child = child_process.spawn(updateScriptFile, [], {
                            detached: true,
                            stdio:    ['ignore']
                        });

                        child.unref();
                    } catch (e) {
                    }

                    return Utils.sleep(1000).then(() => window.app.getSystem().closeApp());
                });
        });
    }
}