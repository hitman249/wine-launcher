import _     from "lodash";
import Utils from "./utils";

export default class Patch {

    /**
     * @type {Config}
     */
    config = null;

    /**
     * @type {Command}
     */
    command = null;

    /**
     * @type {System}
     */
    system = null;

    /**
     * @type {FileSystem}
     */
    fs = null;

    /**
     * @param {Config} config
     * @param {Command} command
     * @param {System} system
     * @param {FileSystem} fs
     */
    constructor(config, command, system, fs) {
        this.config  = config;
        this.command = command;
        this.system  = system;
        this.fs      = fs;
    }
}