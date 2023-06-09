import _          from "lodash";
import Utils      from "./utils";
import Command    from "./command";
import System     from "./system";
import FileSystem from "./file-system";
import AppFolders from "./app-folders";

export default class Prefix {

  /**
   * @type {AppFolders}
   */
  appFolders = null;

  /**
   * @type {Command}
   */
  command = null;

  /**
   * @type {FileSystem}
   */
  fs = null;

  /**
   * @type {System}
   */
  system = null;

  /**
   * @type {string}
   */
  path = '/data/configs/prefix.json';

  /**
   * @type {{}}
   */
  config = null;

  /**
   * @param {AppFolders} appFolders
   * @param {Command} command
   * @param {FileSystem} fs
   * @param {System} system
   */
  constructor(appFolders, command, fs, system) {
    this.appFolders = appFolders;
    this.command    = command;
    this.fs         = fs;
    this.system     = system;
  }

  loadConfig() {
    let path = this.getPath();

    if (!this.config && this.fs.exists(path)) {
      this.config = Utils.jsonDecode(this.fs.fileGetContents(path));
    }

    if (!this.config) {
      this.config = this.getDefaultConfig();
    }
  }

  /**
   * @return {string}
   */
  getArch() {
    return _.get(this.config, 'wine.arch', 'win32');
  }

  /**
   * @return {Wine|Proton}
   */
  getKernel() {
    return window.app.getKernel();
  }

  /**
   * @return {boolean}
   */
  save() {
    if (!this.path || !this.config) {
      return false;
    }

    this.fs.filePutContents(this.getPath(), Utils.jsonEncode(this.config));

    return true;
  }

  getPath() {
    return this.appFolders.getRootDir() + this.path;
  }

  getBasename() {
    return this.fs.basename(this.path);
  }

  /**
   * @return {Command}
   */
  getCommand() {
    return this.command;
  }

  /**
   * @return {FileSystem}
   */
  getFileSystem() {
    return this.fs;
  }

  /**
   * @return {System}
   */
  getSystem() {
    return this.system;
  }

  /**
   * @returns {Object}
   */
  getConfig() {
    return this.config;
  }

  /**
   * @param {string} path 'app.path'
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
   * @returns {Object}
   */
  getFlatConfig() {
    let result = {};
    let config = _.cloneDeep(this.getConfig());

    Object.keys(config).forEach((key) => {
      let section = config[key];

      if ('replaces' === key) {
        result[key] = section;
        return;
      }

      Object.keys(section).forEach((sectionKey) => {
        let subSection = section[sectionKey];

        if ('libs' !== key) {
          result[`${key}.${sectionKey}`] = subSection;
        } else {
          Object.keys(subSection).forEach((subSectionKey) => {
            result[`${key}.${sectionKey}.${subSectionKey}`] = subSection[subSectionKey];
          });
        }
      });
    });

    return result;
  }

  /**
   * @param {Object} config
   */
  setFlatConfig(config) {
    Object.keys(config).forEach((path) => {
      this.setConfigValue(path, config[path]);
    });
  }

  getDefaultConfig() {
    return {
      app:      {
        path:       'Games',
        autoupdate: false,
        sandbox:    true,
        fixres:     true,
        compositor: false,
        sound:      true,
      },
      wine:     {
        arch:            'win32', // WINEARCH
        windows_version: 'win7',  // Windows version (win10, win7, winxp, win2k)
      },
      libs:     {
        dxvk:           {
          install:    false,
          autoupdate: false,
        },
        'vkd3d-proton': {
          install:    false,
          autoupdate: false,
        },
        mf:             {
          install: false,
        },
        mangohud:       {
          install: false,
        },
        vkbasalt:       {
          install: false,
        },
      },
      fixes:    {
        focus:             false,    // Fix focus
        nocrashdialog:     false,    // No crash dialog
        cfc:               false,    // CheckFloatConstants
        glsl:              true,     // Use GLSL shaders (1) or ARB shaders (0) (faster, but sometimes breaks)
        ddr:               '',       // DirectDrawRenderer ""(default), "gdi", "opengl"
        orm:               '',       // OffscreenRenderingMode ""(default), "fbo", "backbuffer"
        MouseWarpOverride: 'enable', // OffscreenRenderingMode "enable"(default), "disable", "force"
        mono:             false,
        gecko:            false,
        gstreamer:        false,
        winemenubuilder:  false,
      },
      /**
       * When creating a prefix, it searches for and replaces tags in the specified files.
       * Performed BEFORE registering * .reg files
       *
       * {WIDTH}        - default monitor width in pixels (number)
       * {HEIGHT}       - default monitor height in pixels (number)
       * {USER}         - username
       * {DOSDEVICES}   - Full path to "/.../prefix/dosdevice"
       * {DRIVE_C}      - Full path to "/.../prefix/drive_c"
       * {PREFIX}       - Full path to "/.../prefix"
       * {ROOT_DIR}     - Full path to game folder
       * {HOSTNAME}     - See command: hostname
       *
       * "data/games/game/example.conf"
       */
      replaces: [],
    };
  }

  /**
   * @return {{"Local Settings": string, "Documents Public Extra": string, Documents: string, "Application Data": string, "Documents Public": string, "Documents Extra": string}}
   */
  getDefaultSaveFolders() {
    return {
      'Documents':              'users/{USER}/Documents',
      'Documents Extra':        'users/{USER}/Мои документы',
      'Documents Public':       'users/Public/Documents',
      'Documents Public Extra': 'users/Public/Мои документы',
      'Application Data':       'users/{USER}/Application Data',
      'Local Settings':         'users/{USER}/Local Settings',
    };
  }

  getGamesFolder() {
    return '/' + _.trim(_.get(this.config, 'app.path', 'Games'), '/\\');
  }

  getWinePrefixGameFolder() {
    return this.getKernel().getDriveC() + this.getGamesFolder();
  }

  setSound(enable) {
    this.setConfigValue('app.sound', enable);
  }

  /**
   * @return {boolean}
   */
  isSound() {
    if (this.system.isSilent()) {
      return false;
    }

    return Boolean(_.get(this.config, 'app.sound'));
  }

  /**
   * @return {boolean}
   */
  isSandbox() {
    return Boolean(_.get(this.config, 'app.sandbox'));
  }

  /**
   * @return {boolean}
   */
  isDisableCompositor() {
    return Boolean(_.get(this.config, 'app.compositor'));
  }

  /**
   * @return {boolean}
   */
  isDxvk() {
    return Boolean(_.get(this.config, 'libs.dxvk.install', false));
  }

  /**
   * @return {boolean}
   */
  isVkd3dProton() {
    return Boolean(_.get(this.config, 'libs.vkd3d-proton.install', false));
  }

  /**
   * @return {boolean}
   */
  isMediaFoundation() {
    return Boolean(_.get(this.config, 'libs.mf.install', false));
  }

  /**
   * @return {boolean}
   */
  isDxvkAutoupdate() {
    return Boolean(_.get(this.config, 'libs.dxvk.autoupdate', false));
  }

  /**
   * @return {boolean}
   */
  isVkd3dProtonAutoupdate() {
    return Boolean(_.get(this.config, 'libs.vkd3d-proton.autoupdate', false));
  }

  /**
   * @return {boolean}
   */
  isMangoHud() {
    return Boolean(_.get(this.config, 'libs.mangohud.install', false));
  }

  /**
   * @return {boolean}
   */
  isVkBasalt() {
    return Boolean(_.get(this.config, 'libs.vkbasalt.install', false));
  }

  /**
   * @return {boolean}
   */
  isRuntime() {
    return Boolean(_.get(this.config, 'libs.runtime.install', false));
  }

  /**
   * @return {string}
   */
  getMangoHudLibPath(arch = this.getKernel().getWineArch()) {
    if ('win32' === arch) {
      return this.appFolders.getLibsDir() + '/libMangoHud.so';
    }
    if ('win64' === arch) {
      return this.appFolders.getLibs64Dir() + '/libMangoHud.so';
    }

    return 'libMangoHud.so';
  }

  /**
   * @return {string}
   */
  getMangoHudLibDlsumPath(arch = this.getKernel().getWineArch()) {
    if ('win32' === arch) {
      return this.appFolders.getLibsDir() + '/libMangoHud_dlsym.so';
    }
    if ('win64' === arch) {
      return this.appFolders.getLibs64Dir() + '/libMangoHud_dlsym.so';
    }

    return 'libMangoHud_dlsym.so';
  }

  /**
   * @return {string}
   */
  getVkBasaltLibPath(arch = this.getKernel().getWineArch()) {
    if ('win32' === arch) {
      return this.appFolders.getLibsDir() + '/libvkbasalt32.so';
    }
    if ('win64' === arch) {
      return this.appFolders.getLibs64Dir() + '/libvkbasalt64.so';
    }

    return 'libvkbasalt32.so';
  }

  /**
   * @return {boolean}
   */
  isMangoHudLib() {
    if (this.getKernel().getWineArch() === 'win32') {
      return this.fs.exists(this.getMangoHudLibPath('win32')) && this.fs.exists(this.getMangoHudLibDlsumPath('win32'));
    }
    if (this.getKernel().getWineArch() === 'win64') {
      return this.fs.exists(this.getMangoHudLibPath('win64')) && this.fs.exists(this.getMangoHudLibDlsumPath('win64'));
    }

    return false;
  }

  /**
   * @return {boolean}
   */
  isVkBasaltLib() {
    if (this.getKernel().getWineArch() === 'win32') {
      return this.fs.exists(this.getVkBasaltLibPath('win32'));
    }
    if (this.getKernel().getWineArch() === 'win64') {
      return this.fs.exists(this.getVkBasaltLibPath('win64'));
    }

    return false;
  }

  /**
   * @return {string}
   */
  getWindowsVersion() {
    return _.get(this.config, 'wine.windows_version', 'win7');
  }

  /**
   * @return {boolean}
   */
  isFixesFocus() {
    return _.get(this.config, 'fixes.focus', false);
  }

  /**
   * @return {boolean}
   */
  isFixesNoCrashDialog() {
    return _.get(this.config, 'fixes.nocrashdialog', false);
  }

  /**
   * @return {boolean}
   */
  isFixesCfc() {
    return _.get(this.config, 'fixes.cfc', false);
  }

  /**
   * @return {boolean}
   */
  isFixesMono() {
    return _.get(this.config, 'fixes.mono', false);
  }

  /**
   * @return {boolean}
   */
  isFixesGecko() {
    return _.get(this.config, 'fixes.gecko', false);
  }

  /**
   * @return {boolean}
   */
  isFixesGStreamer() {
    return _.get(this.config, 'fixes.gstreamer', false);
  }

  /**
   * @return {boolean}
   */
  isFixesWineMenuBuilder() {
    return _.get(this.config, 'fixes.winemenubuilder', false);
  }

  /**
   * @return {boolean}
   */
  isFixesGlsl() {
    return _.get(this.config, 'fixes.glsl', false);
  }

  /**
   * @return {string}
   */
  getFixesDdr() {
    return _.get(this.config, 'fixes.ddr', '');
  }

  /**
   * @return {string}
   */
  getFixesOrm() {
    return _.get(this.config, 'fixes.orm', '');
  }

  /**
   * @return {string}
   */
  getFixesMouseWarpOverride() {
    return _.get(this.config, 'fixes.MouseWarpOverride', 'enable');
  }

  /**
   * @return {string[]}
   */
  getConfigReplaces() {
    return _.get(this.config, 'replaces', [])
      .map((path) => this.appFolders.getRootDir() + '/' + _.trimStart(path, '/'))
      .filter((path) => this.fs.exists(path));
  }

  /**
   * @return {string}
   */
  getLanguage() {
    let support = [ 'ru', 'en' ];
    let auto    = this.command.getLocale().substr(0, 2);
    let find    = support.filter(lang => lang === auto);

    return _.get(this.config, 'app.language', find.length > 0 ? find[0] : 'en');
  }

  /**
   * @param {string} lang
   */
  setLanguage(lang) {
    this.setConfigValue('app.language', lang);
  }

  clear() {
  }
}
