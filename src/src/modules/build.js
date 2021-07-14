import _          from "lodash";
import Utils      from "./utils";
import FileSystem from "./file-system";
import Prefix     from "./prefix";
import Command    from "./command";
import AppFolders from "./app-folders";

export default class Build {

  /**
   * @type {AppFolders}
   */
  appFolders = null;

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
   * @param {AppFolders} appFolders
   * @param {Prefix} prefix
   * @param {Command} command
   * @param {FileSystem} fs
   * @param {System} system
   */
  constructor(appFolders, prefix, command, fs, system) {
    this.appFolders = appFolders;
    this.prefix     = prefix;
    this.command    = command;
    this.fs         = fs;
    this.system     = system;
  }

  build() {
    let root             = this.appFolders.getRootDir();
    let build            = this.appFolders.getBuildDir() + '/' + this.fs.basename(root);
    let gamesSquashfs    = this.appFolders.getGamesFile();
    let wineSquashfs     = this.appFolders.getWineFile();
    let games            = this.appFolders.getGamesDir();
    let wine             = this.appFolders.getWineDir();
    let bin              = this.appFolders.getBinDir();
    let configs          = this.appFolders.getConfigsDir();
    let patches          = this.appFolders.getPatchesDir();
    let replaces         = this.prefix.getConfigReplaces();
    let savesSymlinks    = this.appFolders.getSavesSymlinksDir();
    let savesFoldersFile = this.appFolders.getSavesFoldersFile();
    let staticDir        = `${build}/static`;

    const copyToStatic = (path) => {
      return this.fs.cpHardLink(path, staticDir + '/' + this.fs.relativePath(path, root));
    };

    if (this.fs.exists(build)) {
      this.fs.rm(build);
    }

    this.fs.mkdir(`${build}/data`);

    if (this.fs.exists(gamesSquashfs)) {
      this.fs.cpHardLink(gamesSquashfs, build + '/' + this.fs.relativePath(gamesSquashfs, root));
    } else if (this.fs.exists(games)) {
      this.fs.cpHardLink(games, build + '/' + this.fs.relativePath(games, root));
    }

    this.fs.mkdir(`${staticDir}/data/cache`);
    this.fs.mkdir(`${staticDir}/data/logs`);
    this.fs.mkdir(`${staticDir}/data/saves`);

    if (this.fs.exists(wineSquashfs)) {
      copyToStatic(wineSquashfs);
    } else if (this.fs.exists(wine)) {
      copyToStatic(wine);
    }

    if (this.fs.exists(bin)) {
      copyToStatic(bin);

      let binPath    = staticDir + '/' + this.fs.relativePath(bin, root);
      let winetricks = this.fs.basename(this.appFolders.getWinetricksFile());

      if (this.fs.exists(`${binPath}/${winetricks}`)) {
        this.fs.rm(`${binPath}/${winetricks}`);
      }
    }

    if (this.fs.exists(configs)) {
      copyToStatic(configs);

      this.fs.glob(staticDir + '/' + this.fs.relativePath(configs, root) + '/*.json').forEach(path => {
        if ('prefix.json' === this.fs.basename(path)) {
          let config = Utils.jsonDecode(this.fs.fileGetContents(path));
          this.fs.rm(path);
          delete config.app.language;
          this.fs.filePutContents(path, Utils.jsonEncode(config));
          return;
        }

        if (this.fs.exists(path)) {
          let config = Utils.jsonDecode(this.fs.fileGetContents(path));
          this.fs.rm(path);
          config = _.set(config, 'app.time', 0);
          this.fs.filePutContents(path, Utils.jsonEncode(config));
        }
      });
    }

    if (this.fs.exists(patches)) {
      copyToStatic(patches);
    }

    if (this.fs.exists(savesSymlinks)) {
      copyToStatic(savesSymlinks);
    }

    if (this.fs.exists(savesFoldersFile)) {
      copyToStatic(savesFoldersFile);
    }

    if (replaces.length > 0) {
      replaces.forEach((replace) => {
        replace    = this.fs.relativePath(replace, root);
        let backup = '.backup';

        let pathIn       = `${root}/${replace}`;
        let pathInBackup = `${root}/${replace}${backup}`;

        let pathOut       = `${staticDir}/${replace}`;
        let pathOutBackup = `${staticDir}/${replace}${backup}`;

        if (this.fs.exists(pathOut)) {
          this.fs.rm(pathOut);
        }
        if (this.fs.exists(pathOutBackup)) {
          this.fs.rm(pathOutBackup);
        }
        if (this.fs.exists(pathInBackup)) {
          this.fs.cp(pathInBackup, pathOut);
        } else if (this.fs.exists(pathIn)) {
          this.fs.cp(pathIn, pathOut);
        }
      });
    }

    // eslint-disable-next-line
    this.command.exec(`\\tar -czf \"${build}/static.tar.gz\" -C \"${build}/static\" .`);
    this.fs.rm(staticDir);

    let extractFile = `#!/bin/sh

cd -P -- "$(dirname -- "$0")"
tar -xvf ./static.tar.gz
chmod +x -R ./bin`;

    this.fs.filePutContents(`${build}/extract.sh`, extractFile);
    this.fs.chmod(`${build}/extract.sh`);
  }
}