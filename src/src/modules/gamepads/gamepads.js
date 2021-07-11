import action  from "../../store/action";
import Gamepad from "./gamepad";
import Config       from "../config";
import NodeGamepads from "./node-gamepads";

export default class Gamepads {
  /**
   * @type {Config}
   */
  config;

  /**
   * @type {NodeGamepads}
   */
  nodeGamepads;

  gamepads = {};
  listener = true;
  stubPress = false;

  constructor() {
    this.nodeGamepads = new NodeGamepads();
    this.nodeGamepads.create();

    this.nodeGamepads.addEventListener('gamepadconnected', (e) => {
      let gamepad = new Gamepad(e.gamepad);

      this.gamepads[e.gamepad.index] = gamepad;
      gamepad.stubPressEvents(this.stubPress);

      if (this.config) {
        gamepad.changeConfig(this.config);
      }

      gamepad.mount();

      action.notifyCustom('Controller connected', e.gamepad.id);
      this.start();
    });

    this.nodeGamepads.addEventListener('gamepaddisconnected', (e) => {
      let gamepad = this.gamepads[e.gamepad.index];
      delete this.gamepads[e.gamepad.index];

      if (gamepad) {
        gamepad.unmount();
      }

      action.notifyInfo('Controller disconnected', e.gamepad.id);

      let empty = true;
      Object.keys(this.gamepads).forEach((gamepad) => {
        if (this.gamepads[gamepad]) {
          empty = false;
        }
      });

      if (empty) {
        this.stop();
      }
    });
  }

  /**
   * @param {number} index
   * @return {Gamepad}
   */
  getGamepadByIndex(index) {
    return this.gamepads[index];
  }

  /**
   * @param {boolean} flag
   */
  stubPressEvents(flag) {
    this.stubPress = flag;

    Object.keys(this.gamepads).forEach((index) => {
      let gamepad = /** @type {Gamepad} */ this.gamepads[index];
      if (gamepad) {
        gamepad.stubPressEvents(this.stubPress);
      }
    });
  }

  start() {
    this.listener = true;

    let scanGamepads = () => {
      this.tick();

      if (this.listener) {
        setTimeout(() => scanGamepads(), 16);
      }
    };

    scanGamepads();
  }

  stop() {
    this.listener = false;
  }

  /**
   * @return {Config}
   */
  getConfig() {
    return this.config;
  }

  /**
   * @param {Config} config
   */
  changeConfig(config) {
    this.config = config;

    Object.keys(this.gamepads).forEach((index) => {
      let gamepad = /** @type {Gamepad} */ this.gamepads[index];
      if (gamepad) {
        gamepad.changeConfig(this.config);
      }
    });
  }

  update() {
    Object.keys(this.gamepads).forEach((index) => {
      let gamepad = /** @type {Gamepad} */ this.gamepads[index];
      if (gamepad) {
        gamepad.update();
      }
    });
  }

  tick() {
    let gamepads = this.nodeGamepads.getGamepads();

    Object.keys(gamepads).forEach(index => {
      if (!gamepads[index]) {
        return;
      }

      let gamepad = /** @type {Gamepad} */ this.gamepads[gamepads[index].index];

      if (gamepad) {
        gamepad.tick(gamepads[index]);
      }
    });
  }
}