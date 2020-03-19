import _          from "lodash";
import Prefix     from "./prefix";
import FileSystem from "./file-system";
import Network    from "./network";
import Utils      from "./utils";

export default class PlayOnLinux {
    /**
     * @type {string}
     */
    url = 'https://lutris.net/api/runners?format=json&search=wine';

    data = null;

    /**
     * @type {Prefix}
     */
    prefix = null;

    /**
     * @type {FileSystem}
     */
    fs = null;

    /**
     * @type {Network}
     */
    network = null;

    /**
     * @param {Prefix} prefix
     * @param {FileSystem} fs
     * @param {Network} network
     */
    constructor(prefix, fs, network) {
        this.prefix  = prefix;
        this.fs      = fs;
        this.network = network;
    }

    /**
     * @return {{name: string, type: string, nested: (function(): Promise)}}
     */
    getElement() {
        return {
            name:   'PlayOnLinux',
            type:   'dir',
            nested: [
                {
                    name:   'stable-x86',
                    type:   'dir',
                    nested: () => this.getList(
                        'https://www.playonlinux.com/wine/binaries/linux-x86.lst',
                        'https://www.playonlinux.com/wine/binaries/linux-x86/'
                    ),
                },
                {
                    name:   'stable-x86_64',
                    type:   'dir',
                    nested: () => this.getList(
                        'https://www.playonlinux.com/wine/binaries/linux-amd64.lst',
                        'https://www.playonlinux.com/wine/binaries/linux-amd64/'
                    ),
                },
                {
                    name:   'staging-x86',
                    type:   'dir',
                    nested: () => this.getList('https://www.playonlinux.com/wine/binaries/phoenicis/staging-linux-x86/'),
                },
                {
                    name:   'staging-x86_64',
                    type:   'dir',
                    nested: () => this.getList('https://www.playonlinux.com/wine/binaries/phoenicis/staging-linux-amd64/'),
                },
                {
                    name:   'upstream-x86',
                    type:   'dir',
                    nested: () => this.getList('https://www.playonlinux.com/wine/binaries/phoenicis/upstream-linux-x86/'),
                },
                {
                    name:   'upstream-x86_64',
                    type:   'dir',
                    nested: () => this.getList('https://www.playonlinux.com/wine/binaries/phoenicis/upstream-linux-amd64/'),
                },
            ],
        };
    }

    /**
     * @return {Promise}
     */
    getList(url, prefix = null) {
        let links = [];

        return this.network.get(url).then((html) => {
            if (null === prefix) {
                links = html.match(/<a href=["'](.*?)["']/g)
                    .map(a => _.trim(a.replace('<a href=', ''), '\'"'))
                    .filter(a => _.startsWith(a, 'PlayOnLinux') && (_.endsWith(a, '.tar.gz') || _.endsWith(a, '.pol')));

                links = Utils.natsort(links, true).map(file => ({
                    name:     file,
                    type:     'file',
                    download: () => this.download(`${url}${file}`),
                }));
            } else {
                links = html.trim().split('\n').reverse().map(line => ({
                    name:     line.split(';')[0],
                    type:     'file',
                    download: () => this.download(`${prefix}${line.split(';')[0]}`),
                }));
            }

            let replaces = ['PlayOnLinux-wine-', '-linux-x86.tar.gz', '-linux-amd64.tar.gz', '-linux-x86.pol', '-linux-amd64.pol'];

            return links.map(item => {
                replaces.forEach(s => {
                    item.name = item.name.replace(s, '');
                });

                return item;
            });
        });
    }

    /**
     * @param {string} url
     */
    download(url) {
        let cacheDir = this.prefix.getCacheDir();
        let filename = this.fs.basename(url);

        return this.network.download(url, `${cacheDir}/${filename}`).then(() => filename);
    }
}