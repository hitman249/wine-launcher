const child_process = require('child_process');

export default class Command {
    /**
     * @param {string} cmd
     * @returns {string}
     */
    run(cmd) {
        return child_process.execSync(cmd).toString().trim();
    }

    /**
     * @param {string} cmd
     * @param {Function} callable
     * @returns {ChildProcessWithoutNullStreams}
     */
    watch(cmd, callable = () => {}) {
        let watch = child_process.spawn('sh', ['-c', cmd]);

        watch.stdout.on('data', (data) => callable(data.toString(), 'stdout'));
        watch.stderr.on('data', (data) => callable(data.toString(), 'stderr'));

        return watch;
    }
}