import _          from "lodash";
import Utils      from "./utils";
import FileSystem from "./file-system";
import Prefix     from "./prefix";

export default class Registry {

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
        this.prefix   = prefix;
        this.fs       = fs;
    }


}