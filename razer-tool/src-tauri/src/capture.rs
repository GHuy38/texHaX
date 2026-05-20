use windows::Win32::Graphics::Gdi::*;
use windows::Win32::UI::WindowsAndMessaging::*;

pub struct ScreenCapture {
    pub width: i32,
    pub height: i32,
    pub screen_w: i32,
    pub screen_h: i32,
    pub cx: i32,
    pub cy: i32,
}

impl ScreenCapture {
    pub fn new(fov: i32) -> Self {
        let (sw, sh) = unsafe {
            (GetSystemMetrics(SM_CXSCREEN), GetSystemMetrics(SM_CYSCREEN))
        };
        Self {
            width: fov * 2,
            height: fov * 2,
            screen_w: sw,
            screen_h: sh,
            cx: sw / 2,
            cy: sh / 2,
        }
    }

    /// Capture FOV area from screen center, returns raw BGRA pixels
    pub fn grab(&self) -> Option<Vec<u8>> {
        unsafe {
            let hdc_screen = GetDC(None);
            if hdc_screen.is_invalid() { return None; }

            let hdc_mem = CreateCompatibleDC(hdc_screen);
            let hbmp = CreateCompatibleBitmap(hdc_screen, self.width, self.height);
            let old = SelectObject(hdc_mem, hbmp);

            let src_x = self.cx - self.width / 2;
            let src_y = self.cy - self.height / 2;

            let ok = BitBlt(
                hdc_mem, 0, 0, self.width, self.height,
                hdc_screen, src_x, src_y, SRCCOPY,
            );

            if ok.is_err() {
                SelectObject(hdc_mem, old);
                let _ = DeleteObject(hbmp);
                let _ = DeleteDC(hdc_mem);
                ReleaseDC(None, hdc_screen);
                return None;
            }

            let mut bmi = BITMAPINFO {
                bmiHeader: BITMAPINFOHEADER {
                    biSize: std::mem::size_of::<BITMAPINFOHEADER>() as u32,
                    biWidth: self.width,
                    biHeight: -self.height, // top-down
                    biPlanes: 1,
                    biBitCount: 32,
                    biCompression: 0, // BI_RGB
                    ..Default::default()
                },
                ..Default::default()
            };

            let buf_size = (self.width * self.height * 4) as usize;
            let mut pixels = vec![0u8; buf_size];

            let lines = GetDIBits(
                hdc_mem, hbmp, 0, self.height as u32,
                Some(pixels.as_mut_ptr() as *mut _),
                &mut bmi, DIB_RGB_COLORS,
            );

            SelectObject(hdc_mem, old);
            let _ = DeleteObject(hbmp);
            let _ = DeleteDC(hdc_mem);
            ReleaseDC(None, hdc_screen);

            if lines > 0 { Some(pixels) } else { None }
        }
    }
}
