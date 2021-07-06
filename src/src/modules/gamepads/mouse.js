export default class Mouse {
  static MOUSE_X             = 'mouse_x';
  static MOUSE_Y             = 'mouse_y';
  static MOUSE_BUTTON_LEFT   = 'mouse_btn_left';
  static MOUSE_BUTTON_MIDDLE = 'mouse_btn_middle';
  static MOUSE_BUTTON_RIGHT  = 'mouse_btn_right';

  /**
   * @return {string[]}
   */
  getKeys() {
    return [ Mouse.MOUSE_X, Mouse.MOUSE_Y ];
  }

  /**
   * @param {string} key
   * @return {boolean}
   */
  isMouseKey(key) {
    return this.getKeys().includes(key);
  }

  /**
   * @param {string} key
   * @param {boolean} down or up
   */
  keyToggle(key, down) {

  }
}