export default {
  app:         {
    'preloader':     'Подождите<br>Идёт инициализация...',
    'root-disabled': 'Запуск из-под пользователя root запрещён.',
    'unmount':       'Размонтирование',
    'in-progress':   'В процессе',
    'error':         'Ошибка',
    'success':       'Успешно',
    'warning':       'Предупреждение',
  },
  labels:      {
    'or':             'или',
    'state':          'Состояние',
    'status':         'Статус',
    'type':           'Тип',
    'active':         'Активен',
    'sort':           'Сортировка',
    'name':           'Название',
    'ready-to-build': 'Готов к сборке',
    'expectation':    'Ожидание',
    'packaged':       'Упакован',
    'not-packaged':   'Не упакован',
    'run':            'Запустить',
    'running':        'Выполняется...',
    'wait':           'Подождите...',
    'downloading':    'Скачивание...',
    'extracting':     'Извлечение...',
    'loading':        'Загрузка...',
    'edit':           'Изменить',
    'save':           'Сохранить',
    'add':            'Добавить',
    'share':          'Опубликовать',
    'execute':        'Выполнить',
    'yes':            'Да',
    'no':             'Нет',
    'cancel':         'Отмена',
    'close':          'Закрыть',
    'delete':         'Удалить',
    'size':           'Размер',
    'version':        'Версия',
    'arch':           'Архитектура',
    'folder':         'Папка',
    'action':         'Действие',
    'arguments':      'Аргументы',
    'example':        'Пример',
    'select-file':    'Выберите файл',
    'select-iso':     'Выберите образ',
    'library':        'Библиотека',
    'registration':   'Регистрация',
    'override':       'Переопределение',
    'resolution':     'Разрешение',
    'file-name':      'Имя файла',
    'update':         'Обновить',
    'console':        'Консоль',
    'select':         'Выбрать',
    'create':         'Создать',
    'more':           'Ещё',
    'incompatible':   'несовместим',
  },
  menu:        {
    'games':       'Игры',
    'prefix':      'Префикс',
    'settings':    'Настройки',
    'tools':       'Инструменты',
    'patches':     'Патчи',
    'packing':     'Упаковка',
    'build':       'Сборка',
    'diagnostics': 'Диагностика',
    'help':        'Помощь',
    'docs':        'Справка',
    'updates':     'Обновления',
    'about':       'О программе',
    'more':        'Ещё',
    'off-sounds':  'Выключить звуки',
    'on-sounds':   'Включить звуки',
    'quit':        'Выход',
    'kill-wine':   'Убить Wine',
    'icons':       'Ярлыки',
    'db':          'База Данных',
    'shared':      'Мои игры',
    'search':      'Найти игру',
    'my-patches':  'Мои патчи',
  },
  search:      {
    'not-found':      'Конфигураций не найдено',
    'not-found-desc': 'Создайте собственную конфигурацию и поделитесь с ней сообществом',
    'delete':         'Удаление из базы данных',
    'shared':         'Опубликовать "{name}" конфигурацию в базе данных?',
  },
  build:       {
    'run-build': 'Запустить сборку?',
  },
  patches:     {
    'add':               'Добавить в "Мои патчи"',
    'install':           'Добавить в "Патчи"',
    'install-and-apply': 'Применить в "Патчи"',
    'not-found':         'Патчи не найдены',
    'not-found-desc':    'Это общее хранилище готовых патчей между разными сборками WL которые хранятся в папке: <br><code>~/.local/share/wine-launcher</code><br>Добавляйте сюда патчи, чтобы создать коллекцию часто используемых патчей.',
  },
  game:        {
    'total-time':     'Время в игре',
    'stop':           'Завершить',
    'play':           'Играть',
    'running':        'Запускается...',
    'launch-mode':    'Режим запуска',
    'icon-create':    'Создать ярлык',
    'icon-remove':    'Удалить ярлык',
    'add-menu':       'Добавить в "Меню"',
    'add-desktop':    'Добавить на "Рабочий стол"',
    'icon-load':      'Добавьте в играх иконки',
    'icon-load-desc': 'Необходимо загрузить в играх иконки для использования данного функционала',
    'autostart':      'Автозапуск',
    'delete':         'Удаление игры',
  },
  pack:        {
    'unpack':       'Распаковать',
    'pack':         'Упаковать',
    'pack-to':      'Упаковать в "{file}" образ',
    'rw-dirs':      'RW директории',
    'rw-dirs-full': 'Read-Write директории',

    forms: {
      'info':      'Инфо',
      'item-info': `
<h4 class="text-center">По умолчанию упакованые игры, <u>не могут</u> писать в свои директории.</h4> <br>
<p class="text-dark text-center">
    Чтобы обойти это ограничение, необходимо <br>сконвертировать директории в символьные ссылки. <br><br>
    Чтобы это сделать выберите их во вкладке "RW директории".
</p>
`,
    }
  },
  patch:       {
    'create-patch':             'Создать новый патч',
    'operations':               'Операции',
    'settings':                 'Настройки патча',
    'creating-prefix-snapshot': 'Идёт создание снимка префикса.',
    'delete':                   'Удаление патча',
    forms:                      {
      'library':  'Библиотека будет скопирована в папку system32 или syswow64. Форматы: dll, ocx',
      'registry': 'Регистрация библиотеки через механизм regsvr32',
      'active':   'Применять этот патч при создании префикса?',
      'sort':     'Порядок в котором будут накладываться патчи, меньше - раньше, по умолчанию: 500',
      'name':     'Разрешены латинские буквы, цифры, а также "-", "_", "."',
    },
  },
  prefix:      {
    'system':            'системный',
    'glibc':             'Требуется версия Glibc >=',
    'add-game':          'Добавить новую игру',
    'missing-libs':      'Отсутствуют библиотеки',
    'wine-not-support':  'Префикс не совместим с текущим Wine!',
    'win64-not-support': 'Выбранный Wine не поддерживает 64 бита!',
    'settings-game':     'Настройки игры',
    'settings-prefix':   'Настройки префикса',
    'recreate':          'Пересоздать',
    'prefix':            'Префикс',
    'recreate-prefix':   'Пересоздать префикс?',
    'wine-update':       'Обновление Wine',
    'form-config':       {
      'main':                'Главные',
      'optimizations':       'Оптимизации',
      'tweaks':              'Твики',
      'forbid':              'Запретить',
      'run-in-window':       'Запускать в окне',
      'render-desc':         'Требуется для определения способа отображения счетчика FPS',
      'pulse-desc':          'Использовать PulseAudio, если установлен',
      'csmt-desc':           'Direct3D в отдельном потоке',
      'esync-desc':          'Синхронизация через файловые дескрипторы',
      'fsync-desc':          'Более быстрая синхронизация через файловые дескрипторы',
      'aco-desc':            'Использовать в драйвере RADV альтернативный компилятор шейдеров ACO',
      'gamemode-desc':       'Активирует оптимизации в ОС для максимальной производительности',
      'laa-desc':            'Выделять 32 битному приложению больше 2 Гб ОЗУ',
      'mangohud-dlsym-desc': 'Некоторым OpenGL играм это может понадобиться для правильной загрузки MangoHud',
      'use-wined3d':         'Использовать вместо него WineD3D (OpenGL) реализацию.',
      'forbidden-nvapi':     'Запретить NVAPI',
      'forbidden-libs':      'Запретить библиотеки',
      'forbidden-d3d9':      'Запретить D3D9',
      'forbidden-d3d10':     'Запретить D3D10',
      'forbidden-d3d11':     'Запретить D3D11',
      'game':                'Игра',
      'folder':              'Папка',
      'style':               'Оформление',
      'settings':            'Настройки',
      'game-name':           'Название игры',
      'game-version':        'Версия игры',
      'game-desc':           'Описание игры',
      'game-path':           'Путь до папки с ".exe" файлом внутри папки по умолчанию',
      'prefix-cmd':          'Префикс команда',
      'prefix-cmd-desc':     'Команда, которой будут переданы дальнейшие команды для запуска игры. Работают переменные из автозамены. Не забывайте брать пути до файлов в двойные кавычки.',
      'game-icon':           'Иконка',
      'game-icon-size':      'Размер иконки',
      'game-png-desc':       'В PNG формате',
      'game-png-icon-desc':  'В PNG или ICO формате',
      'background':          'Фон',
      'background-desc':     'В JPEG или PNG форматах',
      'ssm-desc':            'Увеличивает производительность на 5-10%',
      'swc-desc':            'Помогает обойти некоторые виды протекции в старых играх',
    },
    'form-prefix':       {
      'nocrashdialog':            'Не показывать диалоги с ошибками',
      'focus':                    'Требуется для игр, страдающих потерей фокуса',
      'cfc':                      'Проверка диапазона с плавающей точкой в шейдерах d3d9. Помогает отобразить невидимые объекты',
      'main':                     'Основное',
      'libs':                     'Библиотеки',
      'fixes':                    'Fixes',
      'system':                   'Система',
      'replace':                  'Автозамена',
      'path':                     'Папка с играми',
      'windows-version':          'Версия Windows',
      'sandbox-desc':             'Изолировать префикс от системы',
      'fixres':                   'Разрешение экрана',
      'fixres-desc':              'Восстанавливать разрешение экрана после завершения игры',
      'disable-effects':          'Отключать эффекты',
      'disable-effects-desc':     'Отключать эффекты рабочего стола во время игры. Поддерживаемые DE: plasma, mate, xfce, deepin.',
      'dxvk-desc':                'Ускорение dx9-11 игр через Vulkan',
      'update-dxvk-desc':         'Автообновление DXVK',
      'vkd3d-proton-desc':        'Ускорение dx12 игр через Vulkan',
      'update-vkd3d-proton-desc': 'Автообновление VKD3D Proton',
      'mangohud-desc':            'Красивый HUD для отображения FPS.\n[F12] - Показать/скрыть',
      'mf-desc':                  'Мультимедийный фреймворк (только для x86_64 префикса)',
      'vkbasalt-desc':            'Улучшение текстур в Vulkan играх.\n[HOME] - Включить/отключить',
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
    'to-install':         'Чтобы установить игру, создайте',
    'new-patch':          'новый патч',
    'and-select':         'и выберите',
    'operations-install': 'Операции > Установить приложение',
    'install-to-games':   'Уже установленные игры можно переместить в папку',
    'before-label':       'После установки создайте к игре',
    'label':              'ярлык',
    'more':               'Больше',
    'info':               'информации',
    'AppImageLauncher':   `
Обнаружено приложение:
<br>
<code>AppImageLauncher</code>
<br>
<br>
Данное приложение мешает правильной работе
<br>
<code>AppImage</code> приложений.
<br>
<br>
Удалите AppImageLauncher!
`,
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
            Продолжая использовать это программное обеспечение вы автоматически соглашаетесь с выше указанными условиями.
        `,
    'donate':    'Поддержать проект',
  },
  help:        {
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
                    <pre>#!/bin/bash

# ---------------------
# cd root game folder >
# ---------------------

cd -P -- "$(dirname -- "$0")"; cd ..

# ---------------------
# command before      >
# ---------------------

echo "Before command, current path: $(pwd)"


# ---------------------
# run game            >
# ---------------------

true "$(exec "$@")"

# ---------------------
# command after       >
# ---------------------

echo "After command"
</pre>
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
                            <td>Исполняемые файлы</td>
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
                                Дополнительные файлы, которые требуются библиотекам, например, <code>VkBasalt</code> здесь
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
                                Список директорий, которые будут вынесены из префикса, например папки, в которых лежат
                                сохранения и прочее.
                            </td>
                        </tr>
                        <tr>
                            <td><code>./data/saves/symlinks</code></td>
                            <td>
                                Папка, в которой будут храниться симлинки на файлы игры, если в настройках активирован RW
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
  },
  mangohud:    {
    'top-left':     'Сверху слева',
    'top-right':    'Сверху справа',
    'bottom-left':  'Внизу слева',
    'bottom-right': 'Внизу справа',
  },
};