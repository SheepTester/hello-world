echo "const descriptions = {" > audio-list.js
for file in *.{wav,mp3}
do
  filename=$(basename "$file")
  echo "  \"${filename}\": \"INSERT_DESC_HERE\"," >> audio-list.js
done
echo "}" >> audio-list.js
echo "// After you add the descriptions, open index.html in your browser." >> audio-list.js
echo "" >> audio-list.js

echo "Insert descriptions for each file in audio-list.js"

