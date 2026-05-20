use crate::capture::ScreenCapture;
use crate::color::{self, PURPLE_TRITANOPIA};
use crate::mouse;
use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;
use std::time::Duration;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AimConfig {
    pub fov: i32,
    pub smooth: f32,
    pub speed: f32,
    pub y_offset: f32,
    pub x_offset: f32,
    pub aim_key: i32,     // Virtual key code
    pub always_on: bool,
    pub sensitivity: f32,
}

impl Default for AimConfig {
    fn default() -> Self {
        Self {
            fov: 35,
            smooth: 5.0,
            speed: 4.0,
            y_offset: 4.0,
            x_offset: 1.0,
            aim_key: 0x12, // ALT
            always_on: false,
            sensitivity: 1.0,
        }
    }
}

struct AimState {
    x_history: Vec<f32>,
    y_history: Vec<f32>,
    filter_len: usize,
}

impl AimState {
    fn new() -> Self {
        let fl = 3;
        Self {
            x_history: vec![0.0; fl],
            y_history: vec![0.0; fl],
            filter_len: fl,
        }
    }

    fn smooth_move(&mut self, raw_x: f32, raw_y: f32) -> (i32, i32) {
        self.x_history.push(raw_x);
        self.y_history.push(raw_y);
        if self.x_history.len() > self.filter_len { self.x_history.remove(0); }
        if self.y_history.len() > self.filter_len { self.y_history.remove(0); }

        let sx: f32 = self.x_history.iter().sum::<f32>() / self.filter_len as f32;
        let sy: f32 = self.y_history.iter().sum::<f32>() / self.filter_len as f32;

        // Micro-jitter for humanization
        let jx = (rand::random::<f32>() - 0.5) * 0.4;
        let jy = (rand::random::<f32>() - 0.5) * 0.4;

        ((sx + jx) as i32, (sy + jy) as i32)
    }
}

static RUNNING: AtomicBool = AtomicBool::new(false);

pub fn is_running() -> bool {
    RUNNING.load(Ordering::Relaxed)
}

pub fn start(config: AimConfig) {
    if RUNNING.load(Ordering::Relaxed) { return; }
    RUNNING.store(true, Ordering::Relaxed);

    thread::spawn(move || {
        run_loop(config);
    });
}

pub fn stop() {
    RUNNING.store(false, Ordering::Relaxed);
}

fn is_key_held(vk: i32) -> bool {
    unsafe {
        (windows::Win32::UI::Input::KeyboardAndMouse::GetAsyncKeyState(vk) as u16 & 0x8000) != 0
    }
}

fn run_loop(config: AimConfig) {
    let cap = ScreenCapture::new(config.fov);
    let mut state = AimState::new();
    let range = PURPLE_TRITANOPIA;
    let stride = cap.width * 4;

    while RUNNING.load(Ordering::Relaxed) {
        // ESC to stop
        if is_key_held(0x1B) {
            RUNNING.store(false, Ordering::Relaxed);
            break;
        }

        let held = if config.always_on {
            true
        } else {
            is_key_held(config.aim_key)
        };

        if held {
            if let Some(pixels) = cap.grab() {
                if let Some((cx, _cy, min_y, max_y)) = color::find_target(
                    &pixels, cap.width, cap.height, stride,
                    config.fov, &range,
                ) {
                    let blob_h = max_y - min_y;
                    let y_aim = min_y + (blob_h as f32 * 0.3) as i32;

                    let dx = (cx - config.fov) as f32 + config.x_offset;
                    let dy = (y_aim - config.fov) as f32 - config.y_offset;

                    let raw_x = dx * config.speed / config.smooth * config.sensitivity;
                    let raw_y = dy * config.speed / config.smooth * config.sensitivity;

                    let (mx, my) = state.smooth_move(raw_x, raw_y);

                    if mx.abs() > 0 || my.abs() > 0 {
                        mouse::move_mouse(mx, my);
                    }
                }
            }
        }

        thread::sleep(Duration::from_millis(1));
    }
}
