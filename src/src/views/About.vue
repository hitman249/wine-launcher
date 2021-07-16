<template>
  <div>
    <div class="card-box">
      <div class="panel-body">
        <h4>Wine Launcher</h4>
        <p class="text-muted">
          {{ $t('labels.version') }}: {{ version }}
          <br>
          <br>
          {{ $t('about.desc') }}
          <br>
        </p><br>
        <table class="table table-no-bordered">
          <tbody>

          <tr>
            <td>GitHub</td>
            <td>
              <a class="link" @click.prevent="openUrl('https://github.com/hitman249/wine-launcher')">
                https://github.com/hitman249/wine-launcher
              </a>
            </td>
          </tr>
          <tr>
            <td>Discord</td>
            <td>
              <a class="link" @click.prevent="openUrl('https://discord.gg/pzZ5MaU')">
                https://discord.gg/pzZ5MaU
              </a>
            </td>
          </tr>

          <tr>
            <td>VK</td>
            <td>
              <a class="link" @click.prevent="openUrl('https://vk.com/winelauncher')">
                https://vk.com/winelauncher
              </a>
            </td>
          </tr>

          <tr>
            <td>YouTube</td>
            <td>
              <a class="link" @click.prevent="openUrl('https://www.youtube.com/channel/UCsET0u87mD1naQ7VPzScCBA')">
                https://www.youtube.com/channel/UCsET0u87mD1naQ7VPzScCBA
              </a>
            </td>
          </tr>

          <tr>
            <td>Donate</td>
            <td>
              <a class="link" @click.prevent="openUrl('https://www.donationalerts.com/r/winelauncher')">
                https://www.donationalerts.com/r/winelauncher
              </a>
            </td>
          </tr>

          <tr>
            <td colspan="2" style="padding: 10px 0;">
              <div class="progress progress-lg m-0">
                <div class="progress-bar progress-bar-success"
                     :style="{width: foundingPercent + '%'}"></div>
                <span class="progress__percent"></span>
                <span class="progress__busy">{{ foundingBalance }}$</span>
                <span class="progress__free">5000$</span>
              </div>
            </td>
          </tr>

          <!--                    <tr>-->
          <!--                        <td colspan="2">-->
          <!--                            <Funding :title="$t('about.donate')" description=""-->
          <!--                                     @click="openUrl('https://www.donationalerts.com/r/winelauncher')"/>-->
          <!--                        </td>-->
          <!--                    </tr>-->

          </tbody>
        </table>
      </div>
    </div>
    <div class="card-box">
      <div class="panel-body">
        <h4>{{ $t('about.agreement') }}</h4>
        <p class="text-muted">
          {{ $t('about.license') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
// import Funding from "../components/Funding/Funding";

const { remote } = require('electron');

export default {
  name:       'About',
  components: {
    // Funding,
  },
  data() {
    return {};
  },
  mounted() {
  },
  methods:    {
    openUrl(url) {
      remote.shell.openExternal(url);
    },
  },
  computed:   {
    version() {
      return window.app.getUpdate().getVersion();
    },
    foundingBalance() {
      return 16;
    },
    foundingPercent() {
      return Math.trunc(this.foundingBalance / 5000 * 100) || 1;
    }
  },
}
</script>

<style lang="less" scoped>
.link {
  cursor: pointer;
}

.progress {
  position: relative;
}

.progress__percent {
  position: absolute;
  color: #fff;
  text-align: center;
  display: block;
  width: 100%;
}

.progress__busy, .progress__free {
  position: absolute;
  color: #fff;
}

.progress__busy {
  left: 10px;
}

.progress__free {
  right: 10px;
}
</style>