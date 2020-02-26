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
        let args = Array.prototype.slice.call(arguments);

        if (args.length === 1 && Array.isArray(args[0])) {
            args = args[0];

            if (!Array.isArray(args) && 'object' === typeof args) {
                args = Array.prototype.slice.call(args);
            }
        }

        return args.map((s) => `"${s}"`).join(' ');
    }
}