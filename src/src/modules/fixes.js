import Prefix from "./prefix";

export default class Fixes {

  /**
   * @type {Prefix}
   */
  prefix = null;

  /**
   * @param {Prefix} prefix
   */
  constructor(prefix) {
    this.prefix = prefix;
  }

  /**
   * @return {Promise}
   */
  update() {
    let wine    = window.app.getKernel();
    let promise = Promise.resolve();

    if (wine.isBlocked()) {
      return promise;
    }

    if (this.prefix.isFixesFocus()) {
      if (!wine.getWinePrefixInfo('focus')) {
        wine.setWinePrefixInfo('focus', true);
        wine.run('reg', 'add', 'HKEY_CURRENT_USER\\Software\\Wine\\X11 Driver', '/v', 'GrabFullscreen', '/d', 'Y', '/f');
        wine.run('reg', 'add', 'HKEY_CURRENT_USER\\Software\\Wine\\X11 Driver', '/v', 'UseTakeFocus', '/d', 'N', '/f');
      }
    } else if (wine.getWinePrefixInfo('focus')) {
      wine.setWinePrefixInfo('focus', false);
      wine.run('reg', 'delete', 'HKEY_CURRENT_USER\\Software\\Wine\\X11 Driver', '/v', 'GrabFullscreen', '/f');
      wine.run('reg', 'delete', 'HKEY_CURRENT_USER\\Software\\Wine\\X11 Driver', '/v', 'UseTakeFocus', '/f');
    }

    if (this.prefix.isFixesNoCrashDialog()) {
      if (!wine.getWinePrefixInfo('nocrashdialog')) {
        wine.setWinePrefixInfo('nocrashdialog', true);
        wine.run('reg', 'add', 'HKEY_CURRENT_USER\\Software\\Wine\\WineDbg', '/v', 'ShowCrashDialog', '/t', 'REG_DWORD', '/d', '00000000', '/f');
      }
    } else if (wine.getWinePrefixInfo('nocrashdialog')) {
      wine.setWinePrefixInfo('nocrashdialog', false);
      wine.run('reg', 'delete', 'HKEY_CURRENT_USER\\Software\\Wine\\WineDbg', '/v', 'ShowCrashDialog', '/f');
    }

    if (this.prefix.isFixesCfc()) {
      if (!wine.getWinePrefixInfo('cfc')) {
        wine.setWinePrefixInfo('cfc', true);
        wine.run('reg', 'add', 'HKEY_CURRENT_USER\\Software\\Wine\\Direct3D', '/v', 'CheckFloatConstants', '/d', 'enabled', '/f');
      }
    } else if (wine.getWinePrefixInfo('cfc')) {
      wine.setWinePrefixInfo('cfc', false);
      wine.run('reg', 'delete', 'HKEY_CURRENT_USER\\Software\\Wine\\Direct3D', '/v', 'CheckFloatConstants', '/f');
    }

    if (!this.prefix.isFixesGlsl()) {
      if (!wine.getWinePrefixInfo('glsl')) {
        wine.setWinePrefixInfo('glsl', true);
        wine.run('reg', 'add', 'HKEY_CURRENT_USER\\Software\\Wine\\Direct3D', '/v', 'UseGLSL', '/d', 'disabled', '/f');
      }
    } else if (wine.getWinePrefixInfo('glsl')) {
      wine.setWinePrefixInfo('glsl', false);
      wine.run('reg', 'delete', 'HKEY_CURRENT_USER\\Software\\Wine\\Direct3D', '/v', 'UseGLSL', '/f');
    }

    let ddr = this.prefix.getFixesDdr();

    if (ddr) {
      if (wine.getWinePrefixInfo('ddr') !== ddr) {
        wine.setWinePrefixInfo('ddr', ddr);
        wine.run('reg', 'add', 'HKEY_CURRENT_USER\\Software\\Wine\\Direct3D', '/v', 'DirectDrawRenderer', '/d', ddr, '/f');
      }
    } else if (wine.getWinePrefixInfo('ddr')) {
      wine.setWinePrefixInfo('ddr', '');
      wine.run('reg', 'delete', 'HKEY_CURRENT_USER\\Software\\Wine\\Direct3D', '/v', 'DirectDrawRenderer', '/f');
    }

    let orm = this.prefix.getFixesOrm();

    if (orm) {
      if (wine.getWinePrefixInfo('orm') !== orm) {
        wine.setWinePrefixInfo('orm', orm);
        wine.run('reg', 'add', 'HKEY_CURRENT_USER\\Software\\Wine\\Direct3D', '/v', 'OffscreenRenderingMode', '/d', orm, '/f');
      }
    } else if (wine.getWinePrefixInfo('orm')) {
      wine.setWinePrefixInfo('orm', '');
      wine.run('reg', 'delete', 'HKEY_CURRENT_USER\\Software\\Wine\\Direct3D', '/v', 'OffscreenRenderingMode', '/f');
    }

    let mouseWarpOverride = this.prefix.getFixesMouseWarpOverride();

    if ('enable' !== mouseWarpOverride) {
      if (wine.getWinePrefixInfo('MouseWarpOverride') !== mouseWarpOverride) {
        wine.setWinePrefixInfo('MouseWarpOverride', mouseWarpOverride);
        wine.run('reg', 'add', 'HKEY_CURRENT_USER\\Software\\Wine\\DirectInput', '/v', 'MouseWarpOverride', '/d', mouseWarpOverride, '/f');
      }
    } else if (wine.getWinePrefixInfo('MouseWarpOverride')) {
      wine.setWinePrefixInfo('MouseWarpOverride', '');
      wine.run('reg', 'delete', 'HKEY_CURRENT_USER\\Software\\Wine\\DirectInput', '/v', 'MouseWarpOverride', '/f');
    }

    return promise;
  }
}