const { remote } = require('electron');
const UInput     = remote.getGlobal('uinput');

const SETUP_OPTIONS = {
  UI_SET_EVBIT:  [
    UInput.EV_KEY,
    UInput.EV_SYN,
    UInput.EV_REL,
  ],
  UI_SET_RELBIT: [
    UInput.REL_X,
    UInput.REL_Y,
    UInput.REL_WHEEL,
    UInput.REL_HWHEEL,
  ],
  UI_SET_KEYBIT: [
    UInput.BTN_LEFT,
    UInput.BTN_RIGHT,
    UInput.BTN_MIDDLE,
    UInput.BTN_SIDE,
    UInput.BTN_EXTRA,
  ],
};

const CREATE_OPTIONS = {
  name: 'Wine Launcher Mouse Emulation',
  id:   {
    busType: UInput.BUS_USB,
    vendor:  0x0,
    product: 0x0,
    version: 1
  },
};

export default class UInputMouse {
  static map = {
    left:   UInput.BTN_LEFT,
    right:  UInput.BTN_RIGHT,
    middle: UInput.BTN_MIDDLE,
  };
  runtime = Promise.resolve();
  delay = 2;
  device;

  async createDevice() {
    if (undefined !== this.device) {
      return this.device;
    }

    this.device = await UInput.setup(SETUP_OPTIONS);
    this.device.create(CREATE_OPTIONS);

    return this.device;
  }

  async sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  moveMouse(x, y) {
    this.createDevice().then(device => {
      this.runtime = this.runtime
        .then(() => device.sendEvent(UInput.EV_REL, UInput.REL_X, x, false))
        .then(() => device.sendEvent(UInput.EV_REL, UInput.REL_Y, y, true))
        .then(() => this.sleep(this.delay));
    });
  }


  /**
   * @param {string} key [left, right, middle]
   * @param {boolean} pressed
   */
  keyToggle(key, pressed) {
    if (undefined === UInputMouse.map[key]) {
      return;
    }

    this.createDevice().then(device => {
      this.runtime = this.runtime
        .then(() => device.keyEvent(UInputMouse.map[key], pressed))
        .then(() => this.sleep(this.delay));
    });
  }
}