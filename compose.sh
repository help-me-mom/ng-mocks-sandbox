#!/bin/sh
set -eu

docker compose run --rm -e PUPPETEER_SKIP_DOWNLOAD=true core npm ci --no-audit --omit=optional
docker compose run --rm -e PUPPETEER_SKIP_DOWNLOAD=false -e PUPPETEER_SKIP_CHROME_DOWNLOAD=true core node --input-type=module -e "const { downloadBrowsers } = await import('puppeteer/internal/node/install.js'); await downloadBrowsers()"
docker compose run --rm core node -e "require('fs').accessSync(require('puppeteer').executablePath({headless: 'shell'}), require('fs').constants.X_OK)"
