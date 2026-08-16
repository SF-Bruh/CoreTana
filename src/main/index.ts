import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { is } from './isDev'
import { checkOllama, streamCoreTanaReply, MissingModelError } from './ollamaClient'
import { getConfiguredModel, setConfiguredModel } from './modelConfig'
import { IPC, type ChatMessage, type CoreTanaMode } from '../shared/ipc'

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1180,
    height: 800,
    minWidth: 860,
    minHeight: 600,
    show: false,
    backgroundColor: '#05070c',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  win.on('ready-to-show', () => win.show())

  // Never let the app navigate to or open arbitrary remote origins.
  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('http://localhost') && !url.startsWith('file://')) {
      event.preventDefault()
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

ipcMain.handle(IPC.checkOllama, async () => {
  const status = await checkOllama()
  return { ...status, configuredModel: getConfiguredModel() }
})

ipcMain.handle(IPC.setModel, (_event, model: string) => {
  setConfiguredModel(model)
  return { configuredModel: model }
})

ipcMain.handle(
  IPC.sendMessage,
  async (event, payload: { history: ChatMessage[]; mode: CoreTanaMode }) => {
    const sender = event.sender
    try {
      const full = await streamCoreTanaReply(payload.history, payload.mode, (delta) => {
        sender.send(IPC.streamChunk, { delta })
      })
      sender.send(IPC.streamDone, { fullText: full })
      return { ok: true }
    } catch (err) {
      const message = err instanceof MissingModelError ? err.message : (err as Error).message
      sender.send(IPC.streamError, { message })
      return { ok: false, message }
    }
  }
)

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
