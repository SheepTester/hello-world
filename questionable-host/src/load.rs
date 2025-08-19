use std::{
    convert::Infallible,
    io::{Error, ErrorKind},
    os::unix::fs::MetadataExt,
    sync::{
        Arc,
        atomic::{AtomicUsize, Ordering},
    },
};

use async_stream::stream;
use futures_util::{StreamExt, TryStreamExt};
use md5::{Digest, compute};
use reqwest::{Body, Client};
use tokio::{
    fs::File,
    io::{AsyncReadExt, AsyncWrite, AsyncWriteExt},
    spawn,
};
use tokio_util::io::StreamReader;

use crate::util::{BoxedError, MyResult};

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
    client: Arc<Client>,
    buffer: Vec<u8>,
    scratch_sessions_id: String,
    on_progress: impl Fn(usize) + Send + 'static,
) -> (Digest, impl Future<Output = MyResult<()>>) {
    let md5 = compute(&buffer);
    (md5, async move {
        let response = client
            .post(format!("{SERVER}{md5:x}.wav"))
            .header(
                "cookie",
                format!("scratchsessionsid=\"{scratch_sessions_id}\""),
            )
            .body(Body::wrap_stream(stream! {
                // default ReaderStream capacity is 4096
                for chunk in buffer.chunks(4096) {
                    on_progress(chunk.len());
                    yield Ok::<_, Infallible>(Vec::from(chunk));
                }
            }))
            .send()
            .await?;
        if !response.status().is_success() {
            let error_text = format!("HTTP {} error for {}", response.status(), response.url());
            Err(format!("{error_text}. {}", response.text().await?))?;
        }
        Ok(())
    })
}

pub async fn upload(
    client: Arc<Client>,
    file: &mut File,
    scratch_sessions_id: &str,
    on_progress: impl Fn(usize, usize) + Clone + Send + Sync + 'static,
) -> MyResult<String> {
    let size = file.metadata().await?.size() as usize;
    on_progress(0, size);
    let uploaded = Arc::new(AtomicUsize::new(0));
    let handle_progress = move |bytes_uploaded| {
        on_progress(
            uploaded.fetch_add(bytes_uploaded, Ordering::Relaxed) + bytes_uploaded,
            size,
        );
    };

    if size <= MAX_SIZE {
        let mut buffer = Vec::new();
        file.read_to_end(&mut buffer).await?;
        let (hash, future) = upload_file(
            client,
            buffer,
            String::from(scratch_sessions_id),
            handle_progress.clone(),
        );
        future.await?;
        return Ok(format!("{hash:x}."));
    }

    let (chunk_count, offset) = {
        let chunk_count = size.div_ceil(MAX_SIZE);
        let potential_main_chunk_storage =
            MAX_SIZE - (INODE_HEADER_SIZE + (chunk_count - 1) * HASH_SIZE);
        if size % MAX_SIZE <= potential_main_chunk_storage {
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

    let mut parts = Vec::new();
    for i in 0..chunk_count {
        let start_index = offset + i * MAX_SIZE;
        let length = MAX_SIZE.min(size - start_index);
        let mut buffer = vec![0; length];
        file.read_exact(&mut buffer).await?;
        let (hash, future) = upload_file(
            client.clone(),
            buffer,
            String::from(scratch_sessions_id),
            handle_progress.clone(),
        );
        parts.push((hash, spawn(future)));
    }

    let mut main_chunk = vec![0; INODE_HEADER_SIZE + chunk_count * HASH_SIZE + offset];
    (&mut main_chunk[0..6]).copy_from_slice(&(size as u64).to_be_bytes()[2..]);
    (&mut main_chunk[6..9]).copy_from_slice(&(chunk_count as u32).to_be_bytes()[1..]);
    for (i, (hash, _)) in parts.iter().enumerate() {
        let index = INODE_HEADER_SIZE + i * HASH_SIZE;
        (&mut main_chunk[index..index + HASH_SIZE]).copy_from_slice(&hash[..]);
    }
    (&mut main_chunk[INODE_HEADER_SIZE + chunk_count * HASH_SIZE..]).copy_from_slice(&first_buffer);

    let (hash, future) = upload_file(
        client,
        main_chunk,
        String::from(scratch_sessions_id),
        handle_progress,
    );
    future.await?;

    for (_, future) in parts {
        future.await??;
    }

    Ok(format!("i{hash:x}"))
}

pub async fn download_inode(
    client: Arc<Client>,
    hash: &str,
    mut output: impl AsyncWrite + Unpin,
    on_progress: impl Fn(usize, usize) + Send + Clone + 'static,
) -> MyResult<()> {
    let response = client
        .get(format!("{SERVER}internalapi/asset/{hash}.wav/get/"))
        .send()
        .await?;
    if !response.status().is_success() {
        Err(format!(
            "HTTP {} error for {}",
            response.status(),
            response.url()
        ))?;
    }
    let mut stream = StreamReader::new(
        response
            .bytes_stream()
            .map_err(|err| Error::new(ErrorKind::Other, err)),
    );
    let mut header = [0; INODE_HEADER_SIZE];
    stream.read_exact(&mut header).await?;
    let file_size: usize = u64::from_be_bytes({
        let mut bytes = [0; 8];
        (&mut bytes[2..]).copy_from_slice(&header[0..6]);
        bytes
    })
    .try_into()?;
    let hash_count = u32::from_be_bytes({
        let mut bytes = [0; 4];
        (&mut bytes[1..]).copy_from_slice(&header[6..9]);
        bytes
    }) as usize;
    let downloaded = Arc::new(AtomicUsize::new(0));
    on_progress(0, file_size);

    let mut parts = Vec::new();
    for _ in 0..hash_count {
        let mut hash = [0; HASH_SIZE];
        stream.read_exact(&mut hash).await?;
        let client = client.clone();
        let on_progress = on_progress.clone();
        let downloaded = downloaded.clone();
        parts.push(spawn(async move {
            let response = client
                .get(format!(
                    "{SERVER}internalapi/asset/{:x}.wav/get/",
                    Digest(hash)
                ))
                .send()
                .await?;
            if !response.status().is_success() {
                Err(format!(
                    "HTTP {} error for {}",
                    response.status(),
                    response.url()
                ))?;
            }
            let mut stream = response.bytes_stream();
            let mut buffer = Vec::new();
            while let Some(item) = stream.next().await {
                let item = item?;
                on_progress(
                    downloaded.fetch_add(item.len(), Ordering::Relaxed) + item.len(),
                    file_size,
                );
                buffer.extend(item);
            }
            Ok::<Vec<u8>, BoxedError>(buffer)
        }));
    }
    let mut stream = stream.into_inner();
    while let Some(item) = stream.next().await {
        let item = item?;
        on_progress(
            downloaded.fetch_add(item.len(), Ordering::Relaxed) + item.len(),
            file_size,
        );
        output.write_all(&item).await?;
    }
    for part in parts {
        output.write_all(&part.await??).await?;
    }

    Ok(())
}
