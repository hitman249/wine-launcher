import _          from "lodash";
import FileSystem from "./file-system";
import Utils      from "./utils";
import Prefix     from "./prefix";
import AppFolders from "./app-folders";
import Icon       from "./icon";
import Api        from "../api";
import action     from "../store/action";

export default class Config {

  /**
   * @type {AppFolders}
   */
  appFolders = null;

  /**
   * @type {Prefix}
   */
  prefix = null;

  /**
   * @type {FileSystem}
   */
  fs = null;

  /**
   * @type {string}
   */
  path = null;

  /**
   * @type {object}
   */
  config = null;

  /**
   * @type {number}
   */
  sort = 500;

  /**
   * @type {string}
   */
  defaultFile = '/data/configs/game.json';

  /**
   * @type {null}
   */
  process = null;

  /**
   * @type {number}
   */
  static fileIndex = 0;

  /**
   * @param {string|null?} filepath
   * @param {AppFolders} appFolders
   * @param {Prefix} prefix
   */
  constructor(filepath = null, appFolders = null, prefix = null) {
    this.path       = filepath;
    this.appFolders = appFolders || window.app.getAppFolders();
    this.prefix     = prefix || window.app.getPrefix();
    this.fs         = this.appFolders.getFileSystem();

    this.loadConfig();
  }

  /**
   * @return {Config[]}
   */
  findConfigs() {
    let prefixFilename = this.prefix.getBasename();

    return _.sortBy(
      this.fs
        .glob(this.appFolders.getConfigsDir() + '/*.json')
        .filter(path => prefixFilename !== this.fs.basename(path))
        .map(path => new Config(path)),
      'sort'
    );
  }

  getPath() {
    if (null === this.path) {
      // eslint-disable-next-line
      while (true) {
        let path     = this.defaultFile.split('.json').join(`${Config.fileIndex++}.json`);
        let fullPath = this.appFolders.getRootDir() + path;

        if (!this.fs.exists(fullPath)) {
          return fullPath;
        }
      }
    }

    return this.path;
  }

  getCode() {
    return _.head(this.fs.basename(this.path).split('.'));
  }

  getConfigDirPath() {
    return `${this.appFolders.getConfigsDir()}/${this.getCode()}`;
  }

  getGameName() {
    return _.get(this.config, 'app.name', 'Empty name');
  }

  getGameDescription() {
    return _.get(this.config, 'app.description', '');
  }

  getGameVersion() {
    return _.get(this.config, 'app.version', '');
  }

  getGameTime() {
    return _.get(this.config, 'app.time', 0);
  }

  getGamePath() {
    return '/' + _.trim(_.get(this.config, 'app.path', ''), '/\\');
  }

  getGameExe() {
    return _.get(this.config, 'app.exe', '');
  }

  getGameArguments() {
    return _.get(this.config, 'app.arguments', '');
  }

  getGameFullPath() {
    let wine       = window.app.getKernel();
    let driveC     = wine.getDriveC();
    let gamePath   = _.trim(this.prefix.getGamesFolder(), '/');
    let additional = _.trim(this.getGamePath(), '/');

    return [ driveC, gamePath, additional ].filter(s => s).join('/');
  }

  getGameExeFullPath() {
    return this.getGameFullPath() + `/${this.getGameExe()}`;
  }

  getImagesPath() {
    return `${this.appFolders.getConfigsDir()}/${this.getCode()}`;
  }

  getGameIcon() {
    let path = `${this.getImagesPath()}/icon.png`;

    if (this.fs.exists(path)) {
      return path;
    }

    return '';
  }

  /**
   * @return {Icon}
   */
  getIcon() {
    return window.app.createIcon(this);
  }

  getGameBackground() {
    let exts = [ '.jpg', '.png', '.jpeg' ];
    let path = `${this.getImagesPath()}/background`;

    let ext = exts.find((ext) => this.fs.exists(`${path}${ext}`));

    if (ext) {
      return `${path}${ext}`;
    }

    return '';
  }

  loadConfig() {
    if (!this.config && this.path && this.fs.exists(this.path)) {
      this.config = Utils.jsonDecode(this.fs.fileGetContents(this.path));
    }

    if (!this.config) {
      this.config = this.getDefaultConfig();
    }

    if (!this.path) {
      this.path = this.getPath();
    }

    this.sort = _.get(this.config, 'app.sort', 500);

    this.config.app.disable_gamepads = this.isDisabledGamepads();
  }

  getDefaultConfig() {
    return {
      app:     {
        path:             'The Super Game',
        exe:              'Game.exe',
        arguments:        '',
        prefix_cmd:       '',
        name:             'The Super Game: Deluxe Edition',
        description:      '',
        version:          '1.0.0',
        sort:             500,
        time:             0,
        icon_height:      88,
        disable_gamepads: true,
      },
      exports: {},
      wine:    {
        fsr:               '',
        render:            'vulkan',
        csmt:              true,
        pulse:             true,
        esync:             true,
        fsync:             true,
        aco:               false,
        gamemode:          false,
        ssm:               true,
        swc:               false,
        gl_override:       false,
        laa:               true,
        disable_nvapi:     false,
        mangohud_dlsym:    false,
        mangohud_position: 'top-left',
        nod3d9:            false,
        nod3d10:           false,
        nod3d11:           false,
      },
      window:  {
        enable:     false,
        resolution: 'auto',
      },
    };
  }

  /**
   * @returns {Object}
   */
  getConfig() {
    return this.config;
  }

  /**
   * @param {Object} config
   */
  setConfig(config) {
    config.time = 0;
    this.config = this.prepareConfig(config);
  }

  /**
   * @param {Object} config
   * @return {Object}
   */
  prepareConfig(config) {
    let _started = JSON.parse(JSON.stringify(this.config));

    this.config  = this.getDefaultConfig();
    let _default = this.getFlatConfig();

    this.config  = config;
    let _current = this.getFlatConfig();

    Object.keys(_current).forEach(field => {
      let value = _current[field];
      if (undefined !== value && 'undefined' !== value) {
        _default[field] = value;
      }
    });

    this.setFlatConfig(_default);

    let mapExport = {
      'WINE_LARGE_ADDRESS_AWARE': {
        key:   'wine.laa',
        value: this.isLargeAddressAware()
      },
      'STAGING_SHARED_MEMORY':    {
        key:   'wine.ssm',
        value: this.isSSM()
      },
      'RADV_PERFTEST':            {
        key:   'wine.aco',
        value: this.isACO()
      },
      'MANGOHUD_DLSYM':           {
        key:   'wine.mangohud_dlsym',
        value: this.isMangoHudDlsym()
      },
      'WINEFSYNC':                {
        key:   'wine.fsync',
        value: this.isFsync()
      },
      'WINEESYNC':                {
        key:   'wine.esync',
        value: this.isEsync()
      },
      'STAGING_WRITECOPY':        {
        key:   'wine.swc',
        value: this.isSWC()
      },
    };

    let _exports = {};

    Object.keys(this.config.exports).forEach(field => {
      if (undefined !== mapExport[field]) {
        _.set(this.config, mapExport[field].key, mapExport[field].value);
      } else {
        _exports[field] = this.config.exports[field];
      }
    });

    this.config.exports = _exports;

    _default    = JSON.parse(JSON.stringify(this.config));
    this.config = _started;

    return _default;
  }

  /**
   * @param {string} url
   */
  setBackgroundUrl(url) {
    this.background_url = url;
  }

  /**
   * @param {string} url
   */
  setIconUrl(url) {
    this.icon_url = url;
  }

  /**
   * @return {string}
   */
  getBackgroundUrl() {
    return this.background_url;
  }

  /**
   * @return {Buffer|null}
   */
  getBackgroundUrlBuffer() {
    let image = this.getBackgroundUrl();

    if (!image) {
      return null;
    }

    let base64 = image.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    return new Buffer(base64, 'base64');
  }

  /**
   * @return {string}
   */
  getIconUrl() {
    return this.icon_url;
  }

  /**
   * @return {Buffer|null}
   */
  getIconUrlBuffer() {
    let image = this.getIconUrl();

    if (!image) {
      return null;
    }

    let base64 = image.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    return new Buffer(base64, 'base64');
  }

  /**
   * @param {string} type
   * @return {Buffer|null}
   */
  getImageBuffer(type) {
    if ('background' === type) {
      return this.getBackgroundUrlBuffer();
    }

    if ('icon' === type) {
      return this.getIconUrlBuffer();
    }

    return null;
  }

  /**
   * @param {string} type
   * @return {string}
   */
  getImageExt(type) {
    let url = '';

    if ('background' === type) {
      url = this.getBackgroundUrl();
    }

    if ('icon' === type) {
      url = this.getIconUrl();
    }

    if (!url) {
      return '';
    }

    let math = url.match(/^data:([A-Za-z-+/]+);base64,/);

    if (!math || math.length < 2) {
      return '';
    }

    let split = math[1].split('/');

    if (!split || split.length < 2) {
      return '';
    }

    return split[1];
  }

  saveImages() {
    [ 'icon', 'background' ].forEach((path) => {
      let buffer = this.getImageBuffer(path);

      if (buffer) {
        let ext        = this.getImageExt(path);
        let imagesPath = this.getImagesPath();

        if (!this.fs.exists(imagesPath)) {
          this.fs.mkdir(imagesPath);
        }

        this.fs.glob(`${imagesPath}/${path}.*`).forEach(image => this.fs.rm(image));

        this.fs.filePutContents(`${imagesPath}/${path}.${ext}`, buffer);
      }
    });
  }

  /**
   * @return {number}
   */
  getId() {
    return this.config.id || 0;
  }

  /**
   * @returns {Object}
   */
  getFlatConfig() {
    let result = {};
    let config = _.cloneDeep(this.getConfig());

    Object.keys(config).forEach((key) => {
      let section = config[key];

      if ('exports' === key) {
        result[key] = section;
        return;
      }

      Object.keys(section).forEach((sectionKey) => {
        result[`${key}.${sectionKey}`] = section[sectionKey];
      });
    });

    return result;
  }

  /**
   * @param {Object} config
   */
  setFlatConfig(config) {
    Object.keys(config).forEach((path) => {
      if ('icon' === path || 'background' === path) {
        let file = config[path];

        if (undefined !== file.body) {
          let ext        = _.toLower(_.last(file.file.name.split('.')));
          let imagesPath = this.getImagesPath();

          if (!this.fs.exists(imagesPath)) {
            this.fs.mkdir(imagesPath);
          }

          this.fs.glob(`${imagesPath}/${path}.*`).forEach(image => this.fs.rm(image));

          this.fs.filePutContents(`${imagesPath}/${path}.${ext}`, file.body);
        }

        return;
      }

      this.setConfigValue(path, config[path]);
    });

    if (null !== _.get(this.config, 'tmp', null)) {
      _.unset(this.config, 'tmp');
    }
  }

  /**
   * @param {string} path 'app.time'
   * @param {*} value
   */
  setConfigValue(path, value) {
    this.config = _.set(this.config, path, value);
  }

  /**
   * @param {string} path
   * @return {*|null}
   */
  getConfigValue(path) {
    return _.get(this.config, path, null);
  }

  /**
   * @return {string|null}
   */
  getGameDir() {
    let path = this.getConfigValue('app.path');

    if (!path) {
      return null;
    }

    path = _.trim(path, '\\/').split('/')[0].split('\\')[0];

    if (!path) {
      return null;
    }

    return this.appFolders.getGamesDir() + `/${path}`;
  }

  /**
   * @return {boolean}
   */
  save() {
    if (!this.path || !this.config) {
      return false;
    }

    this.fs.filePutContents(this.path, Utils.jsonEncode(this.config));

    return true;
  }

  /**
   * @param {boolean} andFiles
   * @return {boolean}
   */
  delete(andFiles = false) {
    if (!this.path || !this.fs.exists(this.path)) {
      return false;
    }

    this.fs.rm(this.path);

    let dir = this.getImagesPath();

    if (this.fs.exists(dir)) {
      this.fs.rm(dir);
    }

    if (true === andFiles) {
      let gameDir = this.getGameDir();

      if (gameDir && this.fs.exists(gameDir)) {
        this.fs.rm(gameDir);
      }
    }

    return true;
  }

  /**
   * @return {boolean|null}
   */
  isExportEsync() {
    let value = _.get(this.config, 'exports.WINEESYNC', null);

    if (null === value) {
      return null;
    }

    return parseInt(value) === 1;
  }

  /**
   * @return {boolean}
   */
  isConfigEsync() {
    return Boolean(_.get(this.config, 'wine.esync', false));
  }

  /**
   * @return {boolean}
   */
  isEsync() {
    let exportValue = this.isExportEsync();
    let configValue = this.isConfigEsync();

    return Boolean((null === exportValue && configValue) || exportValue);
  }

  /**
   * @return {boolean|null}
   */
  isExportFsync() {
    let value = _.get(this.config, 'exports.WINEFSYNC', null);

    if (null === value) {
      return null;
    }

    return parseInt(value) === 1;
  }

  /**
   * @return {boolean}
   */
  isConfigFsync() {
    return Boolean(_.get(this.config, 'wine.fsync', false));
  }

  /**
   * @return {boolean}
   */
  isFsync() {
    let exportValue = this.isExportFsync();
    let configValue = this.isConfigFsync();

    return Boolean((null === exportValue && configValue) || exportValue);
  }

  /**
   * @return {boolean|null}
   */
  isExportMangoHudDlsym() {
    let value = _.get(this.config, 'exports.MANGOHUD_DLSYM', null);

    if (null === value) {
      return null;
    }

    return parseInt(value) === 1;
  }

  /**
   * @return {boolean}
   */
  isConfigMangoHudDlsym() {
    return Boolean(_.get(this.config, 'wine.mangohud_dlsym', false));
  }

  /**
   * @return {boolean}
   */
  isMangoHudDlsym() {
    let exportValue = this.isExportMangoHudDlsym();
    let configValue = this.isConfigMangoHudDlsym();

    return Boolean((null === exportValue && configValue) || exportValue);
  }

  /**
   * @return {boolean|null}
   */
  isExportPba() {
    let value = _.get(this.config, 'exports.PBA_DISABLE', null);

    if (null === value) {
      return null;
    }

    return parseInt(value) === 0;
  }

  /**
   * @return {string|null}
   */
  isExportACO() {
    let value = _.get(this.config, 'exports.RADV_PERFTEST', null);

    if (null === value) {
      return null;
    }

    return value;
  }

  /**
   * @return {boolean}
   */
  isConfigACO() {
    return Boolean(_.get(this.config, 'wine.aco', false));
  }

  /**
   * @return {boolean}
   */
  isACO() {
    let exportValue = this.isExportACO();
    let configValue = this.isConfigACO();

    return Boolean((null === exportValue && configValue) || exportValue);
  }

  /**
   * @return {string|null}
   */
  isExportSSM() {
    let value = _.get(this.config, 'exports.STAGING_SHARED_MEMORY', null);

    if (null === value) {
      return null;
    }

    return value;
  }

  /**
   * @return {boolean}
   */
  isConfigSSM() {
    return Boolean(_.get(this.config, 'wine.ssm', false));
  }

  /**
   * @return {boolean}
   */
  isSSM() {
    let exportValue = this.isExportSSM();
    let configValue = this.isConfigSSM();

    return Boolean((null === exportValue && configValue) || exportValue);
  }

  /**
   * @return {string|null}
   */
  isExportSWC() {
    let value = _.get(this.config, 'exports.STAGING_WRITECOPY', null);

    if (null === value) {
      return null;
    }

    return value;
  }

  /**
   * @return {boolean}
   */
  isConfigSWC() {
    return Boolean(_.get(this.config, 'wine.swc', false));
  }

  /**
   * @return {boolean}
   */
  isSWC() {
    let exportValue = this.isExportSWC();
    let configValue = this.isConfigSWC();

    return Boolean((null === exportValue && configValue) || exportValue);
  }

  /**
   * @return {boolean}
   */
  isExportOverrideMesaOpenGL() {
    return null !== _.get(this.config, 'exports.MESA_GL_VERSION_OVERRIDE', null);
  }

  /**
   * @return {boolean}
   */
  isOverrideMesaOpenGL() {
    if (this.isExportOverrideMesaOpenGL()) {
      return false;
    }

    return Boolean(_.get(this.config, 'wine.gl_override', false));
  }

  /**
   * @return {boolean}
   */
  isGameMode() {
    return Boolean(_.get(this.config, 'wine.gamemode', false));
  }

  /**
   * @return {boolean|null}
   */
  isExportLargeAddressAware() {
    let value = _.get(this.config, 'exports.WINE_LARGE_ADDRESS_AWARE', null);

    if (null === value) {
      return null;
    }

    return parseInt(value) === 0;
  }

  /**
   * @return {boolean}
   */
  isConfigLargeAddressAware() {
    return Boolean(_.get(this.config, 'wine.laa', false));
  }

  /**
   * @return {boolean}
   */
  isLargeAddressAware() {
    let exportValue = this.isExportLargeAddressAware();
    let configValue = this.isConfigLargeAddressAware();

    return Boolean((null === exportValue && configValue) || exportValue);
  }

  /**
   * @return {boolean}
   */
  isDisableNvapi() {
    return Boolean(_.get(this.config, 'wine.disable_nvapi', false));
  }

  /**
   * @return {boolean}
   */
  isNoD3D9() {
    return Boolean(_.get(this.config, 'wine.nod3d9', false));
  }

  /**
   * @return {boolean}
   */
  isNoD3D10() {
    return Boolean(_.get(this.config, 'wine.nod3d10', false));
  }

  /**
   * @return {boolean}
   */
  isNoD3D11() {
    return Boolean(_.get(this.config, 'wine.nod3d11', false));
  }

  /**
   * @return {boolean}
   */
  isCsmt() {
    return Boolean(_.get(this.config, 'wine.csmt', false));
  }

  /**
   * @return {boolean}
   */
  isFsr() {
    return Boolean(_.get(this.config, 'wine.fsr', ''));
  }

  /**
   * @return {boolean}
   */
  isPulse() {
    return Boolean(_.get(this.config, 'wine.pulse', false));
  }

  /**
   * @return {boolean}
   */
  isWindow() {
    return Boolean(_.get(this.config, 'window.enable', false));
  }

  /**
   * @return {boolean}
   */
  isDisabledGamepads() {
    let status =  _.get(this.config, 'app.disable_gamepads');
    return undefined === status ? true : Boolean(status);
  }

  /**
   * @return {boolean}
   */
  isMangoHud() {
    let mangoHud        = parseInt(_.get(this.config, 'exports.MANGOHUD', 0));
    let disableMangoHud = parseInt(_.get(this.config, 'exports.DISABLE_MANGOHUD', 0));

    return 1 !== disableMangoHud && 1 === mangoHud;
  }

  /**
   * @return {boolean}
   */
  isVkBasalt() {
    let enableVkBasalt  = parseInt(_.get(this.config, 'exports.ENABLE_VKBASALT', 0));
    let disableVkBasalt = parseInt(_.get(this.config, 'exports.DISABLE_VKBASALT', 0));

    return 1 !== disableVkBasalt && 1 === enableVkBasalt;
  }

  /**
   * @return {boolean}
   */
  existExportsVkBasalt() {
    return this.existExports('ENABLE_VKBASALT') || this.existExports('DISABLE_VKBASALT');
  }

  /**
   * @return {boolean}
   */
  existExportsMangoHud() {
    return this.existExports('MANGOHUD') || this.existExports('DISABLE_MANGOHUD');
  }

  /**
   * @param {string} field
   * @return {boolean}
   */
  existExports(field) {
    return undefined !== _.get(this.config, `exports.${field}`, undefined);
  }

  /**
   * @return {string}
   */
  getPrefixCmd() {
    let replaces = window.app.getReplaces();

    if (!replaces) {
      return '';
    }

    return replaces.replaceByString(_.get(this.config, 'app.prefix_cmd', ''));
  }

  /**
   * @return {string}
   */
  getRenderAPI() {
    return _.get(this.config, 'wine.render', 'vulkan');
  }

  /**
   * @return {string}
   */
  getFsr() {
    return _.get(this.config, 'wine.fsr', '').replace('fsr-', '');
  }

  /**
   * @return {string}
   */
  getMangoHudPosition() {
    let position = _.get(this.config, 'wine.mangohud_position', 'top-left');

    if ('undefined' === position || undefined === position) {
      return 'top-left';
    }

    return position;
  }

  /**
   * @return {number}
   */
  getIconHeight() {
    return _.get(this.config, 'app.icon_height', 88);
  }

  /**
   * @return {{}}
   */
  getConfigExports() {
    return _.get(this.config, 'exports', {});
  }

  setProcess(spawn) {
    this.process = spawn;
  }

  /**
   * @return {boolean}
   */
  isKilledProcess() {
    if (this.process && !this.process.killed) {
      return false;
    }

    return true;
  }

  killProcess() {
    if (this.process) {
      try {
        window.process.kill(-this.process.pid);
      } catch (e) {
        try {
          window.process.kill(this.process.pid);
        } catch (e) {
          window.app.getKernel().kill();
        }
      }

      this.process = null;
    }
  }

  /**
   * @return {Promise<Object>}
   */
  sendToServer() {
    Api.commit(action.get('search').CLEAR);
    Api.commit(action.get('shared').CLEAR);

    let config = _.cloneDeep(this.config);
    _.set(config, 'app.time', 0);

    let data       = { config };
    let icon       = this.getGameIcon();
    let background = this.getGameBackground();

    if (icon) {
      data.icon = Utils.formDataFile(icon);
    }

    if (background) {
      data.background = Utils.formDataFile(background);
    }

    let id = this.getConfigValue('id');

    if (id) {
      return Api.updateConfig(id, data).then(data => {
        if (data.id) {
          this.config.id = data.id;
          this.save();
        }

        return data;
      });
    }

    return Api.createConfig(data).then(data => {
      this.config.id = data.id;
      this.save();

      return data;
    });
  }

  /**
   * @return {Promise<boolean>}
   */
  deleteToServer() {
    Api.commit(action.get('search').CLEAR);

    if (this.config.id) {
      return Api.deleteConfig(this.config.id);
    }

    return Promise.resolve(false);
  }

  /**
   * @return {boolean}
   */
  isMsDos() {
    return Utils.isMsDos(this.getGameExeFullPath());
  }
}