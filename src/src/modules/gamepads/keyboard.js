import Mouse      from "./mouse";
import KeyMapping from "./key-mapping";

export default class Keyboard {
  map = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
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
    'command',
    'alt',
    'control',
    'shift',
    'right_shift',
    'space',
    'printscreen',
    'insert',
    KeyMapping.NEXT_MAPPING,
    Mouse.MOUSE_X,
    Mouse.MOUSE_Y,
  ];

  /**
   * @return {string[]}
   */
  getKeys() {
    return this.map;
  }

  /**
   * @param {string} key
   * @param {boolean} down or up
   */
  keyToggle(key, down) {

  }
}