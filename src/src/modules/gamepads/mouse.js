import UInputMouse from "./uinput-mouse";

export default class Mouse {
  static MOUSE_X             = 'mouse_x';
  static MOUSE_Y             = 'mouse_y';
  static MOUSE_INVERTED_X    = 'mouse_inverted_x';
  static MOUSE_INVERTED_Y    = 'mouse_inverted_y';
  static MOUSE_BUTTON_LEFT   = 'mouse_btn_left';
  static MOUSE_BUTTON_MIDDLE = 'mouse_btn_middle';
  static MOUSE_BUTTON_RIGHT  = 'mouse_btn_right';

  stepX  = 0;
  stepY  = 0;
  speedX = 1;
  speedY = 1;
  movedX = false;
  movedY = false;

  /**
   * @type {UInputMouse}
   */
  device;

  constructor() {
    this.device = new UInputMouse();
    this.device.setDelay(2);
  }

  /**
   * @return {string[]}
   */
  getKeys() {
    return [ Mouse.MOUSE_BUTTON_LEFT, Mouse.MOUSE_BUTTON_MIDDLE, Mouse.MOUSE_BUTTON_RIGHT ];
  }

  /**
   * @param {string} key
   * @return {string}
   */
  getKey(key) {
    const map = {
      [Mouse.MOUSE_BUTTON_LEFT]:   'left',
      [Mouse.MOUSE_BUTTON_MIDDLE]: 'middle',
      [Mouse.MOUSE_BUTTON_RIGHT]:  'right',
    };

    return map[key] || key;
  }

  /**
   * @param {string} key
   * @return {boolean}
   */
  check(key) {
    if (!key || !key.trim()) {
      return false;
    }

    return this.getKeys().includes(key);
  }

  /**
   * @param {string} key
   * @return {boolean}
   */
  isMouseXY(key) {
    return [ Mouse.MOUSE_X, Mouse.MOUSE_Y, Mouse.MOUSE_INVERTED_X, Mouse.MOUSE_INVERTED_Y ].includes(key);
  }

  /**
   * @param {string} key
   * @param {boolean} down or up
   */
  keyToggle(key, down) {
    this.device.keyToggle(this.getKey(key), down);
  }

  /**
   * @param {number} step
   * @param {number} speed
   * @param {boolean} down
   */
  moveX(step, speed, down) {
    this.stepX  = step;
    this.speedX = Math.max(1, Number(speed));

    if (this.movedX === down) {
      return;
    }

    this.movedX = down;

    if (!this.movedX) {
      return;
    }

    let updatePosition = () => {
      this.device.moveMouse(this.speedX * this.stepX, 0);

      if (this.movedX) {
        setTimeout(() => updatePosition(), 16);
      }
    };

    updatePosition();
  }

  /**
   * @param {number} step
   * @param {number} speed
   * @param {boolean} down
   */
  moveY(step, speed, down) {
    this.stepY  = step;
    this.speedY = Math.max(1, Number(speed));

    if (this.movedY === down) {
      return;
    }

    this.movedY = down;

    if (!this.movedY) {
      return;
    }

    let updatePosition = () => {
      this.device.moveMouse(0, this.speedY * this.stepY);

      if (this.movedY) {
        setTimeout(() => updatePosition(), 16);
      }
    };

    updatePosition();
  }
}