import Wine   from "./wine";
import Prefix from "./prefix";

export default class Fixes {

  /**
   * @type {Prefix}
   */
  prefix = null;

  /**
   * @type {Wine}
   */
  wine = null;

  /**
   * @param {Prefix} prefix
   * @param {Wine} wine
   */
  constructor(prefix, wine) {
    this.prefix = prefix;
    this.wine   = wine;
  }

  /**
   * @return {Promise}
   */
  update() {
    let promise = Promise.resolve();

    if (this.prefix.isBlocked()) {
      return promise;
    }

    if (this.prefix.isFixesFocus()) {
      if (!this.prefix.getWinePrefixInfo('focus')) {
        this.prefix.setWinePrefixInfo('focus', true);
        this.wine.run('reg', 'add', 'HKEY_CURRENT_USER\\Software\\Wine\\X11 Driver', '/v', 'GrabFullscreen', '/d', 'Y', '/f');
        this.wine.run('reg', 'add', 'HKEY_CURRENT_USER\\Software\\Wine\\X11 Driver', '/v', 'UseTakeFocus', '/d', 'N', '/f');
      }
    } else if (this.prefix.getWinePrefixInfo('focus')) {
      this.prefix.setWinePrefixInfo('focus', false);
      this.wine.run('reg', 'delete', 'HKEY_CURRENT_USER\\Software\\Wine\\X11 Driver', '/v', 'GrabFullscreen', '/f');
      this.wine.run('reg', 'delete', 'HKEY_CURRENT_USER\\Software\\Wine\\X11 Driver', '/v', 'UseTakeFocus', '/f');
    }

    if (this.prefix.isFixesNoCrashDialog()) {
      if (!this.prefix.getWinePrefixInfo('nocrashdialog')) {
        this.prefix.setWinePrefixInfo('nocrashdialog', true);
        this.wine.run('reg', 'add', 'HKEY_CURRENT_USER\\Software\\Wine\\WineDbg', '/v', 'ShowCrashDialog', '/t', 'REG_DWORD', '/d', '00000000', '/f');
      }
    } else if (this.prefix.getWinePrefixInfo('nocrashdialog')) {
      this.prefix.setWinePrefixInfo('nocrashdialog', false);
      this.wine.run('reg', 'delete', 'HKEY_CURRENT_USER\\Software\\Wine\\WineDbg', '/v', 'ShowCrashDialog', '/f');
    }

    if (this.prefix.isFixesCfc()) {
      if (!this.prefix.getWinePrefixInfo('cfc')) {
        this.prefix.setWinePrefixInfo('cfc', true);
        this.wine.run('reg', 'add', 'HKEY_CURRENT_USER\\Software\\Wine\\Direct3D', '/v', 'CheckFloatConstants', '/d', 'enabled', '/f');
      }
    } else if (this.prefix.getWinePrefixInfo('cfc')) {
      this.prefix.setWinePrefixInfo('cfc', false);
      this.wine.run('reg', 'delete', 'HKEY_CURRENT_USER\\Software\\Wine\\Direct3D', '/v', 'CheckFloatConstants', '/f');
    }

    if (!this.prefix.isFixesGlsl()) {
      if (!this.prefix.getWinePrefixInfo('glsl')) {
        this.prefix.setWinePrefixInfo('glsl', true);
        this.wine.run('reg', 'add', 'HKEY_CURRENT_USER\\Software\\Wine\\Direct3D', '/v', 'UseGLSL', '/d', 'disabled', '/f');
      }
    } else if (this.prefix.getWinePrefixInfo('glsl')) {
      this.prefix.setWinePrefixInfo('glsl', false);
      this.wine.run('reg', 'delete', 'HKEY_CURRENT_USER\\Software\\Wine\\Direct3D', '/v', 'UseGLSL', '/f');
    }

    let ddr = this.prefix.getFixesDdr();

    if (ddr) {
      if (this.prefix.getWinePrefixInfo('ddr') !== ddr) {
        this.prefix.setWinePrefixInfo('ddr', ddr);
        this.wine.run('reg', 'add', 'HKEY_CURRENT_USER\\Software\\Wine\\Direct3D', '/v', 'DirectDrawRenderer', '/d', ddr, '/f');
      }
    } else if (this.prefix.getWinePrefixInfo('ddr')) {
      this.prefix.setWinePrefixInfo('ddr', '');
      this.wine.run('reg', 'delete', 'HKEY_CURRENT_USER\\Software\\Wine\\Direct3D', '/v', 'DirectDrawRenderer', '/f');
    }

    let orm = this.prefix.getFixesOrm();

    if (orm) {
      if (this.prefix.getWinePrefixInfo('orm') !== orm) {
        this.prefix.setWinePrefixInfo('orm', orm);
        this.wine.run('reg', 'add', 'HKEY_CURRENT_USER\\Software\\Wine\\Direct3D', '/v', 'OffscreenRenderingMode', '/d', orm, '/f');
      }
    } else if (this.prefix.getWinePrefixInfo('orm')) {
      this.prefix.setWinePrefixInfo('orm', '');
      this.wine.run('reg', 'delete', 'HKEY_CURRENT_USER\\Software\\Wine\\Direct3D', '/v', 'OffscreenRenderingMode', '/f');
    }

    let mouseWarpOverride = this.prefix.getFixesMouseWarpOverride();

    if ('enable' !== mouseWarpOverride) {
      if (this.prefix.getWinePrefixInfo('MouseWarpOverride') !== mouseWarpOverride) {
        this.prefix.setWinePrefixInfo('MouseWarpOverride', mouseWarpOverride);
        this.wine.run('reg', 'add', 'HKEY_CURRENT_USER\\Software\\Wine\\DirectInput', '/v', 'MouseWarpOverride', '/d', mouseWarpOverride, '/f');
      }
    } else if (this.prefix.getWinePrefixInfo('MouseWarpOverride')) {
      this.prefix.setWinePrefixInfo('MouseWarpOverride', '');
      this.wine.run('reg', 'delete', 'HKEY_CURRENT_USER\\Software\\Wine\\DirectInput', '/v', 'MouseWarpOverride', '/f');
    }

    return promise;
  }
}