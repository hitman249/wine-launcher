import _          from "lodash";
import Utils      from "./utils";
import FileSystem from "./file-system";
import Replaces   from "./replaces";
import Wine       from "./wine";
import Prefix     from "./prefix";
import Diff       from "./diff";
import System     from "./system";

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
     * @type {System}
     */
    system = null;

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
     * @param {System} system
     */
    constructor(prefix, fs, replaces, wine, system) {
        this.prefix   = prefix;
        this.fs       = fs;
        this.replaces = replaces;
        this.wine     = wine;
        this.system   = system;
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

        let driveC              = this.prefix.getWineDriveC();
        let relativeGamesFolder = this.fs.relativePath(this.prefix.getWinePrefixGameFolder(), driveC);

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
                let relative = this.fs.relativePath(path, driveC);

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
                let relative = this.fs.relativePath(file, driveC);
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

        let files  = this.getFilesChanges(this.getSnapshotFile(this.TYPE_BEFORE), this.getSnapshotFile(this.TYPE_AFTER));
        let driveC = this.prefix.getWineDriveC();

        let userFolder        = 'users/' + this.system.getUserName();
        let userFolderReplace = 'users/default';

        files.forEach((file) => {
            let fileIn  = `${driveC}/${file}`;
            let fileOut = _.startsWith(file, userFolder)
                ? `${patch}/files/${file.replace(userFolder, userFolderReplace)}`
                : `${patch}/files/${file}`;
            let dirOut  = this.fs.dirname(fileOut);

            if (!this.fs.exists(dirOut)) {
                this.fs.mkdir(dirOut);
            }

            this.fs.cp(fileIn, fileOut);
        });

        if (files.length > 0) {
            let win32      = `${patch}/files/windows/system32`;
            let win64      = `${patch}/files/windows/syswow64`;
            let extensions = ['dll', 'ocx', 'exe'];
            let libs       = [];

            const each = (path) => {
                let filename = this.fs.basename(path).toLocaleLowerCase();
                let ext      = this.fs.extension(path);

                if (extensions.indexOf(ext) !== -1 && libs.indexOf(filename) === -1) {
                    libs.push(filename);
                }
            };

            if (this.fs.exists(win32)) {
                this.fs.glob(`${win32}/*`).forEach(each);
            }

            if (this.fs.exists(win64)) {
                this.fs.glob(`${win64}/*`).forEach(each);
            }

            if (libs.length > 0) {
                let reg = [
                    "REGEDIT4\n",
                    "[HKEY_CURRENT_USER\\Software\\Wine\\DllOverrides]"
                ];

                libs.forEach((file) => {
                    let ext = this.fs.extension(file);
                    if ('dll' === ext) {
                        file = `*${file}`;
                    }

                    reg.push(`"${file}"="native"`);
                });

                this.fs.filePutContents(`${patch}/override-dll.reg`, reg.join('\n'));
            }

            let pathFiles = `${patch}/files`;

            if (this.fs.exists(pathFiles) && this.fs.pack(pathFiles)) {
                this.fs.rm(pathFiles);
            }
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

    /**
     * @param {string} before path
     * @param {string} after path
     * @return {string[]}
     */
    getFilesChanges(before, after) {
        if (!this.fs.exists(before) || !this.fs.exists(after)) {
            return [];
        }

        let diff     = new Diff(this.fs);
        let compare  = diff.diff(before, after);
        let inserted = [];

        _.forEach(compare[diff.INSERTED], (line) => {
            let [path, type, size] = line.split(';');

            if ('file' === type) {
                inserted.push(path);
            }
        });

        return inserted;
    }

    /**
     * @param {Patch} patch
     */
    moveToPatch(patch) {
        return this.fs.mv(this.getPatchDir(), patch.getPath());
    }
}