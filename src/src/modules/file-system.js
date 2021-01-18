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
      if (fs.existsSync(_.trimEnd(path, '/'))) {
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
      fs.mkdirSync(_.trimEnd(path, '/'), { recursive: true, mode: this.DEFAULT_MODE_DIR });
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
    if (this.isDirectory(path) && !this.isSymbolicLink(path)) {
      return this.getDirectorySize(path);
    }

    if (!this.exists(path)) {
      return 0;
    }

    return fs.lstatSync(_.trimEnd(path, '/')).size;
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

      if (this.isDirectory(dirPath + '/' + file) && !this.isSymbolicLink(dirPath + '/' + file)) {
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
      if (this.isDirectory(filePath) && !this.isSymbolicLink(filePath)) {
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
    const sizes = [ 'Bytes', 'KB', 'MB', 'GB', 'TB' ];

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
    path = _.trimEnd(path, '/');

    if (this.isFile(path) || this.isSymbolicLink(path)) {
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
   * @param {boolean} symlinkSync
   */
  cp(src, dest, options = {}, symlinkSync = true) {
    let defaultOptions = {
      overwrite:        true,
      preserveFileDate: true,
      move:             false,
      filter:           (filepath, type) => true,
    };

    const getType = (path) => {
      let isDir          = this.isDirectory(path);
      let isSymbolicLink = this.isSymbolicLink(path);

      if (false === symlinkSync) {
        if (isSymbolicLink) {
          let linkPath = fs.readlinkSync(path);

          if (_.startsWith(linkPath, '/dev/') || _.startsWith(linkPath, '/proc/')) {
            return 'directory';
          }
        }

        return isDir ? 'directory' : 'file';
      }

      return isDir && !isSymbolicLink ? 'directory' : 'file';
    };

    const isSymlinkSync = (path) => {
      if (symlinkSync) {
        return true;
      }

      let type         = getType(path);
      let symbolicLink = this.isSymbolicLink(path);

      return symbolicLink && 'directory' === type;
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

    if (isSymlinkSync(srcPath) && !settings.move && this.isSymbolicLink(srcPath)) {
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
        let type          = getType(childSrcPath);

        if (!settings.filter(childSrcPath, type)) {
          return;
        }

        if (isSymlinkSync(childSrcPath) && !settings.move && this.isSymbolicLink(childSrcPath)) {
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
   * Encodings:
   *
   * - ascii
   * - base64
   * - hex
   * - ucs2/ucs-2/utf16le/utf-16le
   * - utf8/utf-8
   * - binary/latin1 (ISO8859-1, latin1 only in node 6.4.0+)
   *
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

    let finds = this.glob(`${tmpDir}/*`).filter(path => this.exists(`${path}/bin`));

    if (finds.length === 0) {
      this.glob(`${tmpDir}/*`).forEach(level1 => {
        this.glob(`${level1}/*`).forEach(level2 => {
          if (this.exists(`${level2}/bin`)) {
            finds.push(level2);
          }
        });
      });
    }

    let path = tmpDir;

    if (finds.length > 0) {
      path = _.head(finds);
    }

    if (this.exists(`${path}/bin`)) {
      this.chmod(`${path}/bin`);
      this.mv(path, outDir);
    } else {
      let archives = this.glob(`${tmpDir}/*`).filter(path => this.isArchive(path));

      if (archives.length === 0) {
        this.glob(`${tmpDir}/*`).forEach(level1 => {
          this.glob(`${level1}/*`).forEach(level2 => {
            if (this.isArchive(level2)) {
              archives.push(level2);
            }
          });
        });
      }

      archives = archives.sort((a, b) => {
        let sa = this.size(a);
        let sb = this.size(b);

        if (sa > sb) {
          return -1;
        }
        if (sa < sb) {
          return -1;
        }

        return 0;
      })

      if (archives.length > 0) {
        this.unpack(_.head(archives), outDir);
      }
    }

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

  unpackSimpleZip(inFile, outDir) {
    let tmpDir = this.prefix.getCacheDir() + `/tmp_${Utils.rand(10000, 99999)}`;
    this.mkdir(tmpDir);

    if (!this.exists(tmpDir)) {
      return false;
    }

    let fileName = this.basename(inFile);
    let mvFile   = `${tmpDir}/${fileName}`;
    this.mv(inFile, mvFile);

    this.command.run(`cd "${tmpDir}" && unzip "./${fileName}"`);
    this.rm(mvFile);

    let finds = this.glob(`${tmpDir}/*`);
    let path  = tmpDir;

    if (finds.length === 1 && this.isDirectory(finds[0])) {
      path = finds[0];
    }

    this.mv(path, outDir);

    if (this.exists(tmpDir)) {
      this.rm(tmpDir);
    }

    return true;
  }

  /**
   * @param {string} path
   * @return {boolean}
   */
  isArchive(path) {
    if (_.endsWith(path, '.tar.xz')) {
      return true;
    }
    if (_.endsWith(path, '.tar.gz')) {
      return true;
    }
    if (_.endsWith(path, '.pol')) {
      return true;
    }
    if (_.endsWith(path, '.exe') || _.endsWith(path, '.rar')) {
      return true;
    }
    if (_.endsWith(path, '.zip')) {
      return true;
    }
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