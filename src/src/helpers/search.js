import _      from "lodash";
import Config from "../modules/config";
import Prefix from "../modules/prefix";

export default class Search {

  /**
   * @param {Object} data
   * @param {Prefix} prefix
   * @return {Object}
   */
  static prepareData(data, prefix) {
    let newData = JSON.parse(JSON.stringify(data));

    newData.data = newData.data.map((item) => {
      item.config.id = item.id;

      if (Array.isArray(item.config.exports) && item.config.exports.length === 0) {
        item.config.exports = {};
      }

      let config = new Config(null, prefix);
      config.setConfig(item.config);
      config.setBackgroundUrl(item.background_url);
      config.setIconUrl(item.icon_url);

      item.prefix      = prefix;
      item.exports     = _.get(item.config, 'exports', {});
      item.config      = config;
      item.description = config.getGameDescription();
      item.iconHeight  = config.getIconHeight();
      item.esync       = config.isEsync();
      item.fsync       = config.isFsync();
      item.pulse       = config.isPulse();
      item.csmt        = config.isCsmt();
      item.window      = config.isWindow();
      item.laa         = config.isLargeAddressAware();

      let tags = [];

      if (item.esync) {
        tags.push('esync');
      }

      if (item.fsync) {
        tags.push('fsync');
      }

      if (item.pulse) {
        tags.push('pulse');
      } else {
        tags.push('alsa');
      }

      if (item.csmt) {
        tags.push('csmt');
      }

      if (item.window) {
        tags.push('window');
      }

      if (item.laa) {
        tags.push('laa');
      }

      item.tags = tags;

      let env = [];

      Object.keys(item.exports).forEach((code) => {
        env.push(`${code}=${item.exports[code]}`);
      });

      item.env = env;

      let additional = _.trim(config.getGamePath(), '/');
      let exe        = _.trim(config.getGameExe(), '/');
      let args       = config.getGameArguments();

      item.run = _.trim(`${[ additional, exe ].filter(s => s).join('/')} ${args}`);

      return item;
    });

    return newData;
  }
}