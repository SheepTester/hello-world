# iOS Zip Compare

A tool to compare two large iOS export zip files and extract the byte-for-byte identical files without loading the entire zips into memory.

## Usage

To use this script without cloning the entire repository or its commit history:

1. Clone only the required directory using git sparse-checkout:
   ```bash
   git clone --depth 1 --filter=blob:none --sparse https://github.com/USERNAME/REPO_NAME.git
   cd REPO_NAME
   git sparse-checkout set ios-zip-compare
   cd ios-zip-compare
   ```
   *(Replace `USERNAME/REPO_NAME` with the actual GitHub repository path)*

2. Install dependencies:
   ```bash
   npm install
   ```
   *(Note: You may want to install TypeScript and type definitions globally for development: `npm install -g typescript @types/node @types/yauzl`)*

3. Run the script:
   ```bash
   npx tsx index.ts <path_to_zip_1> <path_to_zip_2>
   ```

## Remaining Files Review

If there are any non-identical files remaining, a `remaining-files.txt` will be generated in your current working directory. Each line starts with an `s` (skip).

You can edit this file to categorize them using the following first-letter prefixes:
- `s`: skip (default) - leave in this diff status file
- `u`: use unmodified file(s) (the larger one)
- `f`: use "save to files" file(s) (the smaller one)
- `c`: copy both to the identical folder, suffixed by assumed type (`_unmodified` or `_saved_to_files`)

After editing the prefixes, simply run the script again with the same arguments. It will detect the `remaining-files.txt` file and perform the requested extractions before exiting.
