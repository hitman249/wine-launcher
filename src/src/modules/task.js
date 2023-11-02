import _          from "lodash";
import Config      from "./config";
import WineCommand from "./wine-command";
import FileSystem  from "./file-system";
import Prefix     from "./prefix";
import AppFolders from "./app-folders";
import System     from "./system";
import MangoHud   from "./mango-hud";
import VkBasalt   from "./vk-basalt";
import api        from "../api";
import action     from "../store/action";

export default class Task {

  /**
   * @type {Config}
   */
  config = null;

  /**
   * @type {Prefix}
   */
  prefix = null;

  /**
   * @type {AppFolders}
   */
  appFolders = null;

  /**
   * @type {FileSystem}
   */
  fs = null;

  /**
   * @type {Monitor}
   */
  monitor = null;

  /**
   * @type {System}
   */
  system = null;

  /**
   * @type {MangoHud}
   */
  mangoHud = null;

  /**
   * @type {VkBasalt}
   */
  vkBasalt = null;

  /**
   * @param {Config} config
   * @param {AppFolders} appFolders
   * @param {Prefix} prefix
   * @param {FileSystem} fs
   * @param {Monitor} monitor
   * @param {System} system
   * @param {MangoHud} mangoHud
   * @param {VkBasalt} vkBasalt
   */
  constructor(config, appFolders, prefix, fs, monitor, system, mangoHud, vkBasalt) {
    this.appFolders = appFolders;
    this.prefix     = prefix;
    this.config     = _.cloneDeep(config);
    this.fs         = fs;
    this.monitor    = monitor;
    this.system     = system;
    this.mangoHud   = mangoHud;
    this.vkBasalt   = vkBasalt;
  }

  desktop() {
    if (!this.config.getConfigValue('window.enable')) {
      return '';
    }

    let resolution = this.config.getConfigValue('window.resolution');
    let title      = _.upperFirst(_.camelCase(this.config.getGameName()));

    if ('auto' === resolution) {
      resolution = this.monitor.getDefault().resolution;
    }

    return `explorer "/desktop=${title},${resolution}"`;
  }

  game() {
    let wine = window.app.getKernel();

    let driveC     = wine.getDriveC();
    let gamePath   = _.trim(this.prefix.getGamesFolder(), '/');
    let additional = _.trim(this.config.getGamePath(), '/');

    let path     = [ driveC, gamePath, additional ].filter(s => s).join('/');
    let wineBin  = wine.getWineBin();
    let fileName = this.config.getGameExe();
    let args     = this.config.getGameArguments().split("'").join('"');
    let desktop  = this.desktop();
    let gamemode = '';

    if (this.config.isGameMode() && this.system.isGameMode()) {
      gamemode = 'gamemoderun';
    }

    return `cd "${path}" && ${gamemode} "${wineBin}" ${desktop} "${fileName}" ${args}`;
  }

  /**
   * @return {Promise}
   */
  run(mode = 'standard', spawn = () => null, returnCmd = false) {
    let wine = window.app.getKernel().clone();

    let promise = Promise.resolve();
    let logFile = `${this.appFolders.getLogsDir()}/${this.config.getGameName()}.log`;

    if (!returnCmd && this.fs.exists(logFile)) {
      this.fs.rm(logFile);
    }

    if ('debug' === mode) {
      wine.setWineDebug('');
    }

    if ('fps' === mode) {
      if (this.prefix.isMangoHud()) {
        promise = promise
          .then(() => this.mangoHud.update())
          .then(() => {
            this.config.setConfigValue('exports.MANGOHUD', 1);

            if (!this.config.getConfigValue('exports.MANGOHUD_CONFIG')) {
              let position = this.config.getMangoHudPosition();
              this.config.setConfigValue('exports.MANGOHUD_CONFIG', `cpu_temp,gpu_temp,ram,vram,position=${position},height=500,font_size=32`);
            }
          });
      } else if (this.prefix.isDxvk()) {
        if (!this.config.getConfigValue('exports.DXVK_HUD')) {
          this.config.setConfigValue('exports.DXVK_HUD', 'fps,devinfo');
        }
      } else if (this.system.getMesaVersion()) {
        this.config.setConfigValue('exports.GALLIUM_HUD', 'simple,fps');
      }
    }

    return promise
      .then(() => this.vkBasalt.update())
      .then(() => {
        let winePrefix = window.app.getWinePrefix();

        winePrefix.setConfig(this.config);
        winePrefix.updatePulse();
        winePrefix.updateCsmt();

        if (!returnCmd) {
          let gamepads = window.app.getGamepads();

          gamepads.changeConfig(this.config);
          gamepads.stubPressEvents(this.config.isDisabledGamepads());

          this.monitor.save();

          api.commit(action.get('logs').CLEAR);
        }

        let runner;

        if (this.config.isMsDos()) {
          runner = window.app.getDosbox().runConfig(this.config);
        } else {
          runner = Promise.resolve(this.game());
        }

        return runner.then((cmd) => window.app.createWineCommand(wine, this.config)
          .watch(cmd, output => {
            if (!returnCmd) {
              api.commit(action.get('logs').APPEND, output);
              this.fs.filePutContents(logFile, output, this.fs.FILE_APPEND);
            }
          }, spawn, true, false, returnCmd))
          .then((cmd) => {
            if (!returnCmd) {
              this.monitor.restore();
            }

            return cmd;
          });
      });
  }

  /**
   * @return {Promise<string>}
   */
  getCmd(mode = 'standard') {
    return this.run(mode, () => null, true);
  }
}