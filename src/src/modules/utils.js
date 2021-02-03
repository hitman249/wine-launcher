import _ from "lodash";

const { remote }   = require('electron');
const fsGlob       = remote.getGlobal('fs');
const fs           = require('fs');
const crypto       = require('crypto');
const iconv        = require('electron').remote.getGlobal('iconv');
const array_filter = require('locutus/php/array/array_filter');

export default class Utils {

  /**
   * @param {{}} object
   * @returns {string}
   */
  static jsonEncode(object) {
    return JSON.stringify(object, null, 4);
  }

  /**
   * @param {string} text
   * @returns {object|null}
   */
  static jsonDecode(text) {
    if (!text || 'string' !== typeof text || '' === text.trim()) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      return null;
    }
  }

  /**
   * @param arguments
   * @returns {string}
   */
  static quote() {
    const unpack = (values) => {
      let args = Array.prototype.slice.call(values);

      if (args.length === 1 && (Array.isArray(args[0]) || (!Array.isArray(args[0]) && 'object' === typeof args[0]))) {
        args = args[0];

        if (!Array.isArray(args) && 'object' === typeof args) {
          args = Array.prototype.slice.call(args);
        }
      }

      return args;
    };

    let args = unpack(unpack(arguments));

    return args.map((s) => `"${s}"`).join(' ');
  }

  /**
   * @param {string} str
   * @returns {string}
   */
  static findVersion(str = '') {
    let version = str.match('([0-9]{1,}.[0-9]{1,}.[0-9]{1,})');

    if (version) {
      return version[1];
    }

    version = str.match('([0-9]{1,}.[0-9]{1,})');

    if (version) {
      return version[1];
    }
  }

  /**
   * @param {[]} value
   * @param {boolean} reverse
   * @return {[]}
   */
  static natsort(value = [], reverse = false) {
    let result = value.sort((new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })).compare);

    if (reverse) {
      return _.reverse(result);
    }

    return result;
  }

  /**
   * @param {Buffer} buffer
   * @return {boolean}
   */
  static isUtf16(buffer) {
    let str = buffer.toString();

    // eslint-disable-next-line
    return (str.match(/\x00/g) || []).length / str.length > 0.1;
  }

  /**
   * @param {Buffer} buffer
   * @return {boolean}
   */
  static isCyrilic(buffer) {
    return buffer.toString() === iconv.encode(iconv.decode(buffer, 'utf8'), 'cp1251').toString();
  }

  /**
   * @param {Buffer} buffer
   * @return {string}
   */
  static normalize(buffer) {
    if (Utils.isUtf16(buffer)) {
      return iconv.decode(buffer, 'utf-16');
    } else if (Utils.isCyrilic(buffer)) {
      return iconv.decode(buffer, 'cp1251');
    }

    return buffer.toString();
  }

  /**
   * @param {Buffer|string} buffer
   * @param {string} encoding
   * @return {Buffer}
   */
  static encode(buffer, encoding = 'utf-8') {
    return iconv.encode(buffer, encoding);
  }

  /**
   * @param {Buffer} buffer
   * @param {string} encoding
   * @return {Buffer}
   */
  static decode(buffer, encoding = 'utf-8') {
    return iconv.decode(buffer, encoding);
  }

  /**
   * @param {string} str
   * @returns {string}
   */
  static md5(str) {
    return crypto.createHash('md5').update(str).digest('hex');
  }

  /**
   * @param {number} min
   * @param {number} max
   * @return {number}
   */
  static rand(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * @param {string} value
   * @param {number} _default
   * @returns {number}
   */
  static toInt(value, _default = 0) {
    value = Math.trunc(value);

    if (value === 0 || isNaN(value)) {
      return _default;
    }

    return value;
  }

  /**
   * @param str
   * @returns {number}
   */
  static hashCode(str) {
    return str.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
  }

  /**
   * @param {{}|[]} arr
   * @param {Function} func
   * @return {{}|[]}
   */
  static array_filter(arr, func) {
    return array_filter(arr, func);
  }

  /**
   * @param {number} ms
   * @return {Promise}
   */
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * @param {string} file
   * @return {string}
   */
  static base64FileEncode(file) {
    return (new Buffer(fs.readFileSync(file))).toString('base64');
  }

  /**
   * @param {string} base64
   * @param {string} file
   */
  static base64FileDecode(base64, file) {
    fs.writeFileSync(file, new Buffer(base64, 'base64'));
  }

  /**
   * @param {string} str
   * @param {number} len
   * @return {string}
   */
  static startTruncate(str, len) {
    let reverse = str.split('').reverse().join('');
    let trunc   = _.truncate(reverse, { length: len });

    if (reverse === trunc) {
      return str;
    }

    return trunc.split('').reverse().join('');
  }

  /**
   * @param {string} path
   * @return {null|ReadStream}
   */
  static formDataFile(path) {
    const exists = (path) => {
      try {
        if (fsGlob.existsSync(_.trimEnd(path, '/'))) {
          return true;
        }
      } catch (err) {
      }

      return false;
    };

    if (!exists(path)) {
      return null;
    }

    return fsGlob.createReadStream(path);
  }
}