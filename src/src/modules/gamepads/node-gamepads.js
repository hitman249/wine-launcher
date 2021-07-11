import _ from 'lodash';

const { remote } = require('electron');
const gamepads   = remote.getGlobal('gamepads');

export default class NodeGamepads {
  connectedGamepads = {};
  noiseThreshold = 0.1;

  events = {
    attach: [],
    detach: [],
  };

  static timerDetectDevices;

  create() {
    gamepads.init();

    if (undefined !== NodeGamepads.timerDetectDevices) {
      clearInterval(NodeGamepads.timerDetectDevices);
    }

    NodeGamepads.timerDetectDevices = setInterval(() => this.detectDevices(), 500);
  }

  destroy() {
    clearInterval(NodeGamepads.timerDetectDevices);
    gamepads.shutdown();
  }

  addEventListener(event, callable) {
    switch (event) {
      case 'gamepadconnected':
        this.events.attach.push(callable);
        break;
      case 'gamepaddisconnected':
        this.events.detach.push(callable);
        break;
    }
  }

  detectDevices() {
    gamepads.detectDevices();

    let lastGamepads    = this.connectedGamepads;
    let currentGamepads = this.getGamepads();

    Object.keys(currentGamepads).forEach((i1) => {
      if (undefined === lastGamepads[i1]) {
        this.doAttach(currentGamepads[i1]);
      }
    });

    Object.keys(lastGamepads).forEach((i1) => {
      if (undefined === currentGamepads[i1]) {
        this.doDetach(lastGamepads[i1]);
      }
    });

    this.connectedGamepads = currentGamepads;
  }

  doAttach(gamepad) {
    this.events.attach.forEach(callable => callable({gamepad}));
  }

  doDetach(gamepad) {
    this.events.detach.forEach(callable => callable({gamepad}));
  }

  /**
   * @param {{}} gamepad
   * @return {{buttons: *, axes: *, index: *, id: string}}
   */
  convertGamepad(gamepad) {
    return {
      id:      this.createName(gamepad),
      index:   gamepad.deviceID,
      axes:    gamepad.axisStates.map(value => this.normalizeValue(value)),
      buttons: gamepad.buttonStates.map(status => ({ pressed: status, touched: status, value: status ? 1 : 0 })),
    };
  }

  /**
   * @param {number} value
   */
  normalizeValue(value) {
    if (this.noiseThreshold <= Math.abs(value)) {
      return value;
    }

    return 0;
  }

  /**
   * @param gamepad
   * @return {string}
   */
  createName(gamepad) {
    let vendorID  = gamepad.vendorID.toString(16);
    let productID = gamepad.productID.toString(16);

    return `${gamepad.description} (Vendor: ${_.padStart(vendorID, 4, '0')} Product: ${_.padStart(productID, 4, '0')})`;
  }

  /**
   * @return {{}}
   */
  getGamepads() {
    gamepads.processEvents();

    let result = {};

    for (let i = 0, l = gamepads.numDevices(); i < l; i++) {
      let device = gamepads.deviceAtIndex(i);
      result[device.deviceID] = this.convertGamepad(device);
    }

    return result;
  }

  deviceAtIndex(index) {
    return gamepads.deviceAtIndex(index);
  }
}

