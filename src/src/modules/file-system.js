import _       from "lodash";
import Utils   from "./utils";
import Command from "./command";
import Prefix  from "./prefix";

const fs            = require('fs');
const path          = require('path');
const glob          = require('glob');
const child_process = require('child_process');
const md5_file      = require('md5-file');

export default class FileSystem {
    /**
     * @type {Prefix}
     */
    prefix = null;

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
     * @param {Prefix} prefix
     * @param {Command} command
     */
    constructor(prefix, command) {
        this.prefix  = prefix;
        this.command = command;
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
            let stats = fs.statSync(_.trimEnd(path, '/'));

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
     * @param {string} path
     * @return {number}
     */
    size(path) {
        if (this.isDirectory(path)) {
            return this.getDirectorySize(path);
        }

        return fs.lstatSync(path).size;
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
            arrayOfFiles.push(path.join(dirPath, file));

            if (this.isDirectory(dirPath + '/' + file)) {
                arrayOfFiles = this.getAllFiles(dirPath + '/' + file, arrayOfFiles);
            }
        });

        return arrayOfFiles;
    }

    /**
     * @param {string} directoryPath
     * @returns {number}
     */
    getDirectorySize(directoryPath) {
        const arrayOfFiles = this.getAllFiles(directoryPath);

        let totalSize = 0;

        arrayOfFiles.forEach((filePath) => {
            if (this.isDirectory(filePath)) {
                return;
            }

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
     * @param {{overwrite: boolean?, preserveFileDate: boolean?, filter: Function?}} options
     */
    cp(src, dest, options = {}) {
        let defaultOptions = {
            overwrite:        true,
            preserveFileDate: true,
            move:             false,
            filter:           (filepath, type) => true,
        };

        const copySymbolic = (src, dest) => {
            fs.symlinkSync(fs.readlinkSync(src), dest);
        };

        let srcPath  = path.resolve(src);
        let destPath = path.resolve(dest);

        if (path.relative(srcPath, destPath).charAt(0) !== ".") {
            throw new Error("dest path must be out of src path");
        }

        let settings  = Object.assign(defaultOptions, options);
        let operation = settings.move ? fs.renameSync : fs.copyFileSync;

        if (!settings.move && this.isSymbolicLink(srcPath)) {
            copySymbolic(srcPath, destPath);
            return true;
        }
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

                if (!settings.move && this.isSymbolicLink(childSrcPath)) {
                    copySymbolic(childSrcPath, childDestPath);
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
     * @param {string} src
     * @param {string} dest
     * @return {string}
     */
    cpHardLink(src, dest) {
        if (this.isDirectory(src)) {
            return this.command.run(`\\cp -ra --link "${src}" "${dest}"`);
        }

        this.command.run(`\\cp -a --link "${src}" "${dest}"`);
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
     * @param {string} encoding
     * @return {string}
     */
    fileGetContentsByEncoding(filepath, encoding = 'utf-8') {
        return fs.readFileSync(filepath, { encoding }).toString();
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
            return _.trimStart(absPath.replace(path, '').trim(), '/');
        }

        return _.trimStart(absPath.replace(this.prefix.getRootDir(), '').trim(), '/');
    }

    /**
     * @param path
     */
    chmod(path) {
        try {
            child_process.execSync('chmod +x -R ' + Utils.quote(path));
        } catch (err) {
        }
    }

    /**
     * @param {string} path
     * @param {string} dest
     */
    ln(path, dest) {
        child_process.execSync(`cd "${this.prefix.getRootDir()}" && ln -sfr "${path}" "${dest}"`);
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

    /**
     * @param {string} src
     * @return {string}
     */
    dirname(src) {
        return path.dirname(src);
    }

    /**
     * @param {string} src
     * @return {string}
     */
    basename(src) {
        return path.basename(src);
    }

    /**
     * @param {string} src
     * @return {string}
     */
    extension(src) {
        return _.trimStart(path.extname(src), '.');
    }

    /**
     * @param src
     * @return {string}
     */
    getMd5File(src) {
        return md5_file.sync(src);
    }

    /**
     * @param {string} inFile
     * @param {string} outDir
     * @param {string} type
     * @param {string} glob
     * @param {string} archiver
     * @return {boolean}
     */
    unpackXz(inFile, outDir, type = 'xf', glob = '', archiver = 'tar') {
        if (!this.exists(inFile) || this.isDirectory(inFile)) {
            return false;
        }

        if (this.exists(outDir)) {
            this.rm(outDir);
        }

        let tmpDir = this.prefix.getCacheDir() + `/tmp_${Utils.rand(10000, 99999)}`;
        this.mkdir(tmpDir);

        if (!this.exists(tmpDir)) {
            return false;
        }

        let fileName = this.basename(inFile);
        let mvFile   = `${tmpDir}/${fileName}`;
        this.mv(inFile, mvFile);

        this.command.run(`cd "${tmpDir}" && ${archiver} ${type} "./${fileName}"`);
        this.rm(mvFile);

        let find = this.glob(`${tmpDir}/${glob}*`);

        let path = tmpDir;

        if (find.length === 1) {
            path = _.head(find);
        }

        if (this.exists(`${path}/bin`)) {
            this.chmod(`${path}/bin`);
        }

        this.mv(path, outDir);

        if (this.exists(tmpDir)) {
            this.rm(tmpDir);
        }

        return true;
    }

    /**
     * @param {string} inFile
     * @param {string} outDir
     * @return {boolean}
     */
    unpackGz(inFile, outDir) {
        return this.unpackXz(inFile, outDir, '-xzf');
    }

    /**
     * @param {string} inFile
     * @param {string} outDir
     * @return {boolean}
     */
    unpackPol(inFile, outDir) {
        return this.unpackXz(inFile, outDir, '-xjf', 'wineversion/');
    }

    /**
     * @param {string} inFile
     * @param {string} outDir
     * @return {boolean}
     */
    unpackRar(inFile, outDir) {
        return this.unpackXz(inFile, outDir, 'x', '', 'unrar');
    }

    /**
     * @param {string} inFile
     * @param {string} outDir
     * @return {boolean}
     */
    unpackZip(inFile, outDir) {
        return this.unpackXz(inFile, outDir, '', '', 'unzip');
    }

    /**
     * @param {string} inFile
     * @param {string} outDir
     * @return {boolean}
     */
    unpack(inFile, outDir) {
        if (_.endsWith(inFile, '.tar.xz')) {
            return this.unpackXz(inFile, outDir);
        }
        if (_.endsWith(inFile, '.tar.gz')) {
            return this.unpackGz(inFile, outDir);
        }
        if (_.endsWith(inFile, '.pol')) {
            return this.unpackPol(inFile, outDir);
        }
        if (_.endsWith(inFile, '.exe') || _.endsWith(inFile, '.rar')) {
            return this.unpackRar(inFile, outDir);
        }
        if (_.endsWith(inFile, '.zip')) {
            return this.unpackZip(inFile, outDir);
        }

        return false;
    }

    /**
     * @param {string} folder
     * @return {boolean}
     */
    pack(folder) {
        folder = _.trimEnd(folder, '\\/');

        if (!this.exists(folder) || this.exists(`${folder}.tar.gz`)) {
            return false;
        }

        this.command.run(`cd "${folder}" && tar -zcf "${folder}.tar.gz" -C "${folder}" .`);

        return this.exists(`${folder}.tar.gz`);
    }
}