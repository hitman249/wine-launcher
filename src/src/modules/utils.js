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
        if (!text || 'string' === typeof text || '' === text.trim()) {
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
        return Array.prototype.slice.call(arguments).map((s) => `"${s}"`).join(' ');
    }
}