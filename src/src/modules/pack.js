import FileSystem from "./file-system";
import Prefix     from "./prefix";
import Command    from "./command";
import Mount      from "./mount";
import System     from "./system";

export default class Pack {

    /**
     * @type {Prefix}
     */
    prefix = null;

    /**
     * @type {Command}
     */
    command = null;

    /**
     * @type {FileSystem}
     */
    fs = null;

    /**
     * @type {System}
     */
    system = null;

    /**
     * @type {Mount}
     */
    mountWine = null;

    /**
     * @type {Mount}
     */
    mountData = null;

    /**
     * @param {Prefix} prefix
     * @param {FileSystem} fs
     * @param {Command} command
     * @param {System} system
     * @param {Mount} mountWine
     * @param {Mount} mountData
     */
    constructor(prefix, command, fs, system, mountWine, mountData) {
        this.prefix    = prefix;
        this.command   = command;
        this.fs        = fs;
        this.system    = system;
        this.mountWine = mountWine;
        this.mountData = mountData;
    }

    /**
     * @param {string} folder
     * @return {null|Mount}
     */
    getMount(folder) {
        if (this.mountWine.getFolder() === folder) {
            return this.mountWine;
        }

        if (this.mountData.getFolder() === folder) {
            return this.mountData;
        }

        return null;
    }

    /**
     * @param {string} folder
     * @return {Promise<boolean>}
     */
    pack(folder) {
        let mount    = this.getMount(folder);
        let squashfs = `${folder}.squashfs`;
        let wineBin  = `${folder}/bin`;
        let cmd      = '';

        if (null === mount || mount.isMounted() || !this.fs.exists(folder) || !this.system.existsCommand('mksquashfs')) {
            return Promise.resolve(false);
        }

        if (this.fs.exists(squashfs)) {
            this.fs.rm(squashfs);
        }

        if (this.mountWine.getFolder() === folder && this.fs.exists(wineBin)) {
            this.fs.chmod(wineBin);
            cmd = `mksquashfs "${folder}" "${squashfs}" -b 1048576 -comp xz -Xdict-size 100%`;
        } else {
            cmd = `mksquashfs "${folder}" "${squashfs}" -b 1048576 -comp gzip -Xcompression-level 9`;
        }

        this.command.run(cmd);

        return Promise.resolve(true);
    }

    /**
     * @param {string} folder
     * @return {Promise<boolean>}
     */
    unpack(folder) {
        let mount = this.getMount(folder);
        let tmp   = `${this.prefix.getCacheDir()}/${this.fs.basename(folder)}_tmp`;

        if (null === mount || !mount.isMounted() || !this.fs.exists(folder)) {
            return Promise.resolve(false);
        }

        if (this.fs.exists(tmp)) {
            this.fs.rm(tmp);
        }

        this.fs.cp(folder, tmp);

        return mount.unmount().then(() => {
            if (mount.isMounted() || this.fs.exists(folder)) {
                return false;
            }

            this.fs.mv(tmp, folder);

            return true;
        });
    }
}