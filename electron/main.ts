/* eslint-disable @typescript-eslint/no-explicit-any */
import { app, BrowserWindow, ipcMain, dialog, Tray, Menu, nativeImage, Notification } from 'electron'
import path from 'node:path'
import { execFile, spawn } from 'node:child_process'
import { promisify } from 'node:util'
import fs from 'node:fs'

const execFileAsync = promisify(execFile)

// System tray
let tray: Tray | null = null
let isQuitting = false

// Network change detection
let networkMonitorProcess: ReturnType<typeof spawn> | null = null
let lastActiveProfileId: string | null = null

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

  // Hide to tray on close
  win.on('close', (event) => {
    if (win && !isQuitting) {
      event.preventDefault()
      win.hide()
      return false
    }
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
    
    // Send notification
    sendNotification(
      'Proxy Manager',
      newStatus === 'on' ? `Proxy enabled (${host}:${port})` : 'Proxy disabled'
    )
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

// Network Change Detection
function startNetworkMonitoring() {
  // Use scutil --watch to monitor network changes on macOS
  // Note: --watch is only available on macOS 10.12+
  networkMonitorProcess = spawn('scutil', ['--watch'])

  networkMonitorProcess.stdout?.on('data', (data) => {
    console.log('Network change detected:', data.toString())
    // Auto-apply last active profile on network change
    if (lastActiveProfileId && win) {
      const profiles = getProfiles()
      const profile = profiles.find(p => p.id === lastActiveProfileId)
      if (profile) {
        win.webContents.send('network:change', {
          profileId: profile.id,
          profileName: profile.name,
          host: profile.host,
          port: profile.port,
          httpEnabled: profile.httpEnabled,
          socksEnabled: profile.socksEnabled
        })
      }
    }
  })

  networkMonitorProcess.stderr?.on('data', (data) => {
    const errorStr = data.toString()
    // Only log actual errors, not the usage help text
    if (!errorStr.includes('usage: scutil')) {
      console.error('Network monitor error:', errorStr)
    }
  })

  networkMonitorProcess.on('close', (code) => {
    if (code !== 0 && code !== 64) {
      console.log(`Network monitor process exited with code ${code}`)
    }
    networkMonitorProcess = null
  })
}

function stopNetworkMonitoring() {
  if (networkMonitorProcess) {
    networkMonitorProcess.kill()
    networkMonitorProcess = null
  }
}

ipcMain.handle('automation:startNetworkMonitoring', async () => {
  startNetworkMonitoring()
  return { success: true }
})

ipcMain.handle('automation:stopNetworkMonitoring', async () => {
  stopNetworkMonitoring()
  return { success: true }
})

ipcMain.handle('automation:setLastActiveProfile', async (_, profileId: string | null) => {
  lastActiveProfileId = profileId
  return { success: true }
})

ipcMain.handle('automation:getLastActiveProfile', async () => {
  return { profileId: lastActiveProfileId }
})

// Launch at Login
ipcMain.handle('automation:launchAtLogin', async (_, enable: boolean) => {
  try {
    app.setLoginItemSettings({
      openAtLogin: enable,
      openAsHidden: true,
      args: ['--hidden']
    })
    return { success: true, enabled: enable }
  } catch (error) {
    console.error('Failed to set launch at login:', error)
    return { success: false, error: 'Failed to set launch at login' }
  }
})

ipcMain.handle('automation:getLaunchAtLogin', async () => {
  try {
    const settings = app.getLoginItemSettings()
    return { enabled: settings.openAtLogin }
  } catch (error) {
    console.error('Failed to get launch at login:', error)
    return { enabled: false }
  }
})

// Window management
ipcMain.handle('window:minimize', () => {
  if (win) {
    win.minimize()
  }
})

ipcMain.handle('window:hide', () => {
  if (win) {
    win.hide()
  }
})

ipcMain.handle('window:show', () => {
  if (win) {
    win.show()
    win.focus()
  }
})

ipcMain.handle('app:quit', () => {
  app.quit()
})

// Rule-based mode (PAC file support)
const RULES_KEY = 'proxy_rules'
const RULE_BASED_MODE_KEY = 'proxy_rule_based_mode_enabled'

function getRulesStore(): string[] {
  const store = getProfilesStore()
  return store[RULES_KEY] || []
}

function saveRulesStore(rules: string[]): void {
  const store = getProfilesStore()
  store[RULES_KEY] = rules
  saveProfilesStore(store)
}

function getRuleBasedModeEnabled(): boolean {
  const store = getProfilesStore()
  return store[RULE_BASED_MODE_KEY] === true
}

function setRuleBasedModeEnabled(enabled: boolean): void {
  const store = getProfilesStore()
  store[RULE_BASED_MODE_KEY] = enabled
  saveProfilesStore(store)
}

ipcMain.handle('rules:getAll', async () => {
  return getRulesStore()
})

ipcMain.handle('rules:save', async (_, rules: string[]) => {
  saveRulesStore(rules)
  return { success: true }
})

ipcMain.handle('rules:setEnabled', async (_, enabled: boolean) => {
  setRuleBasedModeEnabled(enabled)
  return { success: true }
})

ipcMain.handle('rules:getEnabled', async () => {
  return getRuleBasedModeEnabled()
})

// Generate PAC file
ipcMain.handle('rules:generatePAC', async (_, rules: string[], proxyHost: string, proxyPort: string) => {
  try {
    // Convert rules to PAC format
    const pacRules = rules.map((rule: string) => {
      const trimmedRule = rule.trim()
      if (trimmedRule.startsWith('*.')) {
        // Domain suffix rule
        const domain = trimmedRule.substring(2)
        return `  if (dnsDomainIs(host, ".${domain}")) return "PROXY ${proxyHost}:${proxyPort}";`
      } else if (trimmedRule.includes('*')) {
        // Wildcard rule - convert to simple pattern
        return `  if (shExpMatch(host, "${trimmedRule}")) return "PROXY ${proxyHost}:${proxyPort}";`
      } else {
        // Exact domain match
        return `  if (host === "${trimmedRule}") return "PROXY ${proxyHost}:${proxyPort}";`
      }
    }).join('\n')

    const pacContent = `function FindProxyForURL(url, host) {
${pacRules}
  return "DIRECT";
}`

    // Save PAC file to user data directory
    const userDataPath = app.getPath('userData')
    const pacPath = path.join(userDataPath, 'proxy.pac')
    await fs.promises.writeFile(pacPath, pacContent)

    return { success: true, pacPath }
  } catch (error) {
    console.error('Failed to generate PAC file:', error)
    return { success: false, error: 'Failed to generate PAC file' }
  }
})

// Create system tray
function createTray() {
  // Create tray icon from template (macOS) or fallback to image
  const trayIcon = nativeImage.createFromPath(path.join(process.env.PUBLIC, 'electron-vite.svg'))
  const icon = trayIcon.isEmpty() ? nativeImage.createEmpty() : trayIcon.resize({ width: 16, height: 16 })
  
  tray = new Tray(icon)
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Toggle Proxy',
      click: () => {
        if (win) {
          win.show()
          win.focus()
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit()
      }
    }
  ])
  
  tray.setToolTip('Proxy Manager')
  tray.setContextMenu(contextMenu)
  
  // Handle tray click
  tray.on('click', () => {
    if (win) {
      if (win.isVisible()) {
        win.focus()
      } else {
        win.show()
      }
    }
  })
}

// Send notification
function sendNotification(title: string, body: string) {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show()
  }
}

// Quit event - set flag to allow window to close
app.on('before-quit', () => {
  isQuitting = true
})

app.on('window-all-closed', () => {
  stopNetworkMonitoring()
  win = null
})

app.whenReady().then(() => {
  createWindow()
  createTray()
  // Start network monitoring by default
  startNetworkMonitoring()
})
