echo "### \`dir\`" > README.md
echo "" >> README.md

for file in {./*.user.css,./*.user.js}
do
  filename=$(basename "$file")
  echo "\`$filename\` " >> README.md
  name=$(grep -oE "@name\s+(.+)" "$file" | sed -E --expression="s/@name\s+//g")
  echo "**$name**" >> README.md
  grep -oE "@description\s+(.+)" "$file" | sed -E --expression="s/@description\s+//g" >> README.md
  echo "" >> README.md
done
