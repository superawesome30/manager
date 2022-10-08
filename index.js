// This file does not need to be diagnosed. As this is the only file that runs on the Main Process

const { app, ipcMain, BrowserWindow, shell } = require('electron');

const createWindow = () => {
    let mainWindow = new BrowserWindow({
        height: 600,
        minHeight: 600,
        width: 700,
        minWidth: 700,
        transparent: true,
        alwaysOnTop: true, // To prevent focus-loss on startup.
        titleBarStyle: 'hidden',
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })

    mainWindow.loadFile('./index.html');
    mainWindow.on('ready-to-show', () => {
        mainWindow.show();
    })

    // IPC Functions
    ipcMain.on('focus', () => {
        mainWindow.setAlwaysOnTop(false);
        mainWindow.focus();
    }) // Focus App on Startup (Must be called in renderer)

    ipcMain.on('close', () => {
        mainWindow.close();
    })
    ipcMain.on('minimize', () => {
        mainWindow.minimize();
    })
    ipcMain.on('maximize', () => {
        if (mainWindow.isFullScreen()) {
            return mainWindow.setFullScreen(false);
        }
        return mainWindow.setFullScreen(true);
    })
    ipcMain.on('url', (e, arg) => {
        shell.openExternal(arg)
    })
}

app.on('ready', createWindow);