#!/bin/bash
set -ex

#git clone https://github.com/hitman249/wine-launcher.git /wl
cd /wl

mkdir /root/.cache
chown -Rh 1000:1000 /root /root/.cache

npm i && cd ./src && npm i && cd ../
npm run electron-rebuild
npm run build

rm -rf /dist/start
cp /wl/dist/start /dist/start