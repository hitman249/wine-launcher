import FileSystem from "../file-system";
import Config     from "../config";
import Utils      from "../utils";

export default class KeyMapping {
  static BUTTONS      = 'buttons';
  static AXES         = 'axes';
  static NEXT_MAPPING = 'next_mapping';

  /**
   * @type {({buttons: {}, axes: {}})[]}
   */
  mappings;

  /**
   * @type {window.Gamepad}
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
   * @param {window.Gamepad} gamepad
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
    return this.gamepad.id;
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
      Utils.natsort(this.fs.glob(dir + '/*.json'))
        .forEach((path) => {
          if (!findPath && !KeyMapping.mountMappings.includes(path)) {
            KeyMapping.mountMappings.push(path);
            findPath = path;
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

    Array.from(this.gamepad.buttons).forEach((button, index) => {
      buttons[index] = '';
    });

    if (this.gamepad.axes && this.gamepad.axes.length > 0) {
      const count = this.gamepad.axes.length;
      Array.from(this.gamepad.axes).forEach((button, index) => {
        if (count > 3) {
          switch (index) {
            case 0:
              axes[index] = 'a|d';
              break;
            case 1:
              axes[index] = 'w|s';
              break;
            case 2:
              axes[index] = 'mouse_inverted_x|3';
              break;
            case 3:
              axes[index] = 'mouse_inverted_y|3';
              break;
            default:
              axes[index] = '';
          }
        } else {
          switch (index) {
            case 0:
              axes[index] = 'mouse_inverted_x|3';
              break;
            case 1:
              axes[index] = 'mouse_inverted_y|3';
              break;
            default:
              axes[index] = '';
          }
        }
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
    this.mappings[mappingIndex][type][index] = key;
  }
}