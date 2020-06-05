const {src, dest, parallel} = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

function js() {
    return src([
        'src/assets/js/modernizr.min.js',
        'src/assets/js/jquery.min.js',
        'src/assets/js/bootstrap.min.js',
        'src/assets/plugins/jquery-ui/jquery-ui.js',
        'src/assets/js/detect.js',
        'src/assets/js/fastclick.js',
        'src/assets/js/jquery.slimscroll.js',
        'src/assets/js/jquery.blockUI.js',
        'src/assets/js/waves.js',
        'src/assets/js/wow.min.js',
        //'src/assets/js/jquery.nicescroll.js',
        'src/assets/js/jquery.scrollTo.min.js',
        'src/assets/plugins/bootstrap-filestyle/js/bootstrap-filestyle.js',
        'src/assets/plugins/switchery/js/switchery.min.js',
        'src/assets/plugins/bootstrap-select/js/bootstrap-select.min.js',

        // Notification js
        'src/assets/plugins/notifyjs/js/notify.js',
        'src/assets/plugins/notifications/notify-metro.js',
        'src/assets/js/notifications.js',

        // Popups
        'src/assets/plugins/bootstrap-sweetalert/sweet-alert.js',

        // Ladda buttons
        'src/assets/plugins/ladda-buttons/js/spin.min.js',
        'src/assets/plugins/ladda-buttons/js/ladda.min.js',
        'src/assets/plugins/ladda-buttons/js/ladda.jquery.min.js',

        // XEditable Plugin
        'src/assets/plugins/moment/moment.js',
        'src/assets/plugins/moment/ru.js',
        'src/assets/plugins/x-editable/js/bootstrap-editable.min.js',
        //'src/assets/pages/jquery.xeditable.js',

        // Datepicker'
        'src/assets/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
        'src/assets/plugins/bootstrap-datepicker/js/bootstrap-datepicker.ru.min.js',
        'src/assets/plugins/timepicker/bootstrap-timepicker.js',

        // Tree view js
        'src/assets/js/jstree.js',

        // Sliders
        'src/assets/plugins/ion-rangeslider/ion.rangeSlider.min.js',
        'src/assets/plugins/bootstrap-slider/js/bootstrap-slider.min.js',

        // Selects
        'src/assets/plugins/select2/js/select2.min.js',
        'src/assets/plugins/multiselect/js/jquery.multi-select.js',
        'src/assets/plugins/bootstrap-touchspin/js/jquery.bootstrap-touchspin.min.js',
        'src/assets/plugins/bootstrap-maxlength/bootstrap-maxlength.min.js',

        // Modals
        'src/assets/plugins/custombox/latest/custombox.min.js',
        'src/assets/plugins/custombox/latest/custombox.legacy.min.js',

        'node_modules/lodash/lodash.js',

        // Funding
        'src/assets/plugins/funding/CSSPlugin.min.js',
        'src/assets/plugins/funding/EasePack.min.js',
        'src/assets/plugins/funding/TweenLite.min.js',
        'src/assets/plugins/funding/TimelineLite.min.js',
    ], {sourcemaps: false})
        .pipe(uglify())
        .pipe(concat('env.min.js'))
        .pipe(dest('public', {sourcemaps: false}))
}

exports.js = js;
exports.default = parallel(js);
