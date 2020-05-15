export default {
    app:         {
        'start-only-root': 'Run as root is prohibited.',
    },
    labels:      {
        'or':             'or',
        'state':          'State',
        'status':         'Status',
        'type':           'Type',
        'active':         'Active',
        'sort':           'Sort',
        'name':           'Name',
        'ready-to-build': 'Ready to build',
        'expectation':    'Wait',
        'packaged':       'Упакован',
        'not-packaged':   'Не упакован',
        'run':            'Run',
        'running':        'Running...',
        'wait':           'Wait...',
        'downloading':    'Downloading...',
        'extracting':     'Extracting...',
        'loading':        'Loading...',
        'edit':           'Edit',
        'save':           'Save',
        'yes':            'Yes',
        'no':             'No',
        'cancel':         'Cancel',
        'close':          'Close',
        'delete':         'Delete',
        'size':           'Size',
        'version':        'Version',
        'arch':           'Architecture',
        'folder':         'Folder',
        'action':         'Action',
        'arguments':      'Arguments',
        'example':        'Example',
        'select-file':    'Select file',
        'select-iso':     'Select iso',
        'library':        'Library',
        'registration':   'Registration',
        'override':       'Переопределение',
        'resolution':     'Разрешение',
        'file-name':      'File name',
        'update':         'Update',
        'console':        'Console',
        'select':         'Select',
    },
    menu:        {
        'games':       'Games',
        'prefix':      'Prefix',
        'settings':    'Settings',
        'tools':       'Tools',
        'patches':     'Patches',
        'packing':     'Packing',
        'build':       'Build',
        'diagnostics': 'Diagnostics',
        'help':        'Help',
        'docs':        'Docs',
        'updates':     'Updates',
        'about':       'About',
        'more':        'More',
        'off-sounds':  'Turn on sounds',
        'on-sounds':   'Turn off sounds',
        'quit':        'Exit',
    },
    build:       {
        'run-build': 'Run build?',
    },
    game:        {
        'total-time':  'Time in the game',
        'stop':        'Stop',
        'play':        'Play',
        'running':     'Running...',
        'launch-mode': 'Launch mode',
    },
    pack:        {
        'unpack':       'Unpack',
        'pack':         'Pack',
        'pack-to':      'Упаковать в "{file}" образ',
        'rw-dirs':      'RW directories',
        'rw-dirs-full': 'Read-Write directories',

        forms: {
            'info':      'Info',
            'item-info': `
<h4 class="text-center">By default, packaged games, <u>cannot</u> write to their directories.</h4> <br>
<p class="text-dark text-center">
    To get around this limitation, you need <br>to convert directories to symbolic links. <br><br>
    To do this, select them in the "RW directories" tab.
</p>
`,
        }
    },
    patch:       {
        'create-patch':             'Create a new patch',
        'operations':               'Operations',
        'settings':                 'Settings',
        'creating-prefix-snapshot': 'A prefix snapshot is being created.',
        'delete':                   'Remove patch',
        forms:                      {
            'library':  'The library will be copied to the system32 or syswow64 folder. Formats: dll, ocx',
            'registry': 'Library registration through the mechanism regsvr32',
            'active':   'Apply this patch when creating a prefix?',
            'sort':     'The order in which patches will be applied is less - earlier, by default: 500',
            'name':     'Allowed to use latin letters, numbers, and "-", "_", "."',
        },
    },
    prefix:      {
        'add-game':          'Add new game',
        'missing-libs':      'Missing Libraries',
        'wine-not-support':  'The prefix is not compatible with the current Wine!',
        'win64-not-support': 'Selected Wine does not support 64 bits!',
        'settings-game':     'Game settings',
        'settings-prefix':   'Prefix settings',
        'recreate':          'Recreate',
        'prefix':            'Prefix',
        'recreate-prefix':   'Recreate prefix?',
        'wine-update':       'Wine Update',
        'form-config':       {
            'main':                'Main',
            'optimizations':       'Optimizations',
            'tweaks':              'Tweaks',
            'forbid':              'Disabled',
            'run-in-window':       'Run in window',
            'render-desc':         'Required to determine how to display the FPS counter',
            'pulse-desc':          'Use PulseAudio if installed',
            'csmt-desc':           'Direct3D in a separate thread',
            'esync-desc':          'Synchronization through file descriptors',
            'fsync-desc':          'Improved synchronization trough file descriptors',
            'aco-desc':            'Use an alternative ACO shader compiler in the RADV driver',
            'laa-desc':            'Allocate to a 32-bit application more than 2 GB of RAM',
            'mangohud-dlsym-desc': 'Some OpenGL games may need this to load MangoHud properly',
            'use-wined3d':         'Use WineD3D (OpenGL) implementation instead.',
            'forbidden-nvapi':     'Disable NVAPI',
            'forbidden-libs':      'Disable libraries',
            'forbidden-d3d9':      'Disable D3D9',
            'forbidden-d3d10':     'Disable D3D10',
            'forbidden-d3d11':     'Disable D3D11',
            'game':                'Game',
            'folder':              'Folder',
            'style':               'Style',
            'settings':            'Settings',
            'game-name':           'Name of the game',
            'game-version':        'Game version',
            'game-desc':           'Game description',
            'game-path':           'The path to the folder with the ".exe" file inside the default folder',
            'prefix-cmd':          'Prefix command',
            'prefix-cmd-desc':     'Command to which further teams will be given to launch the game. AutoCorrect variables work. Do not forget to take the paths to files in double quotes.',
            'game-icon':           'Icon',
            'game-icon-size':      'Icon size',
            'game-icon-desc':      'In PNG format',
            'background':          'Background',
            'background-desc':     'In JPEG or PNG format',
        },
        'form-prefix':       {
            'nocrashdialog':        'Не показывать диалоги с ошибками',
            'focus':                'Требуется для игр страдающих потерей фокуса',
            'cfc':                  'Проверка диапазона с плавающей точкой в шейдерах d3d9. Помогает отобразить невидимые объекты',
            'main':                 'Основное',
            'libs':                 'Библиотеки',
            'fixes':                'Fixes',
            'system':               'Система',
            'replace':              'Автозамена',
            'path':                 'Папка с играми',
            'windows-version':      'Версия Windows',
            'sandbox-desc':         'Изолировать префикс от системы',
            'fixres':               'Разрешение экрана',
            'fixres-desc':          'Восстанавливать разрешение экрана после завершения игры',
            'disable-effects':      'Отключать эффекты',
            'disable-effects-desc': 'Отключать эффекты рабочего стола во время игры. Поддерживаемые DE: plasma, mate, xfce, deepin.',
            'dxvk-desc':            'Ускорение dx9-11 игр через Vulkan',
            'update-dxvk-desc':     'Автообновление DXVK',
            'mangohud-desc':        'Красивый HUD для отображения FPS\\n[F12] - Показать/скрыть',
            'vkbasalt-desc':        'Улучшение текстур в Vulkan играх\\n[HOME] - Включить/отключить',
        },
    },
    forms:       {
        'fill-section':       'Необходимо заполнить раздел',
        'validation-error':   'Ошибка валидации',
        'validation-success': 'Успешно сохранено',
    },
    collects:    {
        'standard':       'Стандартный',
        'fps':            'Показывать FPS',
        'debug':          'Отладка',
        'save':           'Сохранить изменения',
        'install':        'Установить приложение',
        'iso':            'Установить приложение из образа диска',
        'register':       'Регистрация библиотеки',
        'winetricks':     'Выполнить команду Winetricks',
        'cfg':            'Запустить Wine Config',
        'fm':             'Запустить Wine File Manager',
        'regedit':        'Запустить Wine Regedit',
        'builtin':        'Встроенная (Wine)',
        'native':         'Сторонняя (Windows)',
        'builtin-native': 'Встроенная, затем сторонняя',
        'native-builtin': 'Сторонняя, затем встроенная',
        'off':            'Отключить',
        'all':            'Все',
    },
    time:        {
        'h': 'ч.',
        'm': 'мин.',
        's': 'сек.',
    },
    home:        {
        'to-install':         'Чтобы установить игру создайте',
        'new-patch':          'новый патч',
        'and-select':         'и выберите',
        'operations-install': 'Операции > Установить приложение',
        'install-to-games':   'Уже установленные игры можно переместить в папку',
        'before-label':       'После установки создайте к игре',
        'label':              'ярлык',
        'more':               'Больше',
        'info':               'информации',
    },
    update:      {
        'latest':          'Установлена последняя версия',
        'found':           'Найдены обновления',
        'local-version':   'Текущая версия',
        'current-version': 'Актуальная версия',
        'download-update': 'скачать обновление',
    },
    diagnostics: {
        'copy-to-clipboard': 'скопировать в буфер обмена',
        'system':            'Система',
        'system-info':       'Информация о системном окружении.',
        'libs':              'Библиотеки',
        'libs-check':        'Проверка наличия необходимых библиотек.',
    },
    about:       {
        'desc':      'Этот Open Source проект позволяет создавать контейнеризированный порт Windows приложения под Linux системы.',
        'agreement': 'Лицензионное соглашение',
        'license':   `
            Это некоммерческий публичный Open Source проект развиваемый за идею.
            Автор не несет никакой ответственности за данное программное обеспечение.
            Продолжая использовать это программное обеспечение вы автоматически соглашаетесь с вышеуказаннымиусловиями.
        `,
    },
    help: {
        html: `
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
                    <a data-toggle="collapse" data-parent="#help" href="#vulkan" class="collapsed">
                        Моя видеокарта не поддерживает Vulkan, а в сборке используется DXVK
                    </a>
                </h4>
            </div>
            <div id="vulkan" class="panel-collapse collapse">
                <div class="panel-body">
                    Чтобы отключить использование DXVK:
                    <br>
                    <br>
                    1) Перейдите в <code>Префикс > Настройки > Prefix > Изменить > Библиотеки</code>
                    <br>
                    2) Снимите галочки с пунктов <code>DXVK</code>, <code>MangoHud</code>, <code>VkBasalt</code>
                    <br>
                    3) Перейдите в <code>Инструменты > Патчи > DXVK > Изменить</code>
                    <br>
                    4) Снимите галочку с пункта <code>Активен</code>
                    <br>
                    5) Перейдите в <code>Префикс > Настройки</code>
                    <br>
                    6) На элементе <code>Prefix</code> нажмите кнопку <code>Пересоздать</code>
                    <br>
                    7) Готово. В большинстве случаев этого хватает.
                    <br>
                    <br>

                    <div class="grid-structure">
                        <div class="grid-container">
                            В некоторых случаях после этого необходимо установить <code>DirectX</code>:
                            <br>
                            <br>
                            1) Перейдите в <code>Инструменты > Патчи > Создать новый патч > Название > "DirectX"</code>
                            > <code>Сохранить</code>
                            <br>
                            2) В списке патчей появится новый элемент <code>DirectX</code>, нажмите на нём <code>Операции</code>
                            <br>
                            3) Выберите <code>Действие > Выполнить команду Winetricks</code>
                            <br>
                            4) В поле <code>Аргументы</code>, впишите <code>directx9</code> или <code>d3dx9</code> >
                            <code>Сохранить</code>
                            <br>
                            Рекомендуется сначала попробовать первое, команды различаются тем, что directx9 - ставит
                            весь DirectX, а d3dx9 выдёргивает только библиотеки d3dx9_*.dll
                            <br>
                            5) В списке патчей снова найдите элемент <code>DirectX</code>, нажмите на нём
                            <code>Операции</code>
                            <br>
                            6) Выберите <code>Действие > Сохранить изменения</code> > <code>Сохранить</code>
                            <br>
                            7) Дождитесь завершения операции. Готово
                        </div>
                    </div>
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
                    1) Создать пустую директорию (желательно без пробелов и кириллицы в пути).
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
                    <a data-toggle="collapse" data-parent="#help" href="#script" class="collapsed">
                        Как запустить свой скрипт перед запуском игры?
                    </a>
                </h4>
            </div>
            <div id="script" class="panel-collapse collapse">
                <div class="panel-body">
                    Чтобы подключить <code>gamemode</code> либо свой скрипт, необходимо:
                    <br>
                    <br>
                    1) Перейти в <code>Префикс > Игры</code>
                    <br>
                    2) На нужной игре нажать <code>Изменить > Папка</code>
                    <br>
                    3) В данной вкладке в поле <code>Префикс команда</code> вписать путь до скрипта (в кавычках):
                    <br>
                    <code>"{ROOT_DIR}/bin/script"</code>
                    <br>
                    В поле также действуют все остальные переменные из <code>Автозамены</code>
                    <br>
                    4) Сохранить.
                    <br>
                    <br>
                    Теперь в папке <code>./bin</code> необходимо создать файл <code>script</code>, сделать исполняемым и
                    вставить в него:
                    <br>
                    <br>
                    <pre>#!/bin/sh
exec "$@"</pre>
                    <br>
                    Более детальный пример:
                    <br>
                    <br>
                    <pre>#!/bin/sh
LD_PRELOAD="\${LD_PRELOAD}:/usr/lib/libExample.so"
LD_LIBRARY_PATH="\${LD_LIBRARY_PATH}:/home/user/lib32"

exec env EXAMPLE=1 LD_LIBRARY_PATH="\${LD_LIBRARY_PATH}" LD_PRELOAD="\${LD_PRELOAD}" "$@"</pre>
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
        `,
    }
};
