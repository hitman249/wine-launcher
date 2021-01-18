import Utils      from "./utils";
import FileSystem from "./file-system";
import Prefix     from "./prefix";
import Network    from "./network";

export default class MangoHud {

    /**
     * @type {string}
     */
    repo = 'https://api.github.com/repos/flightlessmango/MangoHud/releases/latest';

    /**
     * @type {string}
     */
    launcherRepo = 'https://raw.githubusercontent.com/hitman249/wine-launcher/master';

    /**
     * @type {string}
     */
    version = '0.5.1';

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
     * @return {Promise<void>}
     */
    update() {
        let promise = Promise.resolve();

        let implicitLayers = this.prefix.getCacheImplicitLayerDir();
        let file32         = `${implicitLayers}/MangoHud.x86.json`;
        let file64         = `${implicitLayers}/MangoHud.x86_64.json`;
        let size           = {
            main:  {
                32: 1776104,
                64: 1686600,
            },
            dlsym: {
                32: 20904,
                64: 22240,
            },
        };

        const validate = (main, dlsym, arch) => {
            if (this.fs.exists(main) && !this.fs.exists(dlsym)) {
                this.fs.rm(main);
                return;
            }

            if (!this.fs.exists(main) && this.fs.exists(dlsym)) {
                this.fs.rm(dlsym);
                return;
            }

            if (this.fs.size(main) !== size.main[arch] || this.fs.size(dlsym) !== size.dlsym[arch]) {
                if (this.fs.exists(main)) {
                    this.fs.rm(main);
                }
                if (this.fs.exists(dlsym)) {
                    this.fs.rm(dlsym);
                }
            }
        };

        if (!this.fs.exists(implicitLayers)) {
            this.fs.mkdir(implicitLayers);
        }

        if (!this.prefix.isMangoHud()) {
            return promise;
        }

        this.fs.filePutContents(file32, Utils.jsonEncode(this.getLayer32()));
        this.fs.filePutContents(file64, Utils.jsonEncode(this.getLayer64()));

        let win32      = this.prefix.getMangoHudLibPath('win32');
        let win32dlsum = this.prefix.getMangoHudLibDlsumPath('win32');

        validate(win32, win32dlsum, 32);

        if (!this.fs.exists(win32)) {
            let filename = this.fs.basename(win32).replace('.so', '.tar.gz');

            promise = promise
                .then(() => this.network.downloadTarGz(
                    this.launcherRepo + '/bin/libs/i386/' + filename,
                    this.fs.dirname(win32) + '/' + filename
                ));
        }

        if (!this.fs.exists(win32dlsum)) {
            let filename = this.fs.basename(win32dlsum).replace('.so', '.tar.gz');

            promise = promise
                .then(() => this.network.downloadTarGz(
                    this.launcherRepo + '/bin/libs/i386/' + filename,
                    this.fs.dirname(win32dlsum) + '/' + filename
                ));
        }

        let win64      = this.prefix.getMangoHudLibPath('win64');
        let win64dlsum = this.prefix.getMangoHudLibDlsumPath('win64');

        validate(win64, win64dlsum, 64);

        if (!this.fs.exists(win64)) {
            let filename = this.fs.basename(win64).replace('.so', '.tar.gz');

            promise = promise
                .then(() => this.network.downloadTarGz(
                    this.launcherRepo + '/bin/libs/x86-64/' + filename,
                    this.fs.dirname(win64) + '/' + filename
                ));
        }

        if (!this.fs.exists(win64dlsum)) {
            let filename = this.fs.basename(win64dlsum).replace('.so', '.tar.gz');

            promise = promise
                .then(() => this.network.downloadTarGz(
                    this.launcherRepo + '/bin/libs/x86-64/' + filename,
                    this.fs.dirname(win64dlsum) + '/' + filename
                ));
        }

        return promise;
    }

    getLayer32() {
        return {
            "file_format_version": "1.0.0",
            "layer":               {
                "name":                   "VK_LAYER_MangoHud_32",
                "type":                   "GLOBAL",
                "api_version":            "1.2.135",
                "library_path":           this.prefix.getMangoHudLibPath('win32'),
                "implementation_version": "1",
                "description":            "Vulkan Hud Overlay",
                "functions":              {
                    "vkGetInstanceProcAddr": "overlay_GetInstanceProcAddr",
                    "vkGetDeviceProcAddr":   "overlay_GetDeviceProcAddr"
                },
                "enable_environment":     {
                    "MANGOHUD": "1"
                },
                "disable_environment":    {
                    "DISABLE_MANGOHUD": "1"
                }
            }
        };
    }

    getLayer64() {
        return {
            "file_format_version": "1.0.0",
            "layer":               {
                "name":                   "VK_LAYER_MangoHud_64",
                "type":                   "GLOBAL",
                "api_version":            "1.2.135",
                "library_path":           this.prefix.getMangoHudLibPath('win64'),
                "implementation_version": "1",
                "description":            "Vulkan Hud Overlay",
                "functions":              {
                    "vkGetInstanceProcAddr": "overlay_GetInstanceProcAddr",
                    "vkGetDeviceProcAddr":   "overlay_GetDeviceProcAddr"
                },
                "enable_environment":     {
                    "MANGOHUD": "1"
                },
                "disable_environment":    {
                    "DISABLE_MANGOHUD": "1"
                }
            }
        };
    }
}