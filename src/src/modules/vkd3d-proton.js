import FileSystem from "./file-system";
import Wine       from "./wine";
import Prefix     from "./prefix";
import Network    from "./network";
import Snapshot   from "./snapshot";
import Patch      from "./patch";
import System     from "./system";
import Patches    from "./patches";
import MyPatches  from "./my-patches";

export default class Vkd3dProton {
  /**
   * @type {string}
   */
  url = 'https://api.github.com/repos/HansKristian-Work/vkd3d-proton/releases';

  /**
   * @type {string|null}
   */
  remoteVersion = null;

  /**
   * @type {object|null}
   */
  releases = null;

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
   * @type {System}
   */
  system = null;

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
   * @param {System} system
   * @param {Patches} patches
   * @param {MyPatches} myPatches
   */
  constructor(prefix, fs, network, wine, snapshot, system, patches, myPatches) {
    this.prefix    = prefix;
    this.fs        = fs;
    this.network   = network;
    this.wine      = wine;
    this.snapshot  = snapshot;
    this.system    = system;
    this.patches   = patches;
    this.myPatches = myPatches;
  }

  /**
   * @param {boolean} force
   * @return {Promise<boolean>}
   */
  update(force = false) {
    if (!this.prefix.isVkd3dProton() || this.prefix.isBlocked() || !this.system.existsCommand('zstd')) {
      return Promise.resolve(false);
    }

    let version = this.prefix.getWinePrefixInfo('vkd3d-proton');

    if (!version) {
      return this.getRemoteVersion()
        .then((version) => {
          let patch = new Patch();
          patch.setConfigValue('name', 'VKD3D-Proton');
          patch.setConfigValue('version', version);
          patch.setConfigValue('created', true);
          patch.path = null;

          let existPatch = this.myPatches.findByCode(patch.getCode());

          if (existPatch && this.patches.appendAndApply(existPatch)) {
            return;
          }

          return Promise.resolve()
            .then(() => this.snapshot.createBefore())
            .then(() => this.prefix.setWinePrefixInfo('vkd3d-proton', version))
            .then(() => this.getReleases())
            .then((releases) => {
              let last     = _.head(releases);
              let asset    = _.head(last.assets);
              let url      = asset.browser_download_url;
              let filename = asset.name;
              let cache    = `${this.prefix.getCacheDir()}/vkd3d-proton`;

              if (this.fs.exists(cache)) {
                this.fs.rm(cache);
              }

              this.fs.mkdir(cache);

              return this.network.downloadTarZst(url, `${cache}/${filename}`)
                .then(() => {
                  if (this.fs.exists(`${cache}/x64`)) {
                    return cache;
                  }

                  let root = cache;

                  this.fs.glob(`${root}/*`).forEach((path) => {
                    if (this.fs.isDirectory(path) && this.fs.exists(`${path}/x64`)) {
                      root = path;
                    }
                  });

                  return root;
                })
                .then((root) => {
                  let system32 = this.prefix.getSystem32();
                  let system64 = this.prefix.getSystem64();

                  [ 'x64', 'x86' ].forEach((arch) => {
                    if (!system64 && 'x64' === arch) {
                      return;
                    }

                    this.fs.glob(`${root}/${arch}/*\.dll`).forEach((pathFile) => {
                      let filename = this.fs.basename(pathFile);


                      let path = `${system32}/${filename}`;

                      if ('x64' === arch) {
                        path = `${system64}/${filename}`;
                      }

                      if (this.fs.exists(path)) {
                        this.fs.rm(path);
                      }

                      this.fs.cp(pathFile, path);
                      this.wine.regsvr32(filename);
                      this.wine.run('reg', 'add', 'HKEY_CURRENT_USER\\Software\\Wine\\DllOverrides', '/v', `*${filename}`, '/d', 'native', '/f');
                    });
                  });

                  if (this.fs.exists(cache)) {
                    this.fs.rm(cache);
                  }
                });
            })
            .then(() => {
              patch.save();
              this.snapshot.createAfter();
              this.snapshot.moveToPatch(patch);
              patch.save();
              this.myPatches.append(patch);
            });
        });
    }

    if (!this.prefix.isVkd3dProtonAutoupdate() && !force) {
      return Promise.resolve(true);
    }

    return this.getRemoteVersion()
      .then((remoteVersion) => {
        if (this.getLocalVersion() !== remoteVersion) {
          this.prefix.setWinePrefixInfo('vkd3d-proton', '');
          return this.update();
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
        .then(() => this.getReleases())
        .then(version => {
          this.remoteVersion = version[0].tag_name;
          return this.remoteVersion;
        });
    }

    return promise;
  }

  /**
   * @return {string|null}
   */
  getLocalVersion() {
    return this.prefix.getWinePrefixInfo('vkd3d-proton');
  }

  /**
   * @return {Promise}
   */
  getReleases() {
    if (null !== this.releases) {
      return Promise.resolve(this.releases);
    }

    return this.network.getJSON(this.url)
      .then((releases) => {
        this.releases = releases;
        return releases;
      });
  }
}