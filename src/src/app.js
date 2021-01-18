import _               from "lodash";
import action          from "./store/action";
import FileSystem      from "./modules/file-system";
import AppFolders      from "./modules/app-folders";
import Config          from "./modules/config";
import Wine            from "./modules/wine";
import Command         from "./modules/command";
import System          from "./modules/system";
import Driver          from "./modules/driver";
import Network         from "./modules/network";
import Update          from "./modules/update";
import Monitor         from "./modules/monitor";
import Replaces        from "./modules/replaces";
import Patches         from "./modules/patches";
import Registry        from "./modules/registry";
import Utils           from "./modules/utils";
import WinePrefix      from "./modules/wine-prefix";
import Task            from "./modules/task";
import Prefix          from "./modules/prefix";
import Snapshot        from "./modules/snapshot";
import Diagnostics     from "./modules/diagnostics";
import Lutris          from "./modules/lutris";
import PlayOnLinux     from "./modules/play-on-linux";
import Kron4ek         from "./modules/kron4ek";
import Mount           from "./modules/mount";
import Pack            from "./modules/pack";
import Symlink         from "./modules/symlink";
import Build           from "./modules/build";
import Dxvk            from "./modules/dxvk";
import Vkd3dProton     from "./modules/vkd3d-proton";
import Fixes           from "./modules/fixes";
import MangoHud        from "./modules/mango-hud";
import VkBasalt        from "./modules/vk-basalt";
import AudioButton     from "./helpers/audio";
import Iso             from "./modules/iso";
import ProtonGE        from "./modules/proton-ge";
import ProtonTKG       from "./modules/proton-tkg";
import MediaFoundation from "./modules/media-foundation";
import Steam           from "./modules/steam";
import Errors          from "./helpers/errors";

class App {

    UTILS         = Utils;
    PREFIX        = new Prefix();
    CONFIG        = new Config(null, this.PREFIX);
    COMMAND       = new Command(this.PREFIX, this.CONFIG);
    FILE_SYSTEM   = new FileSystem(this.PREFIX, this.COMMAND);
    NETWORK       = new Network();
    APP_FOLDERS   = new AppFolders(this.PREFIX, this.FILE_SYSTEM);
    LUTRIS        = new Lutris(this.PREFIX, this.FILE_SYSTEM, this.NETWORK);
    PLAY_ON_LINUX = new PlayOnLinux(this.PREFIX, this.FILE_SYSTEM, this.NETWORK);
    KRON4EK       = new Kron4ek(this.PREFIX, this.FILE_SYSTEM, this.NETWORK);
    PROTON_GE     = new ProtonGE(this.PREFIX, this.FILE_SYSTEM, this.NETWORK);
    PROTON_TKG    = new ProtonTKG(this.PREFIX, this.FILE_SYSTEM, this.NETWORK);
    SYSTEM        = new System(this.PREFIX, this.COMMAND, this.FILE_SYSTEM);
    STEAM         = new Steam(this.PREFIX, this.FILE_SYSTEM, this.NETWORK, this.SYSTEM);
    DRIVER        = new Driver(this.COMMAND, this.SYSTEM, this.FILE_SYSTEM);
    UPDATE        = new Update(this.PREFIX, this.FILE_SYSTEM, this.NETWORK);
    WINE          = new Wine(this.PREFIX, this.COMMAND, this.FILE_SYSTEM, this.UPDATE);
    MONITOR       = new Monitor(this.PREFIX, this.COMMAND, this.SYSTEM, this.FILE_SYSTEM, this.WINE);
    REPLACES      = new Replaces(this.PREFIX, this.SYSTEM, this.FILE_SYSTEM, this.MONITOR);
    PATCHES       = new Patches(this.PREFIX, this.COMMAND, this.SYSTEM, this.FILE_SYSTEM);
    REGISTRY      = new Registry(this.PREFIX, this.FILE_SYSTEM, this.REPLACES, this.WINE);
    SNAPSHOT      = new Snapshot(this.PREFIX, this.FILE_SYSTEM, this.REPLACES, this.WINE, this.SYSTEM);
    DXVK          = new Dxvk(this.PREFIX, this.FILE_SYSTEM, this.NETWORK, this.WINE, this.SNAPSHOT);
    VKD3D_PROTON  = new Vkd3dProton(this.PREFIX, this.FILE_SYSTEM, this.NETWORK, this.WINE, this.SNAPSHOT, this.SYSTEM);
    MF            = new MediaFoundation(this.COMMAND, this.PREFIX, this.FILE_SYSTEM, this.NETWORK, this.WINE, this.SNAPSHOT);
    MANGO_HUD     = new MangoHud(this.PREFIX, this.FILE_SYSTEM, this.NETWORK);
    VK_BASALT     = new VkBasalt(this.PREFIX, this.FILE_SYSTEM, this.NETWORK);
    FIXES         = new Fixes(this.PREFIX, this.WINE);
    WINE_PREFIX   = new WinePrefix(this.PREFIX, this.CONFIG, this.SYSTEM, this.FILE_SYSTEM, this.WINE, this.REPLACES, this.REGISTRY, this.PATCHES, this.DXVK, this.FIXES, this.MF, this.VKD3D_PROTON);
    DIAGNOSTICS   = new Diagnostics(this.PREFIX, this.COMMAND, this.SYSTEM, this.FILE_SYSTEM);
    MOUNT_WINE    = new Mount(this.PREFIX, this.COMMAND, this.FILE_SYSTEM, this.UPDATE, this.SYSTEM, this.PREFIX.getWineDir());
    MOUNT_DATA    = new Mount(this.PREFIX, this.COMMAND, this.FILE_SYSTEM, this.UPDATE, this.SYSTEM, this.PREFIX.getGamesDir());
    PACK          = new Pack(this.PREFIX, this.COMMAND, this.FILE_SYSTEM, this.SYSTEM, this.MOUNT_WINE, this.MOUNT_DATA);
    SYMLINK       = new Symlink(this.PREFIX, this.FILE_SYSTEM);
    BUILD         = new Build(this.PREFIX, this.COMMAND, this.FILE_SYSTEM, this.SYSTEM);

    AUDIO_BUTTON = new AudioButton();
    ERROR        = null;

    constructor() {
        this.ERROR = new Errors(this);
    }

    /**
     * @return {Promise<void>}
     */
    initialize() {
        let promise = Promise.resolve();

        return promise
            .then(() => this.getAppFolders().create())
            .then(() => this.getMountWine().mount())
            .then(() => this.getMountData().mount())
            .then(() => {
                let configs = this.CONFIG.findConfigs();
                if (configs.length > 0) {
                    this.CONFIG.setFlatConfig(_.head(configs).getFlatConfig());
                }
            })
            .then(() => this.getWinePrefix().create());
    }

    /**
     * @param {Config} config
     * @return {Task}
     */
    createTask(config) {
        return new Task(config, this.PREFIX, this.FILE_SYSTEM, this.MONITOR, this.SYSTEM, this.MANGO_HUD, this.VK_BASALT);
    }

    /**
     * @param {string} path
     * @return {Iso}
     */
    createIso(path) {
        return new Iso(this.PREFIX, this.COMMAND, this.FILE_SYSTEM, this.UPDATE, this.SYSTEM, this.WINE, path);
    }

    /**
     * @param {string} url
     */
    href(url) {
        window.debugMode     = true;
        window.location.href = url;
    }

    reload() {
        window.debugMode = true;
        window.location.reload();
    }

    getAction() {
        return action;
    }

    /**
     * @returns {FileSystem}
     */
    getFileSystem() {
        return this.FILE_SYSTEM;
    }

    /**
     * @returns {Config}
     */
    getConfig() {
        return this.CONFIG;
    }

    /**
     * @returns {Command}
     */
    getCommand() {
        return this.COMMAND;
    }

    /**
     * @returns {AppFolders}
     */
    getAppFolders() {
        return this.APP_FOLDERS;
    }

    /**
     * @returns {Wine}
     */
    getWine() {
        return this.WINE;
    }

    /**
     * @returns {System}
     */
    getSystem() {
        return this.SYSTEM;
    }

    /**
     * @returns {Driver}
     */
    getDriver() {
        return this.DRIVER;
    }

    /**
     * @returns {Network}
     */
    getNetwork() {
        return this.NETWORK;
    }

    /**
     * @returns {Update}
     */
    getUpdate() {
        return this.UPDATE;
    }

    /**
     * @returns {Monitor}
     */
    getMonitor() {
        return this.MONITOR;
    }

    /**
     * @returns {Replaces}
     */
    getReplaces() {
        return this.REPLACES;
    }

    /**
     * @returns {Patches}
     */
    getPatches() {
        return this.PATCHES;
    }

    /**
     * @returns {Registry}
     */
    getRegistry() {
        return this.REGISTRY;
    }

    /**
     * @returns {Utils}
     */
    getUtils() {
        return this.UTILS;
    }

    /**
     * @returns {Prefix}
     */
    getPrefix() {
        return this.PREFIX;
    }

    /**
     * @returns {WinePrefix}
     */
    getWinePrefix() {
        return this.WINE_PREFIX;
    }

    /**
     * @return {Snapshot}
     */
    getSnapshot() {
        return this.SNAPSHOT;
    }

    /**
     * @return {Diagnostics}
     */
    getDiagnostics() {
        return this.DIAGNOSTICS;
    }

    /**
     * @return {Lutris}
     */
    getLutris() {
        return this.LUTRIS;
    }

    /**
     * @return {PlayOnLinux}
     */
    getPlayOnLinux() {
        return this.PLAY_ON_LINUX;
    }

    /**
     * @return {Kron4ek}
     */
    getKron4ek() {
        return this.KRON4EK;
    }

    /**
     * @return {Mount}
     */
    getMountWine() {
        return this.MOUNT_WINE;
    }

    /**
     * @return {Mount}
     */
    getMountData() {
        return this.MOUNT_DATA;
    }

    /**
     * @return {Pack}
     */
    getPack() {
        return this.PACK;
    }

    /**
     * @return {Symlink}
     */
    getSymlink() {
        return this.SYMLINK;
    }

    /**
     * @return {Build}
     */
    getBuild() {
        return this.BUILD;
    }

    /**
     * @return {Dxvk}
     */
    getDxvk() {
        return this.DXVK;
    }

    /**
     * @return {Vkd3dProton}
     */
    getVkd3dProton() {
        return this.VKD3D_PROTON;
    }

    /**
     * @return {Fixes}
     */
    getFixes() {
        return this.FIXES;
    }

    /**
     * @return {MangoHud}
     */
    getMangoHud() {
        return this.MANGO_HUD;
    }

    /**
     * @return {VkBasalt}
     */
    getVkBasalt() {
        return this.VK_BASALT;
    }

    /**
     * @return {AudioButton}
     */
    getAudioButton() {
        return this.AUDIO_BUTTON;
    }

    /**
     * @return {ProtonGE}
     */
    getProtonGE() {
        return this.PROTON_GE;
    }

    /**
     * @return {ProtonTKG}
     */
    getProtonTKG() {
        return this.PROTON_TKG;
    }

    /**
     * @return {Steam}
     */
    getSteam() {
        return this.STEAM;
    }

    /**
     * @return {MediaFoundation}
     */
    getMediaFoundation() {
        return this.MF;
    }
}

window.app = new App();

export default window.app;