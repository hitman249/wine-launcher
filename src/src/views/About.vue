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
            <td>YouTube</td>
            <td>
              <a class="link" @click.prevent="openUrl('https://www.youtube.com/channel/UCsET0u87mD1naQ7VPzScCBA')">
                https://www.youtube.com/channel/UCsET0u87mD1naQ7VPzScCBA
              </a>
            </td>
          </tr>

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
const {remote} = require('electron');

export default {
  name: 'About',
  components: {
    // Funding,
  },
  data() {
    return {};
  },
  mounted() {
  },
  methods: {
    openUrl(url) {
      remote.shell.openExternal(url);
    },
  },
  computed: {
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