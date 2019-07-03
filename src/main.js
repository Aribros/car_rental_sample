const electron = require('electron')
const menuTemplate = require('./menu')
const url = require('url');



const {app, BrowserWindow, Menu, ipcMain } = electron

let mainWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
          }        
    })
    // and load the index.html of the app.
    mainWindow.loadURL(loadPage("home.htm"))

    // Open the DevTools.
    mainWindow.webContents.openDevTools()
    
    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })    
}
      
// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
  
  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createMainWindow()
    }
  })
  //Load Window when ready
  app.on("ready", createMainWindow)

  //Set Menu
  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
  
  //Format Page Before Load
  const loadPage = (page) => {
    return url.format({ 
        pathname: "/../pages/" + page,
        protocol: 'file',
        slashes: true
    })
  }  

  module.exports = {loadPage}

require("./index")
require("./customer")
