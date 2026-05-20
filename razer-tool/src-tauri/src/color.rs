/// Purple Tritanopia HSV range (from UCRazer analysis)
pub struct ColorRange {
    pub h_min: f32, pub h_max: f32,
    pub s_min: f32, pub s_max: f32,
    pub v_min: f32, pub v_max: f32,
}

pub const PURPLE_TRITANOPIA: ColorRange = ColorRange {
    h_min: 270.0, h_max: 310.0,
    s_min: 38.0,  s_max: 100.0,
    v_min: 40.0,  v_max: 100.0,
};

#[inline(always)]
pub fn rgb_to_hsv(r: u8, g: u8, b: u8) -> (f32, f32, f32) {
    let rf = r as f32 / 255.0;
    let gf = g as f32 / 255.0;
    let bf = b as f32 / 255.0;
    let max = rf.max(gf).max(bf);
    let min = rf.min(gf).min(bf);
    let d = max - min;
    let v = max * 100.0;
    let s = if max != 0.0 { (d / max) * 100.0 } else { 0.0 };
    let h = if d == 0.0 {
        0.0
    } else if max == rf {
        let mut h = 60.0 * ((gf - bf) / d);
        if h < 0.0 { h += 360.0; }
        h
    } else if max == gf {
        60.0 * (2.0 + (bf - rf) / d)
    } else {
        60.0 * (4.0 + (rf - gf) / d)
    };
    (h, s, v)
}

#[inline(always)]
pub fn matches_color(r: u8, g: u8, b: u8, range: &ColorRange) -> bool {
    let (h, s, v) = rgb_to_hsv(r, g, b);
    h >= range.h_min && h <= range.h_max
        && s >= range.s_min && s <= range.s_max
        && v >= range.v_min && v <= range.v_max
}

/// Scan pixel buffer for nearest matching color to crosshair center
pub fn find_target(
    pixels: &[u8], w: i32, h: i32, stride: i32,
    fov: i32, range: &ColorRange,
) -> Option<(i32, i32, i32, i32)> {
    let mut sum_x: i64 = 0;
    let mut sum_y: i64 = 0;
    let mut count: i64 = 0;
    let mut min_y = i32::MAX;
    let mut max_y = i32::MIN;
    let fov_sq = (fov * fov) as i64;
    let step = 2i32;

    for py in (0..h).step_by(step as usize) {
        for px in (0..w).step_by(step as usize) {
            let dx = (px - fov) as i64;
            let dy = (py - fov) as i64;
            if dx * dx + dy * dy > fov_sq { continue; }

            let idx = (py * stride + px * 4) as usize;
            if idx + 2 >= pixels.len() { continue; }
            let (b, g, r) = (pixels[idx], pixels[idx + 1], pixels[idx + 2]);

            if matches_color(r, g, b, range) {
                sum_x += px as i64;
                sum_y += py as i64;
                count += 1;
                if py < min_y { min_y = py; }
                if py > max_y { max_y = py; }
            }
        }
    }

    if count > 5 {
        let cx = (sum_x / count) as i32;
        let cy = (sum_y / count) as i32;
        Some((cx, cy, min_y, max_y))
    } else {
        None
    }
}
