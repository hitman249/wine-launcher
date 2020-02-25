import Config  from "./config";
import Command from "./command";
import Utils   from "./utils";

export default class Wine {
    /**
     * @type {Config}
     */
    config = null;

    /**
     * @type {Command}
     */
    command = null;

    /**
     * @param {Config} config
     * @param {Command} command
     */
    constructor(config, command) {
        this.config  = config;
        this.command = command;
    }

    boot() {
        let wineBootPath   = Utils.quote(this.config.getWineBoot());
        let wineServerPath = Utils.quote(this.config.getWineServer());

        this.command.run(`${wineBootPath} && ${wineServerPath} -w`);
    }

    down() {
        let wineServerPath = Utils.quote(this.config.getWineServer());

        this.command.run(`${wineServerPath} -k`);
    }
}