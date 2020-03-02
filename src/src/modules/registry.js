import _          from "lodash";
import Utils      from "./utils";
import Config     from "./config";
import Command    from "./command";
import System     from "./system";
import FileSystem from "./file-system";
import Replaces   from "./replaces";
import Wine       from "./wine";

export default class Registry {

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
     * @type {Replaces}
     */
    replaces = null;

    /**
     * @type {Wine}
     */
    wine = null;

    /**
     * @param {Config} config
     * @param {Command} command
     * @param {System} system
     * @param {FileSystem} fs
     * @param {Replaces} replaces
     * @param {Wine} wine
     */
    constructor(config, command, system, fs, replaces, wine) {
        this.config   = config;
        this.command  = command;
        this.system   = system;
        this.fs       = fs;
        this.replaces = replaces;
        this.wine     = wine;
    }

    /**
     * @param {[]} files
     * @return {boolean}
     */
    apply(files = []) {
        let path = this.config.getWineDriveC() + '/tmp.reg';
        let regs = ['Windows Registry Editor Version 5.00', ''];

        files
            .map(path => this.fs.fileGetContents(path, true))
            .map(s => this.replaces.replaceByString(s.trim()))
            .forEach(text => {
                let file = text.split('\n');

                if (['Windows Registry Editor Version 5.00', 'REGEDIT4'].indexOf(_.head(file)) !== -1) {
                    file.shift();
                }

                file.forEach(line => regs.push(line));
            });

        if (regs.length > 2) {
            this.fs.filePutContents(path, Utils.encode(regs.join('\n'), 'utf-16'));
            this.wine.reg(path);

            return true;
        }

        return false;
    }
}