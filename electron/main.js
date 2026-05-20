const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const os = require('os');
const { configManager } = require('./modules/configManager');
const { ColorDetector } = require('./modules/colorDetection');
const { MouseController } = require('./modules/mouseControl');

const isDev = !app.isPackaged;
let mainWindow;
const colorDetector = new ColorDetector();
const mouseController = new MouseController();
let aimbotRunning = false;
let aimbotTimer = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 720,
    minWidth: 860,
    minHeight: 640,
    frame: false,
    backgroundColor: '#080808',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();
  setupIPC();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  stopAimbot();
  if (process.platform !== 'darwin') app.quit();
});

function setupIPC() {
  ipcMain.on('window-minimize', () => mainWindow?.minimize());
  ipcMain.on('window-maximize', () => {
    mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize();
  });
  ipcMain.on('window-close', () => { stopAimbot(); mainWindow?.close(); });

  ipcMain.handle('load-config', () => configManager.load());
  ipcMain.handle('save-config', (_, cfg) => configManager.save(cfg));
  ipcMain.handle('reset-config', () => configManager.reset());

  ipcMain.handle('get-system-info', () => {
    const cpus = os.cpus();
    return {
      os: `Windows ${os.release()}`,
      cpu: cpus[0]?.model?.replace(/\s+/g, ' ').trim() || 'Unknown CPU',
      ram: Math.round(os.totalmem() / 1073741824) + ' GB RAM',
      hostname: os.hostname(),
    };
  });

  ipcMain.handle('get-screen-size', () => {
    const d = screen.getPrimaryDisplay();
    return d.size;
  });

  ipcMain.handle('start-aimbot', (_, cfg) => {
    colorDetector.setConfig(cfg);
    mouseController.setConfig(cfg);
    aimbotRunning = true;
    runLoop(cfg);
    return { success: true };
  });

  ipcMain.handle('stop-aimbot', () => {
    stopAimbot();
    return { success: true };
  });

  ipcMain.handle('aimbot-status', () => ({ running: aimbotRunning }));
}

async function runLoop(cfg) {
  if (!aimbotRunning) return;
  try {
    const target = await colorDetector.findTarget();
    if (target && aimbotRunning) {
      await mouseController.moveTo(target.x, target.y);
    }
  } catch (_) {}
  if (aimbotRunning) {
    aimbotTimer = setTimeout(() => runLoop(cfg), 16);
  }
}

function stopAimbot() {
  aimbotRunning = false;
  if (aimbotTimer) { clearTimeout(aimbotTimer); aimbotTimer = null; }
}
