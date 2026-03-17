#!/usr/bin/env bash
set -e

echo "Starting"

export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh"

docker compose up --build -- core && \
  docker compose run --rm core node ./node_modules/puppeteer/install.mjs && \
  nvm install && \
  nvm use && \
  node ./node_modules/puppeteer/install.mjs

docker compose down --remove-orphans
