#!/bin/sh

# https://stackoverflow.com/a/677212
# Install asar if it doesn't exist
if ! command -v asar &> /dev/null
then
  npm install --global asar
fi

# Recursive to delete folder
# Force so that it doesn't err if app doesn't exist
rm -rf app

asar extract app.asar app
