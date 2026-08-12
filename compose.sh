#!/bin/sh
set -eu

docker compose run --rm -e PUPPETEER_SKIP_DOWNLOAD=true core npm ci --no-audit --omit=optional
docker compose run --rm core node ./node_modules/puppeteer/install.mjs
