#!/usr/bin/env bash

cd -P -- "$(dirname -- "$0")" || exit

# wl root dir
cd ..

WINE_DIR="${this.appFolders.getWineDir()}"
GAMES_DIR="${this.appFolders.getGamesDir()}"
SQUASHFUSE="${this.appFolders.getSquashfuseFile()}"

unmount() {
  PATH_MOUNT_DIR="$1"
  PATH_SQUASHFS="$1.squashfs"

  if [[ -e "$PATH_MOUNT_DIR" ]] && [[ -e "$PATH_SQUASHFS" ]]; then
    fusermount -u "$PATH_MOUNT_DIR" || true
    rm -rf "$PATH_MOUNT_DIR" || true
  fi
}

mount() {
  PATH_MOUNT_DIR="$1"
  PATH_SQUASHFS="$1.squashfs"

  unmount "$PATH_MOUNT_DIR"

  if [[ ! -e "$PATH_MOUNT_DIR" ]] && [[ -e "$PATH_SQUASHFS" ]]; then
    mkdir "$PATH_MOUNT_DIR"
    "$SQUASHFUSE" "$PATH_SQUASHFS" "$PATH_MOUNT_DIR"
  fi
}

mount "$WINE_DIR"
mount "$GAMES_DIR"

# START GAME

${cmd}

# STOPPED GAME

unmount "$WINE_DIR"
unmount "$GAMES_DIR"
