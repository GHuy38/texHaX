# 📖 Hướng Dẫn Sử Dụng Razer Tool v1.0

## 1. Cách Khởi Chạy Ứng Dụng

### Bước 1: Mở Terminal (PowerShell)
Nhấn `Win + R` → gõ `powershell` → Enter

### Bước 2: Chạy lệnh
```powershell
cd C:\Users\GiaHuy\Downloads\testhax\razer-tool
npm run tauri dev
```

### Bước 3: Chờ build
- Lần đầu: ~1-2 phút (compile Rust)
- Lần sau: ~5-10 giây (chỉ rebuild file thay đổi)
- Khi thấy dòng `Running target\debug\razer-tool.exe` → **App đã mở**

> [!TIP]
> Nếu muốn tạo shortcut nhanh: Sau khi build xong, file `.exe` nằm tại
> `C:\Users\GiaHuy\Downloads\testhax\razer-tool\src-tauri\target\debug\razer-tool.exe`
> Nhưng nhớ copy `rzctl.dll` vào cùng thư mục với `.exe`

---

## 2. Giao Diện Ứng Dụng

### Header (Thanh trên cùng)
| Phần tử | Ý nghĩa |
|---------|---------|
| 🟢 Driver: OK | `rzctl.dll` đã kết nối với Razer kernel driver thành công |
| 🔴 Driver: FAIL | Không tìm thấy driver Razer → cần cài Razer Synapse |
| 🟢 Aimbot: ON | Engine đang chạy, giữ phím aim sẽ tự di chuột |
| ⚫ Aimbot: OFF | Engine tắt |

---

## 3. Các Tab & Chức Năng

### Tab 1: Aimbot ⚡
| Slider | Chức năng | Range | Giá trị legit |
|--------|-----------|-------|---------------|
| **FOV** | Vùng quét (pixel từ tâm crosshair) | 5-120 | **30-40** |
| **Smooth** | Độ mượt (cao = chậm hơn, tự nhiên hơn) | 1-20 | **6-8** |
| **Speed** | Tốc độ di chuột | 1-15 | **3-5** |
| **Sensitivity** | Nhân tố nhạy (nhân thêm vào speed) | 0.1-3.0 | **0.8-1.2** |
| **Y Offset** | Dịch tâm ngắm lên trên (nhắm đầu) | 0-20 | **3-5** |
| **X Offset** | Dịch tâm ngắm sang ngang | -10 ~ 10 | **0-1** |
| **Enemy Color** | Màu viền địch trong game | --- | **Purple (Tritanopia)** |

### Tab 2: Trigger 🎯
| Slider | Chức năng | Giá trị legit |
|--------|-----------|---------------|
| **Trigger FOV X** | Vùng ngang kích hoạt auto-click | **3-5** |
| **Trigger FOV Y** | Vùng dọc kích hoạt auto-click | **3-5** |
| **Trigger Delay** | Độ trễ trước khi click (ms) | **30-80** |
| **Trigger Key** | Phím giữ để bật trigger | **Mouse5** |
| **Trigger Enabled** | Bật/tắt triggerbot | Tùy ý |

### Tab 3: Config ⚙️
| Chức năng | Mô tả |
|-----------|-------|
| **Aim Key** | Phím giữ để kích hoạt aimbot. Click "Alt" → overlay hiện lên → nhấn phím mới |
| **Always On** | Bật = aimbot luôn hoạt động (không cần giữ phím). **KHÔNG khuyến khích** |
| **Save Config** | Lưu config hiện tại vào bộ nhớ |
| **Load Config** | Tải config đã lưu |
| **Reset Default** | Đặt lại tất cả về mặc định |

### Tab 4: Other ℹ️
| Phần tử | Mô tả |
|---------|-------|
| **Driver** | Hiển thị trạng thái kết nối rzctl → RzCommon.sys |
| **Screen** | Độ phân giải màn hình |
| **Status** | Idle / Running / Stopped |
| **FOV Circle** | Hiển thị vòng tròn FOV trên màn hình (chưa implement) |

---

## 4. Cách Sử Dụng Trong Game

### Bước 1: Chuẩn bị
1. Mở **Razer Synapse** (để driver hoạt động)
2. Mở **Razer Tool** (`npm run tauri dev`)
3. Kiểm tra header: **Driver: OK** 🟢

### Bước 2: Cài đặt Valorant
1. Vào Valorant → **Settings** → **Accessibility**
2. Đổi **Enemy Highlight Color** = **Purple (Tritanopia)**
3. Chế độ hiển thị: **Windowed Fullscreen** (bắt buộc)

### Bước 3: Config tool
1. Tab **Aimbot** → chỉnh các slider (dùng config legit bên dưới)
2. Tab **Config** → bind **Aim Key** (mặc định là ALT)
3. Nhấn **Save Config**

### Bước 4: Kích hoạt
1. Nhấn nút **ACTIVATE** ở cuối app (nút chuyển sang đỏ = đang chạy)
2. Vào game, **giữ phím ALT** (hoặc phím đã bind)
3. Khi có địch trong vùng FOV → chuột tự di về phía đầu địch
4. Bạn chỉ cần **click bắn**

### Bước 5: Tắt
- Nhấn **DEACTIVATE** trên tool
- Hoặc nhấn **ESC** để dừng khẩn cấp

---

## 5. Config Legit Nhất (Khuyến Nghị)

> [!IMPORTANT]
> Config này được thiết kế để trông giống người thật nhất có thể, giảm thiểu detect.

### 🏆 Config "Soft Aim" (An toàn nhất)
```
FOV:         30
Smooth:      8
Speed:       3
Sensitivity: 0.8
Y Offset:    4
X Offset:    0
Aim Key:     Mouse5 (hoặc Alt)
Always On:   OFF
Enemy Color: Purple (Tritanopia)
```
**Đặc điểm:** Di chuột chậm, mượt, chỉ hỗ trợ nhẹ. Khó bị nghi.

### ⚡ Config "Balanced" (Cân bằng)
```
FOV:         40
Smooth:      6
Speed:       4
Sensitivity: 1.0
Y Offset:    4
X Offset:    1
Aim Key:     Alt
Always On:   OFF
Enemy Color: Purple (Tritanopia)
```
**Đặc điểm:** Aim nhanh hơn nhưng vẫn có smooth. Phù hợp rank thấp-trung.

### 🔥 Config "Aggressive" (Mạnh - Dễ bị nghi)
```
FOV:         60
Smooth:      3
Speed:       6
Sensitivity: 1.2
Y Offset:    5
X Offset:    1
Aim Key:     Alt
Always On:   OFF
Enemy Color: Purple (Tritanopia)
```
**Đặc điểm:** Aim nhanh, FOV rộng. **Chỉ dùng khi test, không dùng rank.**

---

## 6. Giải Thích Các Thông Số

### FOV (Field of View)
```
FOV nhỏ (20-30):  Chỉ aim khi crosshair gần địch → tự nhiên hơn
FOV lớn (60-100): Aim từ xa → nhanh nhưng dễ bị phát hiện
```

### Smooth
```
Smooth cao (7-10): Chuột di từ từ, giống người → AN TOÀN
Smooth thấp (1-3): Chuột snap nhanh → robot, DỄ BỊ BAN
```

### Speed vs Sensitivity
- **Speed**: Tốc độ cơ bản của aimbot
- **Sensitivity**: Hệ số nhân (nên set = sens trong game / 1.0)
- Công thức: `mouse_delta = pixel_diff × speed / smooth × sensitivity`

### Y Offset
```
Y Offset = 0:  Aim vào giữa body
Y Offset = 3-5: Aim vào cổ/đầu (khuyến nghị)
Y Offset = 8+:  Aim cao hơn đầu (sai)
```

---

## 7. Lưu Ý Quan Trọng

> [!CAUTION]
> - **Luôn tắt tool trước khi đóng game** để tránh process leak
> - **Không bao giờ dùng Always On** trong ranked match
> - **FOV ≤ 40 + Smooth ≥ 6** là ngưỡng an toàn nhất
> - Valorant chạy **Windowed Fullscreen** (không phải Fullscreen)
> - Razer Synapse **phải đang chạy** để driver hoạt động
> - Tool này chỉ mang tính nghiên cứu học tập

---

## 8. Troubleshooting

| Vấn đề | Giải pháp |
|--------|-----------|
| Driver: FAIL | Cài Razer Synapse, restart PC |
| Aimbot không di chuột | Kiểm tra Enemy Color = Purple Tritanopia trong game |
| App không mở | Chạy `npm install` trước rồi `npm run tauri dev` |
| Build lỗi | Chạy `rustup update` rồi thử lại |
| Chuột giật | Tăng Smooth lên 8-10, giảm Speed xuống 2-3 |
