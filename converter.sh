#!/bin/bash

# Prompt the user for the input file name
read -p "Enter the name of the video file you want to convert: " input_file

# Extract the filename without extension
filename=$(basename -- "$input_file")
extension="mp4"
filename="${filename%.*}"

# Define the output file name
output_file="${filename}_c.${extension}"

# Run ffmpeg to convert the video
ffmpeg -i "$input_file" \
       -vf "scale=1080:1920,setsar=1:1" \
       -t 60 \
       -r 30 \
       -c:v libx264 -pix_fmt yuv420p -g 48 -bf 2 \
       -c:a aac -b:a 128k -ac 2 -ar 48000 \
       -maxrate 9M -bufsize 9M \
       -f mp4 \
       -movflags +faststart \
       "$output_file"

echo "Conversion complete. Output file: $output_file"
