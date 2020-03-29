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
    version = '0.3.1';

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

        if (!this.fs.exists(implicitLayers)) {
            this.fs.mkdir(implicitLayers);
        }

        if (!this.prefix.isMangoHud()) {
            return promise;
        }

        if (!this.fs.exists(file32)) {
            this.fs.filePutContents(file32, Utils.jsonEncode(this.getLayer32()));
        }

        if (!this.fs.exists(file64)) {
            this.fs.filePutContents(file64, Utils.jsonEncode(this.getLayer64()));
        }

        let win32 = this.prefix.getMangoHudLibPath('win32');

        if (!this.fs.exists(win32)) {
            promise = promise.then(() => this.network.download(this.launcherRepo + '/bin/libs/i386/' + this.fs.basename(win32), win32));
        }

        let win64 = this.prefix.getMangoHudLibPath('win64');

        if (!this.fs.exists(win64)) {
            promise = promise.then(() => this.network.download(this.launcherRepo + '/bin/libs/x86-64/' + this.fs.basename(win64), win64));
        }

        return promise;
    }

    getLayer32() {
        return {
            "file_format_version": "1.0.0",
            "layer":               {
                "name":                   "MangoHud x86",
                "type":                   "GLOBAL",
                "api_version":            "1.1.125",
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
                "name":                   "MangoHud x86_64",
                "type":                   "GLOBAL",
                "api_version":            "1.1.125",
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