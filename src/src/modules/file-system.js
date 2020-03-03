import _      from "lodash";
import Config from "./config";
import Utils  from "./utils";

const fs            = require('fs');
const path          = require('path');
const glob          = require('glob');
const child_process = require('child_process');

export default class FileSystem {
    /**
     * @type {Config}
     */
    config = null;

    /**
     * @type {number}
     */
    DEFAULT_MODE_FILE = 0o644;

    /**
     * @type {number}
     */
    DEFAULT_MODE_DIR = 0o755;

    /**
     * @type {string}
     */
    FILE_APPEND = 'a';

    /**
     * @param {Config} config
     */
    constructor(config) {
        this.config = config;
    }

    /**
     * @param {string} path
     * @returns {boolean}
     */
    exists(path) {
        try {
            if (fs.existsSync(path)) {
                return true;
            }
        } catch (err) {
        }

        return false;
    }

    /**
     * @param {string} path
     * @returns {boolean}
     */
    isDirectory(path) {
        try {
            let stats = fs.lstatSync(_.trimEnd(path, '/'));

            if (stats.isDirectory()) {
                return true;
            }
        } catch (e) {
        }

        return false;
    }

    /**
     * @param {string} path
     * @returns {boolean}
     */
    isFile(path) {
        try {
            let stats = fs.lstatSync(_.trimEnd(path, '/'));

            if (stats.isFile()) {
                return true;
            }
        } catch (e) {
        }

        return false;
    }

    /**
     * @param {string} path
     * @returns {boolean}
     */
    isSymbolicLink(path) {
        try {
            let stats = fs.lstatSync(_.trimEnd(path, '/'));

            if (stats.isSymbolicLink()) {
                return true;
            }
        } catch (e) {
        }

        return false;
    }

    /**
     * @param {string} path
     * @returns {Date}
     */
    getCreateDate(path) {
        try {
            let stats = fs.lstatSync(_.trimEnd(path, '/'));

            return stats.ctime
        } catch (e) {
        }

        return null;
    }

    /**
     * @param {string} path
     * @returns {boolean}
     */
    mkdir(path) {
        try {
            fs.mkdirSync(path, { recursive: true, mode: this.DEFAULT_MODE_DIR });
            return true;
        } catch (err) {
        }

        return false;
    }

    /**
     * @param {string} dirPath
     * @param {string[]?} arrayOfFiles
     * @returns {string[]}
     */
    getAllFiles(dirPath, arrayOfFiles) {
        dirPath = _.trimEnd(dirPath, '/');

        let files = fs.readdirSync(dirPath);

        arrayOfFiles = arrayOfFiles || [];

        files.forEach((file) => {
            if (this.isDirectory(dirPath + '/' + file)) {
                arrayOfFiles = this.getAllFiles(dirPath + '/' + file, arrayOfFiles);
            } else {
                arrayOfFiles.push(path.join(__dirname, dirPath, file));
            }
        });

        return arrayOfFiles;
    }

    /**
     * @param {string} directoryPath
     * @returns {number}
     */
    getTotalSize(directoryPath) {
        const arrayOfFiles = this.getAllFiles(directoryPath);

        let totalSize = 0;

        arrayOfFiles.forEach((filePath) => {
            totalSize += fs.lstatSync(filePath).size;
        });

        return totalSize;
    }

    /**
     * @param {number} bytes
     * @returns {string}
     */
    convertBytes(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

        if (bytes === 0) {
            return "n/a";
        }

        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));

        if (i === 0) {
            return bytes + " " + sizes[i];
        }

        return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
    }

    /**
     * @param {string} path
     * @returns {boolean}
     */
    rm(path) {
        if (this.isFile(path)) {
            try {
                fs.unlinkSync(path);
                return true;
            } catch (err) {
            }

            return false;
        }

        try {
            fs.rmdirSync(path, { recursive: true });
            return true;
        } catch (err) {
        }

        return false;
    }

    /**
     * @param {string} src
     * @param {string} dest
     * @param {{overwrite: boolean?, preserveFileDate: boolean?, filter: Function?}} options
     */
    mv(src, dest, options = {}) {
        this.cp(src, dest, Object.assign({ move: true }, options));
        this.rm(src);
    }

    /**
     * @param {string} src
     * @param {string} dest
     * @param {{overwrite: boolean, preserveFileDate: boolean, filter: Function}} options
     */
    cp(src, dest, options = {}) {
        let defaultOptions = {
            overwrite:        true,
            preserveFileDate: true,
            move:             false,
            filter:           (filepath, type) => true,
        };

        let srcPath  = path.resolve(src);
        let destPath = path.resolve(dest);

        if (path.relative(srcPath, destPath).charAt(0) !== ".") {
            throw new Error("dest path must be out of src path");
        }

        let settings  = Object.assign(defaultOptions, options);
        let operation = settings.move ? fs.renameSync : fs.copyFileSync;

        if (this.isFile(srcPath)) {
            operation(srcPath, destPath, settings.overwrite ? 0 : fs.constants.COPYFILE_EXCL);
            return true;
        }

        const copyDirSync0 = (srcPath, destPath, settings) => {
            let files = fs.readdirSync(srcPath);

            if (!this.exists(destPath)) {
                this.mkdir(destPath);
            } else if (!this.isDirectory(destPath)) {
                if (settings.overwrite) {
                    throw new Error(`Cannot overwrite non-directory '${destPath}' with directory '${srcPath}'.`);
                }
                return;
            }

            files.forEach((filename) => {
                let childSrcPath  = path.join(srcPath, filename);
                let childDestPath = path.join(destPath, filename);
                let type          = this.isDirectory(childSrcPath) ? "directory" : "file";

                if (!settings.filter(childSrcPath, type)) {
                    return;
                }

                if (type === "directory") {
                    copyDirSync0(childSrcPath, childDestPath, settings);
                } else {
                    operation(childSrcPath, childDestPath, settings.overwrite ? 0 : fs.constants.COPYFILE_EXCL);

                    if (!settings.preserveFileDate) {
                        fs.futimesSync(childDestPath, Date.now(), Date.now());
                    }
                }
            });
        };

        copyDirSync0(srcPath, destPath, settings);
    }

    /**
     * @param {string} path
     * @returns {string[]}
     */
    glob(path) {
        return glob.sync(path);
    }

    /**
     * @param {string} filepath
     * @param {boolean} autoEncoding
     * @returns {string}
     */
    fileGetContents(filepath, autoEncoding = false) {
        if (autoEncoding) {
            return Utils.normalize(fs.readFileSync(filepath))
        }

        return fs.readFileSync(filepath).toString();
    }

    /**
     * @param {string} filepath
     * @param {string|Buffer} data
     * @param {string|null} flag
     * @returns {boolean}
     */
    filePutContents(filepath, data, flag = null) {
        try {
            fs.writeFileSync(filepath, data, Object.assign({ mode: this.DEFAULT_MODE_FILE }, null === flag ? {} : { flag }));
            return true;
        } catch (err) {
        }

        return false;
    }

    /**
     * @param {string} absPath
     * @param {string|null?} path
     * @return {string}
     */
    relativePath(absPath, path = null) {
        if (null !== path) {
            return absPath.replace(path, '').trim();
        }

        return _.trimStart(absPath.replace(this.config.getRootDir(), '').trim(), '/');
    }

    /**
     * @param path
     */
    chmod(path) {
        child_process.execSync('chmod +x -R ' + Utils.quote(path));
    }

    /**
     * @param {string} path
     * @param {string} dest
     */
    ln(path, dest) {
        child_process.execSync(`cd "${this.config.getRootDir()}" && ln -sfr "${path}" "${dest}"`);
    }

    /**
     * @param {string} path
     * @param {string} dest
     */
    lnOfRoot(path, dest) {
        if (!this.exists(path)) {
            this.mkdir(path);
        }

        if (!this.exists(dest)) {
            this.mkdir(dest);
        }

        if (!this.isEmptyDir(dest) && this.isEmptyDir(path)) {
            this.mv(dest, path, { overwrite: true });
        }

        if (this.exists(dest)) {
            this.rm(dest);
        }

        this.ln(this.relativePath(path), dest);
    }

    /**
     * @param {string} path
     */
    isEmptyDir(path) {
        return this.glob(`${_.trimEnd(path, '/')}/*`).length === 0;
    }
}