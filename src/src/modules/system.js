import Config  from "./config";
import Command from "./command";

export default class System {

    /**
     * @type {Config}
     */
    config = null;

    /**
     * @type {Command}
     */
    command = null;

    /**
     * @type {string|null}
     */
    glibcVersion = null;

    /**
     * @param {Config} config
     * @param {Command} command
     */
    constructor(config, command) {
        this.config = config;
        this.command = command;
    }

    /**
     * @returns {string|null}
     */
    getGlibcVersion() {
        if (null === this.glibcVersion) {

            let isGetConf = Boolean(this.command.run('command -v getconf'));

            if (isGetConf) {
                let version = this.command.run('getconf GNU_LIBC_VERSION')
                    .split('\n').map(s => s.trim())[0].match('([0-9]{1,}.[0-9]{1,})');

                version = version ? version[1] : null;

                if (version) {
                    this.glibcVersion = version;
                }
            }

            if (!this.glibcVersion) {
                let version = this.command.run('ldd --version')
                    .split('\n').map(s => s.trim())[0].match('([0-9]{1,}.[0-9]{1,})');

                version = version ? version[1] : null;

                if (version) {
                    this.glibcVersion = version;
                }
            }
        }

        return this.glibcVersion;
    }
}