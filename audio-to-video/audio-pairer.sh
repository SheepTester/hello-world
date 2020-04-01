#!/bin/sh

for file in {./*.mp3,./*.wav}
do
  filename=$(basename "$file")
  thumbnail="thumbnails/${filename}.png"
  output="parts/${filename}.mp4"
  echo $filename
  echo $thumbnail
  echo $output
  ../../ffmpeg/bin/ffmpeg.exe -loop 1 -y -i "$thumbnail" -i "$file" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest "$output"
done

echo "" > videos.txt
for video in parts/*.mp4
do
  videoname=$(echo "$video" | sed "s/'/'\\\\''/")
  echo "file '$videoname'" >> videos.txt
done

../../ffmpeg/bin/ffmpeg.exe -f concat -safe 0 -i videos.txt -c copy output.mp4
