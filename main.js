// Modules to control application life and create native browser window
const { app, BrowserWindow, remote, protocol, ipcMain } = require('electron');

const process  = require('process');
const path     = require('path');
const fs       = require('fs');
const fetch    = require('node-fetch');
const formData = require('form-data');
const blob     = require('fetch-blob');
const robotjs  = require('robotjs');

global.iconv    = require('iconv-lite');
global.fetch    = (url, options = {}) => fetch(url, options);
global.fs       = fs;
global.formData = formData;
global.blob     = blob;
global.robotjs  = robotjs;

global.getArguments = () => {
  let args = JSON.parse(JSON.stringify(process.argv));
  args.shift();

  let params = {};
  let field  = null;

  const append = (field, value) => {
    if (undefined === params[field]) {
      params[field] = value;
    } else if (Array.isArray(params[field])) {
      params[field].push(value);
    } else {
      params[field] = [ params[field], value ];
    }
  };

  args.forEach(arg => {
    if (arg.substring(0, 2) === '--') {
      if (null === field) {
        field = arg.substring(2);
      } else {
        append(field, '');
        field = arg.substring(2);
      }
    } else {
      if (null !== field) {
        append(field, arg);
        field = null;
      }
    }
  });

  if (null !== field) {
    append(field, '');
    field = null;
  }

  if (undefined !== params['game'] && !Array.isArray(params['game'])) {
    params['game'] = [ params['game'] ];
  }

  return params;
};

app.allowRendererProcessReuse = true;
app.disableHardwareAcceleration();

function createWindow() {
  protocol.registerFileProtocol('local', (request, callback) => {
    callback({ path: decodeURIComponent(request.url).substring(8).split('?')[0] });
  });

  let args = global.getArguments();
  let show = (undefined === args['autostart'] && undefined === args['hide']);

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    show,
    icon:           __dirname + '/build/icons/512.png',
    minWidth:       800,
    minHeight:      600,
    width:          800,
    height:         600,
    webPreferences: {
      sandbox:                     false,
      allowRunningInsecureContent: true,
      webSecurity:                 false,
      nodeIntegration:             true,
      nodeIntegrationInWorker:     true,
      enableRemoteModule:          true,
      backgroundThrottling:        false,
    }
  });

  mainWindow.removeMenu();

  // and load the index.html of the app.
  mainWindow.loadFile('app/index.html');

  if (process.env.debug === '1') {
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  }

  let canExit = false;

  ipcMain.on('app_quit', () => {
    canExit = true;
    mainWindow.destroy();
    app.quit();
  });

  mainWindow.on('close', (e) => {
    if (canExit) {
      return;
    }

    e.preventDefault();
    return false;
  });

  global.mainWindow = mainWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
