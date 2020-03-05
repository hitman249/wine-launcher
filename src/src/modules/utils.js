const crypto = require('crypto');
const iconv  = window.require('iconv-lite');

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

        let result = JSON.parse(text);

        if (!result) {
            return null;
        }

        return result;
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
     * @return {[]}
     */
    static natsort(value = []) {
        return value.sort((new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })).compare);
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
}