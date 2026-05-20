const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_DIR = path.join(os.homedir(), 'AppData', 'Roaming', 'Razer');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

const DEFAULT_CONFIG = {
  // AimBot
  enemyColor: 'purple-tritanopia',
  algorithm: 4,
  aimFov: 100,
  smoothing: 5,
  sensitivity: 1.0,
  aimMultiplier: 1.0,
  recoilLength: 10,
  headOffsetX: 0,
  headOffsetY: 20,
  // Trigger
  trigFov: 10,
  trigSmoothing: 3,
  delayBetweenShots: 100,
  // Keys
  aimbotKey1: 'Mouse2',
  aimbotKey2: 'None',
  triggerKey: 'Mouse4',
  toggleKey: 'F5',
  // Other
  alwaysOn: false,
  darkMode: true,
  themeColors: {
    primary: '#cc0000',
    secondary: '#1a1a1a',
    accent: '#ff4444',
    background: '#080808',
  }
};

class ConfigManager {
  constructor() { this._ensureDir(); }

  _ensureDir() {
    if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  load() {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8')) };
      }
    } catch (_) {}
    return { ...DEFAULT_CONFIG };
  }

  save(cfg) {
    try {
      this._ensureDir();
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8');
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  reset() {
    this.save(DEFAULT_CONFIG);
    return { ...DEFAULT_CONFIG };
  }
}

const configManager = new ConfigManager();
module.exports = { configManager, DEFAULT_CONFIG };
