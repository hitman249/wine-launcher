import _      from "lodash";
import Utils  from "./utils";
import Wine   from "./wine";
import Prefix from "./prefix";

export default class Monitor {

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
     * @type {Wine}
     */
    wine = null;

    /**
     * @type {{name: string, status: string, resolution: string, brightness: string, gamma: string}[]|null}
     */
    monitors = null;

    /**
     * @param {Prefix} prefix
     * @param {Command} command
     * @param {System} system
     * @param {FileSystem} fs
     * @param {Wine} wine
     */
    constructor(prefix, command, system, fs, wine) {
        this.prefix  = prefix;
        this.command = command;
        this.system  = system;
        this.fs      = fs;
        this.wine    = wine;
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
        let info   = this.command.run('xrandr --verbose');

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
                        let [field, value] = line.split(':').map(s => s.trim());
                        brightness         = value;
                    }
                    if (null === gamma && line.includes('Gamma:')) {
                        let [field, r, g, b] = line.split(':').map(s => s.trim());
                        gamma                = `${r}:${g}:${b}`;
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
        return this.getResolutions().find((monitor) => 'primary' === monitor.status) || null;
    }

    save() {
        this.fs.filePutContents(this.prefix.getResolutionsFile(), Utils.jsonEncode(this.getResolutions()));
    }

    /**
     * @return {{name: string, status: string, resolution: string, brightness: string, gamma: string}[]}
     */
    load() {
        let path = this.prefix.getResolutionsFile();

        if (this.fs.exists(path)) {
            return Utils.jsonDecode(this.fs.fileGetContents(path));
        }

        return [];
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

        this.load().forEach((monitor) => {
            let current = monitors[monitor.name];

            if (!current) {
                return;
            }

            if (current.gamma !== monitor.gamma) {
                this.wine.boot(`xrandr --output ${monitor.name} --gamma ${monitor.gamma}`);
            }

            if (current.brightness !== monitor.brightness) {
                this.wine.boot(`xrandr --output ${monitor.name} --brightness ${monitor.brightness}`);
            }

            if (current.resolution !== monitor.resolution) {
                this.wine.boot(`xrandr --output ${monitor.name} --mode ${monitor.resolution}`);
            }
        });

        let path = this.prefix.getResolutionsFile();

        if (this.fs.exists(path)) {
            this.fs.rm(path);
        }

        return true;
    }

    /**
     * @return {{width: string, height: string}}
     */
    getResolution() {
        let monitor         = this.getDefault();
        let [width, height] = monitor.resolution.split('x');

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
}