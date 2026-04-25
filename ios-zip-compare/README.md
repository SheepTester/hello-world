# iPhone photo backup

I'm traveling across Europe right now, and I'm trying out my new iPhone because my elegantly named Google Pixel 4a 5g's battery cannot last a few hours of heavy camera usage.

However, only my Pixel has unlimited Google Photos storage, so I want to get my photos from my iPhone backed up (with unnoticeable lossy compression) by my Pixel.

Here are the steps I've devised. On the Pixel, you will need this folder of the repo, Termux, hotspot-drop, and ffmpeg.

1. Create a chunk of media by enabling select mode in the Photos app, swiping right and holding to select a range of photos, then using another finger to scroll. Add the selected photos to an album, so the remaining photos can be filtered by "Not in an album."
1. Go to the album and select > select all.
1. Share > Export unmodified originals. Put the photos in a new folder.

   - For albums, this should only take a few seconds.
   - For some reason, outside of albums (like in the hidden folder), it can sometimes get stuck. To fix this, add the photos to an album, repeat the selection and un-hide them. Export the photos, select all in the album, then hide them.
1. Share > Save to files. This should be a lot faster because most of the work was done by the iPhone in the previous step. This worries me a bit because it implies "Export unmodified originals" is cached in the background, so it takes up storage somewhere that can't be managed.

   - In my experience, "save to files" is byte-wise identical to "export unmodified originals" (see below for exceptions). You can skip this step and only pass unmodified/ to index.ts.
1. On the Pixel, create two directories for each folder in Termux.
1. Launch hotspot-drop and connect the iPhone to thr Pixel's hotspot.
1. In each directory, select all the files in the corresponding folder, then upload. At up to 10 MB/s, it can take about a minute for 200 photos.

   - Important: Trying to select all files at once will make Safari hang then crash after several minutes. To avoid this, select one file from the folder first, then reload the page. For some reason, this warms Safari up for the full folder.
1. The iPhone is done; the two folders can be deleted.
1. Use the index.ts script and pass the two directory paths (or just one if you believe "save to files" has no difference). In most cases, the photos are actually bytewise identical and will automatically be put in a folder named "identical."
1. Go to the Files app and rename "identical," which changes the Linux user ownership and allows Google Photos to recognize it. Enable backup on the folder. This begins backup of the actual videos and photos.
1. I also want to back up the live photo videos. Use group-live-photos.ts to create a concat.txt file to concatenate the videos into one.
   
   - It uses the commands below to concatenate the videos. The end result will have all videos in the same orientation; photos of the other orientation are rotated.
   - It then moves the video into the downloads folder so I can upload it to YouTube.
1. Rename the concatenated .mov in Files to give file ownership back to Android so it can be backed up to Google Photos.

## When "Save to files" differs from "Export unmodified originals"

This is a non exhaustive list of cases I've found of

1. Cropped screenshots
1. Photos taken on an international flight may have their time zones retroactively adjusted, but this is not reflected in "export unmodified originals"
1. Photos directly taken in iMessage seem to apply image rotations (rather than just setting an orientation flag), which re-encodes the image
1. Sometimes the thumbnail in the photo metadata is also stripped

## iOS Directory Compare

A tool to compare two large iOS export directories and move the byte-for-byte identical files into an `identical` folder, while deleting the duplicates to save storage space.

### Usage

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
   node index.ts <path_to_dir_1> [path_to_dir_2]
   ```

### Unmodified Originals Only

If you are confident that all files in a directory are "unmodified originals" (e.g., from a "Export unmodified originals" action) and would match a second export, you can specify only one directory.

```bash
node index.ts <path_to_dir>
```

In this mode, the script:

- Assumes all contents are identical to their counterparts.
- Extracts Live Photo sister `.mov` files to the `live-photo-videos` directory.
- Moves the remaining media to the `identical` folder.

### Remaining Files Review

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
