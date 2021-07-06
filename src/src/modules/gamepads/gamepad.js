import api        from "../../api";
import action     from "../../store/action";
import Keyboard   from "./keyboard";
import Mouse      from "./mouse";
import KeyMapping from "./key-mapping";
import Config     from "../config";

export default class Gamepad {
  /**
   * @type {Config}
   */
  config;

  /**
   * @type {window.Gamepad}
   */
  gamepad;

  /**
   * @type {Keyboard}
   */
  keyboard;

  /**
   * @type {Mouse}
   */
  mouse;

  /**
   * @type {KeyMapping}
   */
  mapping;

  /**
   * @type {{buttons: {}, axes: {}}}
   */
  state = { buttons: {}, axes: {} };

  /**
   * @type {boolean}
   */
  stubPress = false;

  /**
   * @type {number}
   */
  deadZone = 0.15;

  /**
   * @param {window.Gamepad} gamepad
   */
  constructor(gamepad) {
    this.gamepad  = gamepad;
    this.keyboard = window.app.getKeyboard();
    this.mouse    = window.app.getMouse();
  }

  /**
   * @return {?number}
   */
  getIndex() {
    if (!this.gamepad) {
      return undefined;
    }

    return this.gamepad.index;
  }

  /**
   * @return {string}
   */
  getName() {
    return this.gamepad.id;
  }

  /**
   * @return {{mappings: {buttons: {}, axes: {}}[], name: string, index: ?number}}
   */
  getState() {
    let mappings = this.mapping.getMappings().map((mapping) => {
      let buttons = {};
      let axes    = {};

      Object.keys(mapping.buttons).forEach((index) => {
        let button     = mapping.buttons[index];
        buttons[index] = {
          index,
          value:   button,
          pressed: this.state.buttons[index] || false,
        };
      });

      Object.keys(mapping.axes).forEach((index) => {
        let value   = mapping.axes[index];
        axes[index] = {
          value,
          pressed: this.state.axes[index],
        };
      });

      return { buttons, axes };
    });

    return {
      index: this.getIndex(),
      name:  this.getName(),
      mappings,
    };
  }

  mount() {
    this.update();
  }

  unmount() {
    if (this.stubPress) {
      api.commit(action.get('gamepads').UPDATE, { index: this.getIndex(), data: null });
    }

    if (this.mapping) {
      this.mapping.unmount();
    }
  }

  update() {
    if (this.stubPress) {
      api.commit(action.get('gamepads').UPDATE, { index: this.getIndex(), data: this.getState() });
    }
  }

  /**
   * @return {KeyMapping}
   */
  getMapping() {
    return this.mapping;
  }

  /**
   * @param {boolean} flag
   */
  stubPressEvents(flag) {
    this.stubPress = flag;
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

    if (this.mapping) {
      this.mapping.unmount();
    }

    this.mapping = new KeyMapping(this.gamepad, config);
    this.mapping.mount();
  }

  /**
   * @param {number} index
   * @param {boolean} prev
   * @param {boolean} next
   */
  pressButton(index, prev, next) {
    if (this.mapping) {
      let buttons = this.mapping.getMapping().buttons;
      let key     = buttons[index];

      this.pressKey(key, prev, next);
    }
  }

  /**
   * @param {number} index
   * @param {number} prev
   * @param {number} next
   */
  pressAxes(index, prev, next) {
    if (this.mapping) {
      let axes = this.mapping.getMapping().axes;
      let key  = axes[index];

      const axesToBool = (val) => {
        return Math.abs(val) >= this.deadZone;
      };

      const prevBool = axesToBool(prev);
      const nextBool = axesToBool(next);

      let [ key1, key2 ] = key.split('|');

      if (this.mouse.isMouseXY(key1)) {
        let speed = Number(key2);

        if (this.stubPress) {
          this.update();
        } else {
          if (prev !== next) {
            if (Mouse.MOUSE_X === key1) {
              this.mouse.moveX(next, speed, true);
            } else if (Mouse.MOUSE_Y === key1) {
              this.mouse.moveY(next, speed, true);
            }
          } else {
            if (Mouse.MOUSE_X === key1) {
              this.mouse.moveX(next, speed, false);
            } else if (Mouse.MOUSE_Y === key1) {
              this.mouse.moveY(next, speed, false);
            }
          }
        }

        return;
      }

      key = (-1 === Math.sign(next)) ? key1 : key2;

      if (KeyMapping.NEXT_MAPPING === key || this.keyboard.check(key)) {
        if (this.stubPress) {
          this.update();
        } else {
          if (!prevBool && nextBool && KeyMapping.NEXT_MAPPING === key) {
            this.nextMapping(key);
          } else {
            let lazyUp = key === key1 ? key2 : key1;
            if (lazyUp) {
              this.keyboard.lazyUp(lazyUp);
            }

            this.pressKey(key, prevBool, nextBool, lazyUp);
          }
        }

        return;
      }

      if (this.stubPress) {
        this.update();
      } else if (this.mouse.check(key)) {
        if (!prevBool && nextBool) {
          this.mouse.keyToggle(key, true);
        } else if (prevBool && !nextBool) {
          this.mouse.keyToggle(key, false);
        }
      }
    }
  }

  pressKey(key, prev, next) {
    if (!prev && next) {
      if (this.stubPress) {
        this.update();
      } else if (!this.nextMapping(key) && this.keyboard.check(key)) {
        this.keyboard.keyToggle(key, true);
      } else if (this.mouse.check(key)) {
        this.mouse.keyToggle(key, true);
      }
    } else if (prev && !next) {
      if (this.stubPress) {
        this.update();
      } else if (KeyMapping.NEXT_MAPPING !== key && this.keyboard.check(key)) {
        this.keyboard.keyToggle(key, false);
      } else if (this.mouse.check(key)) {
        this.mouse.keyToggle(key, false);
      }
    }
  }

  nextMapping(key) {
    if (KeyMapping.NEXT_MAPPING === key) {
      this.getMapping().nextMapping();
      return true;
    }

    return false;
  }

  /**
   * @param {window.Gamepad} gamepad
   * @return {boolean}
   */
  compare(gamepad) {
    return gamepad && this.gamepad && this.gamepad.index === gamepad.index && this.gamepad.id === gamepad.id;
  }

  /**
   * @param {window.Gamepad} gamepad
   * @return void
   */
  tick(gamepad) {
    if (!gamepad) {
      return;
    }

    for (let index = 0, count = gamepad.buttons.length; index < count; index++) {
      let button = gamepad.buttons[index];
      let prev   = undefined !== this.state.buttons[index] ? this.state.buttons[index] : false;
      let next   = button.pressed;

      if (prev !== next) {
        this.state.buttons[index] = button.pressed;
        this.pressButton(index, prev, next);
      }
    }

    for (let index = 0, count = gamepad.axes.length; index < count; index++) {
      let value = gamepad.axes[index];
      let prev  = undefined !== this.state.axes[index] ? this.state.axes[index] : 0;
      let next  = value;

      if (prev !== next) {
        this.state.axes[index] = next;
        this.pressAxes(index, prev, next);
      }
    }
  }
}