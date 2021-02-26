#!/bin/sh

echo "{" > wow.json
for file in **/*.json
do
  echo "\"$file\": " >> wow.json
  cat $file >> wow.json
  echo "," >> wow.json
done

echo "\"IGNORE ME\": null}" >> wow.json
