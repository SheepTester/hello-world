# how build?

the build command is at the top of upload-download.ts

# format

there exists 3 formats:

- `hash.hash.ext`: hashes and a file extension separated by a dot. each hash references a chunk. concatenate the chunks together and serve with the extension

- `hash`: a linked list of chunks, where each chunk is composed of:

  - the 16-byte hash of the next block
  - an unsigned 64-bit integer representing the number of bytes remaining (excluding the current chunk data)
  - file data

  starting with the given hash, fetch all the chunks and concatenate together. the file name is served separately

- `hash.`: a single hash followed by a period. a special case of the first format, this format is preferred for files under 10 MB. the file name is served separately

- `ihash`: a single hash preceded by an `i` (for inode, which this format is inspired by). theoretically supports up to around 6 TB. the referenced first chunk follows this format:

  - a 48-bit integer representing the original file size (6 bytes)
  - a 24-bit integer representing the number of hashes (3 bytes)
  - 6 bytes of zeroes for padding
  - a list of 16-byte hashes
  - the rest of the chunk contains the first bytes of the file

  concatenate the chunk's data with the chunks from the listed hashes. the file name is served separately
