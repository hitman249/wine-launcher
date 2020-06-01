/**
 * Валидатор.
 * Применяется для валидации автогенерируемых форм.
 */
export default class Validators {
    static validators = {
        required:       (value) => (
            typeof value === 'object'
                ? Object.keys(value).length > 0 || value instanceof File
                : ['', 'NaN', 'undefined', 'null'].indexOf(_.toString(value)) === -1
        ),
        not_empty:      (value1, value2) => {
            if (!Validators.validators.required(value1)) {
                return true;
            }

            return Validators.validators.required(value2);
        },
        or:             (value1, value2) => {
            return (Validators.validators.required(value1) && value1) || (Validators.validators.required(value2) && value2);
        },
        resolution:     (value) => {
            if (!Validators.validators.required(value)) {
                return false;
            }

            if ('auto' === value) {
                return true;
            }

            let [width, height] = value.split('x');

            return Validators.validators.integer(width) && Validators.validators.integer(height);
        },
        time4:          (value) => {
            if (!Validators.validators.required(value)) {
                return false;
            }

            let [hours, minutes] = value.split(':');

            return Validators.validators.integer(hours) && Validators.validators.integer(minutes);
        },
        number:         (value) => {
            if (!Validators.validators.required(value)) {
                return false;
            }

            return _.toString(value) === _.toString(_.toNumber(value));
        },
        integer:        (value) => {
            if (!Validators.validators.required(value)) {
                return false;
            }

            let trimInt = _.trimStart(value, '0');

            if ('00' === value || '0' === value || 0 === value) {
                trimInt = '0';
            }

            return _.toString(trimInt) === _.toString(_.toInteger(trimInt));
        },
        file_txt:       (value) => {
            if (!Validators.validators.required(value)) {
                return false;
            }

            let file = value instanceof File ? value : value.file;

            return 'text/plain' === file.type;
        },
        file_image_png: (value) => {
            if (!Validators.validators.required(value)) {
                return false;
            }

            let file = value instanceof File ? value : value.file;

            return ['image/png'].indexOf(file.type) !== -1;
        },
        file_image:     (value) => {
            if (!Validators.validators.required(value)) {
                return false;
            }

            let file = value instanceof File ? value : value.file;

            return ['image/jpeg', 'image/png', 'image/gif'].indexOf(file.type) !== -1;
        },
        file_mp3:       (value) => {
            if (!Validators.validators.required(value)) {
                return false;
            }

            let file = value instanceof File ? value : value.file;

            return 'audio/mp3' === file.type;
        },
        file_mp4:       (value) => {
            if (!Validators.validators.required(value)) {
                return false;
            }

            let file = value instanceof File ? value : value.file;

            return 'video/mp4' === file.type;
        },
        file_name:      (value) => {
            if (!Validators.validators.required(value)) {
                return false;
            }

            // eslint-disable-next-line
            return value.match(/^[A-z0-9\-\._]+$/);
        },

        // eslint-disable-next-line
        url: (value) => /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/.test(value),

        // eslint-disable-next-line
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),

        // eslint-disable-next-line
        ipv4: (value) => /^([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\.([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\.([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\.([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])$/g.test(value),
    };

    /**
     * @param {object} fields
     * @param {object} values
     * @returns {object} // errors
     */
    static validate(fields, values) {
        let result = {};

        Object.keys(fields).forEach((name) => {
            let field = fields[name];

            if (field.required) {
                if (!Validators.validators.required(values[name])) {
                    result[name] = 'required';
                    return;
                }
            }

            if (undefined === values[name] || null === values[name] || '' === values[name]) {
                return;
            }

            if (field.validators && Array.isArray(field.validators)) {
                field.validators = field.validators.join(',');
            }

            if (field.validators) {
                field.validators.split(',').forEach((validator) => {
                    if (undefined !== result[name]) {
                        return;
                    }

                    let orValidators = validator.split('|');
                    let orResult     = [];

                    orValidators.forEach((validator) => {
                        let [rule, relation] = validator.split(':');
                        let validated        = null;

                        if (relation) {
                            validated = Validators.validators[rule](values[name], values[relation], values, fields);
                        } else {
                            validated = Validators.validators[rule](values[name], undefined, values, fields);
                        }

                        if (!validated) {
                            orResult.push(rule);
                        }
                    });

                    let validCount  = orValidators.length;
                    let resultCount = orResult.length;

                    if (undefined === result[name] && (validCount === resultCount)) {
                        result[name] = orResult[0];
                    }
                });
            }
        });

        return result;
    }
}
