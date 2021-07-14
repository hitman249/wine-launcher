import Utils from "../utils";
import Wine  from "./wine";

export default class Proton extends Wine {

  init() {
    this.winePrefixDir = '/pfx';
    this.wineDir       = this.findWineDir();
  }

  /**
   * @param {Arguments} arguments
   */
  boot() {
    let cmd = Array.prototype.slice.call(arguments).join(' ');

    if (cmd) {
      cmd = '&& ' + cmd;
    }

    let wineBootPath   = Utils.quote(this.appFolders.getProtonFile());
    let wineServerPath = Utils.quote(this.getWineServer());

    this.command.run(`${wineBootPath} getcompatpath "" && ${wineServerPath} -w ${cmd}`);
    window.app.getWinePrefix().updateSandbox();
  }

  /**
   * @return {string}
   */
  findWineDir() {
    return window.app.getCache().remember('wine.path', () => {
      let wineDir = this.appFolders.getWineDir();

      for (let name of ['wine', 'wine64']) {
        let path = `${wineDir}/bin/${name}`;

        if (this.fs.exists(path) && this.fs.isFile(path)) {
          return '';
        }

        for (let path of this.fs.glob(`${wineDir}/*`)) {

          let find = `${path}/bin/${name}`;

          if (this.fs.exists(find) && this.fs.isFile(find)) {
            return path.replace(wineDir, '');
          }

          for (let subPath of this.fs.glob(`${path}/*`)) {

            let find = `${subPath}/bin/${name}`;

            if (this.fs.exists(find) && this.fs.isFile(find)) {
              return subPath.replace(wineDir, '');
            }
          }
        }
      }
    });
  }
}