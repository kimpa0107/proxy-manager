/* eslint-disable @typescript-eslint/no-explicit-any */
import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import fs from 'node:fs'

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

// Profile storage
const PROFILES_KEY = 'proxy_profiles'
const ACTIVE_PROFILE_KEY = 'proxy_active_profile_id'

function getProfilesStore(): Record<string, any> {
  try {
    const userDataPath = app.getPath('userData')
    const storePath = path.join(userDataPath, 'config.json')
    if (fs.existsSync(storePath)) {
      const data = fs.readFileSync(storePath, 'utf-8')
      const parsed = JSON.parse(data)
      return parsed || {}
    }
  } catch (error) {
    console.error('Failed to read profiles store:', error)
  }
  return {}
}

function saveProfilesStore(store: Record<string, any>): void {
  try {
    const userDataPath = app.getPath('userData')
    const storePath = path.join(userDataPath, 'config.json')
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2))
  } catch (error) {
    console.error('Failed to save profiles store:', error)
  }
}

function getProfiles(): any[] {
  const store = getProfilesStore()
  return store[PROFILES_KEY] || []
}

function saveProfiles(profiles: any[]): void {
  const store = getProfilesStore()
  store[PROFILES_KEY] = profiles
  saveProfilesStore(store)
}

function getActiveProfileId(): string | null {
  const store = getProfilesStore()
  return store[ACTIVE_PROFILE_KEY] || null
}

function setActiveProfileId(id: string | null): void {
  const store = getProfilesStore()
  store[ACTIVE_PROFILE_KEY] = id
  saveProfilesStore(store)
}

let win: BrowserWindow | null
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    width: 450,
    height: 650,
    minWidth: 400,
    minHeight: 550,
    maxWidth: 700,
    maxHeight: 800,
    resizable: true,
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
  } catch (error: unknown) {
    let errorMessage = 'Unknown error occurred'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
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

// Profile Management IPC Handlers
ipcMain.handle('profiles:getAll', async () => {
  return getProfiles()
})

ipcMain.handle('profiles:save', async (_, profileData) => {
  const profiles = getProfiles()
  const existingIndex = profiles.findIndex(p => p.name === profileData.name)
  
  const now = Date.now()
  let profile: any
  
  if (existingIndex >= 0) {
    // Update existing profile
    profile = {
      ...profiles[existingIndex],
      ...profileData,
      updatedAt: now
    }
    profiles[existingIndex] = profile
  } else {
    // Create new profile
    profile = {
      id: `profile_${now}_${Math.random().toString(36).substr(2, 9)}`,
      name: profileData.name,
      host: profileData.host,
      port: profileData.port,
      httpEnabled: profileData.httpEnabled,
      socksEnabled: profileData.socksEnabled,
      createdAt: now,
      updatedAt: now
    }
    profiles.push(profile)
  }
  
  saveProfiles(profiles)
  return profile
})

ipcMain.handle('profiles:update', async (_, id: string, profileData) => {
  const profiles = getProfiles()
  const index = profiles.findIndex(p => p.id === id)
  
  if (index === -1) {
    throw new Error('Profile not found')
  }
  
  const updatedProfile = {
    ...profiles[index],
    ...profileData,
    updatedAt: Date.now()
  }
  
  profiles[index] = updatedProfile
  saveProfiles(profiles)
  return updatedProfile
})

ipcMain.handle('profiles:delete', async (_, id: string) => {
  const profiles = getProfiles()
  const filteredProfiles = profiles.filter(p => p.id !== id)
  
  if (filteredProfiles.length === profiles.length) {
    return false // Profile not found
  }
  
  saveProfiles(filteredProfiles)
  
  // If deleted profile was active, clear active profile
  const activeId = getActiveProfileId()
  if (activeId === id) {
    setActiveProfileId(null)
  }
  
  return true
})

ipcMain.handle('profiles:setActive', async (_, id: string) => {
  const profiles = getProfiles()
  const profile = profiles.find(p => p.id === id)
  
  if (!profile) {
    throw new Error('Profile not found')
  }
  
  setActiveProfileId(id)
})

ipcMain.handle('profiles:getActive', async () => {
  const activeId = getActiveProfileId()
  if (!activeId) {
    return null
  }

  const profiles = getProfiles()
  return profiles.find(p => p.id === activeId) || null
})

// Export/Import and System Proxy Detection Handlers
ipcMain.handle('profiles:export', async () => {
  const profiles = getProfiles()

  const exportData = {
    version: app.getVersion(),
    exportedAt: Date.now(),
    profiles: profiles.map(p => ({
      ...p,
      // Remove internal IDs and timestamps for cleaner export
      id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }))
  }

  // Show save dialog
  const result = await dialog.showSaveDialog({
    title: 'Export Profiles',
    defaultPath: 'proxy-profiles.json',
    filters: [{ name: 'JSON', extensions: ['json'] }]
  })

  if (result.filePath) {
    try {
      await fs.promises.writeFile(result.filePath, JSON.stringify(exportData, null, 2))
      return exportData
    } catch (error) {
      console.error('Failed to export profiles:', error)
      throw new Error('Failed to export profiles')
    }
  }

  throw new Error('Export cancelled')
})

ipcMain.handle('profiles:import', async (_, data) => {
  if (!data || !data.profiles || !Array.isArray(data.profiles)) {
    throw new Error('Invalid import data')
  }

  const profiles = getProfiles()
  let importedCount = 0

  for (const profileData of data.profiles) {
    // Check if profile with same name exists
    const existingIndex = profiles.findIndex(p => p.name === profileData.name)

    const now = Date.now()
    const profile = {
      id: `imported_${now}_${Math.random().toString(36).substr(2, 9)}`,
      name: profileData.name,
      host: profileData.host,
      port: profileData.port,
      httpEnabled: profileData.httpEnabled,
      socksEnabled: profileData.socksEnabled,
      createdAt: now,
      updatedAt: now
    }

    if (existingIndex >= 0) {
      // Update existing profile
      profiles[existingIndex] = profile
    } else {
      // Add new profile
      profiles.push(profile)
    }

    importedCount++
  }

  saveProfiles(profiles)
  return importedCount
})

ipcMain.handle('profiles:detectSystemProxy', async () => {
  try {
    // Use scutil to get current system proxy settings on macOS
    const { stdout } = await execFileAsync('bash', ['-c', `
      # Get HTTP proxy
      HTTP_PROXY=$(/usr/sbin/scutil --proxy | grep -E "^  HTTPProxy" | awk '{print $3}')
      HTTP_PORT=$(/usr/sbin/scutil --proxy | grep -E "^  HTTPPort" | awk '{print $3}')

      # Get SOCKS proxy
      SOCKS_PROXY=$(/usr/sbin/scutil --proxy | grep -E "^  SOCKSProxy" | awk '{print $3}')
      SOCKS_PORT=$(/usr/sbin/scutil --proxy | grep -E "^  SOCKSPort" | awk '{print $3}')

      # Output as JSON
      echo "{
        \\"httpHost\\": \\"$HTTP_PROXY\\",
        \\"httpPort\\": \\"$HTTP_PORT\\",
        \\"socksHost\\": \\"$SOCKS_PROXY\\",
        \\"socksPort\\": \\"$SOCKS_PORT\\"
      }"
    `])

    const config = JSON.parse(stdout)

    // Return the detected proxy configuration
    if (config.httpHost && config.httpPort) {
      return {
        host: config.httpHost,
        port: config.httpPort.toString(),
        httpEnabled: true,
        socksEnabled: !!(config.socksHost && config.socksPort)
      }
    } else if (config.socksHost && config.socksPort) {
      return {
        host: config.socksHost,
        port: config.socksPort.toString(),
        httpEnabled: false,
        socksEnabled: true
      }
    }

    return null
  } catch (error) {
    console.error('Failed to detect system proxy:', error)
    return null
  }
})

app.on('window-all-closed', () => {
  win = null
})

app.whenReady().then(createWindow)
