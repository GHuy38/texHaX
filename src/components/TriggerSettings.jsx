function SliderRow({ label, valKey, min, max, step = 1, cfg, update }) {
  const val = cfg[valKey] ?? 0
  const pct = Math.round(((val - min) / (max - min)) * 100)
  const trackStyle = {
    background: `linear-gradient(to right, #cc0000 ${pct}%, #252525 ${pct}%)`
  }
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span style={{ width: 160, fontSize: 12, color: '#888', flexShrink: 0 }}>{label}</span>
      <div className="flex-1">
        <input type="range" className="slider" min={min} max={max} step={step}
          value={val} style={trackStyle}
          onChange={e => update(valKey, parseFloat(e.target.value))}
        />
      </div>
      <input type="number" min={min} max={max} step={step} value={val}
        onChange={e => {
          const n = parseFloat(e.target.value)
          if (!isNaN(n)) update(valKey, Math.max(min, Math.min(max, n)))
        }}
      />
    </div>
  )
}

export default function TriggerSettings({ cfg, update }) {
  return (
    <div style={{ maxWidth: 700 }}>
      <p className="section-label">Trigger Settings</p>

      <SliderRow label="Trigger FOV" valKey="trigFov" min={1} max={200} step={1} cfg={cfg} update={update} />
      <SliderRow label="Trigger Smoothing" valKey="trigSmoothing" min={1} max={20} step={1} cfg={cfg} update={update} />

      {/* Delay between shots */}
      <div className="flex items-center gap-3 py-1.5 mt-2">
        <span style={{ width: 160, fontSize: 12, color: '#888', flexShrink: 0 }}>Delay Between Shots</span>
        <div className="flex-1">
          <input type="range" className="slider" min={0} max={1000} step={10}
            value={cfg.delayBetweenShots}
            style={{ background: `linear-gradient(to right, #cc0000 ${(cfg.delayBetweenShots/1000)*100}%, #252525 ${(cfg.delayBetweenShots/1000)*100}%)` }}
            onChange={e => update('delayBetweenShots', parseInt(e.target.value))}
          />
        </div>
        <div className="flex items-center gap-1">
          <input type="number" min={0} max={1000} step={10} value={cfg.delayBetweenShots}
            style={{ width: 70 }}
            onChange={e => {
              const n = parseInt(e.target.value)
              if (!isNaN(n)) update('delayBetweenShots', Math.max(0, Math.min(1000, n)))
            }}
          />
          <span style={{ fontSize: 10, color: '#444', marginLeft: 2 }}>ms</span>
        </div>
      </div>

      {/* Info */}
      <div style={{ marginTop: 24, padding: '12px 16px', background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 8 }}>
        <div style={{ fontSize: 10, color: '#444', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Trigger Info</div>
        <div className="flex gap-6">
          {[
            { label: 'FOV Area', val: `${cfg.trigFov * 2}×${cfg.trigFov * 2}px` },
            { label: 'Fire Rate', val: cfg.delayBetweenShots === 0 ? 'Max' : `${(1000 / Math.max(1, cfg.delayBetweenShots)).toFixed(0)} RPS` },
            { label: 'Smoothing', val: cfg.trigSmoothing },
          ].map(({ label, val }) => (
            <div key={label}>
              <div style={{ fontSize: 9, color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#cc0000', fontFamily: 'JetBrains Mono' }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Warning */}
      <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(204,0,0,0.05)', border: '1px solid rgba(204,0,0,0.15)', borderRadius: 6 }}>
        <p style={{ fontSize: 11, color: '#664444', lineHeight: 1.5 }}>
          ⚠ Trigger bot activates when enemy color is detected within Trigger FOV. Set Delay ≥ 50ms to avoid detection patterns.
        </p>
      </div>
    </div>
  )
}
