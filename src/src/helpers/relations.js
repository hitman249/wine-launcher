/**
 * Описание зависимостей поля от другого поля.
 * Применяется для скрытия / отображения поля на автогенерируемой форме.
 */
export default class Relations {
    static relations = {
        require:    (value) => {
            return Boolean(value);
        },
        empty:      (value) => {
            return !value;
        },
        winetricks: (value) => {
            return 'winetricks' === value;
        },
        install:    (value) => {
            return 'install' === value;
        },
        register:   (value) => {
            return 'register' === value;
        },
        arch64:     (value) => {
            return 'win64' === value;
        },
        iso:        (value) => {
            return 'iso' === value;
        },
        mangoHud:   () => {
            return window.app.getPrefix().isMangoHud();
        },
    };

    /**
     * @param {string} field
     * @param {object} fields
     * @param {object} values
     * @returns {boolean}
     */
    static relation(field, fields, values) {
        if (!field || !fields || !fields[field].relations) {
            return true;
        }

        let relations = fields[field].relations;
        let result    = [];

        if (relations && Array.isArray(relations)) {
            relations = relations.join(',');
        }

        if (!relations) {
            return true;
        }

        relations.split(',').forEach((relation) => {
            let orRelations = relation.split('|').map((relation) => {
                let [func, field] = relation.split(':');
                return Relations.relations[func](values[field]);
            });

            result.push(orRelations.filter((n) => true === n).length > 0);
        });

        return result.filter((n) => false === n).length === 0;
    }
}
