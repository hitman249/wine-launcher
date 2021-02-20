import FileSystem from "./file-system";
import Wine       from "./wine";
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
   * @param {Prefix} prefix
   * @param {FileSystem} fs
   * @param {Network} network
   * @param {Wine} wine
   * @param {Snapshot} snapshot
   * @param {Patches} patches
   * @param {MyPatches} myPatches
   */
  constructor(prefix, fs, network, wine, snapshot, patches, myPatches) {
    this.prefix    = prefix;
    this.fs        = fs;
    this.network   = network;
    this.wine      = wine;
    this.snapshot  = snapshot;
    this.patches   = patches;
    this.myPatches = myPatches;
  }

  /**
   * @param {boolean} force
   * @return {Promise<boolean>}
   */
  update(force = false) {
    if (!this.prefix.isDxvk() || this.prefix.isBlocked()) {
      return Promise.resolve(false);
    }

    let version = this.prefix.getWinePrefixInfo('dxvk');

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
            .then(() => this.prefix.setWinePrefixInfo('dxvk', version))
            .then(() => this.wine.winetricks('dxvk'))
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
          if (!this.fs.exists(this.prefix.getDxvkConfFile())) {
            this.fs.filePutContents(this.prefix.getDxvkConfFile(), config);
          }
        })
        .then(() => this.fs.lnOfRoot(this.prefix.getDxvkConfFile(), this.prefix.getWinePrefixDxvkConfFile()));
    }

    let promise = Promise.resolve();

    if (this.fs.exists(this.prefix.getDxvkConfFile())) {
      if (!this.fs.exists(this.prefix.getWinePrefixDxvkConfFile())) {
        this.fs.lnOfRoot(this.prefix.getDxvkConfFile(), this.prefix.getWinePrefixDxvkConfFile());
      }
    } else {
      promise = promise
        .then(() => this.getConfig())
        .then(config => this.fs.filePutContents(this.prefix.getDxvkConfFile(), config))
        .then(() => this.fs.lnOfRoot(this.prefix.getDxvkConfFile(), this.prefix.getWinePrefixDxvkConfFile()));
    }

    if (!this.prefix.isDxvkAutoupdate() && !force) {
      return promise;
    }

    return promise
      .then(() => this.getRemoteVersion())
      .then(latest => {
        if (latest !== version) {
          this.prefix.setWinePrefixInfo('dxvk', latest);

          let promise = Promise.resolve();

          if (!this.fs.exists(this.prefix.getDxvkConfFile())) {
            promise = this.getConfig()
              .then(config => this.fs.filePutContents(this.prefix.getDxvkConfFile(), config));
          }

          return promise
            .then(() => this.fs.lnOfRoot(this.prefix.getDxvkConfFile(), this.prefix.getWinePrefixDxvkConfFile()))
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

              return this.wine.winetricks('dxvk');
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
    return this.prefix.getWinePrefixInfo('dxvk');
  }

  /**
   * @return {Promise<string>}
   */
  getConfig() {
    return this.network.get('https://raw.githubusercontent.com/doitsujin/dxvk/master/dxvk.conf');
  }
}