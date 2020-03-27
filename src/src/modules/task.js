import _          from "lodash";
import Config     from "./config";
import Command    from "./command";
import FileSystem from "./file-system";
import Prefix     from "./prefix";

export default class Task {

    /**
     * @type {Config}
     */
    config = null;


    /**
     * @type {Prefix}
     */
    prefix = null;

    /**
     * @type {Command}
     */
    command = null;

    /**
     * @type {FileSystem}
     */
    fs = null;

    /**
     * @type {Monitor}
     */
    monitor = null;

    /**
     * @param {Config} config
     * @param {Prefix} prefix
     * @param {FileSystem} fs
     * @param {Monitor} monitor
     */
    constructor(config, prefix, fs, monitor) {
        this.prefix  = _.cloneDeep(prefix);
        this.config  = config;
        this.command = new Command(this.prefix, this.config);
        this.fs      = fs;
        this.monitor = monitor;
    }

    desktop() {
        if (!this.config.getConfigValue('window.enable')) {
            return '';
        }

        let resolution = this.config.getConfigValue('window.resolution');
        let title      = _.upperFirst(_.camelCase(this.config.getGameName()));

        if ('auto' === resolution) {
            resolution = this.monitor.getDefault().resolution;
        }

        return `explorer "/desktop=${title},${resolution}"`;
    }

    game() {
        let driveC     = this.prefix.getWineDriveC();
        let gamePath   = _.trim(this.prefix.getGamesFolder(), '/');
        let additional = _.trim(this.config.getGamePath(), '/');

        let path     = [driveC, gamePath, additional].filter(s => s).join('/');
        let wine     = this.prefix.getWineBin();
        let fileName = this.config.getGameExe();
        let args     = this.config.getGameArguments().split("'").join('"');
        let desktop  = this.desktop();

        return `cd "${path}" && "${wine}" ${desktop} "${fileName}" ${args}`;
    }

    /**
     * @return {Promise}
     */
    run(mode = 'standard') {
        let logFile = `${this.prefix.getLogsDir()}/${this.config.getGameName()}.log`;

        if (this.fs.exists(logFile)) {
            this.fs.rm(logFile);
        }

        if ('debug' === mode) {
            this.prefix.setWineDebug('');
        }

        let winePrefix = window.app.getWinePrefix();

        winePrefix.setConfig(this.config);
        winePrefix.updatePulse();
        winePrefix.updateCsmt();

        this.monitor.save();

        return this.command
            .watch(this.game(), output => this.fs.filePutContents(logFile, output, this.fs.FILE_APPEND))
            .then(() => this.monitor.restore());
    }
}