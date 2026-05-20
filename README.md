# 🎯 Razer — Color-Based Target Detection Tool

> **Lưu ý**: Dự án này chỉ mang tính chất học tập và nghiên cứu kỹ thuật.

## Cấu trúc dự án

```
testhax/
├── START.bat                    ← Chạy file này để launch app
├── package.json
├── vite.config.js
├── tailwind.config.js
├── index.html
├── electron/
│   ├── main.js                  ← Electron main process
│   ├── preload.js               ← IPC bridge
│   └── modules/
│       ├── colorDetection.js    ← Screen color search
│       ├── mouseControl.js      ← Smooth mouse movement
│       └── configManager.js     ← Save/load config.json
└── src/
    ├── main.jsx
    ├── App.jsx                  ← Main app + tabs
    ├── index.css                ← Dark theme styles
    └── components/
        ├── AimBotSettings.jsx   ← Tab 1
        ├── TriggerSettings.jsx  ← Tab 2
        ├── ConfigSettings.jsx   ← Tab 3 (key binding)
        └── OtherSettings.jsx    ← Tab 4
```

## Hướng dẫn chạy

### Cách 1 — Tự động (Khuyến nghị)
1. Double-click file `START.bat`
2. Script sẽ tự kiểm tra và cài Node.js nếu chưa có
3. Cài dependencies và launch app

### Cách 2 — Thủ công
```bash
# Yêu cầu: Node.js v18+ (https://nodejs.org)
npm install
npm run dev
```

### Build thành .exe
```bash
npm run build
npm run dist
# Output: dist-electron/Razer Setup.exe
```

## Tính năng

| Tab | Tính năng |
|-----|-----------|
| **AimBot Settings** | Color picker, Algorithm 4/3/2, FOV/Smoothing/Sensitivity/Multiplier/Recoil sliders |
| **Trigger Settings** | Trig FOV, Smoothing, Delay between shots |
| **Config Settings** | Key binding thật (Mouse1-5, F1-F12, A-Z, Special keys) |
| **Other Settings** | Always On, Dark Mode, Theme colors, Compatibility info |

## Yêu cầu kỹ thuật

- **OS**: Windows 10 / Windows 11 (22H2+)
- **CPU**: AMD & Intel (x64)
- **GPU**: AMD & NVIDIA
- **HVCI**: Compatible (userspace only)
- **Node.js**: v18 LTS trở lên

## Config file

Được lưu tại: `%APPDATA%\Razer\config.json`

## Color Detection

Hỗ trợ màu:
- 🟣 Purple (Tritanopia) — **Mặc định**
- 🔴 Red
- 🟡 Yellow  
- 🟢 Green
- 🔵 Blue
- 🩵 Cyan
- 🩷 Pink
- 🟠 Orange
