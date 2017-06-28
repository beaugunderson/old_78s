#!/bin/bash

function urlencode() {
  echo -n "$1" | perl -MURI::Escape -ne 'print uri_escape($_)'
}

rm 78.jpg
rm 78.mp3
rm 78.ogg
rm 78.mp4

image=$(http GET "https://archive.org/metadata/$1" | jq -r '[.files[] | select(.format | contains("Item Image"))][0].name')
music=$(http GET "https://archive.org/metadata/$1" | jq -r '[.files[] | select(.format | contains("VBR MP3"))][0].name')

image_url="http://archive.org/download/$1/$(urlencode "$image")"
music_url="http://archive.org/download/$1/$(urlencode "$music")"
music_extension="mp3"

http --download --output 78.jpg GET "$image_url"
http --download --output 78.mp3 GET "$music_url"

if [ $? -ne 0 ]
then
  music=$(http GET "https://archive.org/metadata/$1" | jq -r '[.files[] | select(.format | contains("Ogg Vorbis"))][0].name')
  music_url="http://archive.org/download/$1/$(urlencode "$music")"
  music_extension="ogg"

  http --download --output 78.ogg GET "$music_url"
fi

# don't bother error checking the above since ffmpeg will quickly exit non-zero
# if the files don't exist
ffmpeg \
  -loop 1 \
  -ss 00:00:00.0 \
  -t 00:00:30.0 \
  -i 78.jpg \
  -i "78.$music_extension" \
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
