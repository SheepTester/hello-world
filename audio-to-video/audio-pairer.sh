#!/bin/sh

mkdir parts

for file in *.{mp3,wav}
do
  filename=$(basename "$file")
  thumbnail="thumbnails/${filename}.png"
  output="parts/${filename}.mp4"
  echo $filename
  echo $thumbnail
  echo $output
  ffmpeg -loop 1 -y -i "$thumbnail" -i "$file" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest "$output"
done

./video-joiner.sh

