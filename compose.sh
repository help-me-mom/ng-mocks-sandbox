#!/bin/sh
set -eu

docker compose run --rm -e PUPPETEER_SKIP_DOWNLOAD=true core npm ci --no-audit --omit=optional
docker compose run --rm core npx puppeteer browsers install chrome-headless-shell
docker compose run --rm core node -e "require('fs').accessSync(require('puppeteer').executablePath({headless: 'shell'}), require('fs').constants.X_OK)"
