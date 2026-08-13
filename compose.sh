#!/bin/sh
set -eu

docker compose run --rm core npm ci --no-audit --omit=optional
docker compose run --rm core sh -eu -c '
  if [ -d "$HOME/.cache/puppeteer" ]; then
    find "$HOME/.cache/puppeteer" -type f -name "*.zip" | while IFS= read -r zip; do
      cache_dir="${zip%/*}"
      browser_name="${cache_dir##*/}"
      archive_name="${zip##*/}"
      build_id="${archive_name%-${browser_name}-linux64.zip}"
      unzip -qo "$zip" -d "$cache_dir/linux-${build_id}"
      rm -f "$zip"
    done
  fi

  browser_executable=$(node -e "Promise.resolve(require(\"puppeteer\").executablePath({headless: \"shell\"})).then(browserExecutable => process.stdout.write(browserExecutable))")
  test -x "$browser_executable"
'
