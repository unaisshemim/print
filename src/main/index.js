import { app, shell, BrowserWindow, webContents } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import image from '../../build/foodbook.png'
const { PosPrinter } = require('@3ksy/electron-pos-printer')

const express = require('express')
const App = express()
const cors = require('cors')

let printer

async function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
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
  //responsing the food

  // if (data) {
  //   res.json(data).status(200)
  // } else {
  //   res.send('no items found here').status(404)
  // }

  res.json(printer).status(200)

  function testPrint() {
    const options = {
      preview: true, //  width of content body
      margin: 'auto', // margin of content body
      copies: 1, // Number of copies to print
      printerName: 'POS-80-Series', // printerName: string, check with webContent.getPrinters()
      timeOutPerLine: 1000,
      pageSize: '80mm', // page size,
      silent: true
    }

    const data = [
      {
        type: 'image',
        url: image, // file path
        position: 'center', // position of image: 'left' | 'center' | 'right'
        width: "1.2rem", // width of image in px; default: auto
        height : "1rem" // width of image in px; default: 50 or '50px'
      },
      {
        type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
        value: 'Food Book :',
        style: { fontWeight: '700', textAlign: 'center', fontSize: '25px' }
      },
      {
        type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
        value: 'Doha',
        style: { fontWeight: '500', textAlign: 'center', fontSize: '15px' }
      },
      {
        type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
        value: 'Order No',
        style: { fontSize: '15px', color: 'black', marginTop: '5px' }
      },
      {
        type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
        value: 'Token',
        style: { marginTop: '5px', fontSize: '15px', color: 'black' }
      },
      {
        type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
        value: 'Order Date',
        style: { marginTop: '5px', fontSize: '15px', color: 'black' }
      },
      {
        type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
        value: 'Customer',
        style: { marginTop: '5px', fontSize: '15px', color: 'black' }
      },
      {
        type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
        value: 'Table',
        style: { marginTop: '5px', fontSize: '15px', color: 'black' }
      },
      {
        type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
        value: 'Address',
        style: { marginTop: '5px', fontSize: '15px', color: 'black' }
      },
      {
        type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
        value: 'Waiter',
        style: { marginTop: '5px', fontSize: '15px', color: 'black' }
      },

      {
        type: 'table',
        // style the table
        style: { border: '1px solid #ddd', marginTop: '10px' },
        // list of the columns to be rendered in the table header
        tableHeader: ['Items', 'Service', 'Qty', 'Price', 'Amount'],
        // multidimensional array depicting the rows and columns of the table body
        tableBody: [
          ['Orange Juice', 'Express', 2, 10, 20],
          ['Apple Juice', 'Normal', 1, 5, 5],
          ['Grape Juice', 'Express', 3, 8, 24]
        ],
        // list of columns to be rendered in the table footer
        tableFooter: [
          [
            { type: 'text', value: 'Subtotal', style: { color: 'black' } },
            { type: 'text', value: '', colspan: 2 }, // Empty cells to create space
            123 // This is the subtotal amount
          ],
          [
            { type: 'text', value: 'Tax', style: { color: 'black' } },
            { type: 'text', value: '', colspan: 2 }, // Empty cells to create space
            15 // This is the tax amount
          ]
        ],
        // tableFooter: ['Total Quantity', '134'],
        // custom style for the table header
        tableHeaderStyle: { backgroundColor: 'white', color: 'black' },
        // custom style for the table body
        tableBodyStyle: { border: '0.5px solid #ddd' },
        // custom style for the table footer
        tableFooterStyle: { backgroundColor: 'white', color: 'black' }
      },
      {
        type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
        value: `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Total&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;200`,
        style: { marginTop: '5px', fontSize: '15px', color: 'black'}
      },
      {
        type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
        value: `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Qty&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5`,
        style: { marginTop: '5px', fontSize: '15px', color: 'black', marginBottom: '10px' }
      },
      {
        type: 'barCode',
        value: '023456789010',
        height: 40, // height of barcode, applicable only to bar and QR codes
        width: 2, // width of barcode, applicable only to bar and QR codes
        displayValue: true, // Display value below barcode
        fontsize: 12,
        style: { marginTop: '10px' }
      }
    ]

    try {
      PosPrinter.print(data, options)
        .then(() => console.log('done'))
        .catch((error) => {
          console.error(error)
        })
    } catch (e) {
      console.log(PosPrinter)
      console.log(e)
    }
  }
  testPrint()
})

App.listen(PORT, () => {
  console.log(`port is running on ${PORT}`)
})

// In this file you can include the rest of your app"s specific main process
