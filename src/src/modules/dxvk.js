import FileSystem from "./file-system";
import Wine       from "./wine";
import Prefix     from "./prefix";
import Network    from "./network";
import Snapshot   from "./snapshot";
import Patch      from "./patch";

export default class Dxvk {

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
     * @param {Prefix} prefix
     * @param {FileSystem} fs
     * @param {Network} network
     * @param {Wine} wine
     * @param {Snapshot} snapshot
     */
    constructor(prefix, fs, network, wine, snapshot) {
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
        if (!this.prefix.isDxvk()) {
            return Promise.resolve(false);
        }

        let version = this.prefix.getWinePrefixInfo('dxvk');

        if (!version) {
            this.snapshot.createBefore();

            return this.getRemoteVersion()
                .then(version => this.prefix.setWinePrefixInfo('dxvk', version.trim()))
                .then(() => this.getConfig())
                .then(config => {
                    if (!this.fs.exists(this.prefix.getDxvkConfFile())) {
                        this.fs.filePutContents(this.prefix.getDxvkConfFile(), config);
                    }
                })
                .then(() => this.fs.lnOfRoot(this.prefix.getDxvkConfFile(), this.prefix.getWinePrefixDxvkConfFile()))
                .then(() => this.wine.winetricks('dxvk'))
                .then(() => {
                    let patch = new Patch();
                    patch.setConfigValue('name', 'DXVK');
                    patch.setConfigValue('version', this.prefix.getWinePrefixInfo('dxvk'));
                    patch.setConfigValue('created', true);
                    patch.save();

                    this.snapshot.createAfter();
                    this.snapshot.moveToPatch(patch);

                    patch.save();
                });
        }

        if (!this.prefix.isDxvkAutoupdate()) {
            return Promise.resolve(false);
        }

        return this.getRemoteVersion()
            .then(latest => {
                if (latest.trim() !== version) {
                    this.prefix.setWinePrefixInfo('dxvk', latest.trim());

                    let promise = Promise.resolve();

                    if (!this.fs.exists(this.prefix.getDxvkConfFile())) {
                        promise = this.getConfig()
                            .then(config => this.fs.filePutContents(this.prefix.getDxvkConfFile(), config));
                    }

                    return promise
                        .then(() => this.fs.lnOfRoot(this.prefix.getDxvkConfFile(), this.prefix.getWinePrefixDxvkConfFile()))
                        .then(() => this.wine.winetricks('dxvk'));
                }
            });
    }

    /**
     * @return {Promise<string>}
     */
    getRemoteVersion() {
        return this.network.get('https://raw.githubusercontent.com/doitsujin/dxvk/master/RELEASE');
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