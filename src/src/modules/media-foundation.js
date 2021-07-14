import Command    from "./command";
import AppFolders from "./app-folders";
import Prefix     from "./prefix";
import FileSystem from "./file-system";
import Network    from "./network";
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
   * @type {AppFolders}
   */
  appFolders = null;

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
   * @param {AppFolders} appFolders
   * @param {Prefix} prefix
   * @param {Command} command
   * @param {FileSystem} fs
   * @param {Network} network
   * @param {Snapshot} snapshot
   * @param {Patches} patches
   * @param {MyPatches} myPatches
   */
  constructor(appFolders, prefix, command, fs, network, snapshot, patches, myPatches) {
    this.appFolders = appFolders;
    this.prefix     = prefix;
    this.fs         = fs;
    this.command    = command;
    this.network    = network;
    this.snapshot   = snapshot;
    this.patches    = patches;
    this.myPatches  = myPatches;
  }

  /**
   * @return {Promise<boolean>}
   */
  update() {
    let wine = window.app.getKernel();

    if (!this.prefix.isMediaFoundation() || wine.isBlocked() || 'win32' === wine.getWineArch()) {
      return Promise.resolve(false);
    }

    let promise     = Promise.resolve(false);
    let isInstalled = wine.getWinePrefixInfo('mf');

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
            .then(() => wine.setWinePrefixInfo('mf', true))
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
              let cacheDir             = this.appFolders.getCacheDir();
              let cacheFile            = `${cacheDir}/${filename}`;
              let cacheUnpackDir       = `${cacheDir}/mf`;
              let cachePrefixUnpackDir = `${wine.getWinePrefixCacheDir()}/mf`;

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

              let wineDir = `${wine.getWineDir()}`;
              let bin     = `${wineDir}/bin`;
              let exports = {
                WINEPREFIX: wine.getWinePrefix(),
              };

              if (this.fs.exists(bin)) {
                exports.PATH        = `${bin}:$PATH`;
                exports.WINESERVER  = `${bin}/wineserver`;
                exports.WINELOADER  = `${bin}/wine`;
                exports.WINEDLLPATH = `${wineDir}/lib/wine:${wineDir}/lib64/wine`;
              }

              let env = Object.keys(exports).map(field => `${field}="${exports[field]}"`).join(' ');

              this.command.exec(`cd "${cachePrefixUnpackDir}" && env ${env} "${shFile}"`);

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
    let cacheDir = this.appFolders.getCacheDir();
    let filename = this.fs.basename(url);

    return this.network.download(url, `${cacheDir}/${filename}`).then(() => filename);
  }
}