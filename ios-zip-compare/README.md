# iOS Zip Compare

A tool to compare two large iOS export zip files and extract the byte-for-byte identical files without loading the entire zips into memory.

## Usage

To use this script without cloning the entire repository or its commit history:

1. Download only this folder using `svn`:
   ```bash
   svn export https://github.com/USERNAME/REPO_NAME/trunk/ios-zip-compare
   ```
   *(Replace `USERNAME/REPO_NAME` with the actual GitHub repository path)*

2. Navigate into the downloaded folder:
   ```bash
   cd ios-zip-compare
   ```

3. Install dependencies:
   ```bash
   npm install
   ```
   *(Note: You may want to install type definitions globally for development: `npm install -g @types/node @types/yauzl`)*

4. Run the script:
   ```bash
   npx tsx index.ts <path_to_zip_1> <path_to_zip_2>
   ```

## Remaining Files Review

If there are any non-identical files remaining, a `remaining-files.txt` will be generated in your current working directory. Each line starts with an `s` (skip).

You can edit this file to categorize them using the following first-letter prefixes:
- `s`: skip (default) - leave in this diff status file
- `u`: use unmodified file(s) (the larger one)
- `f`: use "save to files" file(s) (the smaller one)
- `c`: copy both to the identical folder, suffixed by assumed type (unmodified or saved to files)
