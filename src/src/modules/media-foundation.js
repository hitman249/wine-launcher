import Command    from "./command";
import Prefix     from "./prefix";
import FileSystem from "./file-system";
import Network    from "./network";
import Wine       from "./wine";
import Snapshot   from "./snapshot";
import Patch      from "./patch";
import Patches    from "./patches";
import MyPatches  from "./my-patches";

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
   * @type {Patches}
   */
  patches = null;

  /**
   * @type {MyPatches}
   */
  myPatches = null;

  /**
   * @param {Command} command
   * @param {Prefix} prefix
   * @param {FileSystem} fs
   * @param {Network} network
   * @param {Wine} wine
   * @param {Snapshot} snapshot
   * @param {Patches} patches
   * @param {MyPatches} myPatches
   */
  constructor(command, prefix, fs, network, wine, snapshot, patches, myPatches) {
    this.command   = command;
    this.prefix    = prefix;
    this.fs        = fs;
    this.network   = network;
    this.wine      = wine;
    this.snapshot  = snapshot;
    this.patches   = patches;
    this.myPatches = myPatches;
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
      promise = promise
        .then(() => {
          let patch = new Patch();
          patch.setConfigValue('name', 'MF');
          patch.setConfigValue('created', true);
          patch.path = null;

          let existPatch = this.myPatches.findByCode(patch.getCode());

          if (existPatch && this.patches.appendAndApply(existPatch)) {
            return true;
          }

          return Promise.resolve()
            .then(() => this.snapshot.createBefore())
            .then(() => this.prefix.setWinePrefixInfo('mf', true))
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

              patch.save();
              this.snapshot.createAfter();
              this.snapshot.moveToPatch(patch);
              patch.save();
              this.myPatches.append(patch);
            });
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