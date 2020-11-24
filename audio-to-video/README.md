## Instructions Neue

Put all the mp3 and wav files in this `audio-to-video` folder, then [get Deno](#deno) and run

```sh
deno run --allow-net --allow-run --allow-read=./ --allow-write=./descriptions.json,./thumbnails,./parts,./videos.txt,./output.mp4 audio-to-video.ts
```

This should open http://localhost:8080/ where you can add descriptions (don't forget to click "save"!). When you're done, click "done" and it'll do some magic and send you to the video. The video will also be saved at **output.mp4** in this folder.

Afterwards, you can optionally run `deno run --allow-read=./ --allow-run get-timestamps.ts` (if you haven't cleaned the temporary files yet) to get the timestamps for YouTube.

## Instructions

See how to get this code and install the necessary dependencies for this to work in the [preparation section](#preparation) below.

1. Place all the audio files in this folder.

    If there are no .wav files, you'll need to change `*.{wav,mp3}` to simply `*mp3` in `audio-pairer.sh` and `list-audio.sh`. This is because if there are no .wav files, the `*.wav` pattern will instead look for a file called `*.wav`. Similar process for if there are no .mp3 files.

5. Run `./list-audio.sh`. This produces a list of file names in `audio.txt`.

6. Edit `index.html`'s `descriptions` object to add descriptions for each audio file name in `audio.txt`.

7. Open `index.html` in the browser, and it'll autodownload `thumbnails.zip` containing thumbnails for each audio file. Unzip it here, so there should be a new folder called `thumbnails` containing the thumbnails.

10. Run `./audio-pairer.sh` and hope it works!

    This step is pretty slow, but many things can go wrong here.

11. If everything's good, an `output.mp4` should be created in this directory.

    Sometimes some parts have no audio. You can just upload them separately to YouTube from the `parts` folder or attempt rejoining everything again using `./video-joiner.sh`.

## Preparation

If you haven't already, clone this repository and go inside the `audio-to-video` directory:

```sh
git clone https://github.com/SheepTester/hello-world.git
cd hello-world/audio-to-video
```

1. Ensure that `ffmpeg` is installed. On Ubuntu Linux, you can do

    ```sh
    sudo apt-get install -y ffmpeg
    ```

    to get FFmpeg.

    From my experience, there was an error the first time suggesting to update some commands. I think it was something like `sudo apt-get update`. I ran that and then reattempted to install FFmpeg and it worked.

2. If FFmpeg is not on your PATH, then edit `audio-pairer.sh` and `video-joiner.sh`.

### Self note: Installing Node 13 on Ubuntu Linux

```sh
curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash -
sudo apt-get install -y nodejs
```

to get Node 13.

## Deno

It's pretty easy to [install Deno](https://deno.land/#installation).

To get Atom to work with Deno, using [typescript-deno-plugin](https://www.npmjs.com/package/typescript-deno-plugin) worked for me. Don't forget to restart Atom!
