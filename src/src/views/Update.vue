<template>
    <div>
        <div class="card-box">
            <div class="panel-body">
                <h4>Wine Launcher</h4>
                <template v-if="remote_version">
                    <p class="text-muted">
                    <span v-if="(remote_version === version)" class="label label-success">
                        Установлена последняя версия
                    </span>
                        <span v-else class="label label-warning">Найдены обновления</span>
                    </p>
                </template>
                <p class="text-muted">
                    Текущая версия: {{version}}
                    <br>

                    <template v-if="remote_version && (remote_version !== version)">
                        Актуальная версия: {{remote_version}}
                        <br>
                    </template>
                </p>
                <p class="text-muted">
                    GitHub: <a class="link" @click.prevent="openUrl('https://github.com/hitman249/wine-launcher')">https://github.com/hitman249/wine-launcher</a>
                </p>
            </div>
        </div>
        <div class="card-box" v-if="dxvk_enabled">
            <div class="panel-body">
                <h4>DXVK</h4>
                <template v-if="remote_dxvk_version">
                    <p class="text-muted">
                    <span v-if="(remote_dxvk_version === dxvk_version)" class="label label-success">
                        Установлена последняя версия
                    </span>
                        <span v-else class="label label-warning">Найдены обновления</span>
                    </p>
                </template>
                <p class="text-muted">
                    Текущая версия: {{dxvk_version}}
                    <br>

                    <template v-if="remote_dxvk_version && (remote_dxvk_version !== dxvk_version)">
                        Актуальная версия: {{remote_dxvk_version}}
                        <br>
                    </template>
                </p>
            </div>
        </div>
    </div>
</template>

<script>
    const { remote } = require('electron');

    export default {
        name:       'Update',
        components: {},
        data() {
            return {
                remote_version:      null,
                remote_dxvk_version: null,
            };
        },
        mounted() {
            window.app.getUpdate().getRemoteVersion().then((version) => {
                this.remote_version = version;
            });

            window.app.getDxvk().getRemoteVersion().then((version) => {
                this.remote_dxvk_version = version;
            });
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
            dxvk_enabled() {
                return window.app.getPrefix().isDxvk();
            },
            dxvk_version() {
                return window.app.getDxvk().getLocalVersion();
            },
        },
    }
</script>

<style lang="less" scoped>
    .link {
        cursor: pointer;
    }
</style>