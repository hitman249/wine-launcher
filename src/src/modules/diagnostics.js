import _          from "lodash";
import Command    from "./command";
import System     from "./system";
import FileSystem from "./file-system";
import AppFolders from "./app-folders";

export default class Diagnostics {
  dependencies = {
    apps:  [
      {
        name:     'gamemode',
        packages: [ 'gamemode' ],
        find:     'gamemoderun',
        only64:   true,
      },
      {
        name:     'wine',
        packages: [ 'wine' ],
        find:     'wine',
      },
      {
        name:     'xrandr',
        packages: [ 'x11-xserver-utils' ],
        find:     'xrandr',
        only64:   true,
      },
      {
        name:     'pulseaudio',
        packages: [ 'pulseaudio' ],
        find:     'pulseaudio',
        only64:   true,
      },
      {
        name:     'free',
        packages: [ 'procps' ],
        find:     'free',
        only64:   true,
      },
      {
        name:     'glxinfo',
        packages: [ 'mesa-utils' ],
        find:     'glxinfo',
        only64:   true,
      },
      {
        name:     'grep',
        packages: [ 'grep' ],
        find:     'grep',
        only64:   true,
      },
      {
        name:     'tar',
        packages: [ 'tar' ],
        find:     'tar',
        only64:   true,
      },
      {
        name:     'ldconfig',
        packages: [ 'libc-bin' ],
        find:     'ldconfig',
        only64:   true,
      },
      {
        name:     'mksquashfs',
        packages: [ 'squashfs-tools' ],
        find:     'mksquashfs',
        only64:   true,
      },
      {
        name:     'ldd',
        packages: [ 'libc-bin' ],
        find:     'ldd',
        only64:   true,
      },
      {
        name:     'ps',
        packages: [ 'procps' ],
        find:     'ps',
        only64:   true,
      },
      {
        name:     'lspci',
        packages: [ 'pciutils' ],
        find:     'lspci',
        only64:   true,
      },
      {
        name:     'fusermount',
        packages: [ 'fuse' ],
        find:     'fusermount',
        only64:   true,
      },
      {
        name:     'mount',
        packages: [ 'mount' ],
        find:     'mount',
        only64:   true,
      },
      {
        name:     'tee',
        packages: [ 'coreutils' ],
        find:     'tee',
        only64:   true,
      },
      {
        name:     'sed',
        packages: [ 'sed' ],
        find:     'sed',
        only64:   true,
      },
      {
        name:     'xlsfonts',
        packages: [ 'x11-utils' ],
        find:     'xlsfonts',
        only64:   true,
      },
      {
        name:     'id',
        packages: [ 'coreutils' ],
        find:     'id',
        only64:   true,
      },
      {
        name:     'cabextract',
        packages: [ 'cabextract' ],
        find:     'cabextract',
        only64:   true,
      },
      {
        name:     'p7zip',
        packages: [ 'p7zip-full' ],
        find:     '7z',
        only64:   true,
      },
      {
        name:     'unrar',
        packages: [ 'unrar' ],
        find:     'unrar',
        only64:   true,
      },
      {
        name:     'unzip',
        packages: [ 'unzip' ],
        find:     'unzip',
        only64:   true,
      },
      {
        name:     'zip',
        packages: [ 'zip' ],
        find:     'zip',
        only64:   true,
      },
      {
        name:     'zstd',
        packages: [ 'zstd' ],
        find:     'zstd',
        only64:   true,
      },
      {
        name:     'binutils',
        packages: [ 'binutils' ],
        find:     'ld',
        only64:   true,
      },
      {
        name:     'objdump',
        packages: [ 'binutils' ],
        find:     'objdump',
        only64:   true,
      },
      {
        name:     'ffmpeg',
        packages: [ 'ffmpeg' ],
        find:     'ffmpeg',
        only64:   true,
      },
      {
        name:     'xz',
        packages: [ 'xz-utils' ],
        find:     'xz',
        only64:   true,
      },
      {
        name:     'diff',
        packages: [ 'diffutils' ],
        find:     'diff',
        only64:   true,
      },
      {
        name:     'patch',
        packages: [ 'patch' ],
        find:     'patch',
        only64:   true,
      },
      {
        name:     'hostname',
        packages: [ 'hostname' ],
        find:     'hostname',
        only64:   true,
      },
      {
        name:     'locale',
        packages: [ 'libc-bin' ],
        find:     'locale',
        only64:   true,
      },
      {
        name:     'modinfo',
        packages: [ 'kmod' ],
        find:     'modinfo',
        only64:   true,
      },
      {
        name:     'lsmod',
        packages: [ 'kmod' ],
        find:     'lsmod',
        only64:   true,
      },
      {
        name:     'winbind',
        packages: [ 'winbind' ],
        find:     'winbindd',
        only64:   true,
      },
      {
        name:     'fc-list',
        packages: [ 'fontconfig' ],
        find:     'fc-list',
        only64:   true,
      },
      {
        name:     'icotool',
        packages: [ 'icoutils' ],
        find:     'icotool',
        only64:   true,
      },
      {
        name:     'wrestool',
        packages: [ 'icoutils' ],
        find:     'wrestool',
        only64:   true,
      },
      {
        name:     'aconnect',
        packages: [ 'alsa-utils' ],
        find:     'aconnect',
        only64:   true,
      },
    ],
    libs:  [
      {
        name:     'libvulkan1',
        packages: [ 'libvulkan1' ],
        find:     'libvulkan.so.1',
      },
      {
        name:     'libfuse2',
        packages: [ 'libfuse2' ],
        find:     'libfuse.so.2',
      },
      {
        name:     'libopenal1',
        packages: [ 'libopenal' ],
        find:     'libopenal.so.1',
      },
      {
        name:     'libxinerama1',
        packages: [ 'libxinerama1' ],
        find:     'libXinerama.so.1',
      },
      {
        name:     'libsdl2',
        packages: [ 'libsdl2-2.0-0' ],
        find:     'libSDL2-2.0.so.0',
      },
      {
        name:     'libudev1',
        packages: [ 'libudev1' ],
        find:     'libudev.so.1',
      },
      {
        name:     'libasound2',
        packages: [ 'libasound2' ],
        find:     'libasound.so.2',
      },
      {
        name:     'libsm6',
        packages: [ 'libsm6' ],
        find:     'libSM.so.6',
      },
      {
        name:     'libgl1',
        packages: [ 'libgl1' ],
        find:     'libGL.so.1',
      },
      {
        name:     'libgif7',
        packages: [ 'libgif7' ],
        find:     'libgif.so.7',
      },
      {
        name:     'libncurses5',
        packages: [ 'libncurses5' ],
        find:     'libncurses.so.5',
      },
      {
        name:     'libncursesw5',
        packages: [ 'libncursesw5' ],
        find:     'libncursesw.so.5',
      },
      {
        name:     'libncurses6',
        packages: [ 'libncurses6' ],
        find:     'libncurses.so.6',
      },
      {
        name:     'libncursesw6',
        packages: [ 'libncursesw6' ],
        find:     'libncursesw.so.6',
      },
      {
        name:     'libfreetype6',
        packages: [ 'libfreetype' ],
        find:     'libfreetype.so.6',
      },
      {
        name:     'libfontconfig1',
        packages: [ 'libfontconfig1' ],
        find:     'libfontconfig.so.1',
      },
      {
        name:     'libmpg123',
        packages: [ 'libmpg123-0' ],
        find:     'libmpg123.so.0',
      },
      {
        name:     'libxcomposite1',
        packages: [ 'libxcomposite1' ],
        find:     'libXcomposite.so.1',
      },
      {
        name:     'libgnutls30',
        packages: [ 'libgnutls30' ],
        find:     'libgnutls.so.30',
      },
      {
        name:     'libjpeg62',
        packages: [ 'libjpeg62' ],
        find:     'libjpeg.so.62',
      },
      {
        name:     'libjpeg8',
        packages: [ 'libjpeg8' ],
        find:     'libjpeg.so.8',
      },
      {
        name:     'libxslt1.1',
        packages: [ 'libxslt1.1' ],
        find:     'libxslt.so.1',
      },
      {
        name:     'libxrandr2',
        packages: [ 'libxrandr2' ],
        find:     'libXrandr.so.2',
      },
      {
        name:     'libpng16',
        packages: [ 'libpng16-16' ],
        find:     'libpng16.so.16',
      },
      {
        name:     'libpng12',
        packages: [ 'libpng12-0' ],
        find:     'libpng12.so',
      },
      {
        name:     'libtiff5',
        packages: [ 'libtiff5' ],
        find:     'libtiff.so.5',
      },
      {
        name:     'libxcb1',
        packages: [ 'libxcb1' ],
        find:     'libxcb.so.1',
      },
      {
        name:     'libtheora',
        packages: [ 'libtheora0' ],
        find:     'libtheora.so.0',
      },
      {
        name:     'libvorbis0a',
        packages: [ 'libvorbis0a' ],
        find:     'libvorbis.so.0',
      },
      {
        name:     'samba-libs',
        packages: [ 'samba-libs' ],
        find:     'libnetapi.so.0',
      },
      {
        name:     'libsane1',
        packages: [ 'libsane1' ],
        find:     'libsane.so.1',
      },
      {
        name:     'libcapi20-3',
        packages: [ 'libcapi20-3' ],
        find:     'libcapi20.so.3',
      },
      {
        name:     'libcups2',
        packages: [ 'libcups2' ],
        find:     'libcups.so.2',
      },
      {
        name:     'libgsm1',
        packages: [ 'libgsm1' ],
        find:     'libgsm.so.1',
      },
      {
        name:     'libodbc1',
        packages: [ 'libodbc1' ],
        find:     'libodbc.so.2',
      },
      {
        name:     'libosmesa6',
        packages: [ 'libosmesa6' ],
        find:     'libOSMesa.so.8',
      },
      {
        name:     'libpcap0.8',
        packages: [ 'libpcap0.8' ],
        find:     'libpcap.so.0.8',
      },
      {
        name:     'libv4l',
        packages: [ 'libv4l-0' ],
        find:     'libv4l1.so.0',
      },
      {
        name:     'libdbus-1-3',
        packages: [ 'libdbus-1-3' ],
        find:     'libdbus-1.so.3',
      },
      {
        name:     'libglib2',
        packages: [ 'libglib2.0-0' ],
        find:     'libgobject-2.0.so.0',
      },
      {
        name:     'libgtk-3',
        packages: [ 'libgtk-3-0' ],
        find:     'libgtk-3.so.0',
      },
      {
        name:     'libFAudio',
        packages: [ 'libfaudio0' ],
        find:     'libFAudio.so.0',
      },
      {
        name:     'libvkd3d',
        packages: [ 'libvkd3d1', 'libvkd3d-utils1' ],
        find:     'libvkd3d.so.1',
      },
      {
        name:     'libgstreamer1.0',
        packages: [ 'gstreamer1.0-plugins-base', 'gstreamer1.0-plugins-good', 'libgstreamer1.0-0' ],
        find:     'libgstreamer-1.0.so.0',
      },
    ],
    fonts: [
      {
        name:     'fonts-unfonts-extra',
        packages: [ 'fonts-unfonts-extra' ],
        find:     'UnJamoBatang.ttf',
      },
      {
        name:     'fonts-unfonts-core',
        packages: [ 'fonts-unfonts-core' ],
        find:     'UnBatang.ttf',
      },
      {
        name:     'fonts-wqy-microhei',
        packages: [ 'fonts-wqy-microhei', 'ttf-wqy-microhei' ],
        find:     'wqy-microhei.ttc',
      },
      {
        name:     'fonts-horai-umefont',
        packages: [ 'fonts-horai-umefont' ],
        find:     'horai-umefont',
      },
      {
        name:     'ttf-mscorefonts',
        packages: [ 'ttf-mscorefonts-installer' ],
        find:     'Georgia.ttf',
      },
    ],
  };

  /**
   * @type {AppFolders}
   */
  appFolders = null;

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
   * @param {AppFolders} appFolders
   * @param {Command} command
   * @param {System} system
   * @param {FileSystem} fs
   */
  constructor(appFolders, command, system, fs) {
    this.appFolders = appFolders;
    this.command    = command;
    this.system     = system;
    this.fs         = fs;
  }

  /**
   * @param {string} type
   * @param {Function} callable
   */
  each(type = 'apps', callable = () => {
  }) {
    if ('apps' === type) {
      this.dependencies.apps.forEach((value) => {
        let result    = _.cloneDeep(value);
        result.status = this.system.existsCommand(result.find);
        result.type   = 'app';

        if (callable) {
          callable(result);
        }
      });
    }
    if ('fonts' === type && this.system.existsCommand('fc-list')) {
      this.dependencies.fonts.forEach((value) => {
        let result    = _.cloneDeep(value);
        result.status = Boolean(this.command.exec(`fc-list | grep '${result.find}'`));
        result.type   = 'font';

        if (callable) {
          callable(result);
        }
      });
    }
    if ('libs' === type && this.system.existsCommand('ldconfig')) {
      this.dependencies.libs.forEach((value) => {
        let result   = _.cloneDeep(value);
        result.type  = 'lib';
        result.win64 = null;
        result.win32 = null;

        let finds = this.command.exec(`ldconfig -p | grep '${result.find}'`)
          .split('\n').map(s => s.trim()).filter(s => s);

        this.fs.glob(this.appFolders.getLibsDir() + `/${result.find}*`).forEach(lib => {
          finds.push(`${this.fs.basename(lib)} (libc6) => ${lib}`);
        });
        this.fs.glob(this.appFolders.getLibs64Dir() + `/${result.find}*`).forEach(lib => {
          finds.push(`${this.fs.basename(lib)} (libc6,x86-64) => ${lib}`);
        });

        finds.forEach((find) => {
          let [ arch, path ] = find.split('=>').map(s => s.trim());
          let filename       = this.fs.basename(path);
          arch               = arch.includes('x86-64') ? 'win64' : 'win32';

          if (null === result[arch]) {
            result[arch] = { filename, path };
          } else if (path.length > result[arch].path) {
            result[arch] = { filename, path };
          }
        });

        result.arch = this.system.getArch();

        if (64 === result.arch) {
          result.status = Boolean(result.win64) && Boolean(result.win32);
        } else {
          result.status = Boolean(result.win32);
        }

        if (callable) {
          callable(result);
        }
      });
    }
  }
}