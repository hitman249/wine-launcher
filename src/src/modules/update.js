import _          from "lodash";
import Prefix     from "./prefix";
import FileSystem from "./file-system";
import Network    from "./network";

const child_process = require('child_process');
const fs            = require('fs');

export default class Update {

  version = '1.5.0';

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

    if (!this.fs.exists(path) || this.fs.size(path) !== 548328) {
      return this.network.download(url, path);
    }

    return Promise.resolve();
  }

  /**
   * @returns {Promise}
   */
  downloadDosbox() {
    let url  = this.network.getRepo('/bin/dosbox');
    let path = this.prefix.getDosboxFile();

    if (!this.fs.exists(path) || this.fs.size(path) !== 2776552) {
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
    let log              = this.prefix.getCacheDir() + '/update.log';

    if (!this.fs.exists(startFile)) {
      startFile = this.prefix.getRootDir() + '/start';
    }

    if (!this.fs.exists(startFile)) {
      return Promise.resolve();
    }

    if (this.fs.exists(updateFile)) {
      this.fs.rm(updateFile);
    }

    if (this.fs.exists(updateScriptFile)) {
      this.fs.rm(updateScriptFile);
    }

    if (this.fs.exists(log)) {
      this.fs.rm(log);
    }

    const updateScript = `#!/usr/bin/env sh

processPid=${window.process.pid}
startFile="${startFile}"
updateFile="${updateFile}"
iterator=0

echo "Start to update"

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

          return new Promise((resolve) => {
            try {
              let isNext = false;
              const next = () => {
                if (!isNext) {
                  isNext = true;
                  resolve();
                }
              };

              let out = fs.openSync(log, 'a');
              let err = fs.openSync(log, 'a');

              let child = child_process.spawn(updateScriptFile, [], {
                detached: true,
                stdio:    [ 'ignore', out, err ]
              });

              child.unref();
              child.stdout.on('data', (log) => next(log));
              child.stderr.on('data', (log) => next(log));
            } catch (e) {
              resolve();
            }
          });
        })
        .then(() => window.app.getSystem().closeApp());
    });
  }

  moveSelf() {
    let startFile        = this.prefix.getBinDir() + '/' + this.prefix.getStartFilename();
    let updateFile       = this.prefix.getStartFile();
    let updateScriptFile = this.prefix.getCacheDir() + '/update.sh';
    let log              = this.prefix.getCacheDir() + '/update.log';

    if (startFile === updateFile || !this.fs.exists(updateFile) || this.fs.exists(startFile)) {
      return Promise.resolve();
    }

    if (this.fs.exists(updateScriptFile)) {
      this.fs.rm(updateScriptFile);
    }

    if (this.fs.exists(log)) {
      this.fs.rm(log);
    }

    const updateScript = `#!/usr/bin/env sh

processPid=${window.process.pid}
startFile="${startFile}"
updateFile="${updateFile}"
iterator=0

echo "Start to update"

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

    return Promise.resolve()
      .then(() => {
        this.fs.filePutContents(updateScriptFile, updateScript);
        this.fs.chmod(updateScriptFile);

        return new Promise((resolve) => {
          try {
            let isNext = false;
            const next = () => {
              if (!isNext) {
                isNext = true;
                resolve();
              }
            };

            let out = fs.openSync(log, 'a');
            let err = fs.openSync(log, 'a');

            let child = child_process.spawn(updateScriptFile, [], {
              detached: true,
              stdio:    [ 'ignore', out, err ]
            });

            child.unref();
            child.stdout.on('data', (log) => next(log));
            child.stderr.on('data', (log) => next(log));
          } catch (e) {
            resolve();
          }
        });
      })
      .then(() => window.app.getSystem().closeApp());
  }
}