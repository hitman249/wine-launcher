export default class Collects {

    static modes = {
        standard: 'Стандартный',
        fps:      'Показывать FPS',
        debug:    'Отладка',
    };

    static windowsVersion = {
        win2k: 'Windows 2000',
        winxp: 'Windows XP',
        win7:  'Windows 7',
        win10: 'Windows 10',
    };

    static arch = {
        win32: 'x86',
        win64: 'x86_64',
    };

    static directDrawRenderer = {
        '':     'default',
        gdi:    'gdi',
        opengl: 'opengl',
    };

    static offscreenRenderingMode = {
        '':         'default',
        fbo:        'fbo',
        backbuffer: 'backbuffer',
    };

    static getVar(varName) {
        return JSON.parse(JSON.stringify(Collects[varName]));
    }

    static getToSelect(varName, addAllPoint = false) {
        let collect = Collects.getVar(varName);
        let select  = [];

        if (addAllPoint) {
            select.push({ id: '', name: 'Все' });
        }

        Object.keys(collect).forEach((key) => {
            select.push({ id: key, name: collect[key] });
        });

        return select;
    }
}
