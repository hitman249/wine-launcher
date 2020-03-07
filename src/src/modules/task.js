import _          from "lodash";
import Config     from "./config";
import Command    from "./command";
import System     from "./system";
import FileSystem from "./file-system";

export default class Task {

    /**
     * @type {Config}
     */
    config = null;

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
     * @type {Monitor}
     */
    monitor = null;

    /**
     * @param {Config} config
     * @param {System} system
     * @param {FileSystem} fs
     * @param {Monitor} monitor
     */
    constructor(config, system, fs, monitor) {
        this.config  = _.cloneDeep(config);
        this.command = new Command(this.config);
        this.system  = system;
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
        let driveC     = this.config.getWineDriveC();
        let gamePath   = this.config.getGamePath();
        let additional = this.config.getGameAdditionalPath();

        let path     = [driveC, gamePath, additional].filter(s => s).join('/');
        let wine     = this.config.getWineBin();
        let fileName = this.config.getGameExe();
        let args     = this.config.getGameArguments().split("'").join('"');
        let desktop  = this.desktop();

        return `cd "${path}" && "${wine}" ${desktop} "${fileName}" ${args}`;
    }

    /**
     * @return {Promise}
     */
    run(mode = 'standard') {
        let logFile = `${this.config.getLogsDir()}/${this.config.getGameName()}.log`;

        if (this.fs.exists(logFile)) {
            this.fs.rm(logFile);
        }

        if ('debug' === mode) {
            this.config.setWineDebug('');
        }

        this.monitor.save();

        return this.command
            .watch(this.game(), output => this.fs.filePutContents(logFile, output, this.fs.FILE_APPEND))
            .then(() => this.monitor.restore());
    }
}