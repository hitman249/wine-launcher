import _          from "lodash";
import Command    from "./command";
import Utils      from "./utils";
import FileSystem from "./file-system";
import Update     from "./update";
import Prefix     from "./prefix";

export default class Wine {
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
     * @param {Prefix} prefix
     * @param {Command} command
     * @param {FileSystem} fs
     * @param {Update} update
     */
    constructor(prefix, command, fs, update) {
        this.prefix  = prefix;
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

        let wineBootPath   = Utils.quote(this.prefix.getWineBoot());
        let wineServerPath = Utils.quote(this.prefix.getWineServer());

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

        let wineServerPath = Utils.quote(this.prefix.getWineServer());

        this.command.run(`${wineServerPath} -k ${cmd}`);
    }

    /**
     * @param {Arguments} arguments
     * @returns {string}
     */
    runAll() {
        let cmd        = Utils.quote(arguments);
        let winePath   = Utils.quote(this.prefix.getWineBin());
        let wine64Path = Utils.quote(this.prefix.getWine64Bin());
        let result     = '';

        result = this.command.run(`${winePath} ${cmd}`);

        if (this.prefix.getWineArch() === 'win64') {
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
        let winePath = Utils.quote(this.prefix.getWineBin());

        return this.command.run(`${winePath} ${cmd}`);
    }

    runFile(path) {
        let prefix = /** @type {Prefix} */ _.cloneDeep(this.prefix);
        prefix.setWineDebug('');

        let filename = this.fs.basename(path);
        let logFile  = `${this.prefix.getLogsDir()}/${filename}.log`;

        if (this.fs.exists(logFile)) {
            this.fs.rm(logFile);
        }

        let winePath = Utils.quote(this.prefix.getWineBin());
        let cmd      = Utils.quote(path);

        return (new Command(prefix)).watch(`${winePath} ${cmd}`, (output) => {
            this.fs.filePutContents(logFile, output, this.fs.FILE_APPEND);
        });
    }

    fm() {
        let prefix = /** @type {Prefix} */ _.cloneDeep(this.prefix);
        prefix.setWineDebug('');
        let logFile             = prefix.getLogFileManager();
        let wineFileManagerPath = Utils.quote(prefix.getWineFileManager());

        if (this.fs.exists(logFile)) {
            this.fs.rm(logFile);
        }

        return (new Command(prefix)).watch(wineFileManagerPath, (output) => {
            this.fs.filePutContents(logFile, output, this.fs.FILE_APPEND);
        });
    }

    cfg() {
        let prefix = /** @type {Prefix} */ _.cloneDeep(this.prefix);
        prefix.setWineDebug('');
        let logFile     = prefix.getLogFileConfig();
        let wineCfgPath = Utils.quote(prefix.getWineCfg());

        if (this.fs.exists(logFile)) {
            this.fs.rm(logFile);
        }

        return (new Command(prefix)).watch(wineCfgPath, (output) => {
            this.fs.filePutContents(logFile, output, this.fs.FILE_APPEND);
        });
    }

    /**
     * @param {Arguments} arguments
     * @returns {string}
     */
    reg() {
        let cmd       = Utils.quote(arguments);
        let regedit   = Utils.quote(this.prefix.getWineRegedit());
        let regedit64 = Utils.quote(this.prefix.getWineRegedit64());
        let result    = '';

        result = this.command.run(`${regedit} ${cmd}`);

        if (this.prefix.getWineArch() === 'win64') {
            result += '\n' + this.command.run(`${regedit64} ${cmd}`);
        }

        return result;
    }

    /**
     * @param {Arguments} arguments
     * @returns {string}
     */
    regOnly() {
        let cmd       = Utils.quote(arguments);
        let regedit   = Utils.quote(this.prefix.getWineRegedit());
        let regedit64 = Utils.quote(this.prefix.getWineRegedit64());
        let result    = '';

        if (this.prefix.getWineArch() === 'win64') {
            result += '\n' + this.command.run(`${regedit64} ${cmd}`);
        } else {
            result = this.command.run(`${regedit} ${cmd}`);
        }

        return result;
    }

    /**
     * @param {Arguments} arguments
     * @returns {string}
     */
    regsvr32() {
        let cmd      = Utils.quote(arguments);
        let regsvr32 = Utils.quote(this.prefix.getWineRegsvr32());
        let regsvr64 = Utils.quote(this.prefix.getWineRegsvr64());
        let result   = '';

        result = this.command.run(`${regsvr32} ${cmd}`);

        if (this.prefix.getWineArch() === 'win64') {
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
        let winePath = Utils.quote(this.prefix.getWineBin());

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
        let path  = this.prefix.getWinetricksFile();

        if (title.length > 50) {
            title = title.substr(0, 48) + '..';
        }

        return this.update.downloadWinetricks()
            .then(() => this.fs.exists(path) ? null : Promise.reject())
            .then(() => {
                let winetricksLog = this.prefix.getWinePrefix() + '/winetricks.log';
                let logFile       = this.prefix.getLogsDir() + `/winetricks-${title}.log`;
                let prefix        = /**@type {Prefix} */ _.cloneDeep(this.prefix);
                prefix.setWineDebug('');
                let command = new Command(prefix);

                if (this.fs.exists(winetricksLog)) {
                    this.fs.rm(winetricksLog);
                }
                if (this.fs.exists(logFile)) {
                    this.fs.rm(logFile);
                }

                return command.watch(`"${path}" ${cmd}`, (output) => {
                    this.fs.filePutContents(logFile, output, this.fs.FILE_APPEND);
                });
            });
    }

    clear() {
        this.version     = null;
        this.missingLibs = null;
        this.prefix.loadWineEnv();
    }
}