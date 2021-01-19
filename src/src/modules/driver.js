import _          from "lodash";
import Command    from "./command";
import System     from "./system";
import FileSystem from "./file-system";
import Utils      from "./utils";

const version_compare = require('locutus/php/info/version_compare');

export default class Driver {

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

  values = {
    /**
     * @type {{vendor: string, driver: string, version: string}|boolean|null}
     */
    nvidia: null,

    /**
     * @type {{vendor: string, driver: string, version: string, mesa: string}|boolean|null}
     */
    amd: null,

    /**
     * @type {{vendor: string, driver: string, version: string, mesa: string}|boolean|null}
     */
    intel: null,

    /**
     * @type {string|null}
     */
    name: null,
  };

  /**
   * @param {Command} command
   * @param {System} system
   * @param {FileSystem} fs
   */
  constructor(command, system, fs) {
    this.command = command;
    this.system  = system;
    this.fs      = fs;
  }

  /**
   * @returns {{vendor: string, driver: string, version: string}|boolean}
   */
  getNvidia() {
    if (null !== this.values.nvidia) {
      return this.values.nvidia;
    }

    let procPath = '/proc/driver/nvidia/version';

    if (this.fs.exists(procPath)) {
      let version = Utils.findVersion(this.command.run(`cat "${procPath}" | grep -i "nvidia"`));

      if (version) {
        this.values.nvidia = {
          vendor: 'nvidia',
          driver: 'nvidia',
          version,
        };

        return this.values.nvidia;
      }
    }

    if (this.command.run('command -v nvidia-smi')) {
      let version = Utils.findVersion(this.command.run('nvidia-smi --query-gpu=driver_version --format=csv,noheader'));

      if (version) {
        this.values.nvidia = {
          vendor: 'nvidia',
          driver: 'nvidia',
          version,
        };

        return this.values.nvidia;
      }
    }

    if (this.command.run('command -v modinfo')) {
      let version = Utils.findVersion(this.command.run('modinfo nvidia | grep -E "^version:"'));

      if (version) {
        this.values.nvidia = {
          vendor: 'nvidia',
          driver: 'nvidia',
          version,
        };

        return this.values.nvidia;
      }
    }

    if (this.command.run('lsmod | grep nouveau')) {
      this.values.nvidia = {
        vendor:  'nvidia',
        driver:  'nouveau',
        version: '',
      };

      return this.values.nvidia;
    }

    this.values.nvidia = false;

    return this.values.nvidia;
  }

  /**
   * @returns {{vendor: string, driver: string, version: string, mesa: string}|boolean}
   */
  getAmd() {
    if (null !== this.values.amd) {
      return this.values.amd;
    }

    if (this.command.run('lsmod | grep radeon')) {
      this.values.amd = {
        vendor:  'amd',
        driver:  'radeon',
        version: '',
        mesa:    this.system.getMesaVersion(),
      };

      return this.values.amd;
    }

    let amdgpupro = this.command.run('modinfo amdgpu | grep -E "^version:"');
    let version   = this.command.run('glxinfo | grep "OpenGL" | grep "Compatibility Profile"')
      .split('\n')[0]
      .split('Compatibility Profile')
      .map(s => s.trim());

    if (version.length > 1) {
      version = Utils.findVersion(version[1]);
    } else {
      version = amdgpupro.split(':').map(s => s.trim());

      if (version.length > 1) {
        version = version[1];
      } else {
        version = null;
      }
    }

    if (version && amdgpupro) {
      this.values.amd = {
        vendor: 'amd',
        driver: 'amdgpu-pro',
        version,
        mesa:   '',
      };

      return this.values.amd;
    }

    if (this.command.run('lsmod | grep amdgpu')) {
      this.values.amd = {
        vendor:  'amd',
        driver:  'amdgpu',
        version: '',
        mesa:    this.system.getMesaVersion(),
      };

      return this.values.amd;
    }

    this.values.amd = false;

    return this.values.amd;
  }

  /**
   * @returns {{vendor: string, driver: string, version: string, mesa: string}|boolean}
   */
  getIntel() {
    if (null !== this.values.intel) {
      return this.values.intel;
    }

    if (this.command.run('glxinfo | grep "Intel"')) {
      this.values.amd = {
        vendor:  'intel',
        driver:  'intel',
        version: '',
        mesa:    this.system.getMesaVersion(),
      };

      return this.values.intel;
    }

    this.values.intel = false;

    return this.values.intel;
  }

  /**
   * @returns {{vendor: string, driver: string, version: string, mesa: string}|boolean}
   */
  getVersion() {
    let driver = this.getNvidia();

    if (driver) {
      if ('nvidia' === driver.driver && version_compare(driver.version, '415.22', '<')) {
        driver.info = 'Please install NVIDIA driver 415.22 or newer.';
      }

      return driver;
    }

    driver = this.getAmd();

    if (driver) {
      if ('amdgpu-pro' === driver.driver && version_compare(driver.version, '18.50', '<')) {
        driver.info = 'Please install AMDGPU PRO 18.50 or newer.';
      }
      if ('amdgpu' === driver.driver && version_compare(driver.mesa, '18.3', '<')) {
        driver.info = 'Please install RADV Mesa 18.3 or newer.';
      }

      return driver;
    }

    driver = this.getIntel();

    if ('intel' === driver.driver && version_compare(driver.mesa, '18.3', '<')) {
      driver.info = 'Please install Mesa 18.3 or newer.';
    }

    return driver;
  }

  /**
   * @returns {boolean}
   */
  isGalliumNineSupport() {
    return Boolean(this.getAmd() || this.getIntel());
  }

  /**
   * @return {string}
   */
  getName() {
    if (null !== this.values.name) {
      return this.values.name;
    }

    this.command.run('glxinfo').split('\n').forEach((line) => {
      if (!this.values.name && line.includes('Device')) {
        this.values.name = _.last(line.split(':').map(s => s.trim()));
      }
    });

    if (!this.values.name) {
      this.values.name = this.command.run('lspci | grep VGA | cut -d ":" -f3');
    }

    return this.values.name;
  }
}