import {app, shell, BrowserWindow, ipcMain, dialog, Menu} from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import packageJson from '../../package.json'
import { autoUpdater } from 'electron-updater'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    minWidth: 900,
    minHeight: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('close', async (e) => {
    e.preventDefault()		//阻止默认行为
    const { response } = await dialog.showMessageBox(mainWindow, {
      type: 'question',
      noLink: true,
      defaultId: 0,
      cancelId: 0,
      title: '提示',
      message: '确定要关闭吗？',
      buttons: [ '取消', '最小化', '直接退出' ]
    })

    if (response === 1) {
      mainWindow.minimize()	// 调用 最小化实例方法
    } else if (response === 2) {
      // app.quit();	// 不要用quit();会弹两次
      app.exit() // exit()直接关闭客户端，不会执行quit();
    }
  })

  mainWindow.on('ready-to-show', () => {
    Menu.setApplicationMenu(Menu.buildFromTemplate( [
      { label: 'Magic' },
      {
        label: '编辑',
        submenu: [
          { label: '撤销', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
          { label: '重做', accelerator: 'CmdOrCtrl+Y', selector: 'redo:' },
          { type: 'separator' },
          { label: '剪切', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
          { label: '复制', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
          { label: '粘贴', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
          { label: '全选', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
        ]
      },
      {
        label: '帮助',
        submenu: [
          {
            label: '检查更新',
            click: async () => {
              const { response } = await dialog.showMessageBox(mainWindow, {
                type: 'question',
                buttons: [ '取消', '确定' ],
                title: '检查更新',
                noLink: true,
                defaultId: 1,
                cancelId: 0,
                message: '是否检查新版本？'
              })

              if (response === 1) {
                // if (autoUpdateUrl && token) {
                  checkForUpdates()
                // } else {
                //   await dialog.showMessageBox(mainWindow, {
                //     type: 'warning',
                //     title: '提醒',
                //     message: '请先登录系统！'
                //   })
                // }
              }
            }
          },
          {
            label: '关于',
            click: async () => {
              const { dialog } = require('electron')
              // 显示消息框提示用户功能尚未开发
              await dialog.showMessageBox(mainWindow, {
                type: 'none',
                title: '关于',
                message: `当前版本: ${ packageJson.version }`
              })
            }
          },
          { type: 'separator' },
          { label: '退出', accelerator: 'Command+Q', click: function() { app.quit() } }
        ]
      }
    ]))
    mainWindow.show()
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
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  function checkForUpdates() {
    // 在开发环境调试更新
    // autoUpdater.forceDevUpdateConfig = true
    // 配置自动更新选项
    autoUpdater.autoDownload = false; // 设置为false以允许用户在更新可用时选择是否下载:cite[6]
    autoUpdater.autoInstallOnAppQuit = false;

    // 设置更新源
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'Mage-7-28',
      repo: 'tool-kit',
      releaseType: 'release',
    });

    // 检查更新
    autoUpdater.checkForUpdates()

    // 更新错误事件
    if (!autoUpdater.listenerCount('error')) {
      autoUpdater.on('error', (error) => {
        console.error('检查更新出错:', error)
        dialog.showMessageBox(mainWindow, {
          type: 'warning',
          title: '提醒',
          message: '检查更新出错！'
        })
      })
    }

    // 检查更新事件
    if (!autoUpdater.listenerCount('checking-for-update')) {
      autoUpdater.on('checking-for-update', () => {
        console.log('正在检查更新...')
      })
    }

    // 发现新版本
    if (!autoUpdater.listenerCount('update-available')) {
      autoUpdater.on('update-available', (info) => {
        const choice = dialog.showMessageBoxSync(mainWindow, {
          type: 'info',
          buttons: [ '稍后', '更新' ],
          title: '发现新版本',
          noLink: true,
          defaultId: 1,
          cancelId: 0,
          message: `检测到新版本 ${ info.version }，是否立即更新？`
        })

        if (choice === 1) {
          // 用户选择更新，创建进度弹窗
          autoUpdater.downloadUpdate()
        }
      })
    }

    // 当前版本为最新版本
    if (!autoUpdater.listenerCount('update-not-available')) {
      autoUpdater.on('update-not-available', () => {
        dialog.showMessageBox(mainWindow, {
          type: 'warning',
          title: '提醒',
          message: '当前版本已经是最新版本。'
        })
      })
    }

    // 下载进度事件
    autoUpdater.on('download-progress', (progress) => {
      // const message = `已下载 ${ Math.round(progress.percent) }% (${ progress.transferred }/${ progress.total })`

      mainWindow.setProgressBar(Math.round(progress.percent) / 100)
      // const options = {
      //   type: 'info',
      //   defaultId: 0,
      //   title: '正在下载更新...',
      //   message: message,
      //   cancelId: 0,
      //   noLink: true,
      //   customButtons: []
      // }
      //
      // dialog.showMessageBox(mainWindow, options)
    })

    // 下载完成事件
    if (!autoUpdater.listenerCount('update-downloaded')) {
      autoUpdater.on('update-downloaded', () => {
        const choice = dialog.showMessageBoxSync(mainWindow, {
          type: 'info',
          buttons: [ '稍后安装', '立即安装' ],
          title: '更新完成',
          noLink: true,
          defaultId: 1,
          cancelId: 0,
          message: '更新包已下载完成，是否立即安装并重启应用？'
        })

        if (choice === 1) {
          // C:\Users\xxxxx\AppData\Local\magic-desktop-updater
          autoUpdater.quitAndInstall() // 安装并退出应用
        }
      })
    }
  }
  return mainWindow
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

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.on('open_dev_tools', () => mainWindow.webContents.openDevTools())

  const mainWindow = createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
