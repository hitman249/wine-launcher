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
      return `${hours} ${window.i18n.t('time.h')}`;
    }

    if (minutes) {
      return `${minutes} ${window.i18n.t('time.m')}`;
    }

    if (seconds) {
      return `${seconds} ${window.i18n.t('time.s')}`;
    }
  }
}
