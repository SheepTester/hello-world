use std::{
    os::unix::fs::MetadataExt,
    sync::{
        Arc,
        atomic::{AtomicUsize, Ordering},
    },
};

use md5::{Digest, compute};
use reqwest::Client;
use tokio::{fs::File, io::AsyncReadExt};

use crate::util::MyResult;

/// Maximum size of an asset on Scratch in bytes = 10 MB - 1 byte (10 MB does
/// not work)
pub const MAX_SIZE: usize = 10 * 1000 * 1000 - 1;

/// Length of a hash in bytes
const HASH_SIZE: usize = 16;

/// The size of the header, in bytes, at the start of each inode-like chunk.
const INODE_HEADER_SIZE: usize = 15;

/// The size of the header, in bytes, at the start of each linked-list chunk.
///
/// It consists of:
/// - 16 bytes for the MD5 hash of the next chunk
/// - 8 bytes representing an u64 of the total file size (excluding the unlinked,
///   prior chunks)
const LINKED_HEADER_SIZE: usize = HASH_SIZE + 8;

/// Size of each chunk of the file to be uploaded to Scratch. This excludes the
/// 24-byte header.
const LINKED_CHUNK_SIZE: usize = MAX_SIZE - LINKED_HEADER_SIZE;

/// Scratch's asset server host.
const SERVER: &str = "https://assets.scratch.mit.edu/";

fn upload_file(
    client: &Client,
    buffer: Vec<u8>,
    scratch_sessions_id: &str,
) -> (Digest, impl Future<Output = MyResult<()>>) {
    let md5 = compute(&buffer);
    (md5, async move {
        let response = client
            .post(format!("{SERVER}{md5:x?}.wav"))
            .header("cookie", format!("scratchsessionsid={scratch_sessions_id}"))
            .body(buffer)
            .send()
            .await?;
        if !response.status().is_success() {
            let error_text = format!("HTTP error {} for {}", response.status(), response.url());
            Err(format!("{error_text}. {}", response.text().await?))?;
        }
        Ok(())
    })
}

pub async fn upload<F>(
    file: &mut File,
    scratch_sessions_id: &str,
    on_progress: F,
) -> MyResult<String>
where
    F: Fn(f32) + Copy,
{
    on_progress(0.0);
    let size = file.metadata().await?.size() as usize;
    let client = reqwest::Client::new();

    if size <= MAX_SIZE {
        let mut buffer = Vec::new();
        file.read_to_end(&mut buffer).await?;
        let (hash, future) = upload_file(&client, buffer, scratch_sessions_id);
        future.await?;
        on_progress(1.0);
        return Ok(format!("{hash:x?}."));
    }

    let (chunk_count, offset) = {
        let chunk_count = size.div_ceil(MAX_SIZE);
        let potential_main_chunk_storage =
            MAX_SIZE - (INODE_HEADER_SIZE + (chunk_count - 1) * HASH_SIZE);
        if potential_main_chunk_storage < size % MAX_SIZE {
            (chunk_count - 1, potential_main_chunk_storage)
        } else {
            (
                chunk_count,
                MAX_SIZE - (INODE_HEADER_SIZE + chunk_count * HASH_SIZE),
            )
        }
    };

    let mut first_buffer = vec![0; offset];
    file.read_exact(&mut first_buffer).await?;

    let loaded = Arc::new(AtomicUsize::new(0));
    let mut parts = Vec::new();
    for i in 0..chunk_count {
        let start_index = offset + i * MAX_SIZE;
        let length = MAX_SIZE.min(size - start_index);
        let mut buffer = vec![0; length];
        file.read_exact(&mut buffer).await?;
        let (hash, future) = upload_file(&client, buffer, scratch_sessions_id);
        let loaded = loaded.clone();
        parts.push((hash, async move {
            let result = future.await;
            let new_value = loaded.fetch_add(1, Ordering::Relaxed) + 1;
            on_progress(new_value as f32 / (chunk_count + 1) as f32);
            result
        }));
    }

    let mut main_chunk = vec![0; INODE_HEADER_SIZE + chunk_count * HASH_SIZE + offset];
    (&mut main_chunk[0..6]).copy_from_slice(&(size as u64).to_be_bytes()[2..]);
    (&mut main_chunk[6..9]).copy_from_slice(&(chunk_count as u32).to_be_bytes()[1..]);
    for (i, (hash, _)) in parts.iter().enumerate() {
        let index = INODE_HEADER_SIZE + i * HASH_SIZE;
        (&mut main_chunk[index..index + HASH_SIZE]).copy_from_slice(&hash[..]);
    }
    (&mut main_chunk[INODE_HEADER_SIZE + chunk_count * HASH_SIZE..]).copy_from_slice(&first_buffer);

    let (hash, future) = upload_file(&client, main_chunk, scratch_sessions_id);
    future.await?;
    let new_value = loaded.fetch_add(1, Ordering::Relaxed) + 1;
    on_progress(new_value as f32 / (chunk_count + 1) as f32);

    for (_, future) in parts {
        future.await?;
    }

    Ok(format!("i{hash:x?}"))
}
