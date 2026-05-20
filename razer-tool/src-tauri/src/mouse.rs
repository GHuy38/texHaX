use libloading::{Library, Symbol};
use std::sync::Mutex;
use std::path::PathBuf;

type InitFn = unsafe extern "C" fn() -> bool;
type MouseMoveFn = unsafe extern "C" fn(i32, i32, bool);
type MouseClickFn = unsafe extern "C" fn(i32);

static RZCTL: Mutex<Option<RzctlDriver>> = Mutex::new(None);

struct RzctlDriver {
    _lib: Library,
    mouse_move: MouseMoveFn,
    mouse_click: MouseClickFn,
}

unsafe impl Send for RzctlDriver {}
unsafe impl Sync for RzctlDriver {}

pub fn init_driver() -> bool {
    let mut guard = RZCTL.lock().unwrap();
    if guard.is_some() { return true; }

    let dll_path = find_rzctl_dll();
    let lib = match unsafe { Library::new(&dll_path) } {
        Ok(l) => l,
        Err(_) => return false,
    };

    let init_ok = unsafe {
        let init: Symbol<InitFn> = match lib.get(b"init") {
            Ok(f) => f,
            Err(_) => return false,
        };
        init()
    };

    if !init_ok { return false; }

    let mouse_move = unsafe {
        let f: Symbol<MouseMoveFn> = match lib.get(b"mouse_move") {
            Ok(f) => f,
            Err(_) => return false,
        };
        *f
    };

    let mouse_click = unsafe {
        let f: Symbol<MouseClickFn> = match lib.get(b"mouse_click") {
            Ok(f) => f,
            Err(_) => return false,
        };
        *f
    };

    *guard = Some(RzctlDriver { _lib: lib, mouse_move, mouse_click });
    true
}

pub fn move_mouse(dx: i32, dy: i32) {
    let guard = RZCTL.lock().unwrap();
    if let Some(ref drv) = *guard {
        unsafe { (drv.mouse_move)(dx, dy, false); }
    }
}

pub fn click_mouse(button: i32) {
    let guard = RZCTL.lock().unwrap();
    if let Some(ref drv) = *guard {
        unsafe { (drv.mouse_click)(button); }
    }
}

pub fn is_connected() -> bool {
    RZCTL.lock().unwrap().is_some()
}

fn find_rzctl_dll() -> PathBuf {
    let exe = std::env::current_exe().unwrap_or_default();
    let dir = exe.parent().unwrap_or(std::path::Path::new("."));
    let local = dir.join("rzctl.dll");
    if local.exists() { return local; }
    PathBuf::from("rzctl.dll")
}
