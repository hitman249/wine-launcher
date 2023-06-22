import _            from "lodash";
import AbstractWine from "./abstract-wine";
import WineCommand  from "../wine-command";
import Utils        from "../utils";
import Prefix       from "../prefix";
import api          from "../../api";
import action       from "../../store/action";

export default class Wine extends AbstractWine {
  /**
   * @type {string|null}
   */
  version = null;

  /**
   * @type {string[]|null}
   */
  missingLibs = null;

  /**
   * @param {Arguments} arguments
   */
  boot() {
    let cmd = Array.prototype.slice.call(arguments).join(' ');

    if (cmd) {
      cmd = '&& ' + cmd;
    }

    let wineBootPath   = Utils.quote(this.getWineBoot());
    let wineServerPath = Utils.quote(this.getWineServer());

    if (!this.fs.exists(this.getPrefix())) {
      this.fs.mkdir(this.getPrefix());
    }

    this.command.run(`${wineBootPath} && ${wineServerPath} -w ${cmd}`);
  }

  /**
   * @param {Arguments} arguments
   */
  down() {
    let cmd = Array.prototype.slice.call(arguments).join(' ');

    if (cmd) {
      cmd = '&& ' + cmd;
    }

    let wineServerPath = Utils.quote(this.getWineServer());

    this.command.run(`${wineServerPath} -k ${cmd}`);
  }

  /**
   * @return {Wine}
   */
  kill() {
    let wineServerPath = Utils.quote(this.getWineServer());
    this.command.run(`${wineServerPath} -k`);
    return this;
  }

  /**
   * @param {Arguments} arguments
   * @returns {string}
   */
  runAll() {
    let cmd        = Utils.quote(arguments);
    let winePath   = Utils.quote(this.getWineBin());
    let wine64Path = Utils.quote(this.getWine64Bin());
    let result     = '';

    result = this.command.run(`${winePath} ${cmd}`);

    if (this.getWineArch() === 'win64' && this.isWine64BinExist()) {
      result += '\n' + this.command.run(`${wine64Path} ${cmd}`);
    }

    return result;
  }

  /**
   * @param {Arguments} arguments
   * @returns {string}
   */
  run() {
    let cmd      = Utils.quote(arguments);
    let winePath = Utils.quote(this.getWineBin());

    return this.command.run(`${winePath} ${cmd}`);
  }

  /**
   * @param {string} path
   * @param {Function} spawnObject
   * @param {string} args
   * @return {Promise}
   */
  runFile(path, args = '', spawnObject = () => null) {
    let wine = _.cloneDeep(this);
    wine.setWineDebug('');

    let filename = this.fs.basename(path);
    let logFile  = `${this.appFolders.getLogsDir()}/${filename}.log`;
    let postfix  = 'start /unix ';

    if (_.endsWith(filename, '.msi')) {
      postfix = 'msiexec /i ';
    }

    if (_.endsWith(filename, '.bat')) {
      postfix = 'cmd /c ';
    }

    if (this.fs.exists(logFile)) {
      this.fs.rm(logFile);
    }

    let winePath = Utils.quote(this.getWineBin());
    let cmd      = Utils.quote(path);

    api.commit(action.get('logs').CLEAR);

    let runner;

    if (Utils.isMsDos(path)) {
      runner = window.app.getDosbox().runFile(path.replace(wine.getDriveC(), ''), args);
    } else {
      runner = Promise.resolve(`${winePath} ${postfix}${cmd} ${args}`);
    }

    return runner.then((cmd) => window.app.createWineCommand(wine).watch(cmd, (output) => {
      api.commit(action.get('logs').APPEND, output);
      this.fs.filePutContents(logFile, output, this.fs.FILE_APPEND);
    }, spawnObject, false, true));
  }

  fm(spawnObject = () => null) {
    let wine = _.cloneDeep(this);
    wine.setWineDebug('');

    let logFile             = this.appFolders.getLogFileManager();
    let wineFileManagerPath = Utils.quote(this.getFileManager());

    if (this.fs.exists(logFile)) {
      this.fs.rm(logFile);
    }

    api.commit(action.get('logs').CLEAR);

    return window.app.createWineCommand(wine).watch(wineFileManagerPath, (output) => {
      api.commit(action.get('logs').APPEND, output);
      this.fs.filePutContents(logFile, output, this.fs.FILE_APPEND);
    }, spawnObject, false, true);
  }

  cfg() {
    let wine = _.cloneDeep(this);
    wine.setWineDebug('');

    let logFile     = this.appFolders.getLogFileConfig();
    let wineCfgPath = Utils.quote(this.getWineCfg());

    if (this.fs.exists(logFile)) {
      this.fs.rm(logFile);
    }

    api.commit(action.get('logs').CLEAR);

    return window.app.createWineCommand(wine).watch(wineCfgPath, (output) => {
      api.commit(action.get('logs').APPEND, output);
      this.fs.filePutContents(logFile, output, this.fs.FILE_APPEND);
    });
  }

  /**
   * @param {Arguments} arguments
   * @returns {string}
   */
  reg() {
    let cmd       = Utils.quote(arguments);
    let regedit   = Utils.quote(this.getRegedit());
    let regedit64 = Utils.quote(this.getRegedit64());
    let result    = '';

    result = this.command.run(`${regedit} ${cmd}`);

    if (this.getWineArch() === 'win64' && this.isWine64BinExist()) {
      result += '\n' + this.command.run(`${regedit64} ${cmd}`);
    }

    return result;
  }

  /**
   * @param {Arguments} arguments
   * @returns {string}
   */
  regOnly() {
    let cmd       = Utils.quote(arguments);
    let regedit   = Utils.quote(this.getRegedit());
    let regedit64 = Utils.quote(this.getRegedit64());
    let result    = '';

    if (this.getWineArch() === 'win64' && this.isWine64BinExist()) {
      result += '\n' + this.command.run(`${regedit64} ${cmd}`);
    } else {
      result = this.command.run(`${regedit} ${cmd}`);
    }

    return result;
  }

  /**
   * @param {Arguments} arguments
   * @returns {string}
   */
  regsvr32() {
    let cmd      = Utils.quote(arguments);
    let regsvr32 = Utils.quote(this.getRegsvr32());
    let regsvr64 = Utils.quote(this.getRegsvr64());
    let result   = [];

    api.commit(action.get('logs').CLEAR);

    result.push(this.command.runOfBuffer(`${regsvr32} ${cmd}`));

    if (this.getWineArch() === 'win64' && this.isWine64BinExist()) {
      result.push(this.command.runOfBuffer(`${regsvr64} ${cmd}`));
    }

    result = result.map(b => Utils.encode(Utils.decode(b, 'cp866'))).join('\n');

    api.commit(action.get('logs').APPEND, result);

    return result;
  }

  /**
   * @returns {boolean}
   */
  checkSystemWine() {
    return Boolean(this.command.exec('command -v "wine"'));
  }

  /**
   * @returns {boolean}
   */
  checkWine() {
    let winePath = Utils.quote(this.getWineBin());
    return Boolean(this.command.exec(`command -v ${winePath}`));
  }

  /**
   * @returns {string}
   */
  getVersion() {
    if (null === this.version) {
      this.version = this.run('--version');
    }

    return this.version;
  }

  /**
   * @returns {string[]}
   */
  getMissingLibs() {
    if (null === this.missingLibs) {
      let help = this.run('--help');

      if (!help.includes('--check-libs')) {
        this.missingLibs = [];
        return this.missingLibs;
      }

      let missingLibs = [];

      this.run('--check-libs').split('\n').map(s => s.trim()).forEach((line) => {
        if (!line) {
          return false;
        }

        let [ filename, filepath ] = line.split(':').map(s => _.trim(s, ' \t\n\r\0\x0B.'));

        if (false === filepath.includes('.')) {
          missingLibs.push(filename);
        }
      });

      this.missingLibs = missingLibs;
    }

    return this.missingLibs;
  }

  /**
   * @param {Arguments} arguments
   * @return {Promise}
   */
  winetricks() {
    let title = Array.prototype.slice.call(arguments).join('-');
    let cmd   = Utils.quote(arguments);
    let path  = this.appFolders.getWinetricksFile();

    if (title.length > 50) {
      title = title.substr(0, 48) + '..';
    }

    return this.update.downloadWinetricks()
      .then(() => this.fs.exists(path) ? null : Promise.reject())
      .then(() => {
        if (Boolean(this.command.exec('command -v "cabextract"'))) {
          return;
        }

        return this.update.downloadCabextract();
      })
      .then(() => {
        api.commit(action.get('logs').CLEAR);

        let winetricksLog = this.getWinePrefix() + '/winetricks.log';
        let logFile       = this.appFolders.getLogsDir() + `/winetricks-${title}.log`;

        let wine = window.app.getKernel().clone();
        wine.setWineDebug('');
        let command = window.app.createWineCommand(wine);

        if (this.fs.exists(winetricksLog)) {
          this.fs.rm(winetricksLog);
        }
        if (this.fs.exists(logFile)) {
          this.fs.rm(logFile);
        }

        return command.watch(`"${path}" ${cmd}`, (output) => {
          api.commit(action.get('logs').APPEND, output);
          this.fs.filePutContents(logFile, output, this.fs.FILE_APPEND);
        }, () => null, false, true).then(() => logFile);
      });
  }

  /**
   * @return {Promise<String[]>}
   */
  winetricksAllList() {
    const skip = [
      // apps
      '3m_library',
      '7zip',
      'abiword',
      'adobe_diged',
      'adobe_diged4',
      'autohotkey',
      'busybox',
      'cmake',
      'colorprofile',
      'controlspy',
      'dotnet20sdk',
      'dxsdk_jun2010',
      'dxsdk_nov2006',
      'emu8086',
      'ev3',
      'firefox',
      'fontxplorer',
      'foobar2000',
      'iceweasel',
      'irfanview',
      'kindle',
      'kobo',
      'mingw',
      'mozillabuild',
      'mpc',
      'mspaint',
      'mt4',
      'njcwp_trial',
      'njjwp_trial',
      'nook',
      'npp',
      'office2003pro',
      'office2007pro',
      'office2013pro',
      'ollydbg110',
      'ollydbg200',
      'ollydbg201',
      'openwatcom',
      'protectionid',
      'psdk2003',
      'psdkwin7',
      'psdkwin71',
      'qq',
      'qqintl',
      'safari',
      'sketchup',
      'steam',
      'uplay',
      'utorrent',
      'utorrent3',
      'vc2005express',
      'vc2005expresssp1',
      'vc2005trial',
      'vc2008express',
      'vc2010express',
      'vlc',
      'vulkansdk',
      'winamp',

      // benchmarks
      '3dmark03',
      '3dmark05',
      '3dmark06',
      '3dmark2000',
      '3dmark2001',
      'stalker_pripyat_bench',
      'unigine_heaven',
      'wglgears',

      // dlls
      'd9vk',
      'd9vk010',
      'd9vk011',
      'd9vk012',
      'd9vk013',
      'd9vk013f',
      'd9vk020',
      'd9vk021',
      'd9vk022',
      'd9vk030',
      'd9vk040',
      'python26',
      'python27',

      // games
      'acreedbro',
      'algodoo_demo',
      'alienswarm_steam',
      'amnesia_tdd_demo',
      'aoe3_demo',
      'avatar_demo',
      'bfbc2',
      'bioshock2',
      'bioshock2_steam',
      'bioshock_demo',
      'blobby_volley',
      'borderlands_steam',
      'bttf101',
      'cim_demo',
      'civ4_demo',
      'civ5_demo_steam',
      'cnc3_demo',
      'cnc_redalert3_demo',
      'cod1',
      'cod4mw_demo',
      'cod5_waw',
      'cod_demo',
      'crayonphysics_demo',
      'crysis2',
      'csi6_demo',
      'darknesswithin2_demo',
      'darkspore',
      'dcuo',
      'deadspace',
      'deadspace2',
      'demolition_company_demo',
      'deusex2_demo',
      'diablo2',
      'digitanks_demo',
      'dirt2_demo',
      'dragonage',
      'dragonage2_demo',
      'dragonage_ue',
      'eve',
      'fable_tlc',
      'fifa11_demo',
      'gta_vc',
      'hon',
      'hordesoforcs2_demo',
      'kotor1',
      'lemonysnicket',
      'lhp_demo',
      'losthorizon_demo',
      'lswcs',
      'luxor_ar',
      'masseffect2',
      'masseffect2_demo',
      'maxmagicmarker_demo',
      'mdk',
      'menofwar',
      'mfsx_demo',
      'mfsxde',
      'myth2_demo',
      'nfsshift_demo',
      'oblivion',
      'penpenxmas',
      'popfs',
      'rct3deluxe',
      'riseofnations_demo',
      'ruse_demo_steam',
      'sammax301_demo',
      'sammax304_demo',
      'secondlife',
      'sims3',
      'sims3_gen',
      'simsmed',
      'singularity',
      'splitsecond',
      'spore',
      'spore_cc_demo',
      'starcraft2_demo',
      'supermeatboy_steam',
      'theundergarden_demo',
      'tmnationsforever',
      'torchlight',
      'trainztcc_2004',
      'trine_demo_steam',
      'trine_steam',
      'tropico3_demo',
      'twfc',
      'typingofthedead_demo',
      'ut3',
      'wog',
      'wormsreloaded_demo_steam',

      // prefix
      'apps',
      'benchmarks',
      'dlls',
      'fonts',
      'games',
      'settings',
    ];

    let file = this.appFolders.getWinetricksFile();

    return this.update.downloadWinetricks()
      .then(() => this.fs.exists(file) ? null : Promise.reject())
      .then(() => {
        const find = () => [ ...this.fs.fileGetContents(file).matchAll(/^w_metadata (.+?) (.+?) \\\n.*title="(.+?)" \\/gm) ]
          .filter(n => !skip.includes(n[1].trim()) && !/^dxvk[0-9]{1,}/gm.test(n[1].trim()) && !/^galliumnine[0-9]{1,}/gm.test(n[1].trim()))
          .map(n => ({ name: n[1].trim(), description: n[3].trim() }));

        if (!this.fs.exists(file)) {
          return Promise.resolve(find());
        }

        return Promise.resolve(find());
      });
  }

  clear() {
    this.version     = null;
    this.missingLibs = null;
    this.loadWineEnv();
  }

  /**
   * @return {string[]}
   */
  processList() {
    let process = {};

    this.command.exec(`ls -l /proc/*/exe 2>/dev/null | grep -E 'wine(64)?-preloader|wineserver'`)
      .split('\n')
      .forEach(s => {
        if (!s) {
          return;
        }

        let pid      = s.split('/proc/')[1].split('/')[0];
        let cmd      = this.command.exec(`cat /proc/${pid}/cmdline`);
        let gamesDir = _.trim(`C:${this.prefix.getGamesFolder().split('/').join('\\')}`, '\\/');

        if (_.startsWith(cmd, gamesDir) || (!_.startsWith(cmd, '/') && !_.startsWith(cmd, 'C:\\windows\\system32'))) {
          process[pid] = this.command.exec(`cat /proc/${pid}/cmdline`);
        }
      });

    return process;
  }

  /**
   * @return {string}
   */
  getUserName() {
    if (!this.isUsedSystemWine()) {
      return window.app.getCache().remember('wine.username', () => {
        let libs = this.getWineLibDirs();

        for (let path of libs) {
          for (let name of ['libwine.so', 'winex11.drv.so']) {
            for (let file of this.fs.glob(`${path}/${name}*`)) {
              if (this.fs.isFile(file) && !this.fs.isSymbolicLink(file) && Boolean(this.command.exec(`grep -i "proton" ${Utils.quote(file)}`))) {
                return 'steamuser';
              }
            }
          }
        }

        return this.system.getUserName();
      });
    }

    return this.system.getUserName();
  }

  /**
   * @return {boolean}
   */
  isProton() {
    return 'steamuser' === this.getUserName();
  }

  /**
   * @return {boolean}
   */
  isAmdFsr() {
    if (!this.isUsedSystemWine()) {
      return window.app.getCache().remember('wine.is_amd_fsr', () => {
        let libs = this.getWineLibDirs();

        for (let path of libs) {
          for (let name of ['winex11.drv.so']) {
            for (let file of this.fs.glob(`${path}/${name}*`)) {
              if (this.fs.isFile(file) && !this.fs.isSymbolicLink(file) && Boolean(this.command.exec(`grep -a -i "WINE_FULLSCREEN_FSR" ${Utils.quote(file)}`))) {
                return true;
              }
            }
          }
        }

        return false;
      });
    }

    return false;
  }
}