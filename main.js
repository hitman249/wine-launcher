// Modules to control application life and create native browser window
const { app, BrowserWindow, remote, protocol, ipcMain } = require('electron');

const path  = require('path');
const fs    = require('fs');
const fetch = require('node-fetch');

global.iconv = require('iconv-lite');
global.fetch = (url, options = {}) => fetch(url, options);
global.fs    = fs;

app.allowRendererProcessReuse = true;

function createWindow() {
    protocol.registerFileProtocol('local', (request, callback) => {
        callback({ path: request.url.substring(8).split('?')[0] });
    });

    // Create the browser window.
    const mainWindow = new BrowserWindow({
        minWidth:       800,
        minHeight:      600,
        width:          800,
        height:         600,
        webPreferences: {
            allowRunningInsecureContent: true,
            webSecurity:                 false,
            nodeIntegration:             true,
            nodeIntegrationInWorker:     true,
        }
    });

    mainWindow.removeMenu();

    // and load the index.html of the app.
    mainWindow.loadFile('app/index.html');

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

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
