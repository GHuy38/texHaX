import { useState, useEffect, useCallback } from 'react'
import AimBotSettings from './components/AimBotSettings'
import TriggerSettings from './components/TriggerSettings'
import ConfigSettings from './components/ConfigSettings'
import OtherSettings from './components/OtherSettings'

const api = window.electronAPI || {
  loadConfig: async () => ({}),
  saveConfig: async () => {},
  getSystemInfo: async () => ({ os: 'Windows 11', cpu: 'AMD Ryzen 5 5600X', ram: '16 GB RAM', hostname: 'PC' }),
  startAimbot: async () => {},
  stopAimbot: async () => {},
  minimizeWindow: () => {},
  maximizeWindow: () => {},
  closeWindow: () => {},
}

const DEFAULT_CFG = {
  enemyColor: 'purple-tritanopia', algorithm: 4,
  aimFov: 100, smoothing: 5, sensitivity: 1.0, aimMultiplier: 1.0,
  recoilLength: 10, headOffsetX: 0, headOffsetY: 20,
  trigFov: 10, trigSmoothing: 3, delayBetweenShots: 100,
  aimbotKey1: 'Mouse2', aimbotKey2: 'None', triggerKey: 'Mouse4', toggleKey: 'F5',
  alwaysOn: false, darkMode: true,
  themeColors: { primary: '#cc0000', secondary: '#1a1a1a', accent: '#ff4444', background: '#080808' }
}

const TABS = ['AimBot Settings', 'Trigger Settings', 'Config Settings', 'Other Settings']

export default function App() {
  const [tab, setTab] = useState(0)
  const [cfg, setCfg] = useState(DEFAULT_CFG)
  const [sysInfo, setSysInfo] = useState(null)
  const [aimbotOn, setAimbotOn] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.loadConfig().then(data => {
      if (data && Object.keys(data).length > 0) setCfg(prev => ({ ...prev, ...data }))
    })
    api.getSystemInfo().then(info => setSysInfo(info))
  }, [])

  const updateCfg = useCallback((key, val) => {
    setCfg(prev => ({ ...prev, [key]: val }))
  }, [])

  const handleSave = async () => {
    await api.saveConfig(cfg)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggleAimbot = async () => {
    if (aimbotOn) {
      await api.stopAimbot()
      setAimbotOn(false)
    } else {
      await api.startAimbot(cfg)
      setAimbotOn(true)
    }
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg)' }}>
      {/* Title Bar */}
      <div className="titlebar flex items-center justify-between px-4 h-10 flex-shrink-0"
        style={{ background: '#0a0a0a', borderBottom: '1px solid #161616' }}>
        <div className="flex items-center gap-3">
          {/* Razer Logo SVG */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" fill="#cc0000" opacity="0.9"/>
            <path d="M12 2L2 7l10 5 10-5L12 2z" fill="#ee0000"/>
          </svg>
          <span style={{ fontWeight: 700, fontSize: 12, letterSpacing: '0.15em', color: '#e0e0e0' }}>RAZER</span>
          <span style={{ fontSize: 10, color: '#333', letterSpacing: '0.08em' }}>v1.0.0</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="status-dot" style={aimbotOn ? { background: '#00cc50', boxShadow: '0 0 8px rgba(0,200,80,0.6)' } : {}} />
          <span style={{ fontSize: 10, color: aimbotOn ? '#00cc50' : '#333', marginRight: 12 }}>
            {aimbotOn ? 'ACTIVE' : 'INACTIVE'}
          </span>
          <button onClick={api.minimizeWindow} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 16, padding: '0 6px', lineHeight: 1 }}>─</button>
          <button onClick={api.maximizeWindow} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 12, padding: '0 6px', lineHeight: 1 }}>▭</button>
          <button onClick={api.closeWindow} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 14, padding: '0 6px', lineHeight: 1, transition: 'color 0.15s' }}
            onMouseEnter={e => e.target.style.color = '#cc0000'}
            onMouseLeave={e => e.target.style.color = '#444'}>✕</button>
        </div>
      </div>

      {/* System Info Bar */}
      {sysInfo && (
        <div className="flex items-center gap-5 px-4 py-2 flex-shrink-0"
          style={{ background: '#090909', borderBottom: '1px solid #131313' }}>
          {[
            ['OS', sysInfo.os],
            ['CPU', sysInfo.cpu?.substring(0, 36)],
            ['MEM', sysInfo.ram],
          ].map(([label, val]) => (
            <div key={label} className="flex items-center gap-1.5">
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#333', textTransform: 'uppercase' }}>{label}</span>
              <span style={{ fontSize: 10, color: '#4a4a4a', fontFamily: 'JetBrains Mono, monospace' }}>{val}</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-1.5">
            <span style={{ fontSize: 9, color: '#333' }}>HVCI COMPATIBLE</span>
            <span style={{ fontSize: 9, color: '#00aa44', fontWeight: 700 }}>✓</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-end px-4 flex-shrink-0" style={{ background: '#090909', borderBottom: '1px solid #1a1a1a' }}>
        {TABS.map((t, i) => (
          <button key={t} className={`tab-btn ${tab === i ? 'active' : ''}`} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === 0 && <AimBotSettings cfg={cfg} update={updateCfg} />}
        {tab === 1 && <TriggerSettings cfg={cfg} update={updateCfg} />}
        {tab === 2 && <ConfigSettings cfg={cfg} update={updateCfg} />}
        {tab === 3 && <OtherSettings cfg={cfg} update={updateCfg} />}
      </div>

      {/* Bottom Bar */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ background: '#090909', borderTop: '1px solid #1a1a1a' }}>
        <div style={{ fontSize: 10, color: '#2a2a2a' }}>
          Config: <span style={{ fontFamily: 'JetBrains Mono', color: '#333' }}>%APPDATA%/Razer/config.json</span>
        </div>
        <div className="flex gap-3 items-center">
          {saved && <span style={{ fontSize: 10, color: '#00aa44', fontWeight: 600 }}>✓ SAVED</span>}
          <button className={aimbotOn ? 'btn-aimbot-on' : 'btn-aimbot-off'} onClick={toggleAimbot}>
            {aimbotOn ? '⬛ Stop Aimbot' : '▶ Start Aimbot'}
          </button>
          <button className="btn-update" onClick={handleSave}>Update Configuration</button>
        </div>
      </div>
    </div>
  )
}
