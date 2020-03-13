import _          from "lodash";
import Utils      from "./utils";
import FileSystem from "./file-system";
import Replaces   from "./replaces";
import Wine       from "./wine";
import Prefix     from "./prefix";
import Diff       from "./diff";

export default class Snapshot {

    /**
     * @type {Prefix}
     */
    prefix = null;

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
     * @type {string[]}
     */
    folders = [
        'Program Files',
        'Program Files (x86)',
        'ProgramData',
        'info',
        'users',
        'windows',
    ];

    /**
     * @type {string}
     */
    snapshotDir = '/snapshot';

    /**
     * @type {string}
     */
    snapshotFile = '/filelist.snapshot';

    /**
     * @type {string}
     */
    patchDir = '/patch';

    /**
     * @type {string}
     */
    TYPE_BEFORE = 'before';

    /**
     * @type {string}
     */
    TYPE_AFTER = 'after';

    /**
     * @param {Prefix} prefix
     * @param {FileSystem} fs
     * @param {Replaces} replaces
     * @param {Wine} wine
     */
    constructor(prefix, fs, replaces, wine) {
        this.prefix   = prefix;
        this.fs       = fs;
        this.replaces = replaces;
        this.wine     = wine;
    }

    getSnapshotFile(type = this.TYPE_BEFORE) {
        return this.prefix.getCacheDir() + this.snapshotDir + '/' + type + this.snapshotFile;
    }

    getSnapshotRegeditFile(type = this.TYPE_BEFORE) {
        return this.prefix.getCacheDir() + this.snapshotDir + '/' + type + '/regedit.reg';
    }

    getSnapshotDir(type = this.TYPE_BEFORE) {
        return this.prefix.getCacheDir() + this.snapshotDir + '/' + type;
    }

    getPatchDir() {
        return this.prefix.getCacheDir() + this.snapshotDir + this.patchDir;
    }

    create(type = this.TYPE_BEFORE) {
        let dir  = this.getSnapshotDir(type);
        let file = this.getSnapshotFile(type);
        let reg  = `${this.prefix.getWineDriveC()}/regedit.reg`;

        let relativeGamesFolder = this.fs.relativePath(this.prefix.getWinePrefixGameFolder());

        if (this.fs.exists(dir)) {
            this.fs.rm(dir);
        }

        this.fs.mkdir(dir);

        let files = [];

        this.folders.forEach((folder) => {
            let path = this.prefix.getWineDriveC() + '/' + folder;

            if (!this.fs.exists(path)) {
                return;
            }

            this.fs.getAllFiles(path).forEach((path) => {
                let relative = this.fs.relativePath(path);

                if (relative === relativeGamesFolder || _.startsWith(relative, relativeGamesFolder + '/') || this.fs.isSymbolicLink(path)) {
                    return;
                }

                if (this.fs.isDirectory(path)) {
                    files.push(`${relative};dir;;`);
                } else {
                    files.push(`${relative};file;${this.fs.getMd5File(path)};${this.fs.size(path)}`);
                }
            });
        });

        this.fs.glob(this.prefix.getWineDriveC() + '/*')
            .filter(path => !this.fs.isDirectory(path) && !this.fs.isSymbolicLink(path))
            .forEach(file => {
                let relative = this.fs.relativePath(file);
                files.push(`${relative};file;${this.fs.getMd5File(file)};${this.fs.size(file)}`);
            });

        this.fs.filePutContents(file, files.join('\n'));

        this.wine.regOnly('/E', reg);
        this.fs.mv(reg, `${dir}/regedit.reg`);
    }

    createBefore() {
        this.create(this.TYPE_BEFORE);
    }

    createAfter() {
        this.create(this.TYPE_AFTER);

        let patch = this.getPatchDir();

        if (this.fs.exists(patch)) {
            this.fs.rm(patch);
        }

        this.fs.mkdir(patch);

        let reg = this.getRegeditChanges(this.getSnapshotRegeditFile(this.TYPE_BEFORE), this.getSnapshotRegeditFile(this.TYPE_AFTER));

        if (reg) {
            this.fs.filePutContents(`${patch}/changes.reg`, reg);
        }
    }

    /**
     * @param {string} before path
     * @param {string} after path
     * @return {string}
     */
    getRegeditChanges(before, after) {
        if (!this.fs.exists(before) || !this.fs.exists(after)) {
            return '';
        }

        const findUpOfKey = (sections, key) => {
            // eslint-disable-next-line
            while (undefined === sections[--key] && key >= 0) {}

            if (undefined === sections[key]) {
                return null;
            }

            return sections[key];
        };

        let diff     = new Diff(this.fs);
        let compare  = diff.diff(before, after, 'utf-16le');
        let sections = Utils.array_filter(diff.getFile2Data(), line => _.startsWith(line, '['));
        let inserted = Utils.array_filter(compare[diff.INSERTED], line => !_.startsWith(line, '['));

        let result      = {};
        let prevChange  = null;
        let findSection = null;

        _.forEach(inserted, (line, lineNumber) => {
            if (!prevChange || (prevChange + 1) !== lineNumber) {
                prevChange  = lineNumber;
                findSection = findUpOfKey(sections, lineNumber);
            }

            if (!findSection) {
                return;
            }

            if (undefined === result[findSection]) {
                result[findSection] = [];
            }

            result[findSection].push(line);
        });

        if (_.isEmpty(result)) {
            return '';
        }

        let text = "Windows Registry Editor Version 5.00\n";

        for (let section in result) {
            if (undefined !== section && undefined !== result[section]) {
                text += `\n${section}\n${result[section].join('\n')}\n`;
            }
        }

        return this.replaces.replaceToTemplateByString(text);
    }
}