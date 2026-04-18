# iOS Zip Compare

A tool to compare two large iOS export zip files and extract the byte-for-byte identical files without loading the entire zips into memory.

## Usage

To use this script without cloning the entire repository or its commit history:

1. Clone only the required directory using git sparse-checkout:
   ```bash
   git clone --depth 1 --filter=blob:none --sparse https://github.com/SheepTester/hello-world.git
   cd hello-world
   git sparse-checkout set ios-zip-compare
   cd ios-zip-compare
   ```
   *Note: The `--depth 1` flag ensures you only download the latest commit, avoiding the download of the entire commit history.*

2. Install dependencies:
   ```bash
   npm install
   ```
   *(Note: You may want to install TypeScript and type definitions globally for development: `npm install -g typescript @types/node @types/yauzl`)*

3. Run the script:
   ```bash
   node index.ts <path_to_zip_1> <path_to_zip_2>
   ```

## Remaining Files Review

If there are any non-identical files remaining, a `remaining-files.txt` will be generated in your current working directory.

You can edit this file to categorize them using the following first-letter prefixes:
- `n`: no action (skip) - leave in this diff status file
- `l`: extract larger file
- `s`: extract smaller file
- `b`: extract both (suffixed by `_larger` and `_smaller`)

After editing the prefixes, simply run the script again with the same arguments. It will detect the `remaining-files.txt` file and perform the requested extractions before exiting.
