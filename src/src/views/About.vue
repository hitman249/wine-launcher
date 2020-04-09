<template>
    <div class="card-box">
        <div class="panel-body">
            <h4>Wine Launcher</h4>
            <p class="text-muted">
                Версия: {{version}}
                <br>
                GitHub: <a class="link" @click.prevent="openUrl('https://github.com/hitman249/wine-launcher')">https://github.com/hitman249/wine-launcher</a>
            </p>
        </div>
    </div>
</template>

<script>
    const { remote } = require('electron');

    export default {
        name:       'About',
        components: {},
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
        },
    }
</script>

<style lang="less" scoped>
    .link {
        cursor: pointer;
    }
</style>