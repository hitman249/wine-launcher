import _          from "lodash";
import Command    from "./command";
import Utils      from "./utils";
import FileSystem from "./file-system";
import Update     from "./update";
import Prefix     from "./prefix";
import api        from "../api";
import action     from "../store/action";
import utils      from "./utils";

export default class Wine {
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
   * @type {Update}
   */
  update = null;

  /**
   * @type {string|null}
   */
  version = null;

  /**
   * @type {string[]|null}
   */
  missingLibs = null;

  /**
   * @param {Prefix} prefix
   * @param {Command} command
   * @param {FileSystem} fs
   * @param {Update} update
   */
  constructor(prefix, command, fs, update) {
    this.prefix  = prefix;
    this.command = command;
    this.fs      = fs;
    this.update  = update;
  }

  /**
   * @param {Arguments} arguments
   */
  boot() {
    let cmd = Array.prototype.slice.call(arguments).join(' ');

    if (cmd) {
      cmd = '&& ' + cmd;
    }

    let wineBootPath   = Utils.quote(this.prefix.getWineBoot());
    let wineServerPath = Utils.quote(this.prefix.getWineServer());

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

    let wineServerPath = Utils.quote(this.prefix.getWineServer());

    this.command.run(`${wineServerPath} -k ${cmd}`);
  }

  kill() {
    let wineServerPath = Utils.quote(this.prefix.getWineServer());
    this.command.run(`${wineServerPath} -k`);
  }

  /**
   * @param {Arguments} arguments
   * @returns {string}
   */
  runAll() {
    let cmd        = Utils.quote(arguments);
    let winePath   = Utils.quote(this.prefix.getWineBin());
    let wine64Path = Utils.quote(this.prefix.getWine64Bin());
    let result     = '';

    result = this.command.run(`${winePath} ${cmd}`);

    if (this.prefix.getWineArch() === 'win64' && this.prefix.isWine64BinExist()) {
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
    let winePath = Utils.quote(this.prefix.getWineBin());

    return this.command.run(`${winePath} ${cmd}`);
  }

  /**
   * @param {string} path
   * @param {Function} spawnObject
   * @param {string} args
   * @return {Promise}
   */
  runFile(path, args = '', spawnObject = () => {}) {
    let prefix = /** @type {Prefix} */ _.cloneDeep(this.prefix);
    prefix.setWineDebug('');

    let filename = this.fs.basename(path);
    let logFile  = `${this.prefix.getLogsDir()}/${filename}.log`;
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

    let winePath = Utils.quote(this.prefix.getWineBin());
    let cmd      = Utils.quote(path);

    api.commit(action.get('logs').CLEAR);

    let runner;

    if (Utils.isMsDos(path)) {
      runner = window.app.getDosbox().runFile(path.replace(this.prefix.getWineDriveC(), ''), args);
    } else {
      runner = Promise.resolve(`${winePath} ${postfix}${cmd} ${args}`);
    }

    return runner.then((cmd) => (new Command(prefix)).watch(cmd, (output) => {
      api.commit(action.get('logs').APPEND, output);
      this.fs.filePutContents(logFile, output, this.fs.FILE_APPEND);
    }, spawnObject, false, true));
  }

  fm(spawnObject = () => {}) {
    let prefix = /** @type {Prefix} */ _.cloneDeep(this.prefix);
    prefix.setWineDebug('');
    let logFile             = prefix.getLogFileManager();
    let wineFileManagerPath = Utils.quote(prefix.getWineFileManager());

    if (this.fs.exists(logFile)) {
      this.fs.rm(logFile);
    }

    api.commit(action.get('logs').CLEAR);

    return (new Command(prefix)).watch(wineFileManagerPath, (output) => {
      api.commit(action.get('logs').APPEND, output);
      this.fs.filePutContents(logFile, output, this.fs.FILE_APPEND);
    }, spawnObject, false, true);
  }

  cfg() {
    let prefix = /** @type {Prefix} */ _.cloneDeep(this.prefix);
    prefix.setWineDebug('');
    let logFile     = prefix.getLogFileConfig();
    let wineCfgPath = Utils.quote(prefix.getWineCfg());

    if (this.fs.exists(logFile)) {
      this.fs.rm(logFile);
    }

    api.commit(action.get('logs').CLEAR);

    return (new Command(prefix)).watch(wineCfgPath, (output) => {
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
    let regedit   = Utils.quote(this.prefix.getWineRegedit());
    let regedit64 = Utils.quote(this.prefix.getWineRegedit64());
    let result    = '';

    result = this.command.run(`${regedit} ${cmd}`);

    if (this.prefix.getWineArch() === 'win64' && this.prefix.isWine64BinExist()) {
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
    let regedit   = Utils.quote(this.prefix.getWineRegedit());
    let regedit64 = Utils.quote(this.prefix.getWineRegedit64());
    let result    = '';

    if (this.prefix.getWineArch() === 'win64' && this.prefix.isWine64BinExist()) {
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
    let regsvr32 = Utils.quote(this.prefix.getWineRegsvr32());
    let regsvr64 = Utils.quote(this.prefix.getWineRegsvr64());
    let result   = [];

    api.commit(action.get('logs').CLEAR);

    result.push(this.command.runOfBuffer(`${regsvr32} ${cmd}`));

    if (this.prefix.getWineArch() === 'win64' && this.prefix.isWine64BinExist()) {
      result.push(this.command.runOfBuffer(`${regsvr64} ${cmd}`));
    }

    result = result.map(b => utils.encode(utils.decode(b, 'cp866'))).join('\n');

    api.commit(action.get('logs').APPEND, result);

    return result;
  }

  /**
   * @returns {boolean}
   */
  checkSystemWine() {
    return Boolean(this.command.run('command -v "wine"'));
  }

  /**
   * @returns {boolean}
   */
  checkWine() {
    let winePath = Utils.quote(this.prefix.getWineBin());

    return Boolean(this.command.run(`command -v ${winePath}`));
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
    let path  = this.prefix.getWinetricksFile();

    if (title.length > 50) {
      title = title.substr(0, 48) + '..';
    }

    return this.update.downloadWinetricks()
      .then(() => this.fs.exists(path) ? null : Promise.reject())
      .then(() => {
        api.commit(action.get('logs').CLEAR);

        let winetricksLog = this.prefix.getWinePrefix() + '/winetricks.log';
        let logFile       = this.prefix.getLogsDir() + `/winetricks-${title}.log`;
        let prefix        = /**@type {Prefix} */ _.cloneDeep(this.prefix);
        prefix.setWineDebug('');
        let command = new Command(prefix);

        if (this.fs.exists(winetricksLog)) {
          this.fs.rm(winetricksLog);
        }
        if (this.fs.exists(logFile)) {
          this.fs.rm(logFile);
        }

        return command.watch(`"${path}" ${cmd}`, (output) => {
          api.commit(action.get('logs').APPEND, output);
          this.fs.filePutContents(logFile, output, this.fs.FILE_APPEND);
        }, () => {}, false, true).then(() => logFile);
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
      'dxvk054',
      'dxvk060',
      'dxvk061',
      'dxvk062',
      'dxvk063',
      'dxvk064',
      'dxvk065',
      'dxvk070',
      'dxvk071',
      'dxvk072',
      'dxvk080',
      'dxvk081',
      'dxvk090',
      'dxvk091',
      'dxvk092',
      'dxvk093',
      'dxvk094',
      'dxvk095',
      'dxvk096',
      'dxvk100',
      'dxvk101',
      'dxvk102',
      'dxvk103',
      'dxvk111',
      'dxvk120',
      'dxvk121',
      'dxvk122',
      'dxvk123',
      'dxvk130',
      'dxvk131',
      'dxvk132',
      'dxvk133',
      'dxvk134',
      'dxvk140',
      'dxvk141',
      'dxvk142',
      'dxvk143',
      'dxvk144',
      'dxvk145',
      'dxvk146',
      'dxvk150',
      'dxvk151',
      'dxvk152',
      'dxvk153',
      'dxvk154',
      'dxvk155',
      'dxvk160',
      'dxvk161',
      'dxvk170',
      'dxvk171',
      'dxvk172',
      'galliumnine02',
      'galliumnine03',
      'galliumnine04',
      'galliumnine05',
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

    let log = this.prefix.getLogsDir() + `/winetricks-list-all.log`;

    const find = () => [ ...this.fs.fileGetContents(log).matchAll(/^(?!=|\[| sh )(.+?) +(.*)/gm) ]
      .filter(n => !skip.includes(n[1].trim()))
      .map(n => ({ name: n[1].trim(), description: n[2].trim() }));

    if (this.fs.exists(log)) {
      return Promise.resolve(find());
    }

    return this.winetricks('list-all').then(() => {
      api.commit(action.get('logs').CLEAR);
      return find();
    });
  }

  clear() {
    this.version     = null;
    this.missingLibs = null;
    this.prefix.loadWineEnv();
  }

  /**
   * @return {string[]}
   */
  processList() {
    let process = {};

    this.command.run(`ls -l /proc/*/exe 2>/dev/null | grep -E 'wine(64)?-preloader|wineserver'`)
      .split('\n')
      .forEach(s => {
        if (!s) {
          return;
        }

        let pid      = s.split('/proc/')[1].split('/')[0];
        let cmd      = this.command.run(`cat /proc/${pid}/cmdline`);
        let gamesDir = _.trim(`C:${this.prefix.getGamesFolder().split('/').join('\\')}`, '\\/');

        if (_.startsWith(cmd, gamesDir) || (!_.startsWith(cmd, '/') && !_.startsWith(cmd, 'C:\\windows\\system32'))) {
          process[pid] = this.command.run(`cat /proc/${pid}/cmdline`);
        }
      });

    return process;
  }
}