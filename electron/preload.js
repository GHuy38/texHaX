const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  loadConfig: () => ipcRenderer.invoke('load-config'),
  saveConfig: (cfg) => ipcRenderer.invoke('save-config', cfg),
  resetConfig: () => ipcRenderer.invoke('reset-config'),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  getScreenSize: () => ipcRenderer.invoke('get-screen-size'),
  startAimbot: (cfg) => ipcRenderer.invoke('start-aimbot', cfg),
  stopAimbot: () => ipcRenderer.invoke('stop-aimbot'),
  aimbotStatus: () => ipcRenderer.invoke('aimbot-status'),
});
