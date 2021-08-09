import FileSystem from "../file-system";
import Config     from "../config";
import Utils      from "../utils";
import Gamepad    from "./gamepad";

export default class KeyMapping {
  static BUTTONS      = 'buttons';
  static AXES         = 'axes';
  static NEXT_MAPPING = 'next_mapping';

  /**
   * @type {({buttons: {}, axes: {}})[]}
   */
  mappings;

  /**
   * @type {Gamepad}
   */
  gamepad;

  /**
   * @type {Config}
   */
  config;

  /**
   * @type {FileSystem}
   */
  fs;

  /**
   * @type {number}
   */
  index = 0;

  /**
   * @type {string}
   */
  path;

  /**
   * @type {KeyMapping[]}
   */
  static mountMappings = [];

  /**
   * @param {Gamepad} gamepad
   * @param {Config} config
   */
  constructor(gamepad, config) {
    this.gamepad = gamepad;
    this.config  = config;
    this.fs      = window.app.getFileSystem();
  }

  /**
   * @return {string}
   */
  getGamepadName() {
    return this.gamepad.getName();
  }

  getFolderPath() {
    return `${this.config.getConfigDirPath()}/gamepads/${this.getGamepadName()}`;
  }

  /**
   * @return {string}
   */
  getPath() {
    if (this.path) {
      return this.path;
    }

    const dir = this.getFolderPath();

    let findPath;

    if (this.fs.exists(dir)) {
      let gamepad = this.gamepad.getNativeGamepad();
      let buttons = Object.keys(gamepad.buttons).length;
      let axes    = Object.keys(gamepad.axes).length;

      Utils.natsort(this.fs.glob(dir + '/*.json'))
        .forEach((path) => {
          if (!findPath && !KeyMapping.mountMappings.includes(path)) {
            let config = Utils.jsonDecode(this.fs.fileGetContents(path));
            if (buttons === Object.keys(config[0].buttons).length && axes === Object.keys(config[0].axes).length) {
              KeyMapping.mountMappings.push(path);
              findPath = path;
            }
          }
        });
    }

    if (findPath) {
      this.path = findPath;
      return findPath;
    }

    let i = 0;

    // eslint-disable-next-line
    while (true) {
      let path = `${dir}/mapping${i}.json`;
      if (!this.fs.exists(path) && !KeyMapping.mountMappings.includes(path)) {
        KeyMapping.mountMappings.push(path);
        this.path = path;

        return path;
      }
    }
  }

  mount() {
    this.getMappings();
  }

  unmount() {
    const currentPath        = this.getPath();
    KeyMapping.mountMappings = KeyMapping.mountMappings.filter((path) => path !== currentPath);
  }

  /**
   * @return {boolean}
   */
  save() {
    let dir = this.getFolderPath();

    if (!this.fs.exists(dir)) {
      this.fs.mkdir(dir);
    }

    if (!this.path || !this.mappings) {
      return false;
    }

    this.fs.filePutContents(this.path, Utils.jsonEncode(this.mappings));

    return true;
  }

  /**
   * @return {boolean}
   */
  delete() {
    let path = this.getPath();

    if (!path || !this.fs.exists(path)) {
      return false;
    }

    this.fs.rm(path);

    return true;
  }

  /**
   * @return {{buttons: {}, axes: {}}}
   */
  getDefaultMappings() {
    let buttons = {};
    let axes    = {};
    let gamepad = this.gamepad.getNativeGamepad();

    Array.from(gamepad.buttons).forEach((button, index) => {
      buttons[index] = '';
    });

    if (gamepad.axes && gamepad.axes.length > 0) {
      Array.from(gamepad.axes).forEach((button, index) => {
        axes[index] = '';
      });
    }

    return {
      buttons: Object.assign({}, buttons),
      axes:    Object.assign({}, axes),
    };
  }

  /**
   * @return {({buttons: {}, axes: {}})[]}
   */
  getMappings() {
    if (undefined === this.mappings) {
      let path = this.getPath();

      if (this.fs.exists(path)) {
        this.mappings = Utils.jsonDecode(this.fs.fileGetContents(path));
      } else {
        this.mappings = [ this.getDefaultMappings() ];
      }
    }

    return this.mappings;
  }

  /**
   * @return {{buttons: {}, axes: {}}}
   */
  getMapping() {
    return this.getMappings()[this.index];
  }

  nextMapping() {
    this.index++;

    if (this.index >= this.getMappings().length) {
      this.index = 0;
    }
  }

  addMapping() {
    this.getMappings();
    this.mappings.push(JSON.parse(JSON.stringify(this.mappings[this.mappings.length - 1])));
  }

  /**
   * @param {number} mappingIndex
   */
  removeMapping(mappingIndex) {
    let mappings = [];

    this.mappings.forEach((mapping, index) => {
      if (String(index) !== String(mappingIndex)) {
        mappings.push(mapping);
      }
    });

    this.mappings = mappings;
  }

  /**
   * @param {number} mappingIndex
   * @param {string} type
   * @param {number} index
   * @param {string} key
   */
  setKey(mappingIndex, type, index, key) {
    this.getMappings();
    let value = key.trim();

    this.mappings[mappingIndex][type][index] = ('|' === value) ? '' : value;
  }
}