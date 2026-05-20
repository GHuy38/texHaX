function Toggle({ label, desc, valKey, cfg, update }) {
  const val = cfg[valKey]
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid #141414' }}>
      <div>
        <div style={{ fontSize: 13, color: '#ccc', fontWeight: 500 }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>{desc}</div>}
      </div>
      <label className="toggle-switch">
        <input type="checkbox" checked={!!val} onChange={e => update(valKey, e.target.checked)} />
        <span className="toggle-slider" />
      </label>
    </div>
  )
}

function ColorRow({ label, colorKey, cfg, update }) {
  const colors = cfg.themeColors || {}
  const val = colors[colorKey] || '#cc0000'
  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid #141414' }}>
      <div>
        <span style={{ fontSize: 12, color: '#888' }}>{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <div style={{
          width: 60, height: 22, borderRadius: 4, background: val,
          border: '1px solid #252525', boxShadow: `0 0 8px ${val}44`
        }} />
        <input
          type="color"
          value={val}
          onChange={e => update('themeColors', { ...colors, [colorKey]: e.target.value })}
          style={{ width: 36, height: 28, cursor: 'pointer', background: 'none', border: '1px solid #252525', borderRadius: 4, padding: 2 }}
        />
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#555', width: 70 }}>{val}</span>
      </div>
    </div>
  )
}

export default function OtherSettings({ cfg, update }) {
  return (
    <div style={{ maxWidth: 700 }}>
      <p className="section-label">Other Settings</p>

      {/* Toggles */}
      <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 8, padding: '0 16px', marginBottom: 20 }}>
        <Toggle label="Always On" desc="Aimbot active without holding key" valKey="alwaysOn" cfg={cfg} update={update} />
        <Toggle label="Dark Mode" desc="Dark interface theme (requires restart)" valKey="darkMode" cfg={cfg} update={update} />
      </div>

      {/* Theme Colors */}
      <p className="section-label" style={{ marginBottom: 12 }}>Theme Colors</p>
      <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 8, padding: '0 16px', marginBottom: 20 }}>
        <ColorRow label="Primary Color" colorKey="primary" cfg={cfg} update={update} />
        <ColorRow label="Secondary Color" colorKey="secondary" cfg={cfg} update={update} />
        <ColorRow label="Accent Color" colorKey="accent" cfg={cfg} update={update} />
        <ColorRow label="Background Color" colorKey="background" cfg={cfg} update={update} />
      </div>

      {/* Compatibility */}
      <p className="section-label" style={{ marginBottom: 12 }}>Compatibility</p>
      <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 8, padding: '12px 16px' }}>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'HVCI ON/OFF', status: true },
            { label: 'All Motherboards', status: true },
            { label: 'AMD CPU', status: true },
            { label: 'Intel CPU', status: true },
            { label: 'AMD GPU', status: true },
            { label: 'NVIDIA GPU', status: true },
            { label: 'Windows 10', status: true },
            { label: 'Windows 11 22H2+', status: true },
          ].map(({ label, status }) => (
            <div key={label} className="flex items-center gap-2">
              <span style={{ fontSize: 11, color: status ? '#00aa44' : '#cc0000', fontWeight: 700 }}>
                {status ? '✓' : '✗'}
              </span>
              <span style={{ fontSize: 11, color: '#555' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div style={{ marginTop: 16, padding: '12px 16px', background: '#090909', border: '1px solid #141414', borderRadius: 8 }}>
        <div className="flex items-center justify-between">
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#cc0000', letterSpacing: '0.1em' }}>RAZER</div>
            <div style={{ fontSize: 10, color: '#333', marginTop: 2 }}>Color-Based Target Detection Tool v1.0.0</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: '#2a2a2a' }}>For educational purposes only</div>
            <div style={{ fontSize: 9, color: '#222', marginTop: 2 }}>AMD & Intel & NVIDIA Compatible</div>
          </div>
        </div>
      </div>
    </div>
  )
}
