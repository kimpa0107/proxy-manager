import { contextBridge, ipcRenderer } from 'electron'

function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise(resolve => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find(e => e === child)) {
      parent.appendChild(child)
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find(e => e === child)) {
      parent.removeChild(child)
    }
  },
}

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function createLoading() {
  const className = `loaders-css__square-spin`
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `
  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  oDiv.className = 'app-loading-wrap'
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    },
  }
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = createLoading()
domReady().then(appendLoading)

window.onmessage = ev => {
  ev.data.payload === 'removeLoading' && removeLoading()
}

setTimeout(removeLoading, 4999)

// Expose protected methods that allow the renderer process to call
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('proxyAPI', {
  toggle: (host: string, port: string, currentState: string, httpEnabled: boolean, socksEnabled: boolean) =>
    ipcRenderer.invoke('proxy:toggle', host, port, currentState, httpEnabled, socksEnabled),
  getStatus: () => ipcRenderer.invoke('proxy:getStatus'),
  getConfig: () => ipcRenderer.invoke('proxy:getConfig'),
  onProxyStatusChange: (callback: (status: string) => void) => {
    ipcRenderer.on('proxy:statusChange', (_, status) => callback(status))
  },
  removeProxyStatusChangeListener: () => {
    ipcRenderer.removeAllListeners('proxy:statusChange')
  },
})

// Profile management APIs
contextBridge.exposeInMainWorld('profileAPI', {
  getProfiles: () => ipcRenderer.invoke('profiles:getAll'),
  saveProfile: (profile: { name: string; host: string; port: string; httpEnabled: boolean; socksEnabled: boolean }) =>
    ipcRenderer.invoke('profiles:save', profile),
  updateProfile: (id: string, profile: { name?: string; host?: string; port?: string; httpEnabled?: boolean; socksEnabled?: boolean }) =>
    ipcRenderer.invoke('profiles:update', id, profile),
  deleteProfile: (id: string) => ipcRenderer.invoke('profiles:delete', id),
  setActiveProfile: (id: string) => ipcRenderer.invoke('profiles:setActive', id),
  getActiveProfile: () => ipcRenderer.invoke('profiles:getActive'),
  exportProfiles: () => ipcRenderer.invoke('profiles:export'),
  importProfiles: (data: { version: string; exportedAt: number; profiles: any[] }) =>
    ipcRenderer.invoke('profiles:import', data),
  detectSystemProxy: () => ipcRenderer.invoke('profiles:detectSystemProxy'),
})

// Automation APIs
contextBridge.exposeInMainWorld('automationAPI', {
  startNetworkMonitoring: () => ipcRenderer.invoke('automation:startNetworkMonitoring'),
  stopNetworkMonitoring: () => ipcRenderer.invoke('automation:stopNetworkMonitoring'),
  setLastActiveProfile: (profileId: string | null) => ipcRenderer.invoke('automation:setLastActiveProfile', profileId),
  getLastActiveProfile: () => ipcRenderer.invoke('automation:getLastActiveProfile'),
  setLaunchAtLogin: (enable: boolean) => ipcRenderer.invoke('automation:launchAtLogin', enable),
  getLaunchAtLogin: () => ipcRenderer.invoke('automation:getLaunchAtLogin'),
  onNetworkChange: (callback: (data: { profileId: string; profileName: string; host: string; port: string; httpEnabled: boolean; socksEnabled: boolean }) => void) => {
    ipcRenderer.on('network:change', (_, data) => callback(data))
  },
  removeNetworkChangeListener: () => {
    ipcRenderer.removeAllListeners('network:change')
  },
})

// Window management APIs
contextBridge.exposeInMainWorld('windowAPI', {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  hide: () => ipcRenderer.invoke('window:hide'),
  show: () => ipcRenderer.invoke('window:show'),
  quit: () => ipcRenderer.invoke('app:quit'),
})

// Rule-based mode APIs
contextBridge.exposeInMainWorld('rulesAPI', {
  getAll: () => ipcRenderer.invoke('rules:getAll'),
  save: (rules: string[]) => ipcRenderer.invoke('rules:save', rules),
  setEnabled: (enabled: boolean) => ipcRenderer.invoke('rules:setEnabled', enabled),
  getEnabled: () => ipcRenderer.invoke('rules:getEnabled'),
  generatePAC: (rules: string[], proxyHost: string, proxyPort: string) =>
    ipcRenderer.invoke('rules:generatePAC', rules, proxyHost, proxyPort),
})
