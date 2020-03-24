import FileSystem from "./file-system";
import Prefix     from "./prefix";

export default class Symlink {

    /**
     * @type {string[]}
     */
    extensions = ['cfg', 'conf', 'ini', 'inf', 'log', 'sav', 'save', 'config', 'con', 'profile', 'ltx'];

    /**
     * @type {Prefix}
     */
    prefix = null;

    /**
     * @type {FileSystem}
     */
    fs = null;

    /**
     * @param {Prefix} prefix
     * @param {FileSystem} fs
     */
    constructor(prefix, fs) {
        this.prefix = prefix;
        this.fs     = fs;
    }

    /**
     * @return {{}}
     */
    getDirs() {
        let result      = {};
        let symlinksDir = this.fs.basename(this.prefix.getGamesSymlinksDir());

        this.fs.glob(this.prefix.getGamesDir() + '/*').forEach((path) => {
            let name = this.fs.basename(path);

            if (name !== symlinksDir && this.fs.isDirectory(path)) {
                if (this.fs.isSymbolicLink(path) && this.fs.exists(this.prefix.getGamesSymlinksDir() + '/' + name)) {
                    result[name] = true;
                } else if (!this.fs.isSymbolicLink(path)) {
                    result[name] = false;
                }
            }
        });

        return result;
    }
}