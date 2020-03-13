import _          from "lodash";
import Utils      from "./utils";
import FileSystem from "./file-system";
import Replaces   from "./replaces";
import Wine       from "./wine";
import Prefix     from "./prefix";

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

    getSnapshotDir(type = this.TYPE_BEFORE) {
        return this.prefix.getCacheDir() + this.snapshotDir + '/' + type;
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
    }
}