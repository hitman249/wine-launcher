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
                            <td>
                                Режим отладки пишет более подробный лог который находится в директории
                                <code>./data/logs</code>
                            </td>
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


        <div class="panel panel-default">
            <div class="panel-heading">
                <h4 class="panel-title">
                    <a data-toggle="collapse" data-parent="#help" href="#start" class="collapsed">
                        Как создать новый порт игры имея только файл start?
                    </a>
                </h4>
            </div>
            <div id="start" class="panel-collapse collapse">
                <div class="panel-body">
                    Чтобы развернуть новый инстанс, вам необходимо:
                    <br>
                    <br>
                    1) Создать пустую директорию (желательно без пробелов и кириллице в пути).
                    <br>
                    2) Положить туда файл <code>start</code> и запустить двойным кликом.
                    <br>
                    3) После того как лаунчер проинициализируется, закрыть его.
                    <br>
                    4) Перенести файл <code>start</code> в появившуюся папку <code>./bin</code>
                    <br>
                    <br>
                    <br>
                    Общие рекомендации:
                    <br>
                    <br>
                    - Всегда упаковывайте <code>wine</code>, это никак не влияет на производительность, но экономит кучу
                    места.
                    <br>
                    <br>
                    - Если вы хотите использовать сторонний <code>wine</code>, просто скопируйте его в корневую
                    директорию, которая содержит папки <code>./bin</code>, <code>./data</code>, <code>./prefix</code>,
                    в новую папку под именем <code>./wine</code>.
                    <br>
                    При этом файла <code>wine.squashfs</code> там быть не должно, т.к. он имеет более высокий приоритет,
                    если файл есть удалите.
                </div>
            </div>
        </div>


        <div class="panel panel-default">
            <div class="panel-heading">
                <h4 class="panel-title">
                    <a data-toggle="collapse" data-parent="#help" href="#tree" class="collapsed">
                        Описание структуры папок
                    </a>
                </h4>
            </div>
            <div id="tree" class="panel-collapse collapse">
                <div class="panel-body">
                    <table class="text-dark text-muted tr-title">
                        <tbody>
                        <tr>
                            <td><code>./bin</code></td>
                            <td>Испольняемые файлы</td>
                        </tr>
                        <tr>
                            <td>
                                <code>./bin/libs/i386</code>,
                                <br>
                                <code>./bin/libs/x86-64</code>
                            </td>
                            <td>
                                Библиотеки.
                                <br>
                                Библиотеки которые просит <code>wine</code> сюда также можно складывать.
                            </td>
                        </tr>
                        <tr>
                            <td><code>./bin/share</code></td>
                            <td>
                                Дополнительные файлы которые требуются библиотекам, например <code>VkBasalt</code> здесь
                                хранит шейдеры.
                            </td>
                        </tr>
                        <tr>
                            <td><code>./data/cache</code></td>
                            <td>Временные файлы</td>
                        </tr>
                        <tr>
                            <td><code>./data/configs</code></td>
                            <td>Конфигурационные файлы</td>
                        </tr>
                        <tr>
                            <td><code>./data/games</code></td>
                            <td>Папка для хранения игр, она автоматически пробрасывается симлинком в префикс.</td>
                        </tr>
                        <tr>
                            <td><code>./data/games/_symlinks</code></td>
                            <td>
                                Папка для хранения оригинальных файлов, если в настройках активирован RW режим игры в
                                <code>Упаковке</code>.
                            </td>
                        </tr>
                        <tr>
                            <td><code>./data/logs</code></td>
                            <td>Логи</td>
                        </tr>
                        <tr>
                            <td><code>./data/patches</code></td>
                            <td>Патчи</td>
                        </tr>
                        <tr>
                            <td><code>./data/saves/folders.json</code></td>
                            <td>
                                Список директорий которые будут вынесены из префикса, например папки в которых лежат
                                сохранения и прочее.
                            </td>
                        </tr>
                        <tr>
                            <td><code>./data/saves/symlinks</code></td>
                            <td>
                                Папка в которой будут храниться симлинки на файлы игры, если в настройках активирован RW
                                режим игры в <code>Упаковке</code>.
                            </td>
                        </tr>
                        <tr>
                            <td><code>./prefix</code></td>
                            <td>Префикс <code>wine</code></td>
                        </tr>
                        <tr>
                            <td><code>./wine</code></td>
                            <td>Wine</td>
                        </tr>
                        </tbody>
                    </table>
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