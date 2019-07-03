const { ipcMain, BrowserWindow } = require('electron')
const { loadPage } = require('./main')

ipcMain.on('index:load-page', (event, arg) => {
    BrowserWindow.getFocusedWindow().loadURL(loadPage(arg))
})
