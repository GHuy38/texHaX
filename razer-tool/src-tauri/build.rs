fn main() {
    // Tell linker where to find rzctl.dll at runtime
    println!("cargo:rustc-link-search=native={}", std::env::var("CARGO_MANIFEST_DIR").unwrap());

    tauri_build::build()
}
