import _          from "lodash";
import Config     from "./config";
import Command    from "./command";
import Utils      from "./utils";
import FileSystem from "./file-system";
import Update     from "./update";

export default class Wine {
    /**
     * @type {Config}
     */
    config = null;

    /**
     * @type {Command}
     */
    command = null;

    /**
     * @type {FileSystem}
     */
    fs = null;

    /**
     * @type {Update}
     */
    update = null;

    /**
     * @type {string|null}
     */
    version = null;

    /**
     * @type {string[]|null}
     */
    missingLibs = null;

    /**
     * @param {Config} config
     * @param {Command} command
     * @param {FileSystem} fs
     * @param {Update} update
     */
    constructor(config, command, fs, update) {
        this.config  = config;
        this.command = command;
        this.fs      = fs;
        this.update  = update;
    }

    /**
     * @param {Arguments} arguments
     */
    boot() {
        let cmd = Array.prototype.slice.call(arguments).join(' ');

        if (cmd) {
            cmd = '&& ' + cmd;
        }

        let wineBootPath   = Utils.quote(this.config.getWineBoot());
        let wineServerPath = Utils.quote(this.config.getWineServer());

        this.command.run(`${wineBootPath} && ${wineServerPath} -w ${cmd}`);
    }

    /**
     * @param {Arguments} arguments
     */
    down() {
        let cmd = Array.prototype.slice.call(arguments).join(' ');

        if (cmd) {
            cmd = '&& ' + cmd;
        }

        let wineServerPath = Utils.quote(this.config.getWineServer());

        this.command.run(`${wineServerPath} -k ${cmd}`);
    }

    /**
     * @param {Arguments} arguments
     * @returns {string}
     */
    runAll() {
        let cmd        = Utils.quote(arguments);
        let winePath   = Utils.quote(this.config.getWineBin());
        let wine64Path = Utils.quote(this.config.getWine64Bin());
        let result     = '';

        result = this.command.run(`${winePath} ${cmd}`);

        if (this.config.getWineArch() === 'win64') {
            result += '\n' + this.command.run(`${wine64Path} ${cmd}`);
        }

        return result;
    }

    /**
     * @param {Arguments} arguments
     * @returns {string}
     */
    run() {
        let cmd      = Utils.quote(arguments);
        let winePath = Utils.quote(this.config.getWineBin());

        return this.command.run(`${winePath} ${cmd}`);
    }

    fm() {
        let config = /** @type {Config} */ _.cloneDeep(this.config);
        config.setWineDebug('');
        let logFile             = config.getLogFileManager();
        let wineFileManagerPath = Utils.quote(config.getWineFileManager());

        this.command.watch(wineFileManagerPath, (output) => {
            this.fs.filePutContents(logFile, output, this.fs.FILE_APPEND);
        });
    }

    cfg() {
        this.command.run(Utils.quote(this.config.getWineCfg()));
    }

    /**
     * @param {Arguments} arguments
     * @returns {string}
     */
    reg() {
        let cmd       = Utils.quote(arguments);
        let regedit   = Utils.quote(this.config.getWineRegedit());
        let regedit64 = Utils.quote(this.config.getWineRegedit64());
        let result    = '';

        result = this.command.run(`${regedit} ${cmd}`);

        if (this.config.getWineArch() === 'win64') {
            result += '\n' + this.command.run(`${regedit64} ${cmd}`);
        }

        return result;
    }

    /**
     * @param {Arguments} arguments
     * @returns {string}
     */
    regsvr32() {
        let cmd      = Utils.quote(arguments);
        let regsvr32 = Utils.quote(this.config.getWineRegsvr32());
        let regsvr64 = Utils.quote(this.config.getWineRegsvr64());
        let result   = '';

        result = this.command.run(`${regsvr32} ${cmd}`);

        if (this.config.getWineArch() === 'win64') {
            result += '\n' + this.command.run(`${regsvr64} ${cmd}`);
        }

        return result;
    }

    /**
     * @returns {boolean}
     */
    checkSystemWine() {
        return Boolean(this.command.run('command -v "wine"'));
    }

    /**
     * @returns {boolean}
     */
    checkWine() {
        let winePath = Utils.quote(this.config.getWineBin());

        return Boolean(this.command.run(`command -v ${winePath}`));
    }

    /**
     * @returns {string}
     */
    getVersion() {
        if (null === this.version) {
            this.version = this.run('--version');
        }

        return this.version;
    }

    /**
     * @returns {string[]}
     */
    getMissingLibs() {
        if (null === this.missingLibs) {
            let help = this.run('--help');

            if (!help.includes('--check-libs')) {
                this.missingLibs = [];
                return this.missingLibs;
            }

            let missingLibs = [];

            this.run('--check-libs').split('\n').map(s => s.trim()).forEach((line) => {
                if (!line) {
                    return false;
                }

                let [filename, filepath] = line.split(':').map(s => _.trim(s, ' \t\n\r\0\x0B.'));

                if (false === filepath.includes('.')) {
                    missingLibs.push(filename);
                }
            });

            this.missingLibs = missingLibs;
        }

        return this.missingLibs;
    }

    /**
     * @param {Arguments} arguments
     * @return {Promise}
     */
    winetricks() {
        let title = Array.prototype.slice.call(arguments).join('-');
        let cmd   = Utils.quote(arguments);
        let path  = this.config.getWinetricksFile();

        if (title.length > 50) {
            title = title.substr(0, 48) + '..';
        }

        return this.update.downloadWinetricks()
            .then(() => this.fs.exists(path) ? null : Promise.reject())
            .then(() => {
                let logFile = this.config.getLogsDir() + `/winetricks-${title}.log`;
                let config = /**@type {Config} */ _.cloneDeep(this.config);
                config.setWineDebug('');
                let command = new Command(config);

                return command.watch(`"${path}" ${cmd}`, (output) => {
                    this.fs.filePutContents(logFile, output, this.fs.FILE_APPEND);
                });
            });
    }
}