export default {
    app:         {
        'preloader':     'Wait<br>Initialization in progress...',
        'root-disabled': 'Run as root is prohibited.',
        'unmount':       'Unmount',
        'in-progress':   'In progress',
        'error':         'Error',
        'success':       'Success',
        'warning':       'Warning',
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
        'packaged':       'Packaged',
        'not-packaged':   'Not packaged',
        'run':            'Run',
        'running':        'Running...',
        'wait':           'Wait...',
        'downloading':    'Downloading...',
        'extracting':     'Extracting...',
        'loading':        'Loading...',
        'edit':           'Edit',
        'save':           'Save',
        'execute':        'Execute',
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
        'select-iso':     'Select disk image',
        'library':        'Library',
        'registration':   'Registration',
        'override':       'Override',
        'resolution':     'Screen resolution',
        'file-name':      'File name',
        'update':         'Update',
        'console':        'Console',
        'select':         'Select',
        'create':         'Create',
        'more':           'More',
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
        'off-sounds':  'Turn off sounds',
        'on-sounds':   'Turn on sounds',
        'quit':        'Exit',
        'kill-wine':   'Kill Wine',
        'icons':       'Shortcuts',
    },
    build:       {
        'run-build': 'Run build?',
    },
    game:        {
        'total-time':     'Total time',
        'stop':           'Stop',
        'play':           'Play',
        'running':        'Running...',
        'launch-mode':    'Launch mode',
        'icon-create':    'Create shortcut',
        'icon-remove':    'Remove shortcut',
        'add-menu':       'Add to menu',
        'add-desktop':    'Add to desktop',
        'icon-load':      'Add icons in games',
        'icon-load-desc': 'You need to load icons in games to use this functionality',
        'autostart':      'Autostart',
    },
    pack:        {
        'unpack':       'Unpack',
        'pack':         'Pack',
        'pack-to':      'Pack in "{file}" image',
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
            'gamemode-desc':       'Activates OS optimizations for maximum performance',
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
            'game-name':           'Game name',
            'game-version':        'Game version',
            'game-desc':           'Game description',
            'game-path':           'The path to the folder with the ".exe" file inside the default folder',
            'prefix-cmd':          'Prefix command',
            'prefix-cmd-desc':     'Command to which further teams will be given to launch the game. Auto replace variables work. Do not forget to take the paths to files in double quotes.',
            'game-icon':           'Icon',
            'game-icon-size':      'Icon size',
            'game-icon-desc':      'In PNG format',
            'background':          'Background',
            'background-desc':     'In JPEG or PNG format',
        },
        'form-prefix':       {
            'nocrashdialog':        'Do not show error dialogs',
            'focus':                'Required for games with focus loss',
            'cfc':                  'Checking the floating point range in d3d9 shaders. Helps display invisible objects',
            'main':                 'Main',
            'libs':                 'Libraries',
            'fixes':                'Fixes',
            'system':               'System',
            'replace':              'Auto replace',
            'path':                 'Games folder',
            'windows-version':      'Windows version',
            'sandbox-desc':         'Isolate Prefix from System',
            'fixres':               'Restore resolution',
            'fixres-desc':          'Restore screen resolution after completion of the game',
            'disable-effects':      'Disable effects',
            'disable-effects-desc': 'Disable desktop effects during the game. Supported DE: plasma, mate, xfce, deepin.',
            'dxvk-desc':            'Speeding up dx9-11 games through Vulkan',
            'update-dxvk-desc':     'Auto update DXVK',
            'mangohud-desc':        'Beautiful HUD to display FPS\n[F12] - Show / Hide',
            'vkbasalt-desc':        'Texture Improvement in Vulkan Games\n[HOME] - Enable / Disable',
        },
    },
    forms:       {
        'fill-section':       'It is necessary to fill in the section',
        'validation-error':   'Validation error',
        'validation-success': 'Saved successfully',
    },
    collects:    {
        'standard':       'Standard',
        'fps':            'Show FPS',
        'debug':          'Debug',
        'save':           'Save changes',
        'install':        'Install application',
        'iso':            'Install application from disk image',
        'register':       'Library registration',
        'winetricks':     'Run command Winetricks',
        'cfg':            'Run Wine Config',
        'fm':             'Run Wine File Manager',
        'regedit':        'Run Wine Regedit',
        'builtin':        'Builtin (Wine)',
        'native':         'Native (Windows)',
        'builtin-native': 'Builtin then Native',
        'native-builtin': 'Native then Builtin',
        'off':            'Disable',
        'all':            'All',
    },
    time:        {
        'h': 'h',
        'm': 'm',
        's': 's',
    },
    home:        {
        'to-install':         'To install the game, create',
        'new-patch':          'new patch',
        'and-select':         'and select',
        'operations-install': 'Operations > Install application',
        'install-to-games':   'Already installed games can be moved to the folder',
        'before-label':       'After installation, create for the game',
        'label':              'label',
        'more':               'More',
        'info':               'info',
        'AppImageLauncher':   `
App detected:
<br>
<code>AppImageLauncher</code>
<br>
<br>
This application interferes with the proper operation of
<br>
<code>AppImage</code> applications.
<br>
<br>
Remove AppImageLauncher!
`,
    },
    update:      {
        'latest':          'Latest version installed',
        'found':           'Updates found',
        'local-version':   'Local version',
        'current-version': 'Current version',
        'download-update': 'download update',
    },
    diagnostics: {
        'copy-to-clipboard': 'copy to clipboard',
        'system':            'System',
        'system-info':       'Information about the system environment.',
        'libs':              'Libraries',
        'libs-check':        'Checking the availability of the required libraries.',
    },
    about:       {
        'desc':      'This Open Source project allows you to create a containerized port of Windows applications for Linux systems.',
        'agreement': 'License agreement',
        'license':   `
            This is a not commercial public Open Source project developed for the idea.
            The author assumes no responsibility for this software.
            By continuing to use this software, you automatically agree to the above conditions.
        `,
        'donate': 'Support the project',
    },
    help:        {
        html: `
        <div class="panel panel-default">
            <div class="panel-heading">
                <h4 class="panel-title">
                    <a data-toggle="collapse" data-parent="#help" href="#startGame">
                        Game launch modes
                    </a>
                </h4>
            </div>
            <div id="startGame" class="panel-collapse collapse in">
                <div class="panel-body">
                    <table class="text-dark text-muted tr-title">
                        <tbody>
                        <tr>
                            <td>Standard</td>
                            <td>
                                Runs the game normally
                            </td>
                        </tr>
                        <tr>
                            <td>Show FPS</td>
                            <td>
                                Will try to display the FPS counter
                                <br>
                                <br>
                                It works in several versions:
                                <br>
                                1) If MangoHud is activated, output through it.
                                <br>
                                2) If MangoHud is not activated, but DXVK is activated, outputs via DXVK.
                                <br>
                                3) If neither one nor the other is activated, displays via Gallium (nVidia video cards 
                                do not supported).
                            </td>
                        </tr>
                        <tr>
                            <td>Debug</td>
                            <td>
                                Debug mode writes a more detailed log which is located in the directory
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
                       My video card does not support Vulkan, and the assembly uses DXVK
                    </a>
                </h4>
            </div>
            <div id="vulkan" class="panel-collapse collapse">
                <div class="panel-body">
                    To disable the use of DXVK:
                    <br>
                    <br>
                    1) Go to <code>Prefix > Settings > Prefix > Edit > Libraries</code>
                    <br>
                    2) Uncheck items <code>DXVK</code>, <code>MangoHud</code>, <code>VkBasalt</code>
                    <br>
                    3) Go to <code>Tools > Patches > DXVK > Edit</code>
                    <br>
                    4) Uncheck <code>Active</code>
                    <br>
                    5) Go to <code>Prefix > Settings</code>
                    <br>
                    6) On the item <code>Prefix</code> click <code>Recreate</code>
                    <br>
                    7) Done. In most cases, this is enough.
                    <br>
                    <br>

                    <div class="grid-structure">
                        <div class="grid-container">
                            In some cases, after this it is necessary to establish <code>DirectX</code>:
                            <br>
                            <br>
                            1) Go to <code>Tools > Patches > Create a new patch > Name > "DirectX"</code>
                            > <code>Save</code>
                            <br>
                            2) A new item will appear in the patch list <code>DirectX</code>, click on it <code>Operations</code>
                            <br>
                            3) Select <code>Action > Run command Winetricks</code>
                            <br>
                            4) In the filed <code>Arguments</code>, write <code>directx9</code> or <code>d3dx9</code> >
                            <code>Save</code>
                            <br>
                            It is recommended to try the first directx9, the commands differ in what directx9 - puts
                            whole DirectX, and d3dx9 pulls out only libraries d3dx9_*.dll
                            <br>
                            5) In the patch list again find the item <code>DirectX</code>, click on it
                            <code>Operations</code>
                            <br>
                            6) Select <code>Action > Save changes</code> > <code>Save</code>
                            <br>
                            7) Wait for the operation to complete. Done
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <div class="panel panel-default">
            <div class="panel-heading">
                <h4 class="panel-title">
                    <a data-toggle="collapse" data-parent="#help" href="#install" class="collapsed">
                       How to install or make changes to the prefix?
                    </a>
                </h4>
            </div>
            <div id="install" class="panel-collapse collapse">
                <div class="panel-body">
                    All prefix changes are made through <code>Tools > Patches</code>
                    <br>
                    <br>
                    For example, to install the game you need:
                    <br>
                    <br>
                    1) Press <code>Create a new patch > Save</code>
                    <br>
                    2) A new element will appear in the list on which the button will be active <code>Operations</code>, press it.
                    <br>
                    3) In the form that appears, select <code>Action > Install application</code>
                    <br>
                    4) After the installation is completed, press the button again <code>Operations</code> and select <code>Action >
                    Save changes</code>
                    <br>
                    5) After saving, the patch will turn <span class="label label-success">green</span>, done.

                    <br>
                    <br>
                   If the game requires additional packages, applications or settings, you must repeat the procedure
                    with the creation of a new patch until the game works perfectly.

                    <br>
                    <br>
                    All created patches will be in the directory <code>./data/patches</code>
                </div>
            </div>
        </div>


        <div class="panel panel-default">
            <div class="panel-heading">
                <h4 class="panel-title">
                    <a data-toggle="collapse" data-parent="#help" href="#start" class="collapsed">
                        How to create a new game port with only a start file?
                    </a>
                </h4>
            </div>
            <div id="start" class="panel-collapse collapse">
                <div class="panel-body">
                    To deploy a new instance, you need to:
                    <br>
                    <br>
                    1) Create an empty directory (preferably without spaces).
                    <br>
                    2) Put the file there <code>start</code> and run double click.
                    <br>
                    3) After the launcher is initialized, close it.
                    <br>
                    4) Move the file <code>start</code> to the folder that appears <code>./bin</code>
                    <br>
                    <br>
                    <br>
                    General recommendations:
                    <br>
                    <br>
                    - Always pack <code>wine</code>, it doesn’t affect performance, but it saves a lot places.
                    <br>
                    <br>
                    - If you want to use a third-party <code>wine</code>, just copy it to the root the directory that 
                    contains the <code>./bin</code>, <code>./data</code>, <code>./prefix </code> folders, to a new 
                    folder under the name <code>./wine</code>.
                    <br>
                    In this case, the <code>wine.squashfs</code> file should not be there, because he has a higher 
                    priority, if there is a file, delete it.
                </div>
            </div>
        </div>


        <div class="panel panel-default">
            <div class="panel-heading">
                <h4 class="panel-title">
                    <a data-toggle="collapse" data-parent="#help" href="#script" class="collapsed">
                        How to run your script before starting the game?
                    </a>
                </h4>
            </div>
            <div id="script" class="panel-collapse collapse">
                <div class="panel-body">
                    To connect <code>gamemode</code> or your own script, you must:
                    <br>
                    <br>
                    1) Go to <code>Prefix > Games</code>
                    <br>
                    2) Click on the desired game <code>Change > Folder</code>
                    <br>
                    3) In this tab, in the <code>Prefix command</code> field, enter the path to the script (in quotation marks):
                    <br>
                    <code>"{ROOT_DIR}/bin/script"</code>
                    <br>
                    All other variables from <code>Auto replace</code>
                    <br>
                    4) Save.
                    <br>
                    <br>
                    Now in the <code>./bin</code> folder you need to create a <code>script</code> file, make it executable and paste into it:
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
                   More detailed example:
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
                        Folder structure description
                    </a>
                </h4>
            </div>
            <div id="tree" class="panel-collapse collapse">
                <div class="panel-body">
                    <table class="text-dark text-muted tr-title">
                        <tbody>
                        <tr>
                            <td><code>./bin</code></td>
                            <td>Executable files</td>
                        </tr>
                        <tr>
                            <td>
                                <code>./bin/libs/i386</code>,
                                <br>
                                <code>./bin/libs/x86-64</code>
                            </td>
                            <td>
                                Libraries.
                                <br>
                                Libraries requested by <code>wine</code> can also be added here.
                            </td>
                        </tr>
                        <tr>
                            <td><code>./bin/share</code></td>
                            <td>
                                Additional files required by libraries, for example, <code>VkBasalt</code> here
                                stores shaders.
                            </td>
                        </tr>
                        <tr>
                            <td><code>./data/cache</code></td>
                            <td>Temporary files</td>
                        </tr>
                        <tr>
                            <td><code>./data/configs</code></td>
                            <td>Configuration files</td>
                        </tr>
                        <tr>
                            <td><code>./data/games</code></td>
                            <td>A folder for storing games, it is automatically forwarded by symlink to the prefix.</td>
                        </tr>
                        <tr>
                            <td><code>./data/games/_symlinks</code></td>
                            <td>
                                Folder for storing original files, if RW game mode in
                                <code>Packaging</code>.
                            </td>
                        </tr>
                        <tr>
                            <td><code>./data/logs</code></td>
                            <td>Logs</td>
                        </tr>
                        <tr>
                            <td><code>./data/patches</code></td>
                            <td>Patches</td>
                        </tr>
                        <tr>
                            <td><code>./data/saves/folders.json</code></td>
                            <td>
                               A list of directories that will be taken out of the prefix, for example, folders in which save files and more.
                            </td>
                        </tr>
                        <tr>
                            <td><code>./data/saves/symlinks</code></td>
                            <td>
                                The folder in which the symlinks to the game files will be stored if RW is activated in the settings game mode in <code>Packaging</code>.
                            </td>
                        </tr>
                        <tr>
                            <td><code>./prefix</code></td>
                            <td>Prefix <code>wine</code></td>
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
        'top-left':     'Top left',
        'top-right':    'Top right',
        'bottom-left':  'Bottom left',
        'bottom-right': 'Bottom right',
    },
};
