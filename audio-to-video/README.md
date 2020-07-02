## Instructions

See how to get this code and install the necessary dependencies for this to work in the [preparation section](#preparation) below.

3. Place all the audio files in this folder.

    If there are no .wav files, you'll need to change `audio-pairer.sh`'s `{./*.mp3,./*.wav}` to simply `./*mp3`. This is because if there are no .wav files, `./*.wav` will instead look for a file called `*.wav`. Similar process for if there are no .mp3 files.

5. Run `./list-audio`. This produces a list of file names in `audio.txt`.

6. Edit `index.html`'s `descriptions` object in the `<script>` tag to map the audio file names (in `audio.txt`) to descriptions.

7. Open `index.html` in the browser, and it'll autodownload `thumbnails.zip` containing nice thumbnails for each audio file. Unzip it here, so there should be a new folder called `thumbnails` containing the thumbnails.

10. Run `./audio-pairer.sh` and hope it works! It's pretty slow so you can AFK while it's working. Many things can go wrong here though.

11. If everything's good, an `output.mp4` should be created in this directory. From my experience, sometimes some parts have no audio. I just upload them separately to YouTube from the `parts` folder.

## Preparation

If you haven't already, clone this repository and go inside the `audio-to-video` directory:

```sh
git clone https://github.com/SheepTester/hello-world.git
cd hello-world/audio-to-video
```

1. Ensure that `ffmpeg` and `node` are installed. You'll need Node version 13+ for ES modules support. On Ubuntu linux, you can do

    ```sh
    sudo apt-get install -y ffmpeg
    ```

    to get FFmpeg. From my experience, there was an error the first time suggesting to update some commands. I think it was something like `sudo apt-get update`. I ran that and then reattempted to install FFmpeg and it worked.

    ```sh
    curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```

    to get Node 13.

2. Edit `audio-pairer.sh` in this folder to fix ffmpeg's location (there are two instances). On Windows, I downloaded the exe, so I used a relative path to the exe file. On Linux, you can just do `ffmpeg` without any of the `../` and `.exe` magic.

