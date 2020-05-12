<template>
    <div>
        <div class="card-box">
            <div class="panel-body">
                <h4>Wine Launcher</h4>
                <p class="text-muted">
                    Версия: {{version}}
                    <br>
                    <br>
                    Этот Open Source проект позволяет создавать контейнеризированный порт Windows приложения под Linux
                    системы.
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
                            <a class="link" @click.prevent="openUrl('https://discord.gg/M7WE4V')">
                                https://discord.gg/M7WE4V
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
                        <td>DonationAlerts</td>
                        <td>
                            <a class="link" @click.prevent="openUrl('https://www.donationalerts.com/r/winelauncher')">
                                https://www.donationalerts.com/r/winelauncher
                            </a>
                        </td>
                    </tr>

                    </tbody>
                </table>
            </div>
        </div>
        <div class="card-box">
            <div class="panel-body">
                <h4>Лицензионное соглашение</h4>
                <p class="text-muted">
                    Это некоммерческий публичный Open Source проект развиваемый за идею.
                    Автор не несет никакой ответственности за данное программное обеспечение.
                    Продолжая использовать это программное обеспечение вы автоматически соглашаетесь с вышеуказанными
                    условиями.
                </p>
            </div>
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