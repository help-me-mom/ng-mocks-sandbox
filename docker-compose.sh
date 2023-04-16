#!/usr/bin/env bash
set -e

echo "Starting"

export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh"

docker-compose up -- core && \
  nvm install && \
  nvm use && \
  node ./node_modules/puppeteer/install.js

docker-compose down --remove-orphans
