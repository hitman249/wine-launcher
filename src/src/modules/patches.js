import Prefix from "./prefix";
import Patch  from "./patch";
import _      from "lodash";
import Utils  from "./utils";

export default class Patches {

    /**
     * @type {Prefix}
     */
    prefix = null;

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
     * @param {Prefix} prefix
     * @param {Command} command
     * @param {System} system
     * @param {FileSystem} fs
     */
    constructor(prefix, command, system, fs) {
        this.prefix  = prefix;
        this.command = command;
        this.system  = system;
        this.fs      = fs;
    }

    /**
     * @return {Patch[]}
     */
    findPatches(onlyActive = false) {
        let patchesDir = this.prefix.getPatchesDir();

        if (!this.fs.exists(patchesDir)) {
            return [];
        }

        return _.sortBy(
            Utils.natsort(this.fs.glob(patchesDir + '/*'))
                .map(path => new Patch(path))
                .filter(patch => onlyActive ? patch.isActive() : true),
            ['sort', 'createdAt']
        );
    }

    /**
     * @return {Patch[]}
     */
    getActivePatches() {
        return this.findPatches(true);
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
        let driveC = this.prefix.getWineDriveC();

        this.command.run(`cd "${parent}" && tar -h -xzf "${path}" -C "${driveC}"`);

        return true;
    }

    /**
     * @return {boolean}
     */
    apply() {
        let patchesDir = this.prefix.getPatchesDir();

        if (!this.fs.exists(this.prefix.getWinePrefix()) || !this.fs.exists(patchesDir) || this.fs.isEmptyDir(patchesDir)) {
            return false;
        }

        let driveC      = this.prefix.getWineDriveC();
        let username    = this.system.getUserName();
        let userDefault = this.prefix.getWineDriveC() + '/users/default';
        let userCurrent = `${driveC}/users/${username}`;
        let overwrite   = { overwrite: true };
        let status      = false;

        this.getActivePatches().forEach((patch) => {
            let path = patch.getPath();

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

    /**
     * @return {string[]}
     */
    getRegistryFiles() {
        let files = [];

        this.getActivePatches().forEach((patch) => {
            patch.getRegistryFiles().forEach((path) => {
                files.push(path);
            });
        });

        return files;
    }
}