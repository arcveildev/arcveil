#!/usr/bin/env bash
# Assembles the proof film: rendered text beats (PNG sequences) and real screen
# captures, cut hard rather than dissolved — this is a terminal film, not a
# brand film. No music and no captions, matching the other Arcveil cuts.
set -euo pipefail

ROOT="docs/social/video/proof"
SEQ="$ROOT/seq"
FRAMES="$ROOT/frames"
WORK="$ROOT/work"
FPS=30
OUT="$ROOT/arcveil-proof.mp4"

rm -rf "$WORK"; mkdir -p "$WORK"

# A screen capture, framed on the part that carries the claim — a full page
# shrunk to 1080p is unreadable on a phone — and held with a slow push.
screen () {         # $1 = png  $2 = seconds  $3 = out  $4 = crop w:h:x:y
  ffmpeg -y -v error -loop 1 -i "$FRAMES/$1.png" -t "$2" \
    -vf "crop=$4,scale=2400:-2,zoompan=z='min(zoom+0.0004,1.07)':d=$2*$FPS:s=1920x1080:fps=$FPS,format=yuv420p" \
    -c:v libx264 -preset slow -crf 18 "$WORK/$3.mp4"
}

# A rendered beat, already one PNG per frame.
beat () {           # $1 = beat dir   $2 = out
  ffmpeg -y -v error -framerate $FPS -pattern_type glob -i "$SEQ/$1/*.png" \
    -vf "scale=1920:1080,format=yuv420p" -c:v libx264 -preset slow -crf 18 "$WORK/$2.mp4"
}

beat 01-title      a01
beat 02-deployed   a02
screen explorer-account 2.8 a03 "2300:1294:500:300"
beat 03-prepare    a04
beat 04-sign       a05
screen explorer-anchor  3.4 a06 "2360:1327:480:330"
screen verify-pass      4.2 a07 "1560:878:1380:700"
beat 06-revoke     a08
screen explorer-revoke  2.8 a09 "2360:1327:480:330"
beat 07-refusal    a10
beat 09-end        a11

: > "$WORK/list.txt"
for f in a01 a02 a03 a04 a05 a06 a07 a08 a09 a10 a11; do
  echo "file '$(basename "$f").mp4'" >> "$WORK/list.txt"
done

ffmpeg -y -v error -f concat -safe 0 -i "$WORK/list.txt" -c copy "$WORK/joined.mp4"

# Fade the very top and tail only; everything between is a hard cut.
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$WORK/joined.mp4")
ffmpeg -y -v error -i "$WORK/joined.mp4" \
  -vf "fade=t=in:st=0:d=0.4,fade=t=out:st=$(echo "$DUR - 0.6" | bc):d=0.6,format=yuv420p" \
  -c:v libx264 -preset slow -crf 18 -movflags +faststart -an "$OUT"

ffprobe -v error -show_entries format=duration:stream=width,height,r_frame_rate -of default=noprint_wrappers=1 "$OUT"
ls -lh "$OUT"
