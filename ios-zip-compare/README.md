# iOS Directory Compare

A tool to compare two large iOS export directories and move the byte-for-byte identical files into an `identical` folder, while deleting the duplicates to save storage space.

## Usage

To use this script without cloning the entire repository or its commit history:

1. Clone only the required directory using git sparse-checkout:

   ```bash
   git clone --depth 1 --filter=blob:none --sparse https://github.com/SheepTester/hello-world.git
   cd hello-world
   git sparse-checkout set ios-zip-compare
   cd ios-zip-compare
   ```

   _Note: The `--depth 1` flag ensures you only download the latest commit, avoiding the download of the entire commit history. To pull new changes later, you can run `git pull`._

2. Install dependencies:

   ```bash
   npm install
   ```

   _(Note: You may want to install TypeScript and type definitions globally for development: `npm install -g typescript @types/node`)_

3. Run the script:
   ```bash
   node index.ts <path_to_dir_1> <path_to_dir_2>
   ```

## Remaining Files Review

If there are any non-identical files remaining, a `remaining-files.txt` will be generated in your current working directory.

You can edit this file to categorize them using the following first-letter prefixes:

- `n`: no action (skip) - leave in this diff status file
- `l`: move larger file (and delete the smaller)
- `s`: move smaller file (and delete the larger)
- `b`: move both (suffixed by `_larger` and `_smaller`)

After editing the prefixes, simply run the script again with the same arguments. It will detect the `remaining-files.txt` file and perform the requested operations before exiting.

## Concatenating Live Photo Videos

If you want to quickly concatenate the extracted Live Photo videos, you can use the included `group-live-photos.ts` script.

This script scans a directory for `.mov` and `.mp4` files, groups them based on compatible `ffprobe` properties (codec, dimensions, framerate, etc.) for quick ffmpeg concatenation, and generates `concat.txt` lists in a `concat_groups` subdirectory. The video files are left in place.

```bash
npx tsx group-live-photos.ts [path_to_live_photo_videos_dir]
```

By default, if no path is provided, it will look in the `live-photo-videos` directory created by `index.ts` in your current working directory.

You can then run `ffmpeg` with the concat demuxer using any of the generated text files. For example:

```bash
cd live-photo-videos
ffmpeg -f concat -safe 0 -i concat_groups/group_1.txt -c copy output_group_1.mov
```
