export default class Collects {

  static modes = {
    standard: window.i18n.t('collects.standard'),
    fps:      window.i18n.t('collects.fps'),
    debug:    window.i18n.t('collects.debug'),
  };

  static windowsVersion = {
    win2k: 'Windows 2000',
    winxp: 'Windows XP',
    win7:  'Windows 7',
    win10: 'Windows 10',
  };

  static arch = {
    win32: 'x86',
    win64: 'x86_64',
  };

  static directDrawRenderer = {
    '':     'default',
    gdi:    'gdi',
    opengl: 'opengl',
  };

  static offscreenRenderingMode = {
    '':         'default',
    fbo:        'fbo',
    backbuffer: 'backbuffer',
  };

  static mouseWarpOverride = {
    enable:  'enable (default)',
    disable: 'disable',
    force:   'force',
  };

  static renderApi = {
    vulkan: 'Vulkan',
    opengl: 'OpenGL',
  };

  static fsr = {
    '':      window.i18n.t('collects.off'),
    'fsr-0': '0 - Max blur',
    'fsr-1': '1',
    'fsr-2': '2',
    'fsr-3': '3 - Balanced',
    'fsr-4': '4',
    'fsr-5': '5 - Max sharp',
  };

  static containers = {
    '':           window.i18n.t('collects.off'),
    'sniper':     'SteamLinuxRuntime Sniper  (Debian 11) (Recommended)',
    'soldier':    'SteamLinuxRuntime Soldier (Debian 10)',
    'scout':      'SteamLinuxRuntime Scout   (Ubuntu 12.04)',
    'bottlesdev': 'BottlesDev                (Ubuntu 20.04)',
  };

  static commands = {
    build:      window.i18n.t('collects.save'),
    install:    window.i18n.t('collects.install'),
    iso:        window.i18n.t('collects.iso'),
    register:   window.i18n.t('collects.register'),
    winetricks: window.i18n.t('collects.winetricks'),
    cfg:        window.i18n.t('collects.cfg'),
    fm:         window.i18n.t('collects.fm'),
    regedit:    window.i18n.t('collects.regedit'),
  };

  static overrides = {
    'builtin':        window.i18n.t('collects.builtin'),
    'native':         window.i18n.t('collects.native'),
    'builtin,native': window.i18n.t('collects.builtin-native'),
    'native,builtin': window.i18n.t('collects.native-builtin'),
    ' ':              window.i18n.t('collects.off'),
  };

  static mangoHudPosition = {
    'top-left':     window.i18n.t('mangohud.top-left'),
    'top-right':    window.i18n.t('mangohud.top-right'),
    'bottom-left':  window.i18n.t('mangohud.bottom-left'),
    'bottom-right': window.i18n.t('mangohud.bottom-right'),
  };

  static getVar(varName) {
    return JSON.parse(JSON.stringify(Collects[varName]));
  }

  static getToSelect(varName, addAllPoint = false) {
    let collect = Collects.getVar(varName);
    let select  = [];

    if (addAllPoint) {
      select.push({ id: '', name: window.i18n.t('collects.all') });
    }

    Object.keys(collect).forEach((key) => {
      select.push({ id: key, name: collect[key] });
    });

    return select;
  }
}
