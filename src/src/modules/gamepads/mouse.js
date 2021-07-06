export default class Mouse {
  static MOUSE_X = 'mouse_x';
  static MOUSE_Y = 'mouse_y';

  /**
   * @return {string[]}
   */
  getKeys() {
    return [Mouse.MOUSE_X, Mouse.MOUSE_Y];
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