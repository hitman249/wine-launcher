import Mouse          from "./mouse";
import KeyMapping     from "./key-mapping";
import UInputKeyboard from "./uinput-keyboard";

export default class Keyboard {
  map = [
    ' ',
    ...UInputKeyboard.getLabels(),
    KeyMapping.NEXT_MAPPING,
    Mouse.MOUSE_X,
    Mouse.MOUSE_Y,
    Mouse.MOUSE_INVERTED_X,
    Mouse.MOUSE_INVERTED_Y,
    Mouse.MOUSE_BUTTON_LEFT,
    Mouse.MOUSE_BUTTON_MIDDLE,
    Mouse.MOUSE_BUTTON_RIGHT,
  ];

  /**
   * @type {UInputKeyboard}
   */
  device;

  constructor() {
    this.device = new UInputKeyboard();
    this.device.setDelay(5);
  }

  /**
   * @type {string[]}
   */
  pressedKeys = [];

  /**
   * @return {string[]}
   */
  getKeys() {
    return this.map;
  }

  /**
   * @param {string} key
   * @return {boolean}
   */
  check(key) {
    if (!key || !key.trim()) {
      return false;
    }

    const skip = [
      KeyMapping.NEXT_MAPPING,
      Mouse.MOUSE_X,
      Mouse.MOUSE_Y,
      Mouse.MOUSE_INVERTED_X,
      Mouse.MOUSE_INVERTED_Y,
      Mouse.MOUSE_BUTTON_LEFT,
      Mouse.MOUSE_BUTTON_MIDDLE,
      Mouse.MOUSE_BUTTON_RIGHT,
    ];

    return !skip.includes(key) && this.map.includes(key);
  }

  /**
   * @param {string} key
   * @param {boolean} down or up
   */
  keyToggle(key, down) {
    this.device.keyToggle(key, down);

    if (down && !this.pressedKeys.includes(key)) {
      this.pressedKeys.push(key);
    } else if (this.pressedKeys.includes(key)) {
      this.pressedKeys = this.pressedKeys.filter(k => k !== key);
    }
  }

  lazyUp(key) {
    if (this.pressedKeys.includes(key)) {
      this.keyToggle(key, false);
    }
  }
}