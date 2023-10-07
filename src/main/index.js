import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { PosPrinter } from '@3ksy/electron-pos-printer'


const Printer = require('node-thermal-printer');

const express = require('express')
const App = express()
const cors = require('cors')

let mainWindow
async function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
App.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

App.use(cors())
App.use(express.json())

const PORT = 3000 || process.env.port

App.listen(PORT, () => {
  console.log(`port is running on ${PORT}`)
})

// In this file you can include the rest of your app"s specific main process

// Print the list of USB printers
ipcMain.handle('test-print', async () => {
  // Now, you can use this mcodified data array for printing with increased font sizes.
  const array = [1, 2, 3, 4, 5, 6].map((value) => `<h1>${value}</h1>`)

  const newArray = [array.join('')]
  console.log(newArray)


  const htmlData = `<h1 style="color:red;">hello i am super</h1><h2>hello my name is unais</h2>${newArray}`
  const options = {
    preview: false,
    width: 'auto',
    margin: '0 0 0 0',
    copies: 1,
    printerName: 'EPSON TM-U220 Receipt', // Replace with your printer name
    timeOutPerLine: 400,
    pageSize: '80mm',
    silent: true
  }
  const data = [
    {
      type: 'text',
      value: htmlData,
      style: { textAlign: 'center' }
    }
    // More data here...
  ]

  PosPrinter.print(data, options)
    .then(() => {
      console.log('Print success.')
    })
    .catch((error) => {
      console.error('Print error:', error)
    })
  // const printer = new Printer({
  //   type: 'custom', // Replace with your printer type (e.g., 'star', 'epson', 'custom')
  //   interface: 'POS-80-Series', // Replace with your printer's name or IP address
  //   });
  //   let isConnected = await printer.isPrinterConnected();  
  //   console.log(isConnected)
})
