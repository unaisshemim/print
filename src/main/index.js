import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
// import image from '../../build/foodbook.png'
const {getPrinters}=require('@thiagoelg/node-printer')


const express = require('express')
const App = express()
const cors = require('cors')

let printer
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
  const contents = mainWindow.webContents
  try {
    printer = await contents.getPrintersAsync()
    console.log(printer)
  } catch (error) {
    console.error(error)
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
let data
App.post('/FoodCart', async (req, res) => {
  data = req.body
  res.send('hello').status(200)
})

App.get('/FoodCart', async (req, res) => {
  

  res.json(printer).status(200)

  const hi=async()=>{
    try {
      const response= await getPrinters()
      console.log(response)
    } catch (error) {
      console.log(error)
    }
  }
  hi()
})

App.listen(PORT, () => {
  console.log(`port is running on ${PORT}`)
})

// In this file you can include the rest of your app"s specific main process


// Print the list of USB printers
