#!/bin/sh

echo "" > videos.txt
for video in parts/*.mp4
do
  videoname=$(echo "$video" | sed "s/'/'\\\\''/")
  echo "file '$videoname'" >> videos.txt
done

ffmpeg -f concat -safe 0 -i videos.txt -c copy output.mp4

