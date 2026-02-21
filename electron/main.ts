import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

// Path to proxy shell script
const PROXY_SCRIPT = path.join(process.env.PUBLIC, 'proxy.sh')

let win: BrowserWindow | null
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    width: 400,
    height: 540,
    resizable: false,
    maximizable: false,
    minimizable: true,
    alwaysOnTop: true,
    icon: path.join(process.env.PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

// Proxy command handlers
async function runProxyCommand(args: string[]): Promise<{ success: boolean; output?: string; error?: string }> {
  try {
    const { stdout, stderr } = await execFileAsync('bash', [PROXY_SCRIPT, ...args])
    
    if (stderr && !stderr.includes('Done')) {
      return { success: false, error: stderr }
    }
    
    return { success: true, output: stdout.trim() }
  } catch (error: any) {
    return { success: false, error: error.message || 'Unknown error occurred' }
  }
}

// IPC Handlers
ipcMain.handle('proxy:toggle', async (_, host: string, port: string, currentState: string, httpEnabled: boolean, socksEnabled: boolean) => {
  if (!host || !port) {
    return { success: false, error: 'Host and port are required' }
  }

  const action = currentState === 'on' ? 'off' : 'on'
  const result = await runProxyCommand([action, host, port, httpEnabled ? 'true' : 'false', socksEnabled ? 'true' : 'false'])

  if (result.success && win) {
    const newStatus = action === 'on' ? 'on' : 'off'
    win.webContents.send('proxy:statusChange', newStatus)
  }

  return result
})

ipcMain.handle('proxy:getStatus', async () => {
  const result = await runProxyCommand(['status'])
  return result.success ? (result.output || 'off') : 'off'
})

ipcMain.handle('proxy:getConfig', async () => {
  try {
    const { stdout } = await execFileAsync('bash', [PROXY_SCRIPT, 'config'])
    const output = stdout.trim()
    // 解析 JSON 输出
    const config = JSON.parse(output)
    return {
      httpEnabled: config.httpEnabled === 'true' || config.httpEnabled === true,
      socksEnabled: config.socksEnabled === 'true' || config.socksEnabled === true
    }
  } catch (error) {
    console.error('Failed to get proxy config:', error)
    return { httpEnabled: true, socksEnabled: true }
  }
})

app.on('window-all-closed', () => {
  win = null
})

app.whenReady().then(createWindow)
