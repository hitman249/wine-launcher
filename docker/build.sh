#!/bin/bash
set -e

git clone https://github.com/hitman249/wine-launcher.git /wl
cd /wl

npm i && cd ./src && npm i && cd ../
npm run electron-rebuild
npm run build

rm -rf /dist/start
cp /wl/dist/start /dist/start