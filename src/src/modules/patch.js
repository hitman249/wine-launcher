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

    /**
     * @param {string} path
     * @return {boolean}
     */
    unpack(path) {
        if (!this.fs.exists(path)) {
            return false;
        }

        let parent = this.fs.dirname(path);
        let driveC = this.config.getWineDriveC();

        this.command.run(`cd "${parent}" && tar -h -xzf "${path}" -C "${driveC}"`);

        return true;
    }

    /**
     * @return {boolean}
     */
    apply() {
        let applyPath = this.config.getPatchApplyDir();

        if (!this.fs.exists(this.config.getWinePrefix()) || !this.fs.exists(applyPath) || this.fs.isEmptyDir(applyPath)) {
            return false;
        }

        let driveC      = this.config.getWineDriveC();
        let username    = this.system.getUserName();
        let userDefault = this.config.getWineDriveC() + '/users/default';
        let userCurrent = `${driveC}/users/${username}`;
        let overwrite   = { overwrite: true };
        let status      = false;

        Utils.natsort(this.fs.glob(applyPath + '/*')).forEach(path => {
            if (false === status) {
                status = true;
            }

            if (this.fs.exists(`${path}/files.tar.gz`)) {
                this.unpack(`${path}/files.tar.gz`);

                if ('default' !== username && this.fs.exists(userDefault)) {
                    this.fs.mv(userDefault, userCurrent, overwrite);
                }
            } else if (this.fs.isDirectory(path) && this.fs.exists(`${path}/files`)) {
                let replace = `${path}/files/`;

                this.fs.glob(`${path}/files/*`).forEach(path => {
                    let name         = this.fs.basename(path);
                    let relativePath = this.fs.relativePath(path, replace);

                    if (this.fs.isDirectory(path)) {
                        let out = `${driveC}/${relativePath}`;

                        if (this.fs.exists(out)) {
                            this.fs.rm(out);
                        }

                        this.fs.cp(path, out, overwrite);
                    } else if ('users' === name) {
                        this.fs.glob(`${path}/*`).forEach(user => {
                            let name         = this.fs.basename(user);
                            let relativePath = this.fs.relativePath(user, replace);

                            if (!this.fs.isDirectory(user)) {
                                let out = `${driveC}/${relativePath}`;
                                if (this.fs.exists(out)) {
                                    this.fs.rm(out);
                                }
                                this.fs.cp(user, out, overwrite);
                            } else if ('default' === name) {
                                this.fs.cp(user, userCurrent, overwrite);
                            } else {
                                this.fs.cp(user, `${driveC}/${relativePath}`, overwrite);
                            }
                        });
                    } else {
                        this.fs.cp(path, `${driveC}/${relativePath}`, overwrite);
                    }
                });
            }
        });

        return status;
    }
}