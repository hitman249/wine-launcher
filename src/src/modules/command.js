import _ from "lodash";

const child_process = require('child_process');
const { remote }    = require('electron');
const getArguments  = remote.getGlobal('getArguments');

export default class Command {

  /**
   * @type {string|null}
   */
  locale = null;

  /**
   * @param {string} cmd
   * @return {string}
   */
  exec(cmd) {
    try {
      return child_process.execSync(cmd).toString().trim();
    } catch (e) {
      return e.stdout.toString().trim();
    }
  }

  /**
   * @param {string} cmd
   * @return {Buffer}
   */
  execOfBuffer(cmd) {
    try {
      return child_process.execSync(cmd);
    } catch (e) {
      return e.stdout;
    }
  }

  /**
   * @return {string}
   */
  getLocale() {
    if (null !== this.locale) {
      return this.locale;
    }

    let locale = window.process.env.LC_ALL;

    if (locale) {
      this.locale = locale;
      return this.locale;
    }

    let counts = {};

    child_process.execSync('locale').toString().trim().split('\n').map(s => s.trim())
      .forEach((line) => {
        let [ field, value ] = line.split('=').map(s => _.trim(s.trim(), '"'));

        if (!value) {
          return;
        }

        if (undefined === counts[value]) {
          counts[value] = 0;
        } else {
          counts[value] += 1;
        }
      });

    locale = _.maxBy(Object.keys(counts).map(locale => ({ locale, c: counts[locale] })), 'c');

    if (locale) {
      this.locale = locale.locale;
    }

    return this.locale;
  }

  /**
   * @param {string} cmd
   * @return {string}
   */
  addSlashes(cmd) {
    return cmd.split('\\').join('\\\\').split('"').join('\\"');
  }

  /**
   * @return {{}}
   */
  getArguments() {
    return getArguments();
  }
}