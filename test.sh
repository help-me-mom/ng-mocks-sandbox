#!/bin/sh
set -eu

docker compose run --rm core npm test -- "$@"
