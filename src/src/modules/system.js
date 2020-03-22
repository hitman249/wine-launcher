import Command    from "./command";
import FileSystem from "./file-system";
import Utils      from "./utils";
import Prefix     from "./prefix";

const { ipcRenderer } = require('electron');

export default class System {

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

    values = {
        /**
         * @type {string|null}
         */
        glibc: null,

        /**
         * @type {string|null}
         */
        cpu: null,

        /**
         * @type {string|null}
         */
        hostname: null,

        /**
         * @type {string|null}
         */
        desktopPath: null,

        /**
         * @type {string|null}
         */
        linux: null,

        /**
         * @type {number|null}
         */
        arch: null,

        /**
         * @type {string|null}
         */
        distr: null,

        /**
         * @type {string|null}
         */
        mesa: null,

        /**
         * @type {string|null}
         */
        xrandr: null,

        /**
         * @type {string|null}
         */
        xorg: null,

        /**
         * @type {boolean|null}
         */
        cyrillic: null,

        /**
         * @type {number|null}
         */
        ulimitHard: null,

        /**
         * @type {number|null}
         */
        ulimitSoft: null,

        /**
         * @type {number|null}
         */
        vmMaxMapCount: null,

        /**
         * @type {boolean|null}
         */
        tar: null,

        /**
         * @type {boolean|null}
         */
        xz: null,

        /**
         * @type {boolean|null}
         */
        lock: null,
    };

    /**
     * @type {{}}
     */
    commands = {};

    /**
     * @type {Function[]}
     */
    static shutdownFunctions = null;

    /**
     * @param {Prefix} prefix
     * @param {Command} command
     * @param {FileSystem} fs
     */
    constructor(prefix, command, fs) {
        this.prefix  = prefix;
        this.command = command;
        this.fs      = fs;

        if (null === System.shutdownFunctions) {
            this.createHandlerShutdownFunctions();
        }
    }

    /**
     * @returns {string}
     */
    getUserName() {
        let libWinePath = this.prefix.getWineLibFile();
        libWinePath     = this.fs.glob(`${libWinePath}*`)[0];

        if (libWinePath && Boolean(this.command.run(`grep -i "proton" ${Utils.quote(libWinePath)}`))) {
            return 'steamuser';
        }

        return this.command.run('id -u -n');
    }

    /**
     * @returns {string}
     */
    getHostname() {
        if (null !== this.values.hostname) {
            return this.values.hostname;
        }

        this.values.hostname = this.command.run('hostname');

        return this.values.hostname;
    }

    /**
     * @returns {string}
     */
    getDesktopPath() {
        if (null !== this.values.desktopPath) {
            return this.values.desktopPath;
        }

        if (this.command.run('command -v xdg-user-dir')) {
            this.values.desktopPath = this.command.run('xdg-user-dir DESKTOP');
        }

        return this.values.desktopPath || '';
    }

    /**
     * @returns {string|null}
     */
    getGlibcVersion() {
        if (null === this.values.glibc) {

            let isGetConf = Boolean(this.command.run('command -v getconf'));

            if (isGetConf) {
                let version = this.command.run('getconf GNU_LIBC_VERSION').split('\n').map(s => s.trim())[0];

                version = Utils.findVersion(version);

                if (version) {
                    this.values.glibc = version;
                }
            }

            if (!this.values.glibc) {
                let version = this.command.run('ldd --version').split('\n').map(s => s.trim())[0];

                version = Utils.findVersion(version);

                if (version) {
                    this.values.glibc = version;
                }
            }
        }

        return this.values.glibc;
    }

    /**
     * @returns {string}
     */
    getCPU() {
        if (null !== this.values.cpu) {
            return this.values.cpu;
        }

        let cpuInfo = this.command.run('cat /proc/cpuinfo').split('\n').filter((line) => {
            let [field, value] = line.split(':');

            if (field.includes('model name')) {
                return true;
            }
        })[0];

        let [field, value] = cpuInfo.split(':').map(s => s.trim());

        this.values.cpu = value;

        return this.values.cpu;
    }

    /**
     * @returns {string}
     */
    getLinuxVersion() {
        if (null !== this.values.linux) {
            return this.values.linux;
        }

        this.values.linux = this.command.run('uname -mrs');

        return this.values.linux;
    }

    /**
     * @returns {string}
     */
    getDistrName() {
        if (null !== this.values.distr) {
            return this.values.distr;
        }

        let name    = '';
        let version = '';

        this.command.run('cat /etc/*-release').split('\n').forEach((line) => {
            let [field, value] = line.split('=').map(s => s.trim());

            if ('' === name && 'DISTRIB_ID' === field) {
                name = value;
            } else if ('' === name && 'NAME' === field) {
                name = value;
            } else if ('' === version && 'DISTRIB_RELEASE' === field) {
                version = value;
            } else if ('' === version && 'VERSION' === field) {
                version = value;
            }
        });

        this.values.distr = `${name} ${version}`;

        return this.values.distr;
    }

    /**
     * @returns {string}
     */
    getMesaVersion() {
        if (null !== this.values.mesa) {
            return this.values.mesa;
        }

        let version = '';

        this.command.run('glxinfo | grep "Mesa"').split('\n').map(s => s.trim()).forEach((line) => {
            if (line.includes('OpenGL version string')) {
                let mesa = line.split('Mesa').map(s => s.trim());
                version  = Utils.findVersion(mesa[mesa.length - 1]);
            }
        });

        this.values.mesa = version;

        return this.values.mesa;
    }

    /**
     * @returns {string}
     */
    getXrandrVersion() {
        if (null !== this.values.xrandr) {
            return this.values.xrandr;
        }

        this.values.xrandr = Utils.findVersion(this.command.run("xrandr --version | grep 'xrandr'"));

        return this.values.xrandr;
    }

    /**
     * @returns {number}
     */
    getUlimitHard() {
        if (null !== this.values.ulimitHard) {
            return this.values.ulimitHard;
        }

        this.values.ulimitHard = parseInt(this.command.run('ulimit -Hn'), 10);

        return this.values.ulimitHard;
    }

    /**
     * @returns {number}
     */
    getUlimitSoft() {
        if (null !== this.values.ulimitSoft) {
            return this.values.ulimitSoft;
        }

        this.values.ulimitSoft = parseInt(this.command.run('ulimit -Sn'), 10);

        return this.values.ulimitSoft;
    }

    /**
     * @returns {boolean}
     */
    isCyrillic() {
        if (null !== this.values.cyrillic) {
            return this.values.cyrillic;
        }

        this.values.cyrillic = Boolean(this.command.run('locale | grep LANG=ru'));

        return this.values.cyrillic;
    }

    /**
     * @returns {boolean}
     */
    isTar() {
        if (null !== this.values.tar) {
            return this.values.tar;
        }

        this.values.tar = Boolean(this.command.run('command -v tar'));

        return this.values.tar;
    }

    /**
     * @returns {boolean}
     */
    isXz() {
        if (null !== this.values.xz) {
            return this.isTar() && this.values.xz;
        }

        this.values.xz = Boolean(this.command.run('command -v xz'));

        return this.isTar() && this.values.xz;
    }

    /**
     * @returns {number}
     */
    getArch() {
        if (null !== this.values.arch) {
            return this.values.arch;
        }

        if (this.command.run('command -v arch')) {
            if (this.command.run('arch') === 'x86_64') {
                this.values.arch = 64;
            } else {
                this.values.arch = 32;
            }

            return this.values.arch;
        }

        if (this.command.run('command -v getconf')) {
            if (this.command.run('getconf LONG_BIT') === '64') {
                this.values.arch = 64;
            } else {
                this.values.arch = 32;
            }
        }

        return this.values.arch;
    }

    /**
     * @returns {string}
     */
    getXorgVersion() {
        if (null !== this.values.xorg) {
            return this.values.xorg;
        }

        if (this.command.run('command -v xdpyinfo')) {
            this.values.xorg = Utils.findVersion(this.command.run('xdpyinfo | grep -i "X.Org version"'));

            if (this.values.xorg) {
                return this.values.xorg;
            }
        }

        let path = '/var/log/Xorg.0.log';

        if (this.fs.exists(path)) {
            this.values.xorg = Utils.findVersion(this.command.run(`cat "${path}" | grep "X.Org X Server"`));
        }

        return this.values.xorg;
    }

    /**
     * @returns {number}
     */
    getVmMaxMapCount() {
        if (null !== this.values.vmMaxMapCount) {
            return this.values.vmMaxMapCount;
        }

        if (this.command.run('command -v sysctl')) {
            let value = this.command.run('sysctl vm.max_map_count').split('=')[1].trim();

            this.values.vmMaxMapCount = parseInt(value, 10);
        }

        return this.values.vmMaxMapCount;
    }

    /**
     * @returns {{id: string, name: string, freq: string, mode: string}[]}
     */
    getCpuFreq() {
        let cpus   = this.command.run('cat /proc/cpuinfo').split('\n').map(s => s.trim());
        let result = [];

        let id   = null;
        let name = null;

        cpus.forEach((line) => {
            if (!line) {
                return;
            }

            let [field, value] = line.split(':').map(s => s.trim());

            if ('processor' === field) {
                id = value;
                return;
            }

            if ('model name' === field) {
                name = value;
                return;
            }

            if ('cpu MHz' === field) {
                let cpuPath = `/sys/devices/system/cpu/cpu${id}/cpufreq/scaling_governor`;

                result.push({
                    id,
                    name,
                    freq: value,
                    mode: this.fs.exists(cpuPath) ? this.command.run(`cat "${cpuPath}"`) : '',
                });
            }
        });

        return result;
    }

    /**
     * @returns {boolean}
     */
    lock() {
        if (null !== this.values.lock) {
            return this.values.lock;
        }

        let filepath = this.prefix.getRunPidFile();

        if (this.fs.exists(filepath)) {
            let pid = this.fs.fileGetContents(filepath).trim();
            if (pid && this.command.run(`ps -p ${pid} -o comm=`)) {
                this.values.lock = false;
            }
        }

        this.fs.filePutContents(filepath, window.process.pid);

        this.values.lock = true;

        return this.values.lock;
    }

    /**
     * @param {string} command
     * @return {boolean}
     */
    existsCommand(command) {
        if (undefined === this.commands[command]) {
            this.commands[command] = Boolean(this.command.run(`command -v "${command}"`));
        }

        return this.commands[command];
    }

    /**
     * @return {boolean|{busy: number, free: number, percent: number, full: number}}
     */
    getRam() {
        if (!this.existsCommand('free')) {
            return false;
        }

        let [full, busy] = this.command.run('free -m')
            .split('\n')[1]
            .split(' ')
            .filter(s => !s.includes(':') && s)
            .map(i => parseInt(i));

        return { full, busy, free: full - busy, percent: busy > 0 ? (busy / full * 100) : 0 };
    }

    createHandlerShutdownFunctions() {
        let processed            = false;
        System.shutdownFunctions = [];

        window.onbeforeunload = (e) => {
            if (!processed) {
                processed = true;
                Promise.all(System.shutdownFunctions.map(fn => fn())).then(() => {
                    ipcRenderer.send('app_quit');
                    window.onbeforeunload = null;
                });
            }

            e.returnValue = false;
        };
    }

    /**
     * @param {Function} fn
     */
    registerShutdownFunction(fn) {
        System.shutdownFunctions.push(fn);
    }
}