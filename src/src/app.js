import _                   from "lodash";
import action              from "./store/action";
import FileSystem          from "./modules/file-system";
import AppFolders          from "./modules/app-folders";
import Config              from "./modules/config";
import Command             from "./modules/command";
import System              from "./modules/system";
import Driver              from "./modules/driver";
import Network             from "./modules/network";
import Update              from "./modules/update";
import Monitor             from "./modules/monitor";
import Replaces            from "./modules/replaces";
import Patches             from "./modules/patches";
import MyPatches           from "./modules/my-patches";
import Registry            from "./modules/registry";
import Utils               from "./modules/utils";
import WinePrefix          from "./modules/wine-prefix";
import Task                from "./modules/task";
import Prefix              from "./modules/prefix";
import Snapshot            from "./modules/snapshot";
import Diagnostics         from "./modules/diagnostics";
import Mount               from "./modules/mount";
import Pack                from "./modules/pack";
import Symlink             from "./modules/symlink";
import Build               from "./modules/build";
import Dxvk                from "./modules/dxvk";
import Vkd3dProton         from "./modules/vkd3d-proton";
import Fixes               from "./modules/fixes";
import MangoHud            from "./modules/mango-hud";
import VkBasalt            from "./modules/vk-basalt";
import AudioButton         from "./helpers/audio";
import Iso                 from "./modules/iso";
import Lutris              from "./modules/repositories/lutris";
import PlayOnLinux         from "./modules/repositories/play-on-linux";
import Kron4ek             from "./modules/repositories/kron4ek";
import ProtonGE            from "./modules/repositories/proton-ge";
import WineGE              from "./modules/repositories/wine-ge";
import WineScLug           from "./modules/repositories/wine-sc-lug";
import WineRunnerSc        from "./modules/repositories/wine-runner-sc";
import ProtonTKG           from "./modules/repositories/proton-tkg";
import ProtonTkgGardotd426 from "./modules/repositories/proton-tkg-gardotd426";
import Steam               from "./modules/repositories/steam";
import BottlesDevs         from "./modules/repositories/bottlesdevs";
import Runtime             from "./modules/repositories/runtime";
import MediaFoundation     from "./modules/media-foundation";
import Errors              from "./helpers/errors";
import Cache               from "./modules/cache";
import Wine                from "./modules/kernels/wine";
import Proton              from "./modules/kernels/proton";
import Dosbox              from "./modules/kernels/dosbox";
import FacadeKernel        from "./modules/kernels/facade-kernel";
import Gamepads            from "./modules/gamepads/gamepads";
import Keyboard            from "./modules/gamepads/keyboard";
import Mouse               from "./modules/gamepads/mouse";
import Api                 from "./api";
import Icon                from "./modules/icon";
import WineCommand         from "./modules/wine-command";

class App {

  UTILS                 = Utils;
  APP_FOLDERS           = new AppFolders();
  COMMAND               = new Command();
  NETWORK               = new Network();
  CACHE                 = new Cache(this.APP_FOLDERS);
  FILE_SYSTEM           = new FileSystem(this.APP_FOLDERS);
  SYSTEM                = new System(this.APP_FOLDERS);
  UPDATE                = new Update(this.APP_FOLDERS, this.FILE_SYSTEM, this.NETWORK);
  PREFIX                = new Prefix(this.APP_FOLDERS, this.COMMAND, this.FILE_SYSTEM, this.SYSTEM);
  CONFIG                = new Config(null, this.APP_FOLDERS, this.PREFIX);
  KERNEL                = new FacadeKernel(this.APP_FOLDERS, this.FILE_SYSTEM, this.UPDATE, this.PREFIX, this.SYSTEM);
  LUTRIS                = new Lutris(this.APP_FOLDERS, this.FILE_SYSTEM, this.NETWORK);
  PLAY_ON_LINUX         = new PlayOnLinux(this.APP_FOLDERS, this.FILE_SYSTEM, this.NETWORK);
  KRON4EK               = new Kron4ek(this.APP_FOLDERS, this.FILE_SYSTEM, this.NETWORK);
  PROTON_GE             = new ProtonGE(this.APP_FOLDERS, this.FILE_SYSTEM, this.NETWORK);
  WINE_GE               = new WineGE(this.APP_FOLDERS, this.FILE_SYSTEM, this.NETWORK);
  WINE_SC_LUG           = new WineScLug(this.APP_FOLDERS, this.FILE_SYSTEM, this.NETWORK);
  WINE_RUNNER_SC        = new WineRunnerSc(this.APP_FOLDERS, this.FILE_SYSTEM, this.NETWORK);
  PROTON_TKG            = new ProtonTKG(this.APP_FOLDERS, this.FILE_SYSTEM, this.NETWORK);
  PROTON_TKG_GARDOTD426 = new ProtonTkgGardotd426(this.APP_FOLDERS, this.FILE_SYSTEM, this.NETWORK);
  BOTTLES_DEVS          = new BottlesDevs(this.APP_FOLDERS, this.FILE_SYSTEM, this.NETWORK);
  RUNTIME               = new Runtime(this.APP_FOLDERS, this.FILE_SYSTEM, this.NETWORK);
  STEAM                 = new Steam(this.APP_FOLDERS, this.FILE_SYSTEM, this.NETWORK, this.SYSTEM);
  DRIVER                = new Driver(this.COMMAND, this.SYSTEM, this.FILE_SYSTEM);
  MONITOR               = new Monitor(this.APP_FOLDERS, this.PREFIX, this.COMMAND, this.SYSTEM, this.FILE_SYSTEM);
  REPLACES              = new Replaces(this.APP_FOLDERS, this.SYSTEM, this.FILE_SYSTEM, this.MONITOR);
  REGISTRY              = new Registry(this.FILE_SYSTEM, this.REPLACES);
  PATCHES               = new Patches(this.APP_FOLDERS, this.COMMAND, this.SYSTEM, this.FILE_SYSTEM, this.REGISTRY);
  MY_PATCHES            = new MyPatches(this.SYSTEM, this.FILE_SYSTEM);
  SNAPSHOT              = new Snapshot(this.APP_FOLDERS, this.PREFIX, this.FILE_SYSTEM, this.REPLACES);
  DOSBOX                = new Dosbox(this.APP_FOLDERS, this.PREFIX, this.SYSTEM, this.FILE_SYSTEM, this.UPDATE);
  DXVK                  = new Dxvk(this.APP_FOLDERS, this.PREFIX, this.FILE_SYSTEM, this.NETWORK, this.SNAPSHOT, this.PATCHES, this.MY_PATCHES);
  VKD3D_PROTON          = new Vkd3dProton(this.APP_FOLDERS, this.PREFIX, this.FILE_SYSTEM, this.NETWORK, this.SNAPSHOT, this.SYSTEM, this.PATCHES, this.MY_PATCHES);
  MF                    = new MediaFoundation(this.APP_FOLDERS, this.PREFIX, this.COMMAND, this.FILE_SYSTEM, this.NETWORK, this.SNAPSHOT, this.PATCHES, this.MY_PATCHES);
  MANGO_HUD             = new MangoHud(this.APP_FOLDERS, this.PREFIX, this.FILE_SYSTEM, this.NETWORK);
  VK_BASALT             = new VkBasalt(this.APP_FOLDERS, this.PREFIX, this.FILE_SYSTEM, this.NETWORK);
  FIXES                 = new Fixes(this.PREFIX);
  WINE_PREFIX           = new WinePrefix(this.APP_FOLDERS, this.PREFIX, this.CONFIG, this.SYSTEM, this.FILE_SYSTEM, this.REPLACES, this.REGISTRY, this.PATCHES, this.DXVK, this.FIXES, this.MF, this.VKD3D_PROTON, this.UPDATE, this.RUNTIME);
  DIAGNOSTICS           = new Diagnostics(this.APP_FOLDERS, this.COMMAND, this.SYSTEM, this.FILE_SYSTEM);
  MOUNT_WINE            = new Mount(this.APP_FOLDERS, this.COMMAND, this.FILE_SYSTEM, this.UPDATE, this.SYSTEM, this.APP_FOLDERS.getWineDir());
  MOUNT_DATA            = new Mount(this.APP_FOLDERS, this.COMMAND, this.FILE_SYSTEM, this.UPDATE, this.SYSTEM, this.APP_FOLDERS.getGamesDir());
  PACK                  = new Pack(this.APP_FOLDERS, this.COMMAND, this.FILE_SYSTEM, this.SYSTEM, this.MOUNT_WINE, this.MOUNT_DATA);
  SYMLINK               = new Symlink(this.APP_FOLDERS, this.FILE_SYSTEM);
  BUILD                 = new Build(this.APP_FOLDERS, this.PREFIX, this.COMMAND, this.FILE_SYSTEM, this.SYSTEM);
  KEYBOARD              = new Keyboard();
  MOUSE                 = new Mouse();
  GAMEPADS              = new Gamepads();

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
        let configs = this.getConfig().findConfigs();
        if (configs.length > 0) {
          this.getConfig().setFlatConfig(_.head(configs).getFlatConfig());
        }

        this.getKernel().setConfig(this.getConfig());
        this.getPrefix().loadConfig();
        this.getKernel().loadWineEnv();

      })
      .then(() => this.getWinePrefix().create());
  }

  /**
   * @param {Config} config
   * @return {Task}
   */
  createTask(config) {
    return new Task(config, this.APP_FOLDERS, this.PREFIX, this.FILE_SYSTEM, this.MONITOR, this.SYSTEM, this.MANGO_HUD, this.VK_BASALT);
  }

  /**
   * @param {Config} config
   * @return {Icon}
   */
  createIcon(config) {
    return new Icon(config, this.APP_FOLDERS, this.FILE_SYSTEM, this.SYSTEM);
  }

  /**
   * @param {string} path
   * @return {Iso}
   */
  createIso(path) {
    return new Iso(this.APP_FOLDERS, this.COMMAND, this.FILE_SYSTEM, this.UPDATE, this.SYSTEM, path);
  }

  /**
   * @param {Wine|Proton} wine
   * @param {Config} config
   * @return {WineCommand}
   */
  createWineCommand(wine, config = null) {
    return new WineCommand(this.APP_FOLDERS, this.FILE_SYSTEM, this.PREFIX, wine, config);
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
   * @returns {MyPatches}
   */
  getMyPatches() {
    return this.MY_PATCHES;
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
   * @return {Cache}
   */
  getCache() {
    return this.CACHE;
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
   * @return {WineGE}
   */
  getWineGE() {
    return this.WINE_GE;
  }

  /**
   * @return {WineScLug}
   */
  getWineScLug() {
    return this.WINE_SC_LUG;
  }

  /**
   * @return {WineRunnerSc}
   */
  getWineRunnerSc() {
    return this.WINE_RUNNER_SC;
  }

  /**
   * @return {ProtonTKG}
   */
  getProtonTKG() {
    return this.PROTON_TKG;
  }

  /**
   * @return {ProtonTkgGardotd426}
   */
  getProtonTkgGardotd426() {
    return this.PROTON_TKG_GARDOTD426;
  }

  /**
   * @return {BottlesDevs}
   */
  getBottlesDevs() {
    return this.BOTTLES_DEVS;
  }

  /**
   * @return {Runtime}
   */
  getRuntime() {
    return this.RUNTIME;
  }

  /**
   * @return {Steam}
   */
  getSteam() {
    return this.STEAM;
  }

  /**
   * @return {Dosbox}
   */
  getDosbox() {
    return this.DOSBOX;
  }

  /**
   * @return {MediaFoundation}
   */
  getMediaFoundation() {
    return this.MF;
  }

  /**
   * @return {Keyboard}
   */
  getKeyboard() {
    return this.KEYBOARD;
  }

  /**
   * @return {Mouse}
   */
  getMouse() {
    return this.MOUSE;
  }

  /**
   * @return {Gamepads}
   */
  getGamepads() {
    return this.GAMEPADS;
  }

  /**
   * @return {Wine|Proton}
   */
  getKernel() {
    return this.KERNEL.getKernel();
  }

  /**
   * @return {FacadeKernel}
   */
  getFacadeKernel() {
    return this.KERNEL;
  }

  /**
   * @return {Api}
   */
  getApi() {
    return Api;
  }
}

window.app = new App();

export default window.app;