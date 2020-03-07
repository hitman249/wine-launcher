export default class Collects {

    static modes = {
        standard: 'Стандартный',
        fps:      'Показывать FPS',
        debug:    'Отладка',
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
