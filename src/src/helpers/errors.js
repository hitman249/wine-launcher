export default class Errors {
    /**
     * @type {App}
     */
    app = null;

    /**
     * @param app {App}
     */
    constructor(app) {
        this.app = app;

        JSON.safeStringify = (obj, indent = 2) => {
            let cache    = [];
            const retVal = JSON.stringify(
                obj,
                (key, value) =>
                    typeof value === "object" && value !== null
                        ? cache.includes(value)
                        ? undefined // Duplicate reference found, discard key
                        : cache.push(value) && value // Store value in our collection
                        : value,
                indent
            );
            cache        = null;

            return retVal;
        };

        let handler = this;
        let log     = window.console.log;
        let error   = window.console.error;
        let trace   = window.console.trace;

        window.console.log   = function () {
            let values  = Array.prototype.slice.call(arguments);
            let message = JSON.safeStringify(values);
            app.getAction().notifyWarning('Wine Launcher', _.truncate(message, { length: 50 }));
            handler.addLog(`[LOG]: ${message}\n`);

            return log.apply(this, arguments);
        };
        window.console.error = function () {
            let values  = Array.prototype.slice.call(arguments);
            let message = JSON.safeStringify(values);
            app.getAction().notifyError('Wine Launcher', _.truncate(message, { length: 50 }));
            handler.addLog(`[ERROR]: ${message}\n`);

            return error.apply(this, arguments);
        };
        window.console.trace = function () {
            let values  = Array.prototype.slice.call(arguments);
            let message = JSON.safeStringify(values);
            app.getAction().notifyError('Wine Launcher', _.truncate(message, { length: 50 }));
            handler.addLog(`[TRACE]: ${message}\n`);

            return trace.apply(this, arguments);
        };
        window.process.on('uncaughtException', (err) => {
            window.console.error(err);
        });
        window.onError = function (message, source, lineno, colno, error) {
            window.console.error(error);
        };
    }

    /**
     * @param str {string}
     */
    addLog(str) {
        let fs      = this.app.getFileSystem();
        let prefix  = this.app.getPrefix();
        let logsDir = prefix.getLogsDir();
        let logFile = `${logsDir}/errors.log`;

        if (!fs.exists(logsDir)) {
            fs.mkdir(logsDir);
        }

        fs.filePutContents(logFile, `${new Date().toLocaleString()} ${str}`, fs.FILE_APPEND);
    }
}