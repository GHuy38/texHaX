const COLOR_PRESETS = {
  'purple-tritanopia': { r: 148, g: 0, b: 211, tolerance: 65 },
  'purple': { r: 128, g: 0, b: 200, tolerance: 60 },
  'red': { r: 255, g: 30, b: 30, tolerance: 55 },
  'yellow': { r: 255, g: 240, b: 0, tolerance: 55 },
  'green': { r: 0, g: 230, b: 0, tolerance: 55 },
  'blue': { r: 30, g: 30, b: 255, tolerance: 55 },
  'cyan': { r: 0, g: 220, b: 220, tolerance: 55 },
  'pink': { r: 255, g: 20, b: 180, tolerance: 55 },
  'orange': { r: 255, g: 130, b: 0, tolerance: 55 },
};

let screenshotModule = null;
let jimpModule = null;

async function lazyLoad() {
  if (!screenshotModule) {
    try { screenshotModule = require('screenshot-desktop'); } catch (_) {}
  }
  if (!jimpModule) {
    try { jimpModule = (await import('jimp')).Jimp; } catch (_) {}
  }
}

class ColorDetector {
  constructor() {
    this.config = {};
    this.sw = 1920; this.sh = 1080;
    this.cx = 960; this.cy = 540;
  }

  setConfig(cfg) {
    this.config = cfg;
    this.sw = cfg.screenWidth || 1920;
    this.sh = cfg.screenHeight || 1080;
    this.cx = Math.floor(this.sw / 2);
    this.cy = Math.floor(this.sh / 2);
  }

  async findTarget() {
    await lazyLoad();
    if (!screenshotModule || !jimpModule) return null;

    const fov = this.config.aimFov || 100;
    const preset = COLOR_PRESETS[this.config.enemyColor] || COLOR_PRESETS['purple-tritanopia'];

    const x1 = Math.max(0, this.cx - fov);
    const y1 = Math.max(0, this.cy - fov);

    let buf;
    try { buf = await screenshotModule({ format: 'png' }); } catch (_) { return null; }

    let img;
    try { img = await jimpModule.read(buf); } catch (_) { return null; }

    let bestDist = Infinity, bestX = null, bestY = null;
    const w = Math.min(fov * 2, img.bitmap.width - x1);
    const h = Math.min(fov * 2, img.bitmap.height - y1);

    for (let py = y1; py < y1 + h; py += 2) {
      for (let px = x1; px < x1 + w; px += 2) {
        const pc = img.getPixelColor(px, py);
        const r = (pc >>> 24) & 0xff;
        const g = (pc >>> 16) & 0xff;
        const b = (pc >>> 8) & 0xff;
        const cd = Math.sqrt(
          (r - preset.r) ** 2 + (g - preset.g) ** 2 + (b - preset.b) ** 2
        );
        if (cd < preset.tolerance) {
          const dist = Math.sqrt((px - this.cx) ** 2 + (py - this.cy) ** 2);
          if (dist < bestDist) { bestDist = dist; bestX = px; bestY = py; }
        }
      }
    }

    if (bestX !== null) {
      return { x: bestX + (this.config.headOffsetX || 0), y: bestY - (this.config.headOffsetY || 0), dist: bestDist };
    }
    return null;
  }
}

module.exports = { ColorDetector, COLOR_PRESETS };
