import _          from "lodash";
import Config     from "./config";
import Command    from "./command";
import FileSystem from "./file-system";
import Prefix     from "./prefix";
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
   * @param {Prefix} prefix
   * @param {FileSystem} fs
   * @param {Monitor} monitor
   * @param {System} system
   * @param {MangoHud} mangoHud
   * @param {VkBasalt} vkBasalt
   */
  constructor(config, prefix, fs, monitor, system, mangoHud, vkBasalt) {
    this.prefix   = _.cloneDeep(prefix);
    this.config   = _.cloneDeep(config);
    this.fs       = fs;
    this.monitor  = monitor;
    this.system   = system;
    this.mangoHud = mangoHud;
    this.vkBasalt = vkBasalt;
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
    let driveC     = this.prefix.getWineDriveC();
    let gamePath   = _.trim(this.prefix.getGamesFolder(), '/');
    let additional = _.trim(this.config.getGamePath(), '/');

    let path     = [ driveC, gamePath, additional ].filter(s => s).join('/');
    let wine     = this.prefix.getWineBin();
    let fileName = this.config.getGameExe();
    let args     = this.config.getGameArguments().split("'").join('"');
    let desktop  = this.desktop();
    let gamemode = '';

    if (this.config.isGameMode() && this.system.isGameMode()) {
      gamemode = 'gamemoderun';
    }

    return `cd "${path}" && ${gamemode} "${wine}" ${desktop} "${fileName}" ${args}`;
  }

  /**
   * @return {Promise}
   */
  run(mode = 'standard', spawn = () => {}) {
    let promise = Promise.resolve();
    let logFile = `${this.prefix.getLogsDir()}/${this.config.getGameName()}.log`;

    if (this.fs.exists(logFile)) {
      this.fs.rm(logFile);
    }

    if ('debug' === mode) {
      this.prefix.setWineDebug('');
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

        let gamepads = window.app.getGamepads();

        gamepads.changeConfig(this.config);
        gamepads.stubPressEvents(this.config.isDisabledGamepads());

        this.monitor.save();

        api.commit(action.get('logs').CLEAR);

        let runner;

        if (this.config.isMsDos()) {
          runner = window.app.getDosbox().runConfig(this.config);
        } else {
          runner = Promise.resolve(this.game());
        }

        return runner.then((cmd) => new Command(this.prefix, this.config)
          .watch(cmd, output => {
            api.commit(action.get('logs').APPEND, output);
            this.fs.filePutContents(logFile, output, this.fs.FILE_APPEND);
          }, spawn, true))
          .then(() => this.monitor.restore());
      });
  }
}