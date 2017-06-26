#!/bin/bash

rm 78.jpg
rm 78.mp3
rm 78.mp4

image=$(http GET "https://archive.org/metadata/$1" | jq -r '[.files[] | select(.format | contains("Item Image"))][0].name')
music=$(http GET "https://archive.org/metadata/$1" | jq -r '[.files[] | select(.format | contains("VBR MP3"))][0].name')

image_url="http://archive.org/download/$1/$image"
music_url="http://archive.org/download/$1/$music"

http --download --output 78.jpg GET "$image_url"
http --download --output 78.mp3 GET "$music_url"

# don't bother error checking the above since ffmpeg will quickly exit non-zero
# if the files don't exist
ffmpeg \
  -loop 1 \
  -ss 00:00:00.0 \
  -t 00:00:30.0 \
  -i 78.jpg \
  -i 78.mp3 \
  -c:v libx264 \
  -tune stillimage \
  -c:a aac \
  -ar 44100 \
  -pix_fmt yuv420p \
  -shortest \
  -profile:v baseline \
  -vf scale=1080:1080 \
  -strict \
  -2 \
  78.mp4
