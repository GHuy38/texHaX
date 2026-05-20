// Reusable slider row with synced number input
function SliderRow({ label, valKey, min, max, step = 0.01, cfg, update, format }) {
  const val = cfg[valKey] ?? 0
  const display = format ? format(val) : (Number.isInteger(step) || step >= 1 ? Math.round(val) : parseFloat(val).toFixed(2))

  const pct = Math.round(((val - min) / (max - min)) * 100)
  const trackStyle = {
    background: `linear-gradient(to right, #cc0000 ${pct}%, #252525 ${pct}%)`
  }

  return (
    <div className="flex items-center gap-3 py-1.5">
      <span style={{ width: 130, fontSize: 12, color: '#888', flexShrink: 0 }}>{label}</span>
      <div className="flex-1" style={{ position: 'relative' }}>
        <input
          type="range"
          className="slider"
          min={min} max={max} step={step}
          value={val}
          style={trackStyle}
          onChange={e => update(valKey, parseFloat(e.target.value))}
        />
      </div>
      <input
        type="number"
        min={min} max={max} step={step}
        value={display}
        onChange={e => {
          const n = parseFloat(e.target.value)
          if (!isNaN(n)) update(valKey, Math.max(min, Math.min(max, n)))
        }}
      />
    </div>
  )
}

const COLOR_OPTIONS = [
  { value: 'purple-tritanopia', label: 'Purple (Tritanopia)' },
  { value: 'purple', label: 'Purple' },
  { value: 'red', label: 'Red' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
  { value: 'cyan', label: 'Cyan' },
  { value: 'pink', label: 'Pink' },
  { value: 'orange', label: 'Orange' },
]

const COLOR_SWATCH = {
  'purple-tritanopia': '#9400d3',
  'purple': '#8000c8',
  'red': '#ff1e1e',
  'yellow': '#ffe000',
  'green': '#00e600',
  'blue': '#1e1eff',
  'cyan': '#00dcdc',
  'pink': '#ff14b4',
  'orange': '#ff8200',
}

export default function AimBotSettings({ cfg, update }) {
  return (
    <div style={{ maxWidth: 700 }}>
      <p className="section-label">AimBot Settings</p>

      {/* Enemy Color */}
      <div className="flex items-center gap-3 py-1.5 mb-1">
        <span style={{ width: 130, fontSize: 12, color: '#888', flexShrink: 0 }}>Enemy Highlight Color</span>
        <div className="flex items-center gap-2 flex-1">
          <div style={{
            width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
            background: COLOR_SWATCH[cfg.enemyColor] || '#9400d3',
            boxShadow: `0 0 8px ${COLOR_SWATCH[cfg.enemyColor] || '#9400d3'}66`
          }} />
          <select value={cfg.enemyColor} onChange={e => update('enemyColor', e.target.value)} style={{ flex: 1, maxWidth: 220 }}>
            {COLOR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Algorithm Toggle */}
      <div className="flex items-center gap-3 py-1.5 mb-3">
        <span style={{ width: 130, fontSize: 12, color: '#888', flexShrink: 0 }}>Aim Algorithm</span>
        <div className="flex gap-2">
          {[4, 3, 2].map(n => (
            <button
              key={n}
              className={`algo-btn ${cfg.algorithm === n ? 'active' : ''}`}
              onClick={() => update('algorithm', n)}
            >
              Algorithm {n}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #181818', margin: '8px 0 12px' }} />

      {/* Sliders */}
      <SliderRow label="Aim FOV" valKey="aimFov" min={10} max={500} step={1} cfg={cfg} update={update} />
      <SliderRow label="Smoothing" valKey="smoothing" min={1} max={20} step={1} cfg={cfg} update={update} />
      <SliderRow label="Sensitivity" valKey="sensitivity" min={0.1} max={5.0} step={0.05} cfg={cfg} update={update} />
      <SliderRow label="Aim Multiplier" valKey="aimMultiplier" min={0.1} max={3.0} step={0.05} cfg={cfg} update={update} />
      <SliderRow label="Recoil Length" valKey="recoilLength" min={0} max={100} step={1} cfg={cfg} update={update} />
      <SliderRow label="Head Offset X" valKey="headOffsetX" min={-50} max={50} step={1} cfg={cfg} update={update} />
      <SliderRow label="Head Offset Y" valKey="headOffsetY" min={0} max={100} step={1} cfg={cfg} update={update} />

      {/* Info cards */}
      <div className="grid grid-cols-3 gap-2 mt-6">
        {[
          { label: 'FOV Radius', val: `${cfg.aimFov}px` },
          { label: 'Smooth Steps', val: cfg.smoothing },
          { label: 'Effective Sens', val: (cfg.sensitivity * cfg.aimMultiplier).toFixed(2) },
        ].map(({ label, val }) => (
          <div key={label} style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 6, padding: '10px 14px' }}>
            <div style={{ fontSize: 9, color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#cc0000', fontFamily: 'JetBrains Mono' }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
