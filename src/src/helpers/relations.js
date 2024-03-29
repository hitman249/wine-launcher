/**
 * Описание зависимостей поля от другого поля.
 * Применяется для скрытия / отображения поля на автогенерируемой форме.
 */
export default class Relations {
  static relations = {
    require:               (value) => {
      return Boolean(value);
    },
    empty:                 (value) => {
      return !value;
    },
    winetricks:            (value) => {
      return 'winetricks' === value;
    },
    install:               (value) => {
      return 'install' === value;
    },
    iso_file:              (value) => {
      return Boolean(value);
    },
    register:              (value) => {
      return 'register' === value;
    },
    arch64:                (value) => {
      return 'win64' === value;
    },
    iso:                   (value) => {
      return 'iso' === value;
    },
    mango_hud:             () => {
      return window.app.getPrefix().isMangoHud();
    },
    amd_fsr:               () => {
      return window.app.getKernel().isAmdFsr();
    },
    gamemode:              () => {
      return window.app.getSystem().isGameMode();
    },
    aco:                   () => {
      return !window.app.getDriver().isDefaultACO();
    },
    mesa:                  () => {
      return Boolean(window.app.getSystem().getMesaVersion());
    },
    key_mapping_no_mouse:  (value) => {
      return !window.app.getMouse().isMouseXY(value);
    },
    key_mapping_mouse:     (value) => {
      return window.app.getMouse().isMouseXY(value);
    },
    key_mapping_only_axes: (value) => {
      return 'axes' === value;
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

    if (relations && Array.isArray(relations)) {
      relations = relations.join(',');
    }

    if (!relations) {
      return true;
    }

    let success = false;

    relations.split('|').forEach((relation) => {
      let conditions = relation.split(',').map((relation) => {
        let [ func, field ] = relation.split(':');
        return Relations.relations[func](values[field]);
      });

      if (false === success) {
        success = conditions.filter((n) => false === n).length === 0;
      }
    });

    return success;
  }
}
