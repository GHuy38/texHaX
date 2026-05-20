mod mouse;
mod capture;
mod color;
mod aimbot;

use aimbot::AimConfig;

#[tauri::command]
fn init_driver() -> bool {
    mouse::init_driver()
}

#[tauri::command]
fn driver_status() -> bool {
    mouse::is_connected()
}

#[tauri::command]
fn start_aimbot(config: AimConfig) -> bool {
    if !mouse::is_connected() {
        if !mouse::init_driver() {
            return false;
        }
    }
    aimbot::start(config);
    true
}

#[tauri::command]
fn stop_aimbot() {
    aimbot::stop();
}

#[tauri::command]
fn aimbot_status() -> bool {
    aimbot::is_running()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            init_driver,
            driver_status,
            start_aimbot,
            stop_aimbot,
            aimbot_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
