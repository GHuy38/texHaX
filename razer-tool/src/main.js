const { invoke } = window.__TAURI__.core;

// ============= State =============
let isActive = false;
let driverOk = false;
let bindingTarget = null;

const VK_MAP = {
  'Alt':18,'Shift':16,'Ctrl':17,'CapsLock':20,'Tab':9,'Space':32,
  'F1':112,'F2':113,'F3':114,'F4':115,'F5':116,'F6':117,
  'Mouse1':1,'Mouse2':2,'Mouse3':4,'Mouse4':5,'Mouse5':6,
};
const VK_NAMES = Object.fromEntries(Object.entries(VK_MAP).map(([k,v])=>[v,k]));

// ============= Tabs =============
document.querySelectorAll('.tab').forEach(t=>{
  t.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById(t.dataset.tab).classList.add('active');
  });
});

// ============= Sliders =============
['fov','smooth','speed','sens','yoff','xoff','trigFovX','trigFovY','trigDelay'].forEach(id=>{
  const el = document.getElementById(id);
  const vl = document.getElementById(id+'V');
  if(!el||!vl) return;
  const upd = ()=>{ vl.textContent = el.value; };
  el.addEventListener('input', upd);
  upd();
});

// ============= Key Binding =============
function startBind(targetId) {
  bindingTarget = targetId;
  const btn = document.getElementById(targetId+'Btn');
  btn.classList.add('listening');
  btn.textContent = '...';
  document.getElementById('bindOverlay').classList.add('show');

  const onKey = (e)=>{
    e.preventDefault();
    if(e.key==='Escape'){cancelBind(); return;}
    let name = e.key==='Control'?'Ctrl':e.key===' '?'Space':
               e.key.length===1?e.key.toUpperCase():e.key;
    let vk = VK_MAP[name] || e.keyCode;
    finishBind(name, vk);
  };
  const onMouse = (e)=>{
    e.preventDefault();
    const names = {0:'Mouse1',1:'Mouse3',2:'Mouse2',3:'Mouse4',4:'Mouse5'};
    let name = names[e.button]||'Mouse'+(e.button+1);
    let vk = VK_MAP[name]||1;
    finishBind(name, vk);
  };
  document.addEventListener('keydown', onKey, {once:true});
  document.getElementById('bindOverlay').addEventListener('mousedown', (e)=>{
    if(e.target.closest('.btn-cancel')) return;
    onMouse(e);
  }, {once:true});
}

function finishBind(name, vk) {
  if(!bindingTarget) return;
  document.getElementById(bindingTarget).value = vk;
  const btn = document.getElementById(bindingTarget+'Btn');
  btn.textContent = name;
  btn.classList.remove('listening');
  document.getElementById('bindOverlay').classList.remove('show');
  bindingTarget = null;
}

function cancelBind() {
  if(bindingTarget) {
    const btn = document.getElementById(bindingTarget+'Btn');
    btn.classList.remove('listening');
    btn.textContent = VK_NAMES[parseInt(document.getElementById(bindingTarget).value)]||'?';
  }
  document.getElementById('bindOverlay').classList.remove('show');
  bindingTarget = null;
}

// ============= Config =============
function getConfig() {
  return {
    fov: parseInt(document.getElementById('fov').value),
    smooth: parseFloat(document.getElementById('smooth').value),
    speed: parseFloat(document.getElementById('speed').value),
    y_offset: parseFloat(document.getElementById('yoff').value),
    x_offset: parseFloat(document.getElementById('xoff').value),
    aim_key: parseInt(document.getElementById('aimKey').value),
    always_on: document.getElementById('alwaysOn').checked,
    sensitivity: parseFloat(document.getElementById('sens').value),
  };
}

function saveConfig() {
  const cfg = getConfig();
  localStorage.setItem('razer_config', JSON.stringify(cfg));
  const msg = document.getElementById('saveMsg');
  msg.textContent = '✓ Config saved';
  setTimeout(()=>msg.textContent='', 2000);
}

function loadConfig() {
  const raw = localStorage.getItem('razer_config');
  if(!raw) return;
  try {
    const cfg = JSON.parse(raw);
    if(cfg.fov) document.getElementById('fov').value = cfg.fov;
    if(cfg.smooth) document.getElementById('smooth').value = cfg.smooth;
    if(cfg.speed) document.getElementById('speed').value = cfg.speed;
    if(cfg.sensitivity) document.getElementById('sens').value = cfg.sensitivity;
    if(cfg.y_offset!==undefined) document.getElementById('yoff').value = cfg.y_offset;
    if(cfg.x_offset!==undefined) document.getElementById('xoff').value = cfg.x_offset;
    if(cfg.aim_key) {
      document.getElementById('aimKey').value = cfg.aim_key;
      document.getElementById('aimKeyBtn').textContent = VK_NAMES[cfg.aim_key]||'Key'+cfg.aim_key;
    }
    if(cfg.always_on) document.getElementById('alwaysOn').checked = cfg.always_on;
    // Update slider displays
    ['fov','smooth','speed','sens','yoff','xoff'].forEach(id=>{
      const el = document.getElementById(id);
      const vl = document.getElementById(id+'V');
      if(el&&vl) vl.textContent = el.value;
    });
    const msg = document.getElementById('saveMsg');
    msg.textContent = '✓ Config loaded';
    setTimeout(()=>msg.textContent='', 2000);
  } catch(e){}
}

function resetConfig() {
  document.getElementById('fov').value = 35;
  document.getElementById('smooth').value = 5;
  document.getElementById('speed').value = 4;
  document.getElementById('sens').value = 1;
  document.getElementById('yoff').value = 4;
  document.getElementById('xoff').value = 1;
  document.getElementById('aimKey').value = 18;
  document.getElementById('aimKeyBtn').textContent = 'Alt';
  document.getElementById('alwaysOn').checked = false;
  ['fov','smooth','speed','sens','yoff','xoff'].forEach(id=>{
    const el = document.getElementById(id);
    const vl = document.getElementById(id+'V');
    if(el&&vl) vl.textContent = el.value;
  });
}

// ============= Activate =============
async function toggleActivate() {
  const btn = document.getElementById('activateBtn');
  if(!isActive) {
    if(!driverOk) {
      driverOk = await invoke('init_driver');
      updateDriverUI();
      if(!driverOk) {
        btn.textContent = 'DRIVER ERROR';
        setTimeout(()=>btn.textContent='ACTIVATE', 2000);
        return;
      }
    }
    const cfg = getConfig();
    const ok = await invoke('start_aimbot', { config: cfg });
    if(ok) {
      isActive = true;
      btn.textContent = 'DEACTIVATE';
      btn.className = 'btn-activate active';
      document.getElementById('aimDot').className = 'dot on';
      document.getElementById('aimLabel').textContent = 'Aimbot: ON';
      document.getElementById('statusInfo').textContent = 'Running';
    }
  } else {
    await invoke('stop_aimbot');
    isActive = false;
    btn.textContent = 'ACTIVATE';
    btn.className = 'btn-activate ready';
    document.getElementById('aimDot').className = 'dot off';
    document.getElementById('aimLabel').textContent = 'Aimbot: OFF';
    document.getElementById('statusInfo').textContent = 'Stopped';
  }
}

function updateDriverUI() {
  const dot = document.getElementById('driverDot');
  const lbl = document.getElementById('driverLabel');
  const info = document.getElementById('drvInfo');
  const btn = document.getElementById('activateBtn');
  if(driverOk) {
    dot.className = 'dot on';
    lbl.textContent = 'Driver: OK';
    info.textContent = 'rzctl.dll → RzCommon.sys ✓';
    btn.className = 'btn-activate ready';
    btn.textContent = 'ACTIVATE';
  } else {
    dot.className = 'dot off';
    lbl.textContent = 'Driver: FAIL';
    info.textContent = 'Not connected';
  }
}

// ============= Init =============
window.addEventListener('DOMContentLoaded', async ()=>{
  loadConfig();
  try {
    driverOk = await invoke('init_driver');
  } catch(e) { driverOk = false; }
  updateDriverUI();
  document.getElementById('scrInfo').textContent = `${screen.width}x${screen.height}`;
});
