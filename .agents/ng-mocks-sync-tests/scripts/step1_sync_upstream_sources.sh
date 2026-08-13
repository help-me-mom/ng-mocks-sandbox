#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/../../.." && pwd)
PACKAGE_JSON="$ROOT_DIR/package.json"
REPO_SLUG="${NG_MOCKS_GITHUB_REPO:-help-me-mom/ng-mocks}"

if [ ! -f "$PACKAGE_JSON" ]; then
  echo "package.json not found: $PACKAGE_JSON" >&2
  exit 1
fi

VERSION="$(
  sed -nE 's/.*"ng-mocks"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/p' "$PACKAGE_JSON" \
    | head -n1
)"

if [ -z "$VERSION" ]; then
  echo "Cannot detect ng-mocks version in $PACKAGE_JSON" >&2
  exit 1
fi

VERSION="${VERSION#^}"
VERSION="${VERSION#~}"
TAG="v$VERSION"
ARCHIVE_URL="https://codeload.github.com/$REPO_SLUG/tar.gz/refs/tags/$TAG"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

ARCHIVE_PATH="$TMP_DIR/ng-mocks.tar.gz"

curl --fail --silent --show-error --location "$ARCHIVE_URL" --output "$ARCHIVE_PATH"
tar -xzf "$ARCHIVE_PATH" -C "$TMP_DIR"

EXTRACTED_ROOT="$(find "$TMP_DIR" -mindepth 1 -maxdepth 1 -type d -name 'ng-mocks-*' | head -n1)"

if [ -z "$EXTRACTED_ROOT" ]; then
  echo "Cannot find extracted ng-mocks archive root for $TAG" >&2
  exit 1
fi

if [ ! -d "$EXTRACTED_ROOT/tests" ] || [ ! -d "$EXTRACTED_ROOT/examples" ]; then
  echo "Archive for $TAG does not contain tests/examples" >&2
  exit 1
fi

rm -rf "$ROOT_DIR/src/tests" "$ROOT_DIR/src/examples"
mkdir -p "$ROOT_DIR/src"
mv "$EXTRACTED_ROOT/tests" "$ROOT_DIR/src/tests"
mv "$EXTRACTED_ROOT/examples" "$ROOT_DIR/src/examples"

echo "Synced src/tests and src/examples from https://github.com/$REPO_SLUG @ $TAG"
