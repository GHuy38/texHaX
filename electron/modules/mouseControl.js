const { execSync } = require('child_process');

// Try loading robotjs (needs native build), fallback to PowerShell
let robot = null;
try { robot = require('robotjs'); } catch (_) {
  console.log('[MouseController] robotjs not available, using PowerShell fallback');
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

class MouseController {
  constructor() {
    this.cfg = { smoothing: 5, sensitivity: 1.0, aimMultiplier: 1.0, recoilLength: 10 };
  }

  setConfig(cfg) { this.cfg = { ...this.cfg, ...cfg }; }

  async moveTo(tx, ty) {
    const { smoothing, sensitivity, aimMultiplier } = this.cfg;
    const steps = Math.max(1, Math.min(20, Math.floor(smoothing)));

    if (robot) {
      const pos = robot.getMousePos();
      const dx = (tx - pos.x) * sensitivity * aimMultiplier;
      const dy = (ty - pos.y) * sensitivity * aimMultiplier;

      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
        const jx = (Math.random() - 0.5) * 0.8;
        const jy = (Math.random() - 0.5) * 0.8;
        robot.moveMouse(
          Math.round(pos.x + dx * ease + jx),
          Math.round(pos.y + dy * ease + jy)
        );
        if (i < steps) await sleep(1);
      }
    } else {
      // PowerShell fallback (slower but works without native build)
      try {
        execSync(
          `powershell -NoProfile -Command "` +
          `Add-Type -AssemblyName System.Windows.Forms;` +
          `[System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${Math.round(tx)},${Math.round(ty)})"`,
          { timeout: 100, windowsHide: true }
        );
      } catch (_) {}
    }
  }

  click(btn = 'left') {
    if (robot) robot.mouseClick(btn);
  }
}

module.exports = { MouseController };
