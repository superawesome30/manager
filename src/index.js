const { exec } = require('child_process');
const electron = require('electron');
const { dialog } = require('electron');
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const ipc = ipcMain;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) app.quit(); // eslint-disable-line global-require

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 645,
        height: 500,
        minWidth: 645,
        minHeight: 500,
        transparent: true,
        titleBarStyle: 'hidden',
        frame: false,
        icon: path.join(__dirname, 'img/icon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            devTools:
                require('dotenv').config({ path: `${__dirname}/.env` }).parsed
                    .MANAGER_ENV === 'development',
        },
    });

    const render = mainWindow.webContents;

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Main Window Functions
    ipc.on('close-app', () => {
        mainWindow.close();
    });

    ipc.on('status', (e, arg) => {
        if (arg == true) {
            mainWindow.setOverlayIcon(
                path.join(__dirname, '../src/img/online.png'),
                'SnailyCAD Online'
            );
        } else {
            mainWindow.setOverlayIcon(
                path.join(__dirname, '../src/img/offline.png'),
                'SnailyCAD Offline'
            );
        }
    });

    ipc.on('minimize-app', () => {
        mainWindow.minimize();
    });

    ipc.on('hard-restart', () => {
        app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) });
        app.exit(0);
    });

    ipc.on('selectDir', (e, arg) => {
        dialog
            .showOpenDialog(mainWindow, {
                properties: ['openDirectory'],
                title: `${arg}`,
                defaultPath: ``,
            })
            .then((result) => {
                render.send('callback', `${result.filePaths}`);
            })
            .catch((err) => {
                alert(err);
            });
    });

    ipc.on('startCad', () => {
        render.send('api-startCad');
    });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// This is a note that should only be added to the downloaded update
