//! WASM integration tests

use wasm_bindgen_test::*;

// Import from the crate using external name
use rustreexo_wasm::{Hash, WasmStump, WasmPollard, version};

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn test_version() {
    let v = version();
    assert!(!v.is_empty());
    assert!(v.contains("0.4.0"));
}

#[wasm_bindgen_test] 
fn test_hash_creation() {
    let test_hash = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    let hash = Hash::new(test_hash).unwrap();
    assert_eq!(hash.to_hex(), test_hash);
}

#[wasm_bindgen_test]
fn test_hash_from_bytes() {
    let bytes = [1u8; 32];
    let hash = Hash::from_bytes(&bytes).unwrap();
    let result_bytes = hash.to_bytes();
    assert_eq!(result_bytes, bytes);
}

#[wasm_bindgen_test]
fn test_stump_creation() {
    let stump = WasmStump::new();
    assert_eq!(stump.num_leaves(), 0);
    assert_eq!(stump.roots().len(), 0);
}

#[wasm_bindgen_test]
fn test_pollard_creation() {
    let pollard = WasmPollard::new();
    assert_eq!(pollard.num_leaves(), 0);
    assert_eq!(pollard.roots().len(), 0);
}