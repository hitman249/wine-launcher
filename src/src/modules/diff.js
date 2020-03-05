import _          from "lodash";
import Utils      from "./utils";
import Config     from "./config";
import Command    from "./command";
import FileSystem from "./file-system";

const child_process = require('child_process');

export default class Diff {

    /**
     * @type {number}
     */
    UNMODIFIED = 0;

    /**
     * @type {number}
     */
    DELETED = 1;

    /**
     * @type {number}
     */
    INSERTED = 2;

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

    file1Data = [];
    file2Data = [];

    /**
     * @param {Config} config
     * @param {Command} command
     * @param {FileSystem} fs
     */
    constructor(config, command, fs) {
        this.config  = config;
        this.command = command;
        this.fs      = fs;
    }

    /**
     * @param {string} diff
     * @return {{}}
     */
    parse(diff) {
        let result = {
            [this.DELETED]:  {},
            [this.INSERTED]: {},
        };

        let from = '0';
        let to   = '0';

        let sectionType = this.DELETED;

        diff.split('\n').forEach(line => {
            if (line.includes('*** ') && false === line.includes(' ****')) {
                return;
            }
            if (line.includes('--- ') && false === line.includes(' ----')) {
                return;
            }
            if (line.includes('***************')) {
                sectionType = this.DELETED;
                return;
            }

            if (line.includes('--- ') && line.includes(' ----')) {
                sectionType = this.INSERTED;
                [from, to]  = _.trim(line, '-* \t\n\r\0\x0B').split(',');
                return;
            }
            if (line.includes('*** ') && line.includes(' ****')) {
                sectionType = this.DELETED;
                [from, to]  = _.trim(line, '-* \t\n\r\0\x0B').split(',');
                return;
            }

            if (_.startsWith(line, '+') || _.startsWith(line, '-') || _.startsWith(line, '!')) {
                let index = Utils.toInt(from) - 1;
                if (sectionType === this.DELETED) {
                    result[this.DELETED][index] = this.file1Data[index];
                } else if (sectionType === this.INSERTED) {
                    result[this.INSERTED][index] = this.file2Data[index];
                }
            }

            from = Utils.toInt(from) + 1;
        });

        return result;
    }

    /**
     * @param {string} file1
     * @param {string} file2
     * @param {string} encoding
     * @return {{}}
     */
    diff(file1, file2, encoding = 'utf-8') {
        this.file1Data = this.fs.fileGetContentsByEncoding(file1, encoding).split(/\n|\r\n?/);
        this.file2Data = this.fs.fileGetContentsByEncoding(file2, encoding).split(/\n|\r\n?/);

        return this.parse(child_process.execSync(`diff --text -c "${file1}" "${file2}"`).toString());
    }

    /**
     * @return {string[]}
     */
    getFile1Data() {
        return this.file1Data;
    }

    /**
     * @return {string[]}
     */
    getFile2Data() {
        return this.file2Data;
    }
}