import Mouse      from "./mouse";
import KeyMapping from "./key-mapping";

const { remote } = require('electron');
const robot      = remote.getGlobal('robotjs');

robot.setKeyboardDelay(1);

export default class Keyboard {
  map = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    '`', '-', '=', '\\', '/', '.',
    'backspace',
    'delete',
    'enter',
    'tab',
    'escape',
    'up',
    'down',
    'right',
    'left',
    'home',
    'end',
    'pageup',
    'pagedown',
    'f1',
    'f2',
    'f3',
    'f4',
    'f5',
    'f6',
    'f7',
    'f8',
    'f9',
    'f10',
    'f11',
    'f12',
    'capslock',
    'command',
    'alt',
    'right_alt',
    'control',
    'left_control',
    'right_control',
    'shift',
    'right_shift',
    'space',
    'printscreen',
    'insert',
    'menu',
    'numpad_lock',
    'numpad_0',
    'numpad_0',
    'numpad_1',
    'numpad_2',
    'numpad_3',
    'numpad_4',
    'numpad_5',
    'numpad_6',
    'numpad_7',
    'numpad_8',
    'numpad_9',
    'numpad_+',
    'numpad_-',
    'numpad_*',
    'numpad_/',
    'numpad_.',

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
    robot.keyToggle(key, down ? 'down' : 'up');

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