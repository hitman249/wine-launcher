#!/bin/bash

cd -P -- "$(dirname -- "$0")" || exit
cd ..
sudo chown root:root ./node_modules/electron/dist/chrome-sandbox
sudo chmod 4755 ./node_modules/electron/dist/chrome-sandbox
cd src || exit
npm run build
cd ..
electron-builder
cd dist || exit
rm -rf ./start ./squashfs-root
mv wine-launcher-1.0.0.AppImage start
./start --appimage-extract
rm -rf ./start
chmod +x ../build/AppRun
chmod +x ../build/appimagetool-x86_64.AppImage
cp ../build/AppRun ./squashfs-root/AppRun
../build/appimagetool-x86_64.AppImage -n --comp gzip ./squashfs-root ./start