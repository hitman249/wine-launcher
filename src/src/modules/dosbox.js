import _          from "lodash";
import Utils      from "./utils";
import Prefix     from "./prefix";
import System     from "./system";
import FileSystem from "./file-system";
import Command    from "./command";
import Config     from "./config";
import Update     from "./update";

export default class Dosbox {

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
   * @type {Update}
   */
  update = null;

  /**
   * @param {Prefix} prefix
   * @param {Command} command
   * @param {System} system
   * @param {FileSystem} fs
   * @param {Update} update
   */
  constructor(prefix, command, system, fs, update) {
    this.prefix  = prefix;
    this.command = command;
    this.system  = system;
    this.fs      = fs;
    this.update  = update;
  }

  /**
   * @param {Config} config
   * @return {Promise}
   */
  runConfig(config) {
    return this.update.downloadDosbox().then(() => {
      let dosbox      = Utils.quote(this.prefix.getDosboxFile());
      let lang        = Utils.quote(this.getLanguagePath());
      let conf        = Utils.quote(this.getConfigPath());
      let driveC      = Utils.quote(this.prefix.getWineDriveC());
      let gameDir     = this.getDosGamePath(config);
      let gameExe     = this.getDosGameExe(config);
      let currentLang = this.prefix.getLanguage().toUpperCase();

      return `${dosbox} -conf ${conf} ${'RU' === currentLang ? `-lang ${lang}` : ''} -c "mount C \\"${driveC}\\"" -c "C:" -c "cd ${gameDir}" -c "${gameExe}" -c exit ${config.isWindow() ? '' : '-fullscreen'}`;
    });
  }

  /**
   * @param {string} path
   * @param {string} args
   * @return {Promise}
   */
  runFile(path, args = '') {
    return this.update.downloadDosbox().then(() => {
      let dosbox      = Utils.quote(this.prefix.getDosboxFile());
      let lang        = Utils.quote(this.getLanguagePath());
      let conf        = Utils.quote(this.getConfigPath());
      let driveC      = Utils.quote(this.prefix.getWineDriveC());
      let gameDir     = this.convertPath(this.fs.dirname(path));
      let gameExe     = this.convertFilename(this.fs.basename(path));
      let currentLang = this.prefix.getLanguage().toUpperCase();

      return `${dosbox} -conf ${conf} ${'RU' === currentLang ? `-lang ${lang}` : ''} -c "mount C \\"${driveC}\\"" -c "C:" -c "cd ${gameDir}" -c "${gameExe} ${args}" -c exit`;
    });
  }

  /**
   * @return {string}
   */
  getDefaultConfig() {
    let ports = this.system.getMidiPorts();
    let lang  = this.prefix.getLanguage().toUpperCase();

    if ('RU' !== lang) {
      lang = 'auto';
    }

    return `# This is the configurationfile for DOSBox 0.74. (Please use the latest version of DOSBox)
# Lines starting with a # are commentlines and are ignored by DOSBox.
# They are used to (briefly) document the effect of each option.

[sdl]
#       fullscreen: Start dosbox directly in fullscreen. (Press ALT-Enter to go back)
#       fulldouble: Use double buffering in fullscreen. It can reduce screen flickering, but it can also result in a slow DOSBox.
#   fullresolution: What resolution to use for fullscreen: original or fixed size (e.g. 1024x768).
#                     Using your monitor's native resolution with aspect=true might give the best results.
#                     If you end up with small window on a large screen, try an output different from surface.
# windowresolution: Scale the window to this size IF the output device supports hardware scaling.
#                     (output=surface does not!)
#           output: What video system to use for output.
#                   Possible values: surface, overlay, opengl, openglnb.
#         autolock: Mouse will automatically lock, if you click on the screen. (Press CTRL-F10 to unlock)
#      sensitivity: Mouse sensitivity.
#      waitonerror: Wait before closing the console if dosbox has an error.
#         priority: Priority levels for dosbox. Second entry behind the comma is for when dosbox is not focused/minimized.
#                     pause is only valid for the second entry.
#                   Possible values: lowest, lower, normal, higher, highest, pause.
#       mapperfile: File used to load/save the key/event mappings from. Resetmapper only works with the defaul value.
#     usescancodes: Avoid usage of symkeys, might not work on all operating systems.

fullscreen=false
fulldouble=false
fullresolution=original
windowresolution=original
output=surface
autolock=true
sensitivity=100
waitonerror=true
priority=higher,normal
mapperfile=mapper-0.74.map
usescancodes=true

[dosbox]
# language: Select another language file.
#  machine: The type of machine tries to emulate.
#           Possible values: hercules, cga, tandy, pcjr, ega, vgaonly, svga_s3, svga_et3000, svga_et4000, svga_paradise, vesa_nolfb, vesa_oldvbe.
# captures: Directory where things like wave, midi, screenshot get captured.
#  memsize: Amount of memory DOSBox has in megabytes.
#             This value is best left at its default to avoid problems with some games,
#             though few games might require a higher value.
#             There is generally no speed advantage when raising this value.

language=
machine=svga_s3
captures=capture
memsize=16

[render]
# frameskip: How many frames DOSBox skips before drawing one.
#    aspect: Do aspect correction, if your output method doesn't support scaling this can slow things down!.
#    scaler: Scaler used to enlarge/enhance low resolution modes.
#              If 'forced' is appended, then the scaler will be used even if the result might not be desired.
#            Possible values: none, normal2x, normal3x, advmame2x, advmame3x, advinterp2x, advinterp3x, hq2x, hq3x, 2xsai, super2xsai, supereagle, tv2x, tv3x, rgb2x, rgb3x, scan2x, scan3x.

frameskip=0
aspect=false
scaler=normal2x

[cpu]
#      core: CPU Core used in emulation. auto will switch to dynamic if available and appropriate.
#            Possible values: auto, dynamic, normal, simple.
#   cputype: CPU Type used in emulation. auto is the fastest choice.
#            Possible values: auto, 386, 386_slow, 486_slow, pentium_slow, 386_prefetch.
#    cycles: Amount of instructions DOSBox tries to emulate each millisecond.
#            Setting this value too high results in sound dropouts and lags.
#            Cycles can be set in 3 ways:
#              'auto'          tries to guess what a game needs.
#                              It usually works, but can fail for certain games.
#              'fixed #number' will set a fixed amount of cycles. This is what you usually need if 'auto' fails.
#                              (Example: fixed 4000).
#              'max'           will allocate as much cycles as your computer is able to handle.
#            
#            Possible values: auto, fixed, max.
#   cycleup: Amount of cycles to decrease/increase with keycombo.(CTRL-F11/CTRL-F12)
# cycledown: Setting it lower than 100 will be a percentage.

core=auto
cputype=auto
cycles=auto
cycleup=10
cycledown=20

[mixer]
#   nosound: Enable silent mode, sound is still emulated though.
#      rate: Mixer sample rate, setting any device's rate higher than this will probably lower their sound quality.
#            Possible values: 44100, 48000, 32000, 22050, 16000, 11025, 8000, 49716.
# blocksize: Mixer block size, larger blocks might help sound stuttering but sound will also be more lagged.
#            Possible values: 1024, 2048, 4096, 8192, 512, 256.
# prebuffer: How many milliseconds of data to keep on top of the blocksize.

nosound=false
rate=44100
blocksize=1024
prebuffer=20

[midi]
#     mpu401: Type of MPU-401 to emulate.
#             Possible values: intelligent, uart, none.
# mididevice: Device that will receive the MIDI data from MPU-401.
#             Possible values: default, win32, alsa, oss, coreaudio, coremidi, none.
# midiconfig: Special configuration options for the device driver. This is usually the id of the device you want to use.
#               See the README/Manual for more details.

mpu401=intelligent
mididevice=default
midiconfig=${Object.keys(ports)[0]}

[sblaster]
#  sbtype: Type of Soundblaster to emulate. gb is Gameblaster.
#          Possible values: sb1, sb2, sbpro1, sbpro2, sb16, gb, none.
#  sbbase: The IO address of the soundblaster.
#          Possible values: 220, 240, 260, 280, 2a0, 2c0, 2e0, 300.
#     irq: The IRQ number of the soundblaster.
#          Possible values: 7, 5, 3, 9, 10, 11, 12.
#     dma: The DMA number of the soundblaster.
#          Possible values: 1, 5, 0, 3, 6, 7.
#    hdma: The High DMA number of the soundblaster.
#          Possible values: 1, 5, 0, 3, 6, 7.
# sbmixer: Allow the soundblaster mixer to modify the DOSBox mixer.
# oplmode: Type of OPL emulation. On 'auto' the mode is determined by sblaster type. All OPL modes are Adlib-compatible, except for 'cms'.
#          Possible values: auto, cms, opl2, dualopl2, opl3, none.
#  oplemu: Provider for the OPL emulation. compat might provide better quality (see oplrate as well).
#          Possible values: default, compat, fast.
# oplrate: Sample rate of OPL music emulation. Use 49716 for highest quality (set the mixer rate accordingly).
#          Possible values: 44100, 49716, 48000, 32000, 22050, 16000, 11025, 8000.

sbtype=sb16
sbbase=220
irq=7
dma=1
hdma=5
sbmixer=true
oplmode=auto
oplemu=default
oplrate=44100

[gus]
#      gus: Enable the Gravis Ultrasound emulation.
#  gusrate: Sample rate of Ultrasound emulation.
#           Possible values: 44100, 48000, 32000, 22050, 16000, 11025, 8000, 49716.
#  gusbase: The IO base address of the Gravis Ultrasound.
#           Possible values: 240, 220, 260, 280, 2a0, 2c0, 2e0, 300.
#   gusirq: The IRQ number of the Gravis Ultrasound.
#           Possible values: 5, 3, 7, 9, 10, 11, 12.
#   gusdma: The DMA channel of the Gravis Ultrasound.
#           Possible values: 3, 0, 1, 5, 6, 7.
# ultradir: Path to Ultrasound directory. In this directory
#           there should be a MIDI directory that contains
#           the patch files for GUS playback. Patch sets used
#           with Timidity should work fine.

gus=false
gusrate=44100
gusbase=240
gusirq=5
gusdma=3
ultradir=C:\\ULTRASND

[speaker]
# pcspeaker: Enable PC-Speaker emulation.
#    pcrate: Sample rate of the PC-Speaker sound generation.
#            Possible values: 44100, 48000, 32000, 22050, 16000, 11025, 8000, 49716.
#     tandy: Enable Tandy Sound System emulation. For 'auto', emulation is present only if machine is set to 'tandy'.
#            Possible values: auto, on, off.
# tandyrate: Sample rate of the Tandy 3-Voice generation.
#            Possible values: 44100, 48000, 32000, 22050, 16000, 11025, 8000, 49716.
#    disney: Enable Disney Sound Source emulation. (Covox Voice Master and Speech Thing compatible).

pcspeaker=true
pcrate=44100
tandy=auto
tandyrate=44100
disney=true

[joystick]
# joysticktype: Type of joystick to emulate: auto (default), none,
#               2axis (supports two joysticks),
#               4axis (supports one joystick, first joystick used),
#               4axis_2 (supports one joystick, second joystick used),
#               fcs (Thrustmaster), ch (CH Flightstick).
#               none disables joystick emulation.
#               auto chooses emulation depending on real joystick(s).
#               (Remember to reset dosbox's mapperfile if you saved it earlier)
#               Possible values: auto, 2axis, 4axis, 4axis_2, fcs, ch, none.
#        timed: enable timed intervals for axis. Experiment with this option, if your joystick drifts (away).
#     autofire: continuously fires as long as you keep the button pressed.
#       swap34: swap the 3rd and the 4th axis. can be useful for certain joysticks.
#   buttonwrap: enable button wrapping at the number of emulated buttons.

joysticktype=auto
timed=true
autofire=false
swap34=false
buttonwrap=false

[serial]
# serial1: set type of device connected to com port.
#          Can be disabled, dummy, modem, nullmodem, directserial.
#          Additional parameters must be in the same line in the form of
#          parameter:value. Parameter for all types is irq (optional).
#          for directserial: realport (required), rxdelay (optional).
#                           (realport:COM1 realport:ttyS0).
#          for modem: listenport (optional).
#          for nullmodem: server, rxdelay, txdelay, telnet, usedtr,
#                         transparent, port, inhsocket (all optional).
#          Example: serial1=modem listenport:5000
#          Possible values: dummy, disabled, modem, nullmodem, directserial.
# serial2: see serial1
#          Possible values: dummy, disabled, modem, nullmodem, directserial.
# serial3: see serial1
#          Possible values: dummy, disabled, modem, nullmodem, directserial.
# serial4: see serial1
#          Possible values: dummy, disabled, modem, nullmodem, directserial.

serial1=dummy
serial2=dummy
serial3=disabled
serial4=disabled

[dos]
#            xms: Enable XMS support.
#            ems: Enable EMS support.
#            umb: Enable UMB support.
# keyboardlayout: Language code of the keyboard layout (or none).

xms=true
ems=true
umb=true
keyboardlayout=${lang}

[ipx]
# ipx: Enable ipx over UDP/IP emulation.

ipx=false

[autoexec]
# Lines in this section will be run at startup.
# You can put your MOUNT lines here.

`;
  }

  /**
   * @return {string}
   */
  getConfigPath() {
    let path = this.prefix.getDosboxConfFile();

    if (this.fs.exists(path)) {
      return path;
    }

    let config = this.getDefaultConfig();

    this.fs.filePutContents(path, config);

    return path;
  }

  /**
   * Text incorrect codepage
   * Therefore it is saved as base64
   * Russian locale
   *
   * @return {Buffer}
   */
  getDefaultLanguage() {
    return new Buffer('OkNPTkZJR19GVUxMU0NSRUVODQrH4O/z8erg5fIgRE9TQm94IPHw4OfzIOIg7+7r7e796vDg7e3u7CDw5ebo7OUuICjE6/8g7vLq6/735e3o/yDt4Obs6PLlIEFMVF9FTlRFUikNCi4NCjpDT05GSUdfRlVMTERPVUJMRQ0KyPHv7uv85+7i4PL8IOTi7unt8/4g4fP05fDo5+D26P4g7/DoIO/u6+3u/erw4O3t7uwg8OXm6OzlLiDM7ubl8iDz7OXt/Pjo8vwg7OXw9uDt6OUg/erw4O3gLCDt7iDi7ufs7ubt7iDv8Oji5eS48iDqIOfg7OXk6+Xt6P4gRE9TQm94Lg0KLg0KOkNPTkZJR19GVUxMUkVTT0xVVElPTg0KyuDq7uUg8ODn8OX45e3o5SDo8e/u6/zn7uLg8vwg5Ov/IO/u6+3u4+4g/erw4O3gOiDu8Ojj6O3g6/zt7uUg6OvoIPTo6vHo8O7i4O3t7uUg5+3g9+Xt6OUgKO3g7/Do7OXwLCAxMDI0eDc2OCkuDQrI8e/u6/zn7uLg7ejlICLw7uTt7uPuIiDw4Ofw5fjl7ej/IOzu7ejy7vDgIPEg7+Dw4Ozl8vDu7CBhc3BlY3Q9dHJ1ZSDs7ubl8iDk4PL8IO3g6Ovz9/jo5SDw5efz6/zy4PL7Lg0KxfHr6CDi+yDv7uvz9+Dl8uUg7ODr5e386u7lIO7q7vjq7iDt4CDh7uv8+O7sIP3q8ODt5Swg7+7v8O7h8+ny5SDs5fLu5CDi++Lu5OAg7vLr6Pft++kg7vIgc3VyZmFjZS4NCi4NCjpDT05GSUdfV0lORE9XUkVTT0xVVElPTg0KzODx+PLg4ejw7uLg8vwg7urt7iDqIP3y7uzzIPDg5+zl8PMsIEVDy8gg8/Hy8O7p8fLi7g0K4vvi7uTgIO/u5OTl8Obo4uDl8iDg7+/g8ODy7e7lIOzg8fjy4OHo8O7i4O3o5S4NCijQ5ebo7CDi++Lu5OAgb3V0cHV0PXN1cmZhY2Ug7eUg7+7k5OXw5uji4OXyISkNCi4NCjpDT05GSUdfT1VUUFVUDQrK4Orz/iDi6OTl7vHo8fLl7PMg6PHv7uv85+7i4PL8IOTr/yDi++Lu5OAuDQouDQo6Q09ORklHX0FVVE9MT0NLDQrM+/j8IOHz5OXyIODi8u7s4PLo9+Xx6ugg5+Dq8OXv6+Xt4CDv8Ogg+eXr9+rlIO/uIP3q8ODt8y4gKNfy7uH7IO7x4u7h7uTo/CDs+/j8IO3g5uzo8uVDVFJMLUYxMC4pDQouDQo6Q09ORklHX1NFTlNJVElWSVRZDQrX8+Lx8uLo8uXr/O3u8fL8IOz7+OguDQouDQo6Q09ORklHX1dBSVRPTkVSUk9SDQrG5ODy/CDv5fDl5CDn4Orw+/Lo5ewg6u7t8e7r6Cwg5fHr6CDiIERPU0JveCDv8O7o8fXu5OjyIO746OHq4C4NCi4NCjpDT05GSUdfUFJJT1JJVFkNCtPw7uLt6CDv8Oju8Ojy5fLgIO/w7vbl8fHgIERPU0JveC4gwvLu8O7pIO/g8ODs5fLwICjv7vHr5SDn4O//8u7pKSDo8e/u6/zn8+Xy8f8sIA0K6u7j5OAgRE9TQm94IO3lIODq8uji5e0g6OvoIPHi5fDt8/IuIA0Kx+3g9+Xt6OUgJ3BhdXNlJyDv7uTk5fDm6OLg5fLx/yDy7uv86u4g5Ov/IOLy7vDu4+4g7+Dw4Ozl8vDgLg0KLg0KOkNPTkZJR19NQVBQRVJGSUxFDQrU4OnrLCDo8e/u6/zn8+Xs++kg5Ov/IOfg4/Dz5+roL/Hu9fDg7eXt6P8g8ODx6uvg5OroIOrr4OLo+C4gz+Dw4Ozl8vAgcmVzZXRtYXBwZXIg8ODh7vLg5fIg8u7r/OruIPHuIOft4Pfl7ejl7CDv7iDz7O7r9+Dt6P4uDQouDQo6Q09ORklHX1VTRVNDQU5DT0RFUw0KzuHu6fLoIOjx7+7r/Ofu4uDt6OUgc3lta2V5cywg7O7m5fIg7eUg8ODh7vLg8vwg7eAg4vHl9SDO0S4NCi4NCjpDT05GSUdfTEFOR1VBR0UNCsL74ejw4OXyIOTw8+Pu6SD/5/vq7uLu6SD04OnrLg0KLg0KOkNPTkZJR19NQUNISU5FDQrS6O8g7OD46O37LCDq7vLu8PvpIOHz5OXyIP3s8+vo8O7i4PL88f8uDQouDQo6Q09ORklHX0NBUFRVUkVTDQrE6PDl6vLu8Oj/LCDq8+TgIOHz5PPyIPHu9fDg7f/y/PH/IPLg6ujlIOLl+egsIOrg6iB3YXZlLCBtaWRpLCDx6vDo7fju8vsuDQouDQo6Q09ORklHX01FTVNJWkUNCsLl6+j36O3gIO/g7P/y6CDk6/8gRE9TQm94IOIg7OXj4OHg6fLg9S4NCiAg3fLuIOft4Pfl7ejlIOvz9/jlIO7x8uDi6PL8IO/uIPPs7uv34O3o/iwg9/Lu4fsg6Ofh5ebg8vwg7/Du4evl7CDxIO3l6u7y7vD77Ogg6OPw4OzoLA0KICD17vL/IO3l6u7y7vD75SDk8PPj6OUg7O7j8/Ig7+7y8OXh7uLg8vwg4e7r/Pjo9SDn7eD35e3o6S4NCiAg0+Ll6+j35e3o5SD98u7j7iDn7eD35e3o/yDiIO7h+eXsIPHr8/fg5SDt5SDv7uL7+ODl8iDh+/Hy8O7k5enx8uLo5S4NCi4NCjpDT05GSUdfRlJBTUVTS0lQDQrR6u7r/OruIOrg5PDu4iBET1NCb3gg7/Du7/Px6uDl8iDv5fDl5CDy5ewsIOrg6iDu8vDo8e7i4PL8IO7k6O0uDQouDQo6Q09ORklHX0FTUEVDVA0Kwvvv7uvt//L8IOru8PDl6vbo/iDx7u7y7e745e3o/yDx8u7w7u0uIMXx6+gg4uD4IOzl8u7kIOL74u7k4CDt5SDv7uTk5fDm6OLg5fIgDQrs4PH48uDh6PDu4uDt6OUsIP3y7iDs7ubl8iDn4Ozl5Ovo8vwg8ODh7vLzIQ0KLg0KOkNPTkZJR19TQ0FMRVINCsjx7+7r/Ofz5fLx/yDk6/8g8+Ll6+j35e3o/y/z6/P3+OXt6P8g8OXm6Ozu4iDxIO3o5+ro7CDw4Ofw5fjl7ejl7C4gDQrF8evoIO/u8evlIO7x7e7i7e7j7iDn7eD35e3o/yDz6uDn4O3uIOLq6/735e3uICdmb3JjZWQnLCDs4PH48uDh6PDu4uDt6OUgDQrh8+Tl8iDo8e/u6/zn7uLg7e4sIOTg5uUg5fHr6CDw5efz6/zy4PIg7O7m5fIg4fvy/CDt5ebl6+Dy5ev87fvsLg0KLg0KOkNPTkZJR19DT1JFDQrf5PDuINbP0yDo8e/u6/zn8+Xs7uUg4iD97PPr//bo6C4gJ2F1dG8nIO/l8OXq6/734OXyICdub3JtYWwnIO3gICdkeW5hbWljJywg5fHr6CDi7ufs7ubt7i4NCi4NCjpDT05GSUdfQ1BVVFlQRQ0K0ujvINbP0yDo8e/u6/zn8+Xs++kg4iD97PPr//bo6C4gJ2F1dG8nIOL74ejw4OXyIPHg7PvpIOH78fLw++kg4uDw6ODt8i4NCi4NCjpDT05GSUdfQ1lDTEVTDQrX6PHr7iDo7fHy8PPq9ujpLCDq7vLu8O7lIERPU0JveCDv+/Lg5fLx/yD97PPr6PDu4uDy/CDq4Obk8/4gIOzo6+vo8eXq8+3k8y4gDQrT8fLg7e7i6uAg4vv45SDi7ufs7ubt7vHy5ekg4uD45ekg7OD46O37IOzu5uXyIO/w6OLl8fLoIOog7/Dl8Pvi4O3o/+wg5+Lz6uAg6CDr4OPg7C4NCszu5uXyIOH78vwg8/Hy4O3u4uvl7e4g8vDl7P8g8e/u8e7h4OzoOg0KICAnYXV0bycgICAgICAgICAg7/vy4OXy8f8g7+7k7uHw4PL8IO3z5u3u5SDo4/DlIOft4Pfl7ejlLg0KICAgICAgICAgICAgICAgICAg3fLuIO7h+/ft7iDw4OHu8uDl8iwg7e4g5Ov/IO3l6u7y7vD79SDo4/Ag8e7n5ODl8iDv8O7h6+Xs+y4NCiAgJ2ZpeGVkICP36PHr7icgIPPx8uDt4OLr6OLg5fIg9Ojq8ejw7uLg7e3u5SD36PHr7iD26Orr7uIuIN3y7iDy7iwg9/LuIO7h+/ft7iDt8+bt7iwg5fHr6CDt5SDx8ODh7vLg6+4gJ2F1dG8nLg0KICAgICAgICAgICAgICAgICAgKM3g7/Do7OXwOiBmaXhlZCA0MDAwKQ0KICAnbWF4JyAgICAgICAgICAg4vvx8uDi6PIg7ODq8ejs4Ov87e7lIPfo8evuIPbo6uvu4iwg7eAg6u7y7vDu5SDx7+7x7uHl7SDi4Pgg6u7s7/z+8uXwDQoNCi4NCjpDT05GSUdfQ1lDTEVVUA0K1+jx6+4g9ujq6+7iIOTr/yDz4uXr6Pfl7ej/L/Ps5e38+OXt6P8g7vHt7uLt7uPuIOft4Pfl7ej/IO/uIO3g5uDy6Ogg6u7s4ejt4Pbo6CDq6+Di6PggKENUUkwtRjExL0NUUkwtRjEyKS4NCi4NCjpDT05GSUdfQ1lDTEVET1dODQrT8fLg7e7i6uAg5+3g9+Xt6P8g7OXt5eUgMTAwIOfg5OC48iDo5+zl7eXt6OUg7vHt7uLt7uPuIOft4Pfl7ej/IOIg7/Du9uXt8uD1Lg0KLg0KOkNPTkZJR19OT1NPVU5EDQrC6uv+9+Dl8iDy6PXo6SDw5ebo7Cwg9e7y/yDn4vPqIOLx5SDw4OLt7iD97PPr6PDz5fLx/y4NCi4NCjpDT05GSUdfUkFURQ0K0uXs7yDs6Or45fDgLiDN4PHy8O7p6uAg5+3g9+Xt6P8g8uXs7+Ag6/7h7uPuIOTw8+Pu4+4g8/Hy8O7p8fLi4CDi+/jlLCANCvfl7CD98u7yIOLu5+zu5u3uIPP18+T46PIg6PUg6uD35fHy4u4g5+Lz6uAuDQouDQo6Q09ORklHX0JMT0NLU0laRQ0K0ODn7OXwIOHr7uru4iDs6Or45fDgLCDz4uXr6Pfl7ejlIOHr7uru4iDs7ubl8iDv7uzu9/wg8SDn4Ojq4O3o5ewNCufi8+rgLCDt7iDn4vPqIOHz5OXyIOHu6/z45SDu8vHy4OLg8vwuDQouDQo6Q09ORklHX1BSRUJVRkZFUg0K0eru6/zq7iDs6Ovr6PHl6vPt5CDk4O3t+/Ug5OXw5uDy/CDv5fDl5CDw4Ofs5fDu7CDh6+7q4CDs6Or45fDgLg0KLg0KOkNPTkZJR19NUFU0MDENCtLo7yBNUFUtNDAxIOTr/yD97PPr//bo6C4NCi4NCjpDT05GSUdfTUlESURFVklDRQ0K0/Hy8O7p8fLi7iwg6u7y7vDu5SDh8+Tl8iDv7uvz9+Dy/CDk4O3t++UgTUlESSDu8iBNUFUtNDAxLg0KLg0KOkNPTkZJR19NSURJQ09ORklHDQrR7+X26ODr/O375SDq7u306OPz8OD26O7t7fvlIO7v9ujoIOTr/yDz8fLw7unx8uLgLiDO4fv37e4g/fLuIGlkIA0K8/Hy8O7p8fLi4Cwg6u7y7vDu5SD17vLo8uUg6PHv7uv85+7i4PL8LiDO4fDg8ujy5fH8IOogUkVBRE1FL9Dz6u7i7uTx8uLzIOfgIO/u5PDu4e3u8fL/7OguDQouDQo6Q09ORklHX1NCVFlQRQ0K0ujvIP3s8+vo8PPl7O7j7iBTb3VuZEJsYXN0ZXIuIMft4Pfl7ejlIGdiIO7n7eD34OXyIEdhbWVibGFzdGVyLg0KLg0KOkNPTkZJR19TQkJBU0UNCsDk8OXxIO/u8PLgIOLi7uTgL+L74u7k4CAoSU8pIFNvdW5kQmxhc3Rlci4NCi4NCjpDT05GSUdfSVJRDQrN7uzl8CDv8OXw++Lg7ej/IChJUlEpIFNvdW5kQmxhc3Rlci4NCi4NCjpDT05GSUdfRE1BDQrN7uzl8CDPxM8gKERNQSkgU291bmRCbGFzdGVyLg0KLg0KOkNPTkZJR19IRE1BDQrN7uzl8CDi5fD17eXj7iDPxM8gKEhpZ2ggRE1BKSBTb3VuZEJsYXN0ZXIuDQouDQo6Q09ORklHX1NCTUlYRVINCs/u5+Lu6+jy/CDs6Or45fDzIFNvdW5kQmxhc3RlciDs7uTo9Oj26PDu4uDy/CDs6Or45fAgRE9TQm94Lg0KLg0KOkNPTkZJR19PUExNT0RFDQrS6O8g/ezz6//26OggT1BMLiDP8OggJ2F1dG8nIPDl5ujsIO7v8OXk5ev/5fLx/yDy6O/u7CBTb3VuZEJsYXN0ZXIuIA0KwvHlIPDl5ujs+yBPUEwg8e7i7OXx8ujs+yDxIEFkbGliLCDq8O7s5SAnY21zJy4NCi4NCjpDT05GSUdfT1BMRU1VDQrQ5eDr6Ofg9uj/IP3s8+v/9ujoIE9QTC4gwu7n7O7m7e4gJ2NvbXBhdCcg8ezu5uXyIO7h5fHv5ffo8vwg6/P3+OXlIOrg9+Xx8uLuICjx7C4g8uDq5uUgJ29wbHJhdGUnKS4NCi4NCjpDT05GSUdfT1BMUkFURQ0K0uXs7yD97PPr//bo6CBPUEwg7PPn++roLiDT6uDm6PLlIDQ5NzE2IOTr/yDt4Ojr8/f45ePuIOrg9+Xx8uLgICjz8fLg7e7i6PLlIPHu7vLi5fLx8uLz/vno6SDy5ezvIOzo6vjl8OApLg0KLg0KOkNPTkZJR19HVVMNCsLq6/736PL8IP3s8+v/9uj+IEdyYXZpcyBVbHRyYXNvdW5kLg0KLg0KOkNPTkZJR19HVVNSQVRFDQrS5ezvIP3s8+v/9ujoIEdyYXZpcyBVbHRyYXNvdW5kLg0KLg0KOkNPTkZJR19HVVNCQVNFDQrA5PDl8SDv7vDy4CDi4u7k4C/i++Lu5OAgKElPKSBHcmF2aXMgVWx0cmFzb3VuZC4NCi4NCjpDT05GSUdfR1VTSVJRDQrN7uzl8CDv8OXw++Lg7ej/IChJUlEpIEdyYXZpcyBVbHRyYXNvdW5kLg0KLg0KOkNPTkZJR19HVVNETUENCs3u7OXwIM/EzyAoRE1BKSBHcmF2aXMgVWx0cmFzb3VuZC4NCi4NCjpDT05GSUdfVUxUUkFESVINCs/z8vwg6iDk6PDl6vLu8OjoIEdyYXZpcyBVbHRyYXNvdW5kLiDCIP3y7ukg5Ojw5ery7vDo6CDk7uvm7eAg4fvy/CDk6PDl6vLu8Oj/IA0KTUlESSwg6u7y7vDg/yDx7uTl8Obo8iD04Onr+yDv4PL35ekg5Ov/IOLu8e/w7ujn4uXk5e3o/yBHVVMuINTg6ev7IO/g8vfl6SwNCujx7+7r/Ofz5ez75SDxIFRpbWlkaXR5IOTu6+bt+yDw4OHu8uDy/CDt7vDs4Ov87e4uDQouDQo6Q09ORklHX1BDU1BFQUtFUg0Kwurr/vfo8vwg/ezz6//26P4g5Ojt4Ozo6uAgz8ouDQouDQo6Q09ORklHX1BDUkFURQ0K0uXs7yDj5e3l8OD26Ogg5+Lz6uAg5Ojt4Ozo6uAgz8ouDQouDQo6Q09ORklHX1RBTkRZDQrC6uv+9+jy/CD97PPr//bo/iDn4vPq7uLu6SDx6PHy5ez7IFRhbmR5LiDE6/8g8OXm6OzgICdhdXRvJyD97PPr//bo/yDi6uv+9+Dl8vH/LCANCvLu6/zq7iDl8evoIPLo7yDs4Pjo7fsg8/Hy4O3u4uvl7SDq4OogJ3RhbmR5Jy4NCi4NCjpDT05GSUdfVEFORFlSQVRFDQrS5ezvIOPl7eXw4Pbo6CDy8Lj14+7r7vHu4+4gVGFuZHkuDQouDQo6Q09ORklHX0RJU05FWQ0Kwurr/vfo8vwg/ezz6//26P4gRGlzbmV5IFNvdW5kIFNvdXJjZS4g0e7i7OXx8ujs7iDxIENvdm94IFZvaWNlIE1hc3RlciBhbmQgDQpTcGVlY2ggVGhpbmcuDQouDQo6Q09ORklHX0pPWVNUSUNLVFlQRQ0K0ujv+yDk5u7p8fLo6u7iIOTr/yD97PPr//bo6DogYXV0byAo8/Hy4O3u4uvl7e4g7+4g8+zu6/fg7ej+KSwgbm9uZSwgDQoyYXhpcyAo7+7k5OXw5uji4OXy8f8g5OLgIOTm7unx8ujq4CksIA0KNGF4aXMgKO/u5OTl8Obo4uDl8vH/IO7k6O0g5Obu6fHy6OosIOjx7+7r/Ofz5fLx/yDv5fDi++kpLA0KNGF4aXNfMiAo7+7k5OXw5uji4OXy8f8g7uTo7SDk5u7p8fLo6iwg6PHv7uv85/Pl8vH/IOLy7vDu6SksIA0KZmNzIChUaHJ1c3RtYXN0ZXIpLCBjaCAoQ0ggRmxpZ2h0c3RpY2spLg0Kbm9uZSDu8urr/vfg5fIg/ezz6//26P4g5Obu6fHy6OrgLg0KYXV0byDi++Ho8ODl8iDn7eD35e3o5SDiIOfg4ujx6Ozu8fLoIO7yIPDl4Ov87e4g7+7k6uv+9+Xt7e7j7iDk5u7p8fLo6uAo7uIpLg0KKM3lIOfg4fPk/PLlIPHh8O7x6PL8IO3g8fLw7unq8yDw4PHq6+Dk6ugg6uvg4uj4IERPU0JveCwg5fHr6CDi+yDluCDx7vXw4O3/6+guKQ0KLg0KOkNPTkZJR19USU1FRA0Kwurr/vfo8vwg4vDl7OXt7fvlIOjt8uXw4uDr+yDk6/8g7vHl6S4gz+796vHv5fDo7OXt8ujw8+ny5SDxIP3y6Owg7+Dw4Ozl8vDu7Cwg5fHr6CDk5u7p8fLo6iAi8+/r++Lg5fIiLg0KLg0KOkNPTkZJR19BVVRPRklSRQ0Kyu3u7+roIO/w7uTu6+bg/vIg7eDm6Ozg8vzx/yDv7vHy7v/t7e4sIO/u6uAg4vsg6PUg5OXw5ujy5SDt4Obg8vvs6C4NCi4NCjpDT05GSUdfU1dBUDM0DQrM5e3/5fIg7OXx8uDs6CAz/iDoIDT+IO7x6CDk5u7p8fLo6uAgKOzu5uXyIOH78vwg7+7r5eft7iDk6/8g7eXq7vLu8Pv1DQrs7uTl6+XpIOTm7unx8ujq7uIpLg0KLg0KOkNPTkZJR19CVVRUT05XUkFQDQrO8fP55fHy4uv/5fIg7+7k7OXt8yDq7uvo9+Xx8uLgIPDl4Ov87fv1IOrt7u/u6iDt4CDq7uvo9+Xx8uLuIP3s8+vo8PPl7Pv1Lg0KLg0KOkNPTkZJR19TRVJJQUwxDQrT8fLg7eDi6+ji4OXyIPLo7yDz8fLw7unx8uLgLCDx7uXk6O3l7e3u4+4g8SBDT00g7+7w8u7sLg0KzO7m5fIg4fvy/DogZGlzYWJsZWQsIGR1bW15LCBtb2RlbSwgbnVsbG1vZGVtLCBkaXJlY3RzZXJpYWwuDQrE7u/u6+3o8uXr/O375SDv4PDg7OXy8Psg5O7r5u37IOH78vwg5+Dk4O37IO3gIPLu6SDm5SDx8vDu6uUsIOIg4ujk5Q0K7+Dw4Ozl8vA65+3g9+Xt6OUuIM/g8ODs5fLw+yDk6/8g4vHl9SDy6O/u4jogaXJxICAo7eXu4f/n4PLl6/zt7ikuDQrk6/8gZGlyZWN0c2VyaWFsOiByZWFscG9ydCAo7eXu4fXu5Ojs7iksIHJ4ZGVsYXkgKO3l7uH/5+Dy5ev87e4pLg0KICAgICAgICAgICAgICAgICAocmVhbHBvcnQ6Q09NMSByZWFscG9ydDp0dHlTMCkuDQrk6/8gbW9kZW06IGxpc3RlbnBvcnQgKO3l7uH/5+Dy5ev87e4pLg0K5Ov/IG51bGxtb2RlbTogc2VydmVyLCByeGRlbGF5LCB0eGRlbGF5LCB0ZWxuZXQsIHVzZWR0ciwNCiAgICAgICAgICAgICAgIHRyYW5zcGFyZW50LCBwb3J0LCBpbmhzb2NrZXQgKOLx5SAtIO3l7uH/5+Dy5ev87e4pLg0Kz/Do7OXwOiBzZXJpYWwxPW1vZGVtIGxpc3RlbnBvcnQ6NTAwMA0KLg0KOkNPTkZJR19TRVJJQUwyDQrR7C4gc2VyaWFsMQ0KLg0KOkNPTkZJR19TRVJJQUwzDQrR7C4gc2VyaWFsMQ0KLg0KOkNPTkZJR19TRVJJQUw0DQrR7C4gc2VyaWFsMQ0KLg0KOkNPTkZJR19YTVMNCsLq6/736PL8IO/u5OTl8Obq8yBYTVMuDQouDQo6Q09ORklHX0VNUw0Kwurr/vfo8vwg7+7k5OXw5urzIEVNUy4NCi4NCjpDT05GSUdfVU1CDQrC6uv+9+Dl8iDv7uTk5fDm6vMgVU1CLg0KLg0KOkNPTkZJR19LRVlCT0FSRExBWU9VVA0Kyu7kIP/n++rgIOTr/yDq6+Di6ODy8/Dt7ukg8ODx6uvg5OroICjo6+ggJ25vbmUnKS4NCi4NCjpDT05GSUdfSVBYDQrC6uv+9+Dl8iD97PPr//bo/iBpcHgg7eDkIFVEUC9JUC4NCi4NCjpBVVRPRVhFQ19DT05GSUdGSUxFX0hFTFANCsru7ODt5Psg4iD98u7pIPHl6vbo6CDh8+Tz8iDi++/u6+3l7fsg7/DoIOfg7/Px6uUuDQrC+yDs7ubl8uUg8+rg5+Dy/CDn5OXx/CDi4PjoIOru7ODt5Psg7O7t8ujw7uLg7ej/IPPx8vDu6fHy4iAoTU9VTlQpLg0KDQouDQo6Q09ORklHRklMRV9JTlRSTw0KIyDd8u4g6u7t9Ojj8/Dg9uju7e376SD04OnrIERPU0JveCAlcy4gKM/u5uDr8+nx8uAsIOjx7+7r/Ofz6fLlIPHg7PP+IPHi5ebz/iDi5fDx6P4gRE9TQm94LikNCiMg0fLw7uroLCDt4Pfo7eD++ejl8f8g8SAjIP/i6//+8vH/IOru7Ozl7fLg8Oj/7Ogg6CDo4+3u8Ojw8/7y8f8gRE9TQm94Lg0KIyDO7egg6PHv7uv85/P+8vH/LCD38u7h+yDq8ODy6u4g7u/o8eDy/CDq4Obk8/4g7u/26P4uIA0KDQouDQo6Q09ORklHX1NVR0dFU1RFRF9WQUxVRVMNCsLu5+zu5u375SDn7eD35e3o/w0KLg0KOlBST0dSQU1fQ09ORklHX0ZJTEVfRVJST1INCo2loq6nrK6mra4gruKq4Ovi7CDkoKmrICVzDQoNCi4NCjpQUk9HUkFNX0NPTkZJR19VU0FHRQ0KiK3h4uDjrKWt4iCqrq3kqKPj4KDmqKg6DQqI4a+uq+yn46nipSAtd3JpdGVjb25mIKis7y3koKmroCCkq+8gp6CvqOGoIOKlquPpqOUgraDh4uCupaouDQqI4a+uq+yn46nipSAtd3JpdGVsYW5nIKis7y3koKmroCCkq+8gp6CvqOGoIOKlquPpqOUg76frqq6irqOuIOSgqaugLg0KDQouDQo6UFJPR1JBTV9DT05GSUdfU0VDVVJFX09ODQqPpeClqqvu56irqOHsIKIgp6DpqOmlra3rqSDgpaaorC4NCg0KLg0KOlBST0dSQU1fQ09ORklHX1NFQ1VSRV9ESVNBTExPVw0KneKgIK6vpeCg5qjvIK2lpK6v4+HiqKygIKIgp6DpqOmlra2urCDgpaaorKUuDQoNCi4NCjpQUk9HUkFNX0NPTkZJR19TRUNUSU9OX0VSUk9SDQqRparmqO8gJXMgraUg4ePppeHiouOl4i4NCg0KLg0KOlBST0dSQU1fQ09ORklHX1BST1BFUlRZX0VSUk9SDQqNpeIg4qCqrqkg4aWq5qioIKirqCCvoOCgrKXi4KAuDQoNCi4NCjpQUk9HUkFNX0NPTkZJR19OT19QUk9QRVJUWQ0KjaXiIK+g4KCspeLgoCAlcyCiIOGlquaoqCAlcy4NCg0KLg0KOlBST0dSQU1fQ09ORklHX0dFVF9TWU5UQVgNCo/goKKoq+yt66kg4ait4qCq4ajhOiBjb25maWcgLWdldCAi4aWq5qjvIK+g4KCspeLgIi4NCg0KLg0KOlBST0dSQU1fTU9VTlRfQ0RST01TX0ZPVU5EDQqOoa2g4OOmpa3rIK/gqKKupOsgQ0QtUk9NOiAlZA0KDQouDQo6UFJPR1JBTV9NT1VOVF9TVEFUVVNfMg0KhKjhqiAlYyDhrK6t4qjgrqKgrSCqoKogJXMNCg0KLg0KOlBST0dSQU1fTU9VTlRfU1RBVFVTXzENCpKlquPpqKUg4ayureKo4K6ioK2t66UgpKjhqqg6DQoNCi4NCjpQUk9HUkFNX01PVU5UX0VSUk9SXzENCoSo4KWq4q7gqO8gJXMgraUg4ePppeHiouOl4i4NCg0KLg0KOlBST0dSQU1fTU9VTlRfRVJST1JfMg0KJXMgraUg76Kr76Xi4e8gpKjgpariruCopakNCg0KLg0KOlBST0dSQU1fTU9VTlRfSUxMX1RZUEUNCo2loqXgreupIOKoryAlcw0KDQouDQo6UFJPR1JBTV9NT1VOVF9BTFJFQURZX01PVU5URUQNCoSo4aogJWMg46alIOGsrq3iqOCuoqCtIKqgqiAlcw0KDQouDQo6UFJPR1JBTV9NT1VOVF9VU0FHRQ0KiOGvrqvsp+Op4qUgG1szNDsxbU1PVU5UIIHjqqKgLaSo4aqgICCLrqqgq+ytoO8tpKjgpariruCo7xtbMG0NCo/gqKyl4DogTU9VTlQgYyAlcw0KhKCtraDvIKqurKCtpKAgp6Dh4qCiqOIgpKjgpariruCo7iAlcyCi66Or76Sl4uwNCqqgqiCkqOGqIEM6IKKt4+LgqCBET1NCb3guDQqd4qAgpKjgpariruCo7yCkrqumraAg4ePppeHioq6ioOLsLg0KDQouDQo6UFJPR1JBTV9NT1VOVF9VTU9VTlRfTk9UX01PVU5URUQNCoSo4aogJWMgraUg4ayureKo4K6ioK0uDQoNCi4NCjpQUk9HUkFNX01PVU5UX1VNT1VOVF9TVUNDRVMNCoSo4aogJWMgoeurIOPhr6Xora4g46Sgq6WtLg0KDQouDQo6UFJPR1JBTV9NT1VOVF9VTU9VTlRfTk9fVklSVFVBTA0KjaWirqesrqatriDgoKesrq3iqOCuoqDi7CCiqODi46Cr7K3rpSCkqOGqqA0KDQouDQo6UFJPR1JBTV9NT1VOVF9XQVJOSU5HX1dJTg0KG1szMTsxbYyureKo4K6ioK2opSBjOlwgjYUg4KWqrqylraTjpeLh7y4ggiDhq6Wk4+7pqKkg4KCnIKyureKo4OOp4qUgKK+upCmkqOClquKu4KjuLhtbMG0NCg0KLg0KOlBST0dSQU1fTU9VTlRfV0FSTklOR19PVEhFUg0KG1szMTsxbYyureKo4K6ioK2opSAvII2FIOClqq6spa2k46Xi4e8uIIIg4aulpOPu6aipIOCgpyCsrq3iqODjqeKlICivrqQppKjgpariruCo7i4bWzBtDQoNCi4NCjpQUk9HUkFNX01FTV9DT05WRU4NCiUxMGQgiqEgrqHr562uqSCvoKzv4qgg4aKuoa6kra4NCg0KLg0KOlBST0dSQU1fTUVNX0VYVEVORA0KJTEwZCCKoSDgoOHoqOClra2uqSAoZXh0ZW5kZWQpIK+grO/iqCDhoq6hrqStrg0KDQouDQo6UFJPR1JBTV9NRU1fRVhQQU5EDQolMTBkIIqhIKSur66rrajipavsra6pIChleHBhbmRlZCkgr6Cs7+KoIOGirqGupK2uDQoNCi4NCjpQUk9HUkFNX01FTV9VUFBFUg0KJTEwZCCKoSDhoq6hrqStrqkgoqXg5a2lqSCvoKzv4qggoiAlZCChq66qoOUgKK2gqKGuq+zoqKkgVU1CICVkIIqhKQ0KDQouDQo6UFJPR1JBTV9MT0FERklYX0FMTE9DDQolZCCKoSCi66Slq6Wtri4NCg0KLg0KOlBST0dSQU1fTE9BREZJWF9ERUFMTE9DDQolZCCKoSCi6+GirqGupqSlra4uDQoNCi4NCjpQUk9HUkFNX0xPQURGSVhfREVBTExPQ0FMTA0KiOGvrqvsp66ioK2toO8gr6Cs7+LsIK7hoq6hrqakpa2gLg0KDQouDQo6UFJPR1JBTV9MT0FERklYX0VSUk9SDQqO6KihqqAgouukpaulrajvIK+grO/iqC4NCg0KLg0KOk1TQ0RFWF9TVUNDRVNTDQpNU0NERVgg4+HioK2uoqulrS4NCg0KLg0KOk1TQ0RFWF9FUlJPUl9NVUxUSVBMRV9DRFJPTVMNCk1TQ0RFWDogkaGuqToggeOqousgpKjhqq6iIENELVJPTSDj4eLgrqnh4qIgpK6rpq3rIKHr4uwgr67hq6WkrqKg4qWr7K3rLg0KDQouDQo6TVNDREVYX0VSUk9SX05PVF9TVVBQT1JURUQNCk1TQ0RFWDogkaGuqTogj66qoCCtpSCvrqSkpeCmqKKgpeLh7y4NCg0KLg0KOk1TQ0RFWF9FUlJPUl9PUEVODQpNU0NERVg6IJGhrqk6II2loqXgreupIOSgqasgqKuoIK2loq6nrK6mra4gruKq4Ovi7C4NCg0KLg0KOk1TQ0RFWF9UT09fTUFOWV9EUklWRVMNCk1TQ0RFWDogkaGuqToghK7h4qijrePiIK/gpaSlqyCqrquo56Xh4qKgIOPh4uCuqeHioiBDRC1ST00gKKygquGorOOsOiA1KS4gDQpNU0NERVggraUg4+HioK2uoqulrS4NCg0KLg0KOk1TQ0RFWF9MSU1JVEVEX1NVUFBPUlQNCk1TQ0RFWDogkayureKo4K6ioK2gIK+upKSo4KWq4q7gqO86IK6j4KCtqOelra2g7yCvrqSkpeCmqqAuDQoNCi4NCjpNU0NERVhfSU5WQUxJRF9GSUxFRk9STUFUDQpNU0NERVg6IJGhrqk6IJSgqasgraUg76Kr76Xi4e8grqHgoKeurCBpc28vY3VlLCCrqKGuIK+uouClpqSlrS4NCg0KLg0KOk1TQ0RFWF9VTktOT1dOX0VSUk9SDQpNU0NERVg6IJGhrqk6II2lqKeipeHiraDvIK7oqKGqoC4NCg0KLg0KOlBST0dSQU1fUkVTQ0FOX1NVQ0NFU1MNCort6CCkqOGqrqIgrueo6aWtLg0KDQouDQo6UFJPR1JBTV9JTlRSTw0KG1syShtbMzI7MW2ErqHgriCvrqagq66ioOLsIKIgRE9TQm94G1swbSwg7azjq+/iruAg4ajh4qWsIHg4NiDhriCnouOqrqwgqCCj4KDkqKquqS4NCkRPU0JveCCiruGv4K6op6KupKjiIKSr7yCioOEgrqGuq67nquMsIK+u5a6m4+4graAg4eKg4OupIOKlquHirqLrqSBET1MuDQoNCoSr7yCoreSu4Kyg5qioIK6hIK7hra6ioOUgrK6t4qjgrqKgrajvIK2goaXgqOKlIBtbMzQ7MW1pbnRybyBtb3VudBtbMG0NCoSr7yCoreSu4Kyg5qioIK4gr66kpKXgpqqlIENELVJPTSCtoKGl4KjipSAbWzM0OzFtaW50cm8gY2Ryb20bWzBtDQqEq+8gqK3kruCsoOaoqCCuIOGvpeaooKvsrevlIKqroKKo6KDlIK2goaXgqOKlIBtbMzQ7MW1pbnRybyBzcGVjaWFsG1swbQ0KhKvvIKit5K7grKDmqKggriBET1NCb3gsIKegqaSo4qUgraAgG1szNDsxbWh0dHA6Ly93d3cuZG9zYm94LmNvbS93aWtpLxtbMG0NCg0KG1szMTsxbURPU0JveCCu4eKgra6iqOLh7y+noKrgrqXi4e8goaWnIK/gpaTjr+ClpqSlrajvLCCl4auoIKKup62oqq2l4iCu6KihqqAhG1swbQ0KDQoNCg0KLg0KOlBST0dSQU1fSU5UUk9fTU9VTlRfU1RBUlQNChtbMzI7MW2NpeGqrqvsqq4gqq6soK2kLCCqruKu4OulIK+u4uCloePu4uHvIKKgrCCkq+8graDnoKugOhtbMG0NCo+l4KWkIOKlrCwgqqCqIKLrIOGsrqal4qUgqOGvrqvsp66ioOLsIOSgqavrLCDgoOGvrquupqWtreulIK2gIKKg6KWpIOSgqauuoq6pDQrhqOHipaylLCCC6yCkrqumresg4ayureKo4K6ioOLsIKSo4KWq4q7gqO4sIOGupKXgpqDp4+4g7eKoIOSgqavrLg0KDQoNCi4NCjpQUk9HUkFNX0lOVFJPX01PVU5UX1dJTkRPV1MNChtbNDQ7MW3Jzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nuw0KuiAbWzMybW1vdW50IGMgYzpcZG9zcHJvZ3NcG1szN20g4a6npKDh4iCkqOGqIEMg4SDhrqSl4KaorOusIGM6XGRvc3Byb2dzLiAgICAgICAgICAgICC6DQq6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgug0KuiAbWzMybWM6XGRvc3Byb2dzXBtbMzdtIO3iriCv4KispeAuIIegrKWtqOKlIK2gIKSo4KWq4q7gqO4g4SCioOiorKggqKPgoKyoLiAbWzM3bSAgICAgICAgILoNCsjNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc28G1swbQ0KDQouDQo6UFJPR1JBTV9JTlRST19NT1VOVF9PVEhFUg0KG1s0NDsxbcnNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc27DQq6IBtbMzJtbW91bnQgYyB+L2Rvc3Byb2dzG1szN20g4a6npKDh4iCkqOGqIEMg4SDhrqSl4KaorOusIH4vZG9zcHJvZ3MuICAgICAgICAgICAgICAgILoNCrogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICC6DQq6IBtbMzJtfi9kb3Nwcm9ncxtbMzdtIO3iriCv4KispeAuIIegrKWtqOKlIK2gIKSo4KWq4q7gqO4g4SCioOiorKggqKPgoKyoLiAbWzM3bSAgICAgICAgICAgug0KyM3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3NzbwbWzBtDQoNCi4NCjpQUk9HUkFNX0lOVFJPX01PVU5UX0VORA0Kiq6jpKAgrK6t4qjgrqKgrailIOPhr6Xora4gp6CipeDopa2uLCCi6yCsrqal4qUgraCh4KDi7CAbWzM0OzFtYzobWzBtIOfirqHrIK+l4KWp4qgNCq2gIKKg6CDhrK6t4qjgrqKgra3rqSCkqOGqIEMuII2goaXgqOKlIBtbMzQ7MW1kaXIbWzBtIOfirqHrIK+uq+PnqOLsIKWjriDhrqSl4KaorK6lLiANChtbMzQ7MW1jZBtbMG0gr66noq6rqOIgoqCsIKKuqeKoIKIgpKjgpariruCo7iAoruKuoeCgpqCl4uHvIOEgG1szMzsxbTxESVI+G1swbSCiIOGvqOGqpSCkqOClquKu4KipKS4NCoLrIKyupqXipSCnoK/j4aqg4uwgr+Cuo+CgrKzrL+SgqavrIOEg4KDh6Kjgpa2opawgG1szMW0uZXhlIC5iYXQbWzBtIKgg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4uwgr+CuoaulrOsuDQoNCi4NCjpQUk9HUkFNX0JPT1RfUFJJTlRfRVJST1INCp3ioCCqrqygraSgIKego+DjpqCl4iBEb3NCb3gg4SCuoeCgp6AgpKjhqqXi6yCoq6ggrqHgoKegIKal4eKqrqOuIKSo4aqgLg0KDQqEq+8g7eKuqSCqrqygraTrIKLrIKyupqXipSDjqqCnoOLsIK+u4aulpK6ioOKlq+ytruHi7CCkqOGqpeIsIK+l4KWqq+7noKWs6+UNCq2gpqDiqKWsIEN0cmwtRjQsIC1sIOOqoKfroqCl4iwgqqCqrqkg4ayureKo4K6ioOLsIKSo4aosIKSr7yCnoKPg46eqqC4gheGrqA0KoeOqoqAgraUg46qgp6CtoCwgp6Cj4OOnqqAgr+CuqOHlrqSo4iDhIKSo4aqgIEEuDQqF4eLsIOKuq+yqriDi4Kggp6Cj4OOmoKWs6+UgpKjhqqAgQSwgQywgqCBELiAghKvvIKego+Djp6qoIOEgpqXh4qquo64gpKjhqqAgDQooQyCoq6ggRCksIK6h4KCnIKSuq6alrSCh6+LsIOOmpSDhrK6t4qjgrqKgrSCqrqygraSuqSAbWzM0OzFtSU1HTU9VTlQbWzBtLg0KDQqRqK3ioKrhqOEg7eKuqSCqrqygraTrOg0KDQobWzM0OzFtQk9PVCBbZGlza2ltZzEuaW1nIGRpc2tpbWcyLmltZ10gWy1sIKHjqqKgLaSo4aqgXRtbMG0NCg0KLg0KOlBST0dSQU1fQk9PVF9VTkFCTEUNCo2loq6nrK6mra4gp6Cj4OOnqOLh7yDhIKSo4aqgICVjDQouDQo6UFJPR1JBTV9CT09UX0lNQUdFX09QRU4NCo7iquDr4qilIOSgqaugIK6h4KCnoDogJXMNCg0KLg0KOlBST0dSQU1fQk9PVF9JTUFHRV9OT1RfT1BFTg0KjaUg46Sgq67h7CCu4qrg6+LsICVzDQouDQo6UFJPR1JBTV9CT09UX0JPT1QNCoego+Djp6qgIOEgpKjhqqAgJWMuLi4NCg0KLg0KOlBST0dSQU1fQk9PVF9DQVJUX1dPX1BDSlINCoqg4OLgqKSmIFBDSnIgrqGtoODjpqWtLCCtriCsoOioraAgraUg76Kr76Xi4e8gUENKcg0KLg0KOlBST0dSQU1fQk9PVF9DQVJUX0xJU1RfQ01EUw0KhK7h4uOvreulIKqurKCtpOsgraAgqqDg4uCopKalIFBDanI6JXMNCi4NCjpQUk9HUkFNX0JPT1RfQ0FSVF9OT19DTURTDQqNpSCuoa2g4OOmpa2uIKqurKCtpCCtoCCqoODi4KikpqUgUENqcg0KLg0KOlBST0dSQU1fSU1HTU9VTlRfU1BFQ0lGWV9EUklWRQ0KhK6rpq2gIKHr4uwg46qgp6CtoCCh46qioCCkqOGqoCwg5+Kuoesg4ayureKo4K6ioOLsIK6h4KCnLg0KDQouDQo6UFJPR1JBTV9JTUdNT1VOVF9TUEVDSUZZMg0KhK6rpqWtIKHr4uwg46qgp6CtIK2urKXgIOPh4uCuqeHioqAgpKjhqqAgKDAgqKuoIDMpLCDn4q6h6yDhrK6t4qjgrqKg4uwgrqHgoKcgKDAsMT1mZGEsZmRiOzIsMz1oZGEsaGRiKS4NCg0KLg0KOlBST0dSQU1fSU1HTU9VTlRfU1BFQ0lGWV9HRU9NRVRSWQ0KhKvvIBtbMzNtQ0QtUk9NG1swbSCuoeCgp66iOiAgIBtbMzQ7MW1JTUdNT1VOVCCB46qioC2EqOGqoCCMpeHirq2g5a6mpKWtqKUtrqHgoKegIC10IGlzbxtbMG0NCg0KhKvvIK6h4KCnrqIgG1szM22mpeHiqq6jriCkqOGqoBtbMG0gOiCN46atriDjqqCnoOLsIKOlrqyl4uCo7iCmpeHiqq6jriCkqOGqoDoNCqGgqeJfol/hpariruClLCDhpariruCuol+toF/mqKuoraTgLCCjrquuoq6qX62gX+aoq6itpOAsIKquq6jnpeHioq5f5qirqK2k4K6iLg0KG1szNDsxbUlNR01PVU5UIKHjqqKgLaSo4aqgIKyl4eKuraDlrqakpa2o7y2uoeCgp6AgLeCgp6yl4CBicHMsc3BjLGhwYyxjeWwbWzBtDQoNCi4NCjpQUk9HUkFNX0lNR01PVU5UX0lOVkFMSURfSU1BR0UNCo2lIKyuo+Mgp6Cj4OOnqOLsIOSgqasgrqHgoKegLg0Kj+CuoqXg7OKlIKqu4OClquKtruHi7CCv4+KoIKggpK7h4uOvra7h4uwgrqHgoKegLg0KDQouDQo6UFJPR1JBTV9JTUdNT1VOVF9JTlZBTElEX0dFT01FVFJZDQqNpSCsrqPjIKinoqul5+wgo6WurKXi4KjuIKSo4aqgIKinIK6h4KCnoC4NCojhr66r7KfjqeKlIK+g4KCspeLgIC1zaXplIGJwcyxzcGMsaHBjLGN5bCAs5+Kuoesgp6CkoOLsIKOlrqyl4uCo7i4NCg0KLg0KOlBST0dSQU1fSU1HTU9VTlRfVFlQRV9VTlNVUFBPUlRFRA0KkqivICIlcyIgraUgr66kpKXgpqiioKXi4e8uIJOqoKao4qUgImhkZCIgqKuoICJmbG9wcHkiIKirqCAiaXNvIi4NCg0KLg0KOlBST0dSQU1fSU1HTU9VTlRfRk9STUFUX1VOU1VQUE9SVEVEDQqUruCsoOIgIiVzIiCtpSCvrqSkpeCmqKKgpeLh7y4gk6qgpqjipSAiZmF0IiCoq6ggImlzbyIgqKuoICJub25lIi4NCg0KLg0KOlBST0dSQU1fSU1HTU9VTlRfU1BFQ0lGWV9GSUxFDQqN46atriDjqqCnoOLsIKyureKo4OOlrOupIOSgqasgrqHgoKegLg0KDQouDQo6UFJPR1JBTV9JTUdNT1VOVF9GSUxFX05PVF9GT1VORA0KlKCpqyCuoeCgp6AgraUgraCppKWtLg0KDQouDQo6UFJPR1JBTV9JTUdNT1VOVF9NT1VOVA0Kl+Kuoesg4ayureKo4K6ioOLsIKSo4KWq4q7gqKgsIKjhr66r7KfjqeKlIKqurKCtpOMgG1szNDsxbU1PVU5UG1swbSAsIKAgraUgG1szNDsxbUlNR01PVU5UG1swbSAuDQoNCi4NCjpQUk9HUkFNX0lNR01PVU5UX0FMUkVBRFlfTU9VTlRFRA0KhKjhqiDhIOKgqq6pIKHjqqKuqSDjpqUg4ayureKo4K6ioK0uDQoNCi4NCjpQUk9HUkFNX0lNR01PVU5UX0NBTlRfQ1JFQVRFDQqNpaKup6yupq2uIOGup6Sg4uwgpKjhqiCopyDkoKmroC4NCg0KLg0KOlBST0dSQU1fSU1HTU9VTlRfTU9VTlRfTlVNQkVSDQqEqOGqIK2urKXgICVkIOGsrq3iqOCuoqCtIKqgqiAlcw0KDQouDQo6UFJPR1JBTV9JTUdNT1VOVF9OT05fTE9DQUxfRFJJVkUNCpSgqasgrqHgoKegIKSuq6alrSCh6+LsIK2gIKuuqqCr7K2urCCkqOGqpSCqrqyv7O7ipeCgIKirqCCtoCDhrK6t4qjgrqKgra2urCCiIERPU0JveCCkqOGqpS4NCg0KLg0KOlBST0dSQU1fSU1HTU9VTlRfTVVMVElQTEVfTk9OX0NVRUlTT19GSUxFUw0KiOGvrqvsp66ioK2opSDh4KCn4yCtpeGqrqvsqqjlIOSgqauuoiCvrqSkpeCmqKKgpeLh7yDirqvsqq4gpKvvIK6h4KCnrqIgY3VlL2lzby4NCg0KLg0KOlBST0dSQU1fS0VZQl9JTkZPDQqKrqSuoqDvIOHi4KCtqOagICVpIKHrq6Agp6Cj4OOmpa2gLg0KDQouDQo6UFJPR1JBTV9LRVlCX0lORk9fTEFZT1VUDQqKrqSuoqDvIOHi4KCtqOagICVpIKHrq6Agp6Cj4OOmpa2gIKSr7yDgoOGqq6CkqqggJXMNCg0KLg0KOlBST0dSQU1fS0VZQl9TSE9XSEVMUA0KG1szMjsxbUtFWUIbWzBtIFtJRCCqq6CiqKDi4+Ctrqkg4KDhqqugpKqoWyCtrqyl4CCqrqSuoq6pIOHi4KCtqObrWyDkoKmrIKqupK6irqkg4eLgoK2o5utdXV0NCg0KjaWqruKu4OulIK/gqKyl4Os6DQogIBtbMzI7MW1LRVlCG1swbTogj66qoKeg4uwgp6Cj4OOmpa2t4+4goiCkoK2t66kgrK6spa3iIKqupK6i4+4g4eLgoK2o5uMNCiAgG1szMjsxbUtFWUIbWzBtIHNwOiCHoKPg46eo4uwgqOGvoK3hquPuIOCg4aqroKSq4yAoU1ApIKggqOGvrqvsp66ioOLsIK+upOWupO/p4+4gqq6krqLj7iDh4uCgrajm4y4NCiAgG1szMjsxbUtFWUIbWzBtIHNwIDg1MDogh6Cj4OOnqOLsIKjhr6Ct4arj7iDgoOGqq6CkquMgKFNQKSCoIKjhr66r7KeuoqDi7CCvrqTlrqTv6ePuIKqupK6i4+4g4eLgoK2o5uMgODUwLg0KICAbWzMyOzFtS0VZQhtbMG0gc3AgODUwIG15Y3AuY3BpOiCSrqalLCDn4q4gqCCi6+ilLCCtriCo4a+uq+ynrqKg4uwg5KCpqyBteWNwLmNwaS4NCg0KLg0KOlBST0dSQU1fS0VZQl9OT0VSUk9SDQqKq6CiqKDi4+CtoO8g4KDhqqugpKqgICVzIKego+DjpqWtoCCkq+8gqq6krqKuqSDh4uCgrajm6yAlaQ0KDQouDQo6UFJPR1JBTV9LRVlCX0ZJTEVOT1RGT1VORA0KlKCpqyCqq6CiqKDi4+Ctrqkg4KDhqqugpKqoICVzIK2lIK6hraDg46alrQ0KDQouDQo6UFJPR1JBTV9LRVlCX0lOVkFMSURGSUxFDQqUoKmrIKqroKKooOLj4K2uqSDgoOGqq6CkqqggJXMgraWkrq/j4eKorA0KDQouDQo6UFJPR1JBTV9LRVlCX0xBWU9VVE5PVEZPVU5EDQqNpeIg4KDhqqugpKqoIKIgJXMgpKvvIKqupK6irqkg4eLgoK2o5usgJWkNCg0KLg0KOlBST0dSQU1fS0VZQl9JTlZDUEZJTEUNCpSgqasgqq6krqKuqSDh4uCgrajm6yCu4uHj4uHiouOl4iCoq6ggraWkrq/j4eKorCCkq+8g4KDhqqugpKqoICVzDQoNCg0KLg0KOlNIRUxMX0lMTEVHQUxfUEFUSA0KjaWipeCt66kgr+Pi7C4NCg0KLg0KOlNIRUxMX0NNRF9IRUxQDQqF4auoIKKgrCDi4KWh46Xi4e8g4a+o4a6qIKLhpeUgr66kpKXgpqiioKWs6+Ugqq6soK2kLCCioqWkqOKlICAbWzMzOzFtaGVscCAvYWxsG1swbSAuDQqK4KDiqqipIOGvqOGuqiCvrqSkpeCmqKKgpazr5SCqrqygraQ6DQoNCi4NCjpTSEVMTF9DTURfRUNIT19PTg0KRUNITyBvbg0KDQouDQo6U0hFTExfQ01EX0VDSE9fT0ZGDQpFQ0hPIG9mZg0KDQouDQo6U0hFTExfSUxMRUdBTF9TV0lUQ0gNCo2loqXgraDvIK6v5qjvOiAlcy4NCg0KLg0KOlNIRUxMX01JU1NJTkdfUEFSQU1FVEVSDQqS4KWh46Ws66kgr6DgoKyl4uAgruLh4+Lh4qLjpeIuDQoNCi4NCjpTSEVMTF9DTURfQ0hESVJfRVJST1INCo2loq6nrK6mra4g4aylraji7CCtoDogJXMuDQoNCi4NCjpTSEVMTF9DTURfQ0hESVJfSElOVA0KhKvvIK+l4KWqq+7npa2o7yCtoCCk4OOjrqkgpKjhqiCioqWkqOKlIBtbMzFtJWM6G1swbQ0KDQouDQo6U0hFTExfQ01EX0NIRElSX0hJTlRfMg0KiKzvIKSo4KWq4q7gqKggpKuora2lpSA4IOGorKKuq66iIKgvqKuoIOGupKXgpqjiIK/grqGlq+suDQqPrq/grqHjqeKlIBtbMzFtY2QgJXMbWzBtDQoNCi4NCjpTSEVMTF9DTURfQ0hESVJfSElOVF8zDQqC6yCi4aUgpemlIK2gIKSo4aqlIFo6LCCvpeClqqvu56jipeHsIK2gIOGsrq3iqOCuoqCtreupIKSo4aog4SCvrqyu6ezuIBtbMzFtQzobWzBtLg0KDQouDQo6U0hFTExfQ01EX01LRElSX0VSUk9SDQqNpaKup6yupq2uIOGup6Sg4uw6ICVzLg0KDQouDQo6U0hFTExfQ01EX1JNRElSX0VSUk9SDQqNpaKup6yupq2uIOOkoKuo4uwgpKjgpariruCo7jogJXMuDQoNCi4NCjpTSEVMTF9DTURfREVMX0VSUk9SDQqNpaKup6yupq2uIOOkoKuo4uw6ICVzLg0KDQouDQo6U0hFTExfU1lOVEFYRVJST1INCpGoreKgquGo4SCqrqygraTrIK2loqXgpa0uDQoNCi4NCjpTSEVMTF9DTURfU0VUX05PVF9TRVQNCo+l4KWspa2toO8grqrg46alrajvICVzIK2lIK6v4KWkpaulraAuDQoNCi4NCjpTSEVMTF9DTURfU0VUX09VVF9PRl9TUEFDRQ0KjuHioKuu4ewgraWkruHioOKu562uIKyl4eKgIKSr7yCvpeClrKWtrevlIK6q4OOmpa2o7y4NCg0KLg0KOlNIRUxMX0NNRF9JRl9FWElTVF9NSVNTSU5HX0ZJTEVOQU1FDQpJRiBFWElTVDogjuLh4+Lh4qLjpeIgqKzvIOSgqaugLg0KDQouDQo6U0hFTExfQ01EX0lGX0VSUk9STEVWRUxfTUlTU0lOR19OVU1CRVINCklGIEVSUk9STEVWRUw6II7i4ePi4eKi46XiIK2urKXgLg0KDQouDQo6U0hFTExfQ01EX0lGX0VSUk9STEVWRUxfSU5WQUxJRF9OVU1CRVINCklGIEVSUk9STEVWRUw6II2loqXgreupIK2urKXgLg0KDQouDQo6U0hFTExfQ01EX0dPVE9fTUlTU0lOR19MQUJFTA0KjaXiIKyl4qqoLCDhrq7ioqXi4eKi4+7ppakgqq6soK2kpSBHT1RPLg0KDQouDQo6U0hFTExfQ01EX0dPVE9fTEFCRUxfTk9UX0ZPVU5EDQpHT1RPOiCMpeKqoCAlcyCtpSCtoKmkpa2gLg0KDQouDQo6U0hFTExfQ01EX0ZJTEVfTk9UX0ZPVU5EDQqUoKmrICVzIK2lIK2gqaSlrS4NCg0KLg0KOlNIRUxMX0NNRF9GSUxFX0VYSVNUUw0KlKCpqyAlcyDjpqUg4ePppeHiouOl4i4NCg0KLg0KOlNIRUxMX0NNRF9ESVJfSU5UUk8NCpGupKXgpqisrqUgJXMuDQoNCi4NCjpTSEVMTF9DTURfRElSX0JZVEVTX1VTRUQNCiU1ZCCUoKmrKK6iKSAlMTdzIIGgqeIuDQoNCi4NCjpTSEVMTF9DTURfRElSX0JZVEVTX0ZSRUUNCiU1ZCCEqOClquKu4KipICAlMTdzIIGgqeIg4aKuoa6kra4uDQoNCi4NCjpTSEVMTF9FWEVDVVRFX0RSSVZFX05PVF9GT1VORA0KhKjhqiAlYyCNpSDh4+ml4eKi46XiIQ0KgusgpK6rpq3rIOGtoOegq6AgpaOuIOGsrq3iqOCuoqDi7CAbWzMxbW1vdW50G1swbS4NCoKipaSo4qUgG1sxOzMzbWludHJvG1swbSBia2IgG1sxOzMzbWludHJvIG1vdW50G1swbSCkq+8gr66r4+elrajvIKSur66rrajipavsra6pIKit5K7grKDmqKguDQoNCi4NCjpTSEVMTF9FWEVDVVRFX0lMTEVHQUxfQ09NTUFORA0KjaWipeCtoO8gqq6soK2koDogJXMuDQoNCi4NCjpTSEVMTF9DTURfUEFVU0UNCo2gpqyo4qUgq+6h4+4gqqugoqjo4yCkq+8gr+CupK6rpqWtqO8uDQoNCi4NCjpTSEVMTF9DTURfUEFVU0VfSEVMUA0KjqaopKCtqKUgrqStrqOuIK2gpqDiqO8gqqugoqjoqCCkq+8gr+CupK6rpqWtqO8uDQoNCi4NCjpTSEVMTF9DTURfQ09QWV9GQUlMVVJFDQqKrq+o4K6ioK2opSCtpSDjpKCrruHsIDogJXMuDQoNCi4NCjpTSEVMTF9DTURfQ09QWV9TVUNDRVNTDQogICAlZCCUoKmrKK6iKSDhqq6vqOCuoqCtri4NCg0KLg0KOlNIRUxMX0NNRF9TVUJTVF9OT19SRU1PVkUNCpOkoKulrailIKSo4aqgIK2lIK+upKSl4KaooqCl4uHvLiCNqOelo64graUgqKespa2lra4uDQoNCi4NCjpTSEVMTF9DTURfU1VCU1RfRkFJTFVSRQ0Kiq6soK2koCBTVUJTVCCtpSCi66+uq62lraAuIILrIOGkpaugq6ggruiooarjIKIgoqDopawgp6Cv4K7hpSCoq6gg46qgp6CtreupIKSo4aog46alIKjhr66r7KfjpeLh7y4gDQqI4a+uq+ynrqKg4uwgU1VCU1Qgoq6nrK6mra4g4q6r7KquIOEgrK6t4qjgrqKgra3rrKggpKjhqqCsqC4NCi4NCjpTSEVMTF9TVEFSVFVQX0JFR0lODQobWzQ0OzFtyc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nuw0KuiAbWzMybURPU0JveCBTaGVsbCB2JS04cxtbMzdtICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgug0KuiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgug0KuiCEq+8goevh4uCuo64goqKlpKWtqO8graCvpeeg4qCp4qU6IBtbMzNtSU5UUk8bWzM3bSAgICAgICAgICAgICAgICAgICAgICAgICAgILoNCroghKvvIK+upKSl4KaooqClrOvlIK6hrquu56quqSCqrqygraQgoqKlpKjipTogG1szM21IRUxQG1szN20gICAgICAgICAgICAgICAgICC6DQq6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICC6DQq6IJfirqHrIK+upOHi4K7i7CDhqq7gruHi7CwgraCmrKjipSAbWzMxbWN0cmwtRjExG1szN20gqCAbWzMxbWN0cmwtRjEyG1szN20uICAgICAgICAgICAgILoNCrogl+Kuoesgr6Xgpa2gp62g56ji7CCqq6CiqOioLCCtoKasqOKlIBtbMzFtY3RybC1GMRtbMzdtLiAgICAgICAgICAgICAgICAgICAgICC6DQq6IJfirqHrIOOnraDi7CChrqvs6KUsIK/grufiqOKlIOSgqasgG1szNm1SRUFETUUbWzM3bSCiIKSo4KWq4q7gqKggRE9TQm94LiAgICAgug0KuiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgug0KDQouDQo6U0hFTExfU1RBUlRVUF9DR0ENCrogRE9TQm94IOCgoa7ioKXiIKIg4KWmqKylIENvbXBvc2l0ZSBDR0EuICAgICAgICAgICAgICAgICAgICAgICAgICAgILoNCrogiOGvrqvsp+Op4qUgG1szMW0oYWx0LSlGMTEbWzM3bSCkq+8gqKespa2lrajvIOaipeKuoiCiIO3irqwg4KWmqKylLiAgICAgICAgICC6DQq6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICC6DQoNCi4NCjpTSEVMTF9TVEFSVFVQX0hFUkMNCroghKvvIK/gpaqr7uelrajvIKylpqTjIKGlq+usL++t4qDgreusL6elq/Gt66wg5qKl4q6sIK2gpqyo4qUgG1szMW1GMTEbWzM3bS4gICC6DQq6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICC6DQoNCi4NCjpTSEVMTF9TVEFSVFVQX0RFQlVHDQq6II2gpqyo4qUgG1szMW1hbHQtUGF1c2UbWzM3bSCkq+8gouWupKAgoiCu4qugpOeoqiCoq6ggp6Cv4+HiqOKlIGV4ZSAgICAgICAgICAgug0KuiDhIK+g4KCspeLgrqwgG1szM21ERUJVRxtbMzdtLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgug0KuiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgug0KDQouDQo6U0hFTExfU1RBUlRVUF9FTkQNCrogG1szMm2NoOGroKakoKnipeHsIRtbMzdtICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICC6DQq6IBtbMzJtiq6soK2koCBET1NCb3ggG1szM21odHRwOi8vd3d3LmRvc2JveC5jb20bWzM3bSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICC6DQrIzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc28G1swbQ0KDQouDQo6U0hFTExfQ01EX0NIRElSX0hFTFANCo7irqHgoKagpeIvqKespa3vpeIg4qWq4+nj7iCkqOClquKu4KjuLg0KDQouDQo6U0hFTExfQ01EX0NIRElSX0hFTFBfTE9ORw0KQ0hESVIgW6HjqqKgLaSo4aqgOl1br+Pi7F0NCkNIRElSIFsuLl0NCkNEIFuh46qioC2kqOGqoDpdW6/j4uxdDQpDRCBbLi5dDQoNCiAgLi4gICCTqqCn66KgpeIgraAg4q4sIOfiriCi6yDlruKo4qUgr6XgpaniqCCtoCDj4K6ipa3sIKLr6KUuDQoNCoKipaSo4qUgQ0QgoeOqoqAtpKjhqqA6IOfirqHrIK7irqHgoKeo4uwg4qWq4+nj7iCkqOClquKu4KjuIKIg46qgp6Ctra6sIKSo4aqlLg0KgqKlpKjipSBDRCChpacgr6DgoKyl4uCuoiwg5+KuoesgruKuoeCgp6ji7CDiparj6ePuIKHjqqLjIKSo4aqgIKggr+Pi7C4NCg0KLg0KOlNIRUxMX0NNRF9DTFNfSEVMUA0Kjueo4eKqoCDtquCgraAuDQoNCi4NCjpTSEVMTF9DTURfRElSX0hFTFANCo/gruGsruLgIKSo4KWq4q7gqKguDQoNCi4NCjpTSEVMTF9DTURfRUNIT19IRUxQDQqC66KupKjiIOGurqHppa2o7yCoIKKqq+7noKXiL6Lrqqvu56Cl4iCu4q6h4KCmpa2opSCqrqygraQuDQoNCi4NCjpTSEVMTF9DTURfRVhJVF9IRUxQDQqC6+WupCCopyCuoa6rrueqqC4NCg0KLg0KOlNIRUxMX0NNRF9IRUxQX0hFTFANCo+uqqCnoOLsIK+urK7p7C4NCg0KLg0KOlNIRUxMX0NNRF9NS0RJUl9IRUxQDQqRrqekoOLsIKSo4KWq4q7gqO4uDQoNCi4NCjpTSEVMTF9DTURfTUtESVJfSEVMUF9MT05HDQpNS0RJUiBboeOqoqAtpKjhqqA6XVuv4+LsXQ0KTUQgW6HjqqKgLaSo4aqgOl1br+Pi7F0NCg0KLg0KOlNIRUxMX0NNRF9STURJUl9IRUxQDQqTpKCrqOLsIKSo4KWq4q7gqO4uDQoNCi4NCjpTSEVMTF9DTURfUk1ESVJfSEVMUF9MT05HDQpSTURJUiBboeOqoqAtpKjhqqA6XVuv4+LsXQ0KUkQgW6HjqqKgLaSo4aqgOl1br+Pi7F0NCg0KLg0KOlNIRUxMX0NNRF9TRVRfSEVMUA0KiKespa2o4uwgr6Xgpaylra3rpSDh4KWk6y4NCg0KLg0KOlNIRUxMX0NNRF9JRl9IRUxQDQqT4auuoq2upSCi66+uq62lrailIKIgr6CqpeKt6+Ug5KCpq6DlLg0KDQouDQo6U0hFTExfQ01EX0dPVE9fSEVMUA0Kj6XgpaniqCCtoCDhrqSl4Kag6ePuIKyl4qrjIOHi4K6q4yCiIK+gqqXira6sIOSgqaulLg0KDQouDQo6U0hFTExfQ01EX1NISUZUX0hFTFANCpGkoqit4+LsIK+g4KCspeLg6yCqrqygraStrqkg4eLgrqqoIKIgr6CqpeKtrqwg5KCpq6UuDQoNCi4NCjpTSEVMTF9DTURfVFlQRV9IRUxQDQqO4q6h4KCnqOLsIOGupKXgpqisrqUg4qWq4eKuoq6jriDkoKmroC4NCg0KLg0KOlNIRUxMX0NNRF9UWVBFX0hFTFBfTE9ORw0KVFlQRSBboeOqoqAtpKjhqqA6XVuv4+LsXVuorO8t5KCpq6BdDQoNCi4NCjpTSEVMTF9DTURfUkVNX0hFTFANCoSuoaCiqOLsIKqurKylreKg4KioIKIgr6CqpeKt66kg5KCpqy4NCg0KLg0KOlNIRUxMX0NNRF9SRU1fSEVMUF9MT05HDQpSRU0gW6qurKylreKg4KipXQ0KDQouDQo6U0hFTExfQ01EX05PX1dJTEQNCp3iriCv4K7h4qDvIKKl4OGo7yCqrqygraTrLCCj4OOvr66i66Ug4aisoq6r6yCtpSCkrq/j4aqg7uLh7yENCg0KLg0KOlNIRUxMX0NNRF9SRU5BTUVfSEVMUA0Kj6Xgpaispa2uoqDi7CCupKitIKirqCCtpeGqrqvsqq4g5KCpq66iLg0KDQouDQo6U0hFTExfQ01EX1JFTkFNRV9IRUxQX0xPTkcNClJFTkFNRSBboeOqoqAtpKjhqqA6XVuv4+LsXais7y3koKmroDEgqKzvLeSgqaugMi4NClJFTiBboeOqoqAtpKjhqqA6XVuv4+LsXais7y3koKmroDEgqKzvLeSgqaugMi4NCg0KjqHgoOKo4qUgoq2orKCtqKUgLSCtpavsp+8g46qgp+uioOLsIK2uouupIKSo4aogqKuoIK/j4uwgr+CoIK+l4KWorKWtrqKgraioIOSgqaugLg0KDQouDQo6U0hFTExfQ01EX0RFTEVURV9IRUxQDQqTpKCrqOLsIK6kqK0gqKuoIK2l4aquq+yqriDkoKmrrqIuDQoNCi4NCjpTSEVMTF9DTURfQ09QWV9IRUxQDQqRqq6vqOCuoqDi7CDkoKmr6y4NCg0KLg0KOlNIRUxMX0NNRF9DQUxMX0hFTFANCoegr+PhqiCupK2uo64gr6CqpeKtrqOuIOSgqaugIKinIKTg46Ouo64uDQoNCi4NCjpTSEVMTF9DTURfU1VCU1RfSEVMUA0Kka6vruHioKKo4uwgoq3j4uClra3u7iCkqOClquKu4KjuIKSo4arjLg0KDQouDQo6U0hFTExfQ01EX0xPQURISUdIX0hFTFANCoego+DjpqCl4iCv4K6j4KCsrOMgoiCipeDlre7uIK+grO/i7C4gKOLgpaHjpeLh7yB4bXM9dHJ1ZSx1bWI9dHJ1ZSkNCg0KLg0KOlNIRUxMX0NNRF9DSE9JQ0VfSEVMUA0KjqaopKCtqKUgraCmoOKo7yCqq6CiqOioIKgg4+HioK2uoqqgIEVSUk9STEVWRUwuDQoNCi4NCjpTSEVMTF9DTURfQ0hPSUNFX0hFTFBfTE9ORw0KQ0hPSUNFIFsvQzqioOCooK3i610gWy9OXSBbL1NdIOKlquHiDQogIC9DWzpdY2hvaWNlcyAgLSAgk+HioK2goquooqCl4iCkruHi46+t66Ugqqvu56ggKK+uLeOsrqvnoK2o7jogeS9uKQ0KICAvTiAgLSAgjaUgruKuoeCgpqDi7CCioOCooK3i6yCiIKqurealIOHi4K6qqC4NCiAgL1MgIC0gIIKqq+7nqOLsIKKup6yupq2u4eLsIKLroa7goCDgpaOo4eLgrqegoqjhqKzr5SCioOCooK3irqIuDQogIOKlquHiICAtICCSparh4iwgqq7iruDrqSCh46Sl4iCi66KlpKWtIKIgqqDnpeHioqUgoq6v4K7hoC4NCg0KLg0KOlNIRUxMX0NNRF9BVFRSSUJfSEVMUA0KjajnpaOuIK2lIKSlq6Cl4i4gj66kpKXgpqiioKXi4e8gpKvvIOGuoqyl4eKorK7h4qguDQoNCi4NCjpTSEVMTF9DTURfUEFUSF9IRUxQDQqPrqSkpeCmqKKgpeLh7yCkq+8g4a6irKXh4qisruHiqC4NCg0KLg0KOlNIRUxMX0NNRF9WRVJfSEVMUA0Kj66qoKeg4uwgqKuoIKinrKWtqOLsIOGurqHpoKWs4+4goqXg4ajuIERPUy4NCg0KLg0KOlNIRUxMX0NNRF9WRVJfVkVSDQqCpeDhqO8gRE9TQm94ICVzLiCRrq6h6aClrKDvIKKl4OGo7yBET1M6ICVkLiUwMmQuDQoNCi4NCg==', 'base64');
  }

  /**
   * @return {string}
   */
  getLanguagePath() {
    let path = this.prefix.getDosboxRuLangFile();

    if (this.fs.exists(path)) {
      return path;
    }

    let language = this.getDefaultLanguage();

    this.fs.filePutContents(path, language);

    return path;
  }

  /**
   * @param {Config} config
   * @return {string}
   */
  getDosGamePath(config) {
    return this.convertPath(_.trim(this.prefix.getGamesFolder(), '/\\') + config.getGamePath());
  }

  /**
   * @param {Config} config
   * @return {string}
   */
  getDosGameExe(config) {
    return this.convertFilename(config.getGameExe());
  }

  /**
   * @param {string} path
   * @return {string}
   */
  convertPath(path) {
    path = _.trim(path, '/\\').split('/').join('\\');

    return path.split('\\').map(folder => {
      folder = folder.replaceAll(' ', '');

      if (8 >= folder.length) {
        return folder;
      }

      return folder.substr(0, 6) + '~1';
    }).join('\\');
  }

  /**
   * @param {string} filename
   * @return {string}
   */
  convertFilename(filename) {
    let ext    = '';
    let chunks = _.trim(filename, '/\\').split('.');

    ext = chunks[chunks.length - 1];

    delete chunks[chunks.length - 1];

    chunks = chunks.filter(n => undefined !== n);

    let name = chunks.join('.').replaceAll(' ', '');

    if (8 >= name.length) {
      return `${name}.${ext}`;
    }

    return `${name.substr(0, 6)}~1.${ext}`;
  }
}