import { useState, useEffect, useRef } from 'react'

const MOUSE_KEYS = ['None', 'Mouse1', 'Mouse2', 'Mouse3', 'Mouse4', 'Mouse5']
const KEY_GROUPS = {
  'Mouse': MOUSE_KEYS,
  'Function': ['F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12'],
  'Special': ['Shift','Ctrl','Alt','CapsLock','Tab','Space','Enter','Backspace','Delete','Insert','Home','End','PageUp','PageDown'],
  'Numbers': ['0','1','2','3','4','5','6','7','8','9'],
  'Letters': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
}
const ALL_KEYS = [...new Set(Object.values(KEY_GROUPS).flat())]

function normalizeKey(e) {
  if (e.type === 'mousedown') {
    const btns = { 0: 'Mouse1', 1: 'Mouse3', 2: 'Mouse2', 3: 'Mouse4', 4: 'Mouse5' }
    return btns[e.button] || `Mouse${e.button + 1}`
  }
  if (e.code?.startsWith('Mouse')) return e.code
  const map = {
    ' ': 'Space', 'Control': 'Ctrl', 'Meta': 'Win',
    'ArrowUp': '↑', 'ArrowDown': '↓', 'ArrowLeft': '←', 'ArrowRight': '→',
  }
  return map[e.key] || e.key?.toUpperCase() || 'Unknown'
}

function KeyBindRow({ label, cfgKey, cfg, update }) {
  const [listening, setListening] = useState(false)
  const overlayRef = useRef(null)

  const startListen = () => {
    setListening(true)
    setTimeout(() => overlayRef.current?.focus(), 50)
  }

  const onKeyCapture = (e) => {
    if (!listening) return
    e.preventDefault()
    e.stopPropagation()
    if (e.key === 'Escape') { setListening(false); return }
    const key = normalizeKey(e)
    update(cfgKey, key)
    setListening(false)
  }

  return (
    <div className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid #141414' }}>
      <span style={{ width: 120, fontSize: 12, color: '#888', flexShrink: 0 }}>{label}</span>

      {/* Dropdown */}
      <select
        value={cfg[cfgKey]}
        onChange={e => update(cfgKey, e.target.value)}
        style={{ width: 140 }}
      >
        {ALL_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
      </select>

      {/* Current key display */}
      <div style={{
        padding: '4px 12px', minWidth: 70, textAlign: 'center',
        background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: 4,
        fontFamily: 'JetBrains Mono', fontSize: 12, color: '#aaa',
      }}>
        {cfg[cfgKey] || 'None'}
      </div>

      {/* Bind button */}
      <button
        className={`bind-btn ${listening ? 'listening' : ''}`}
        onClick={startListen}
        ref={listening ? undefined : undefined}
      >
        {listening ? '⌨ Press Key...' : 'Click to Bind'}
      </button>

      {/* Hidden focusable overlay to capture key events */}
      {listening && (
        <div
          ref={overlayRef}
          tabIndex={0}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, outline: 'none', cursor: 'crosshair',
            background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onKeyDown={onKeyCapture}
          onMouseDown={onKeyCapture}
          onClick={e => { if (listening) { e.preventDefault(); const k = normalizeKey(e); update(cfgKey, k); setListening(false); } }}
        >
          <div style={{ background: '#111', border: '1px solid #cc0000', borderRadius: 10, padding: '24px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
              Press any key or mouse button
            </div>
            <div style={{ fontSize: 11, color: '#cc0000', fontFamily: 'JetBrains Mono' }}>Binding: {label}</div>
            <div style={{ fontSize: 10, color: '#333', marginTop: 10 }}>ESC to cancel</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ConfigSettings({ cfg, update }) {
  return (
    <div style={{ maxWidth: 700 }}>
      <p className="section-label">Config Settings</p>

      <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 8, padding: '4px 16px', marginBottom: 16 }}>
        <KeyBindRow label="AimBot Key 1" cfgKey="aimbotKey1" cfg={cfg} update={update} />
        <KeyBindRow label="AimBot Key 2" cfgKey="aimbotKey2" cfg={cfg} update={update} />
        <KeyBindRow label="Trigger Key" cfgKey="triggerKey" cfg={cfg} update={update} />
        <KeyBindRow label="Toggle Key" cfgKey="toggleKey" cfg={cfg} update={update} />
      </div>

      {/* Key reference */}
      <div style={{ padding: '12px 16px', background: '#0a0a0a', border: '1px solid #161616', borderRadius: 8 }}>
        <div style={{ fontSize: 10, color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Key Reference</div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(KEY_GROUPS).map(([group, keys]) => (
            <div key={group}>
              <div style={{ fontSize: 9, color: '#333', marginBottom: 4, letterSpacing: '0.08em' }}>{group}</div>
              <div className="flex flex-wrap gap-1">
                {keys.slice(0, 12).map(k => (
                  <span key={k} style={{
                    fontSize: 9, padding: '2px 5px',
                    background: '#111', border: '1px solid #1e1e1e',
                    borderRadius: 3, color: '#444', fontFamily: 'JetBrains Mono'
                  }}>{k}</span>
                ))}
                {keys.length > 12 && <span style={{ fontSize: 9, color: '#333' }}>+{keys.length - 12}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
