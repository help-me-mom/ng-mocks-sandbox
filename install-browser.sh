#!/bin/sh
set -eu

browser_revision=$(node -p "require('puppeteer-core/internal/revisions.js').PUPPETEER_REVISIONS['chrome-headless-shell']")
browser_executable=$(node -p "require('puppeteer').executablePath({headless: 'shell'})")
browser_directory=${browser_executable%/chrome-headless-shell-linux64/chrome-headless-shell}

if [ ! -x "$browser_executable" ]; then
  browser_archive="/tmp/chrome-headless-shell-${browser_revision}.zip"
  curl -fsSL "https://storage.googleapis.com/chrome-for-testing-public/${browser_revision}/linux64/chrome-headless-shell-linux64.zip" -o "$browser_archive"
  mkdir -p "$browser_directory"
  unzip -q -o "$browser_archive" -d "$browser_directory"
fi

test -x "$browser_executable"
