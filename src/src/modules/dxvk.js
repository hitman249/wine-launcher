import FileSystem from "./file-system";
import AppFolders from "./app-folders";
import Prefix     from "./prefix";
import Network    from "./network";
import Snapshot   from "./snapshot";
import Patch      from "./patch";
import Patches    from "./patches";
import MyPatches  from "./my-patches";

export default class Dxvk {

  /**
   * @type {string|null}
   */
  remoteVersion = null;

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
   * @param {FileSystem} fs
   * @param {Network} network
   * @param {Snapshot} snapshot
   * @param {Patches} patches
   * @param {MyPatches} myPatches
   */
  constructor(appFolders, prefix, fs, network, snapshot, patches, myPatches) {
    this.appFolders = appFolders;
    this.prefix     = prefix;
    this.fs         = fs;
    this.network    = network;
    this.snapshot   = snapshot;
    this.patches    = patches;
    this.myPatches  = myPatches;
  }

  /**
   * @param {boolean} force
   * @return {Promise<boolean>}
   */
  update(force = false) {
    let wine = window.app.getKernel();

    if (!this.prefix.isDxvk() || wine.isBlocked()) {
      return Promise.resolve(false);
    }

    let version = wine.getWinePrefixInfo('dxvk');

    if (!version) {
      return this.getRemoteVersion()
        .then(version => {
          let patch = new Patch();
          patch.setConfigValue('name', 'DXVK');
          patch.setConfigValue('version', version);
          patch.setConfigValue('created', true);
          patch.path = null;

          let existPatch = this.myPatches.findByCode(patch.getCode());

          if (existPatch && this.patches.appendAndApply(existPatch)) {
            return;
          }

          return Promise.resolve()
            .then(() => this.snapshot.createBefore())
            .then(() => wine.setWinePrefixInfo('dxvk', version))
            .then(() => wine.winetricks('dxvk'))
            .then(() => {
              patch.save();
              this.snapshot.createAfter();
              this.snapshot.moveToPatch(patch);
              patch.save();
              this.myPatches.append(patch);
            });
        })
        .then(() => this.getConfig())
        .then(config => {
          if (!this.fs.exists(this.appFolders.getDxvkConfFile())) {
            this.fs.filePutContents(this.appFolders.getDxvkConfFile(), config);
          }
        })
        .then(() => this.fs.lnOfRoot(this.appFolders.getDxvkConfFile(), wine.getWinePrefixDxvkConfFile()));
    }

    let promise = Promise.resolve();

    if (this.fs.exists(this.appFolders.getDxvkConfFile())) {
      if (!this.fs.exists(wine.getWinePrefixDxvkConfFile())) {
        this.fs.lnOfRoot(this.appFolders.getDxvkConfFile(), wine.getWinePrefixDxvkConfFile());
      }
    } else {
      promise = promise
        .then(() => this.getConfig())
        .then(config => this.fs.filePutContents(this.appFolders.getDxvkConfFile(), config))
        .then(() => this.fs.lnOfRoot(this.appFolders.getDxvkConfFile(), wine.getWinePrefixDxvkConfFile()));
    }

    if (!this.prefix.isDxvkAutoupdate() && !force) {
      return promise;
    }

    return promise
      .then(() => this.getRemoteVersion())
      .then(latest => {
        if (latest !== version) {
          wine.setWinePrefixInfo('dxvk', latest);

          let promise = Promise.resolve();

          if (!this.fs.exists(this.appFolders.getDxvkConfFile())) {
            promise = this.getConfig()
              .then(config => this.fs.filePutContents(this.appFolders.getDxvkConfFile(), config));
          }

          return promise
            .then(() => this.fs.lnOfRoot(this.appFolders.getDxvkConfFile(), wine.getWinePrefixDxvkConfFile()))
            .then(() => {
              let patch = new Patch();
              patch.setConfigValue('name', 'DXVK');
              patch.setConfigValue('version', latest);
              patch.setConfigValue('created', true);
              patch.path = null;

              let existPatch = this.myPatches.findByCode(patch.getCode());

              if (existPatch && this.patches.appendAndApply(existPatch)) {
                return;
              }

              return wine.winetricks('dxvk');
            });
        }
      });
  }

  /**
   * @return {Promise<boolean>}
   */
  updateForce() {
    return this.update(true);
  }

  /**
   * @return {Promise<string>}
   */
  getRemoteVersion() {
    let promise = Promise.resolve();

    if (this.remoteVersion) {
      promise = promise.then(() => this.remoteVersion);
    } else {
      promise = promise
        .then(() => this.network.get('https://raw.githubusercontent.com/doitsujin/dxvk/master/RELEASE'))
        .then(version => {
          this.remoteVersion = version.trim();
          return this.remoteVersion;
        });
    }

    return promise;
  }

  /**
   * @return {string|null}
   */
  getLocalVersion() {
    let wine = window.app.getKernel();
    return wine.getWinePrefixInfo('dxvk');
  }

  /**
   * @return {Promise<string>}
   */
  getConfig() {
    return this.network.get('https://raw.githubusercontent.com/doitsujin/dxvk/master/dxvk.conf');
  }
}