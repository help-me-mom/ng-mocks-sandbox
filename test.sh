#!/usr/bin/env bash
set -e

docker compose run --rm core npm test
