/**
 * Описание зависимостей поля от другого поля.
 * Применяется для скрытия / отображения поля на автогенерируемой форме.
 */
export default class Relations {
    static relations = {
        server_type_audio: (value) => {
            return 'audio' === value;
        },
        server_type_video: (value) => {
            return 'video' === value;
        },
        server_type_mixed: (value) => {
            return 'mixed' === value;
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
