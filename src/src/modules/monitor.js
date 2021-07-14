import _          from "lodash";
import Utils      from "./utils";
import AppFolders from "./app-folders";
import Prefix     from "./prefix";
import Command    from "./command";
import System     from "./system";
import FileSystem from "./file-system";

export default class Monitor {

  /**
   * @type {AppFolders}
   */
  appFolders = null;

  /**
   * @type {Prefix}
   */
  prefix = null;

  /**
   * @type {Command}
   */
  command = null;

  /**
   * @type {System}
   */
  system = null;

  /**
   * @type {FileSystem}
   */
  fs = null;

  /**
   * @type {{name: string, status: string, resolution: string, brightness: string, gamma: string}[]|null}
   */
  monitors = null;

  compositor = null;

  /**
   * @param {AppFolders} appFolders
   * @param {Prefix} prefix
   * @param {Command} command
   * @param {System} system
   * @param {FileSystem} fs
   */
  constructor(appFolders, prefix, command, system, fs) {
    this.appFolders = appFolders;
    this.prefix     = prefix;
    this.command    = command;
    this.system     = system;
    this.fs         = fs;
  }

  /**
   * @returns {{name: string, status: string, resolution: string, brightness: string, gamma: string}[]}
   */
  getResolutions() {
    if (null !== this.monitors) {
      return this.monitors;
    }

    if (!this.system.getXrandrVersion()) {
      this.monitors = [];
      return this.monitors;
    }

    this.monitors = [];

    let regexp = /^(.*) connected( | primary )([0-9]{3,4}x[0-9]{3,4}).*\n*/mg;
    let info   = this.command.exec('xrandr --verbose');

    Array.from(info.matchAll(regexp)).forEach((match) => {
      let full       = match[0].trim();
      let name       = match[1].trim();
      let status     = match[2].trim();
      let resolution = match[3].trim();
      let brightness = null;
      let gamma      = null;

      let record = false;
      info.split('\n').forEach((line) => {
        if (record && (null === brightness || null === gamma)) {
          if (null === brightness && line.includes('Brightness:')) {
            let [ field, value ] = line.split(':').map(s => s.trim());
            brightness           = value;
          }
          if (null === gamma && line.includes('Gamma:')) {
            let [ field, r, g, b ] = line.split(':').map(s => s.trim());
            gamma                  = `${r}:${g}:${b}`;
          }
        }

        if (false === record && line.includes(full)) {
          record = true;
        }
      });

      this.monitors.push({ name, status, resolution, brightness, gamma });
    });

    return this.monitors;
  }

  /**
   * @return {{name: string, status: string, resolution: string, brightness: string, gamma: string}|null}
   */
  getDefault() {
    let monitor = this.getResolutions().find((monitor) => 'primary' === monitor.status) || null;

    if (!monitor) {
      monitor = _.head(this.getResolutions());
    }

    return monitor;
  }

  save() {
    let compositor = this.getCompositor();

    if (compositor) {
      this.command.exec(compositor.stop);
    }

    this.fs.filePutContents(this.appFolders.getResolutionsFile(), Utils.jsonEncode({
      resolutions: this.getResolutions(), compositor
    }));
  }

  /**
   * @return {{resolutions: {name: string, status: string, resolution: string, brightness: string, gamma: string}[], compositor: (null|{start: string, stop: string})}}
   */
  load() {
    let path = this.appFolders.getResolutionsFile();

    if (this.fs.exists(path)) {
      return Utils.jsonDecode(this.fs.fileGetContents(path));
    }

    return { resolutions: [], compositor: null };
  }

  /**
   * @return {boolean}
   */
  restore() {
    if (!this.system.getXrandrVersion()) {
      return false;
    }

    this.monitors = null;

    let monitors = _.keyBy(this.getResolutions(), 'name');
    let load     = this.load();

    load.resolutions.forEach((monitor) => {
      let current = monitors[monitor.name];

      if (!current) {
        return;
      }

      const wine = window.app.getKernel();

      if (current.gamma !== monitor.gamma) {
        wine.boot(`xrandr --output ${monitor.name} --gamma ${monitor.gamma}`);
      }

      if (current.brightness !== monitor.brightness) {
        wine.boot(`xrandr --output ${monitor.name} --brightness ${monitor.brightness}`);
      }

      if (current.resolution !== monitor.resolution) {
        wine.boot(`xrandr --output ${monitor.name} --mode ${monitor.resolution}`);
      }
    });

    if (load.compositor) {
      this.compositor = load.compositor;
      this.command.exec(load.compositor.start);
    }

    let path = this.appFolders.getResolutionsFile();

    if (this.fs.exists(path)) {
      this.fs.rm(path);
    }

    this.monitors = null;

    return true;
  }

  /**
   * @return {{width: string, height: string}}
   */
  getResolution() {
    let monitor           = this.getDefault();
    let [ width, height ] = monitor.resolution.split('x');

    return { width, height };
  }

  /**
   * @return {string}
   */
  getWidth() {
    return this.getResolution().width;
  }

  /**
   * @return {string}
   */
  getHeight() {
    return this.getResolution().height;
  }

  /**
   * @return {null|{start: string, stop: string}}
   */
  getCompositor() {
    if (!this.prefix.isDisableCompositor()) {
      this.compositor = false;
      return null;
    }

    if (null !== this.compositor) {
      return this.compositor;
    }

    let session = this.system.getDesktopSession();

    if ('plasma' === session) {
      this.compositor = {
        start: 'qdbus org.kde.KWin /Compositor org.kde.kwin.Compositing.resume',
        stop:  'qdbus org.kde.KWin /Compositor org.kde.kwin.Compositing.suspend',
      };
    }
    if ('mate' === session) {
      if (this.command.exec('gsettings get org.mate.Marco.general compositing-manager') !== 'true') {
        this.compositor = false;
        return this.compositor;
      }

      this.compositor = {
        start: 'gsettings set org.mate.Marco.general compositing-manager true',
        stop:  'gsettings set org.mate.Marco.general compositing-manager false',
      };
    }
    if ('xfce' === session) {
      if (this.command.exec('xfconf-query --channel=xfwm4 --property=/general/use_compositing') !== 'true') {
        this.compositor = false;
        return this.compositor;
      }

      this.compositor = {
        start: 'xfconf-query --channel=xfwm4 --property=/general/use_compositing --set=true',
        stop:  'xfconf-query --channel=xfwm4 --property=/general/use_compositing --set=false',
      };
    }
    if ('deepin' === session) {
      if (this.command.exec('dbus-send --session --dest=com.deepin.WMSwitcher --type=method_call --print-reply=literal /com/deepin/WMSwitcher com.deepin.WMSwitcher.CurrentWM') !== 'deepin wm') {
        this.compositor = false;
        return this.compositor;
      }

      this.compositor = {
        start: 'dbus-send --session --dest=com.deepin.WMSwitcher --type=method_call /com/deepin/WMSwitcher com.deepin.WMSwitcher.RequestSwitchWM',
        stop:  'dbus-send --session --dest=com.deepin.WMSwitcher --type=method_call /com/deepin/WMSwitcher com.deepin.WMSwitcher.RequestSwitchWM',
      };
    }

    return this.compositor;
  }
}