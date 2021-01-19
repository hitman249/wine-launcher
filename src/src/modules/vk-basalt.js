import Utils      from "./utils";
import FileSystem from "./file-system";
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
  version = '0.3.1';

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
   * @return {Promise<void>}
   */
  update() {
    let promise = Promise.resolve();

    let implicitLayers = this.prefix.getCacheImplicitLayerDir();
    let file32         = `${implicitLayers}/vkBasalt32.json`;
    let file64         = `${implicitLayers}/vkBasalt64.json`;
    let config         = this.prefix.getVkBasaltConfFile();

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

    let share   = this.prefix.getShareDir();
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
        "api_version":            "1.1.125",
        "implementation_version": "1",
        "description":            "a post process layer",
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
        "api_version":            "1.1.125",
        "implementation_version": "1",
        "description":            "a post process layer",
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
#fxaa   - Fast Approximate Anti-Aliasing
#smaa   - Enhanced Subpixel Morphological Antialiasing
#deband - Effects against banding artefacts
#lut    - color LookUp Table
effects = cas

reshadeTexturePath = ${this.prefix.getShareDir()}/vkBasalt/reshade-shaders/Textures
reshadeIncludePath = ${this.prefix.getShareDir()}/vkBasalt/reshade-shaders/Shaders

#depthCapture = off


#casSharpness specifies the amount of sharpning in the CAS shader.
#0.0 less sharp, less artefacts, but not off
#1.0 maximum sharp more artefacts
#Everything in between is possible
#negative values sharpen even less, up to -1.0 make a visible difference
casSharpness = 0.4


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

#debandAvgdiff is the average threshold
#Threshold for the difference between the average of reference pixel values and the original pixel value.
#Higher numbers increase the debanding strength but progressively diminish image details. In pixel shaders a 8-bit color step equals to 1.0/255.0
#0.6 - low
#1.8 - medium
#3.4 - high
debandAvgdiff = 1.8

#debandMaxdiff is the maximum threshold
#Threshold for the difference between the maximum difference of one of the reference pixel values and the original pixel value.
#Higher numbers increase the debanding strength but progressively diminish image details. In pixel shaders a 8-bit color step equals to 1.0/255.0
#1.9 - low
#4.0 - medium
#6.8 - high
debandMaxdiff = 4.0

#debandMiddiff  is the middle threshold
#Threshold for the difference between the average of diagonal reference pixel values and the original pixel value.
#Higher numbers increase the debanding strength but progressively diminish image details. In pixel shaders a 8-bit color step equals to 1.0/255.0
#1.2 - low
#2.0 - medium
#3.3 -high
debandMiddiff = 2.0

#debandRange is the inital radius
#The radius increases linearly for each iteration.
#A higher radius will find more gradients, but a lower radius will smooth more aggressively.
#Range: [0.0, 32.0]
debandRange = 24.0

#debandIterations is the number of steps
#The number of debanding steps to perform per sample.
#Each step reduces a bit more banding, but takes time to compute.
#Range: [1, 4]
debandIterations = 1

#lutFile is the path to the LUT file that will be used
#supported are .CUBE files and .png with width == height * height
#the path should not include spaces
#lutFile = /path/to/lut/without/spaces
`;
  }
}