import Time     from "./time";
import Collects from "./collects";

/**
 * Валидатор.
 * Применяется для валидации автогенерируемых форм.
 */
export default class Validators {
    static validators = {
        required:              (value) => (
            typeof value === 'object'
                ? Object.keys(value).length > 0 || value instanceof File
                : ['', 'NaN', 'undefined', 'null'].indexOf(_.toString(value)) === -1
        ),
        not_empty:             (value1, value2) => {
            if (!Validators.validators.required(value1)) {
                return true;
            }

            return Validators.validators.required(value2);
        },
        time4:                 (value) => {
            if (!Validators.validators.required(value)) {
                return false;
            }

            let [hours, minutes] = value.split(':');

            return Validators.validators.integer(hours) && Validators.validators.integer(minutes);
        },
        time4_up:              (value1, value2) => {
            if (!Validators.validators.time4(value1) || !Validators.validators.time4(value2)) {
                return false;
            }

            let time1 = Time.convertHoursMinutesTimeToSec(value1);
            let time2 = Time.convertHoursMinutesTimeToSec(value2);

            return time1 < time2;
        },
        time4_down:            (value1, value2) => {
            if (!Validators.validators.time4(value1) || !Validators.validators.time4(value2)) {
                return false;
            }

            let time1 = Time.convertHoursMinutesTimeToSec(value1);
            let time2 = Time.convertHoursMinutesTimeToSec(value2);

            return time1 > time2;
        },
        time4_same:            (value1, value2) => {
            if (!Validators.validators.time4(value1) || !Validators.validators.time4(value2)) {
                return false;
            }

            let time1 = Time.convertHoursMinutesTimeToSec(value1);
            let time2 = Time.convertHoursMinutesTimeToSec(value2);

            return time1 === time2;
        },
        date:                  (value) => window.moment(value, Time.dateInputMask).isValid(),
        date_up:               (value1, value2) => {
            if (!Validators.validators.date(value1) || !Validators.validators.date(value2)) {
                return false;
            }

            let date1 = window.moment(value1, Time.dateInputMask);
            let date2 = window.moment(value2, Time.dateInputMask);

            return date1.isBefore(date2);
        },
        date_down:             (value1, value2) => {
            if (!Validators.validators.date(value1) || !Validators.validators.date(value2)) {
                return false;
            }

            let date1 = window.moment(value1, Time.dateInputMask);
            let date2 = window.moment(value2, Time.dateInputMask);

            return date1.isAfter(date2);
        },
        date_same:             (value1, value2) => {
            if (!Validators.validators.date(value1) || !Validators.validators.date(value2)) {
                return false;
            }

            let date1 = window.moment(value1, Time.dateInputMask);
            let date2 = window.moment(value2, Time.dateInputMask);

            return date1.isSame(date2);
        },
        number:                (value) => {
            if (!Validators.validators.required(value)) {
                return false;
            }

            return _.toString(value) === _.toString(_.toNumber(value));
        },
        integer:               (value) => {
            if (!Validators.validators.required(value)) {
                return false;
            }

            let trimInt = _.trimStart(value, '0');

            if ('00' === value || '0' === value || 0 === value) {
                trimInt = '0';
            }

            return _.toString(trimInt) === _.toString(_.toInteger(trimInt));
        },
        type_server:           (value) => {
            if (!Validators.validators.required(value)) {
                return false;
            }

            return Object.keys(Collects.typeServer).indexOf(value) !== -1;
        },
        day:                   (value) => {
            if (!Validators.validators.required(value)) {
                return false;
            }

            return Object.keys(Collects.days).map((day) => _.toString(day)).indexOf(_.toString(value)) !== -1;
        },
        file_txt:              (value) => {
            if (!Validators.validators.required(value)) {
                return false;
            }

            let file = value instanceof File ? value : value.file;

            return 'text/plain' === file.type;
        },
        file_image:            (value) => {
            if (!Validators.validators.required(value)) {
                return false;
            }

            let file = value instanceof File ? value : value.file;

            return ['image/jpeg', 'image/png', 'image/gif'].indexOf(file.type) !== -1;
        },
        file_mp3:              (value) => {
            if (!Validators.validators.required(value)) {
                return false;
            }

            let file = value instanceof File ? value : value.file;

            return 'audio/mp3' === file.type;
        },
        file_mp4:              (value) => {
            if (!Validators.validators.required(value)) {
                return false;
            }

            let file = value instanceof File ? value : value.file;

            return 'video/mp4' === file.type;
        },
        file_music_playlist:   (value) => {
            if (!Validators.validators.file_txt(value)) {
                return false;
            }

            let body = value instanceof File ? undefined : value.body;

            if (undefined === body) {
                return true;
            }

            let error = false;

            body.split('\n').forEach((track) => {
                if (true === error) {
                    return;
                }

                if (track.trim().length > 0) {
                    let [time, filename] = track.split('|');

                    if (false === error && 2 !== time.split(':').length) {
                        error = true;
                    }
                    if (false === error && !filename) {
                        error = true;
                    }
                }
            });

            return !error;
        },
        template_group_time:   (value, value2, values) => {
            if (!Validators.validators.required(value)) {
                return false;
            }

            let status = true;

            let current = _.get(values, 'source.item', {});

            if (false === values.active) {
                return true;
            }

            let currentStart = Time.convertHoursMinutesTimeToSec(values.start);
            let currentStop  = Time.convertHoursMinutesTimeToSec(values.stop);
            let currentValue = Time.convertHoursMinutesTimeToSec(value);

            _.get(values, 'source.groups', []).forEach((group) => {
                if (false === status || current === group || false === group.active) {
                    return;
                }
                if (!Validators.validators.time4(value) || !Validators.validators.time4(group.stop) || !Validators.validators.time4(group.start)) {
                    status = false;
                    return;
                }

                let start = Time.convertHoursMinutesTimeToSec(group.start);
                let stop  = Time.convertHoursMinutesTimeToSec(group.stop);

                if ((currentStart > start && currentStart < stop) || currentStart === start) {
                    if (currentStart === currentValue) {
                        status = false;
                    }
                }
                if ((currentStop > start && currentStop < stop) || currentStop === stop) {
                    if (currentStop === currentValue) {
                        status = false;
                    }
                }
            });

            return status;
        },
        template_rules:        (values) => {
            if (!Validators.validators.required(values)) {
                return false;
            }

            if (!values || values.length <= 0) {
                return false;
            }

            let groups = _.filter(values, (group) => 'deleted' !== group.model);

            if (!groups || groups.length <= 0) {
                return false;
            }

            let status = true;

            groups.forEach((group) => {
                if (false === status) {
                    return;
                }
                if (!group.rules || group.rules.length <= 0) {
                    status = false;
                    return;
                }

                let rules = _.filter(group.rules, (rule) => 'deleted' !== rule.model);

                if (!rules || rules.length <= 0) {
                    status = false;
                    return;
                }

                rules.forEach((rule) => {
                    if (false === status) {
                        return;
                    }
                    if (!rule.genres || rule.genres.length <= 0) {
                        status = false;
                    }
                });
            });

            return status;
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
