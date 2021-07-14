import _          from "lodash";
import Utils      from "./utils";
import FileSystem from "./file-system";
import Replaces   from "./replaces";

export default class Registry {

  /**
   * @type {FileSystem}
   */
  fs = null;

  /**
   * @type {Replaces}
   */
  replaces = null;

  /**
   * @param {FileSystem} fs
   * @param {Replaces} replaces
   */
  constructor(fs, replaces) {
    this.fs       = fs;
    this.replaces = replaces;
  }

  /**
   * @param {[]} files
   * @return {boolean}
   */
  apply(files = []) {
    let wine = window.app.getKernel();
    let path = wine.getDriveC() + '/tmp.reg';
    let regs = [ 'Windows Registry Editor Version 5.00', '' ];

    files
      .map(path => this.fs.fileGetContents(path, true))
      .map(s => this.replaces.replaceByString(s.trim()))
      .forEach(text => {
        let file = text.split('\n');

        if ([ 'Windows Registry Editor Version 5.00', 'REGEDIT4' ].indexOf(_.head(file)) !== -1) {
          file.shift();
        }

        file.forEach(line => regs.push(line));
      });

    if (regs.length > 2) {
      this.fs.filePutContents(path, Utils.encode(regs.join('\n'), 'utf-16'));
      wine.reg(path);

      return true;
    }

    return false;
  }
}