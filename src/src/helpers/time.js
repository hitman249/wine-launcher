export default class Time {

    /**
     * 3610 -> 1 час.
     * @param {number} sec
     * @return {string}
     */
    static secondPrint(sec) {
        let hours   = Math.floor(sec / 3600);
        let minutes = Math.floor((sec - (hours * 3600)) / 60);
        let seconds = Math.floor((sec - (hours * 3600)) - (minutes * 60));

        if (hours) {
            return `${hours} ч.`;
        }

        if (minutes) {
            return `${minutes} мин.`;
        }

        if (seconds) {
            return `${seconds} сек.`;
        }
    }
}
