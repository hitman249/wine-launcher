import Utils      from "./utils";
import FileSystem from "./file-system";
import AppFolders from "./app-folders";
import Prefix     from "./prefix";
import Network    from "./network";

export default class VkBasalt {

  /**
   * @type {string}
   */
  repo = 'https://api.github.com/repos/DadSchoorse/vkBasalt/releases/latest';

  /**
   * @type {string}
   */
  launcherRepo = 'https://raw.githubusercontent.com/hitman249/wine-launcher/master';

  /**
   * @type {string}
   */
  version = '0.3.2.4';

  /**
   * @type {AppFolders}
   */
  appFolders = null;

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
   * @param {AppFolders} appFolders
   * @param {Prefix} prefix
   * @param {FileSystem} fs
   * @param {Network} network
   */
  constructor(appFolders, prefix, fs, network) {
    this.appFolders = appFolders;
    this.prefix     = prefix;
    this.fs         = fs;
    this.network    = network;
  }

  /**
   * @return {Promise<void>}
   */
  update() {
    let promise = Promise.resolve();

    let implicitLayers = this.appFolders.getCacheImplicitLayerDir();
    let file32         = `${implicitLayers}/vkBasalt32.json`;
    let file64         = `${implicitLayers}/vkBasalt64.json`;
    let config         = this.appFolders.getVkBasaltConfFile();

    if (!this.fs.exists(implicitLayers)) {
      this.fs.mkdir(implicitLayers);
    }

    if (!this.prefix.isVkBasalt()) {
      return promise;
    }

    if (!this.fs.exists(config)) {
      this.fs.filePutContents(config, this.getConfig());
    }

    this.fs.filePutContents(file32, Utils.jsonEncode(this.getLayer32()));
    this.fs.filePutContents(file64, Utils.jsonEncode(this.getLayer64()));

    let win32 = this.prefix.getVkBasaltLibPath('win32');

    if (!this.fs.exists(win32)) {
      let filename = this.fs.basename(win32).replace('.so', '.tar.gz');

      promise = promise
        .then(() => this.network.downloadTarGz(
          this.launcherRepo + '/bin/libs/i386/' + filename,
          this.fs.dirname(win32) + '/' + filename
        ));
    }

    let win64 = this.prefix.getVkBasaltLibPath('win64');

    if (!this.fs.exists(win64)) {
      let filename = this.fs.basename(win64).replace('.so', '.tar.gz');

      promise = promise
        .then(() => this.network.downloadTarGz(
          this.launcherRepo + '/bin/libs/x86-64/' + filename,
          this.fs.dirname(win64) + '/' + filename
        ));
    }

    let share   = this.appFolders.getShareDir();
    let shaders = share + '/vkBasalt';

    if (!this.fs.exists(shaders)) {
      if (!this.fs.exists(share)) {
        this.fs.mkdir(share);
      }

      let filename = 'vkBasalt.tar.gz';

      promise = promise
        .then(() => this.network.downloadTarGz(
          this.launcherRepo + '/bin/share/' + filename,
          share + '/' + filename
        ));
    }

    return promise;
  }

  getLayer32() {
    return {
      "file_format_version": "1.0.0",
      "layer":               {
        "name":                   "VK_LAYER_VKBASALT_PostProcess32",
        "type":                   "GLOBAL",
        "library_path":           this.prefix.getVkBasaltLibPath('win32'),
        "api_version":            "1.2.136",
        "implementation_version": "1",
        "description":            "a post processing layer",
        "functions":              {
          "vkGetInstanceProcAddr": "vkBasalt_GetInstanceProcAddr",
          "vkGetDeviceProcAddr":   "vkBasalt_GetDeviceProcAddr"
        },
        "enable_environment":     {
          "ENABLE_VKBASALT": "1"
        },
        "disable_environment":    {
          "DISABLE_VKBASALT": "1"
        }
      }
    };
  }

  getLayer64() {
    return {
      "file_format_version": "1.0.0",
      "layer":               {
        "name":                   "VK_LAYER_VKBASALT_PostProcess64",
        "type":                   "GLOBAL",
        "library_path":           this.prefix.getVkBasaltLibPath('win64'),
        "api_version":            "1.2.136",
        "implementation_version": "1",
        "description":            "a post processing layer",
        "functions":              {
          "vkGetInstanceProcAddr": "vkBasalt_GetInstanceProcAddr",
          "vkGetDeviceProcAddr":   "vkBasalt_GetDeviceProcAddr"
        },
        "enable_environment":     {
          "ENABLE_VKBASALT": "1"
        },
        "disable_environment":    {
          "DISABLE_VKBASALT": "1"
        }
      }
    };
  }

  getConfig() {
    return `#effects is a colon seperated list of effect to use
#e.g.: effects = fxaa:cas
#effects will be run in order from left to right
#one effect can be run multiple times e.g. smaa:smaa:cas
#cas    - Contrast Adaptive Sharpening
#dls    - Denoised Luma Sharpening
#fxaa   - Fast Approximate Anti-Aliasing
#smaa   - Enhanced Subpixel Morphological Antialiasing
#lut    - Color LookUp Table
effects = cas

reshadeTexturePath = ${this.appFolders.getShareDir()}/vkBasalt/reshade-shaders/Textures
reshadeIncludePath = ${this.appFolders.getShareDir()}/vkBasalt/reshade-shaders/Shaders
depthCapture = off

#toggleKey toggles the effects on/off
toggleKey = Home

#casSharpness specifies the amount of sharpning in the CAS shader.
#0.0 less sharp, less artefacts, but not off
#1.0 maximum sharp more artefacts
#Everything in between is possible
#negative values sharpen even less, up to -1.0 make a visible difference
casSharpness = 0.4

#dlsSharpness specifies the amount of sharpening in the Denoised Luma Sharpening shader.
#Increase to sharpen details within the image.
#0.0 less sharp, less artefacts, but not off
#1.0 maximum sharp more artefacts
dlsSharpness = 0.5

#dlsDenoise specifies the amount of denoising in the Denoised Luma Sharpening shader.
#Increase to limit how intensely film grain within the image gets sharpened.
#0.0 min
#1.0 max
dlsDenoise = 0.17

#fxaaQualitySubpix can effect sharpness.
#1.00 - upper limit (softer)
#0.75 - default amount of filtering
#0.50 - lower limit (sharper, less sub-pixel aliasing removal)
#0.25 - almost off
#0.00 - completely off
fxaaQualitySubpix = 0.75

#fxaaQualityEdgeThreshold is the minimum amount of local contrast required to apply algorithm.
#0.333 - too little (faster)
#0.250 - low quality
#0.166 - default
#0.125 - high quality 
#0.063 - overkill (slower)
fxaaQualityEdgeThreshold = 0.125

#fxaaQualityEdgeThresholdMin trims the algorithm from processing darks.
#0.0833 - upper limit (default, the start of visible unfiltered edges)
#0.0625 - high quality (faster)
#0.0312 - visible limit (slower)
#Special notes: due to the current implementation you
#Likely want to set this to zero.
#As colors that are mostly not-green
#will appear very dark in the green channel!
#Tune by looking at mostly non-green content,
#then start at zero and increase until aliasing is a problem.
fxaaQualityEdgeThresholdMin = 0.0312

#smaaEdgeDetection changes the edge detection shader
#luma  - default
#color - might catch more edges, but is more expensive
smaaEdgeDetection = luma

#smaaThreshold specifies the threshold or sensitivity to edges
#Lowering this value you will be able to detect more edges at the expense of performance.
#Range: [0, 0.5]
#0.1 is a reasonable value, and allows to catch most visible edges.
#0.05 is a rather overkill value, that allows to catch 'em all.
smaaThreshold = 0.05

#smaaMaxSearchSteps specifies the maximum steps performed in the horizontal/vertical pattern searches
#Range: [0, 112]
#4  - low
#8  - medium
#16 - high
#32 - ultra
smaaMaxSearchSteps = 32

#smaaMaxSearchStepsDiag specifies the maximum steps performed in the diagonal pattern searches
#Range: [0, 20]
#0  - low, medium
#8  - high
#16 - ultra
smaaMaxSearchStepsDiag = 16

#smaaCornerRounding specifies how much sharp corners will be rounded
#Range: [0, 100]
#25 is a reasonable value
smaaCornerRounding = 25

#lutFile is the path to the LUT file that will be used
#supported are .CUBE files and .png with width == height * height
#lutFile = "/path/to/lut"
`;
  }
}