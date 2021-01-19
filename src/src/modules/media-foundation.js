import Command    from "./command";
import Prefix     from "./prefix";
import FileSystem from "./file-system";
import Network    from "./network";
import Wine       from "./wine";
import Snapshot   from "./snapshot";
import Patch      from "./patch";

export default class MediaFoundation {
  /**
   * @type {string[]}
   */
  urls = [
    'https://github.com/z0z0z/mf-install/archive/master.zip',
    'https://lutris.nyc3.cdn.digitaloceanspaces.com/games/epic-games-store/mf-install-master.zip',
  ];

  /**
   * @type {Command}
   */
  command = null;

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
   * @type {Wine}
   */
  wine = null;

  /**
   * @type {Snapshot}
   */
  snapshot = null;

  /**
   * @param {Command} command
   * @param {Prefix} prefix
   * @param {FileSystem} fs
   * @param {Network} network
   * @param {Wine} wine
   * @param {Snapshot} snapshot
   */
  constructor(command, prefix, fs, network, wine, snapshot) {
    this.command  = command;
    this.prefix   = prefix;
    this.fs       = fs;
    this.network  = network;
    this.wine     = wine;
    this.snapshot = snapshot;
  }

  /**
   * @return {Promise<boolean>}
   */
  update() {
    if (!this.prefix.isMediaFoundation() || this.prefix.isBlocked() || 'win32' === this.prefix.getWineArch()) {
      return Promise.resolve(false);
    }

    let promise     = Promise.resolve(false);
    let isInstalled = this.prefix.getWinePrefixInfo('mf');

    if (!isInstalled) {
      this.snapshot.createBefore();
      this.prefix.setWinePrefixInfo('mf', true);

      promise = promise
        .then(() => {
          const download = (i = 0) => {
            if (this.urls.length <= i) {
              return false;
            }

            return this.download(this.urls[i]).then(f => f, () => download(i + 1));
          };

          return download();
        })
        .then((filename) => {
          let cacheDir             = this.prefix.getCacheDir();
          let cacheFile            = `${cacheDir}/${filename}`;
          let cacheUnpackDir       = `${cacheDir}/mf`;
          let cachePrefixUnpackDir = `${this.prefix.getWinePrefixCacheDir()}/mf`;

          if (!this.fs.exists(cacheFile)) {
            return false;
          }

          if (this.fs.exists(cacheUnpackDir)) {
            this.fs.rm(cacheUnpackDir);
          }

          if (!this.fs.unpackSimpleZip(cacheFile, cacheUnpackDir)) {
            return false;
          }

          let shFile = `${cachePrefixUnpackDir}/mf-install.sh`;

          if (!this.fs.exists(shFile)) {
            return false;
          }

          this.fs.chmod(shFile);

          let wine    = `${this.prefix.getWineDir()}`;
          let bin     = `${wine}/bin`;
          let exports = {
            WINEPREFIX: this.prefix.getWinePrefix(),
          };

          if (this.fs.exists(bin)) {
            exports.PATH        = `${bin}:$PATH`;
            exports.WINESERVER  = `${bin}/wineserver`;
            exports.WINELOADER  = `${bin}/wine`;
            exports.WINEDLLPATH = `${wine}/lib/wine:${wine}/lib64/wine`;
          }

          let env = Object.keys(exports).map(field => `${field}="${exports[field]}"`).join(' ');

          this.command.run(`cd "${cachePrefixUnpackDir}" && env ${env} "${shFile}"`);

          if (this.fs.exists(cacheUnpackDir)) {
            this.fs.rm(cacheUnpackDir);
          }

          return true;
        })
        .then((status) => {
          if (!status) {
            return false;
          }

          let patch = new Patch();
          patch.setConfigValue('name', 'MF');
          patch.setConfigValue('created', true);
          patch.save();

          this.snapshot.createAfter();
          this.snapshot.moveToPatch(patch);

          patch.save();
        });
    }

    return promise;
  }


  /**
   * @param {string} url
   */
  download(url) {
    let cacheDir = this.prefix.getCacheDir();
    let filename = this.fs.basename(url);

    return this.network.download(url, `${cacheDir}/${filename}`).then(() => filename);
  }
}