<template>
    <div class="panel-group panel-group-joined" id="help">

        <div class="panel panel-default">
            <div class="panel-heading">
                <h4 class="panel-title">
                    <a data-toggle="collapse" data-parent="#help" href="#startGame">
                        Режимы запуска игры
                    </a>
                </h4>
            </div>
            <div id="startGame" class="panel-collapse collapse in">
                <div class="panel-body">
                    <table class="text-dark text-muted tr-title">
                        <tbody>
                        <tr>
                            <td>Стандартный</td>
                            <td>
                                Запускает игру в обычном режиме
                            </td>
                        </tr>
                        <tr>
                            <td>Показывать FPS</td>
                            <td>
                                Попытается отобразить счетчик FPS
                                <br>
                                <br>
                                Работает в нескольких вариантах:
                                <br>
                                1) Если активирован MangoHud, выводит через него.
                                <br>
                                2) Если не активирован MangoHud, но активирован DXVK, выводит через DXVK.
                                <br>
                                3) Если не активировано ни то ни второе, выводит через Gallium (видеокарты nvidia не
                                поддерживаются).
                            </td>
                        </tr>
                        <tr>
                            <td>Отладка</td>
                            <td>Режим отладки пишет более подробный лог который находится в директории
                                <code>./data/logs</code></td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>


        <div class="panel panel-default">
            <div class="panel-heading">
                <h4 class="panel-title">
                    <a data-toggle="collapse" data-parent="#help" href="#install" class="collapsed">
                        Как что-либо установить или внести изменения в префикс?
                    </a>
                </h4>
            </div>
            <div id="install" class="panel-collapse collapse">
                <div class="panel-body">
                    Все изменения префикса проводятся через <code>Инструменты > Патчи</code>
                    <br>
                    <br>
                    Например, чтобы установить игру необходимо:
                    <br>
                    1) Нажать <code>Создать новый патч > Сохранить</code>
                    <br>
                    2) В списке появится новый элемент на котором будет активна кнопка <code>Операции</code>, нажать её.
                    <br>
                    3) В появившейся форме выбрать <code>Действие > Установить приложение</code>
                    <br>
                    4) После окончания установки, снова нажать кнопку <code>Операции</code> и выбрать <code>Действие >
                    Сохранить изменения</code>
                    <br>
                    5) После сохранения, патч станет <span class="label label-success">зелёным</span>, готово.

                    <br>
                    <br>
                    Если игре требуются дополнительные пакеты, приложения или настройки, необходимо повторить процедуру
                    с созданием нового патча, до тех пор пока игра не станет работать идеально.

                    <br>
                    <br>
                    Все созданные патчи будут находиться в директории <code>./data/patches</code>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
    export default {
        name:       'Help',
        components: {},
        data() {
            return {};
        },
        mounted() {
        },
        methods:    {},
        computed:   {},
    }
</script>

<style lang="less" scoped>
    .tr-title td {
        &:first-child {
            font-weight: bold;
        }

        padding-right: 10px;
        vertical-align: top;
        padding-bottom: 10px;
        padding-top: 10px;
    }
</style>