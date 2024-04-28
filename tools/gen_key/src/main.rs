use std::error::Error;

use rand::RngCore;

//https://github.com/rust10x/rust-web-app/blob/main/crates/tools/gen-key/src/main.rs
fn main() -> Result<(), Box<dyn Error>> {
    let mut key = [0u8; 64]; // 512 bits = 64 bytes
    rand::thread_rng().fill_bytes(&mut key);
    println!("\nGenerated key from rand::thread_rng():\n{key:?}");

    let b64u = simple_base64::encode(key);
    println!("\nKey b64u encoded:\n{b64u}");
    Ok(())
}
