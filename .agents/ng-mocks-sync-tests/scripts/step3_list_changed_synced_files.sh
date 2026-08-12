#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/../../.." && pwd)

cd "$ROOT_DIR"

CHANGED_FILES=$(
  git status --porcelain=v1 --untracked-files=all -- src/tests src/examples \
    | awk '
        {
          xy = substr($0, 1, 2)
          y = substr($0, 2, 1)

          if (xy != "??" && y == " ") {
            next
          }

          path = substr($0, 4)
          arrow = index(path, " -> ")
          if (arrow > 0) {
            path = substr(path, arrow + 4)
          }

          if (path != "") {
            print path
          }
        }
      ' \
    | LC_ALL=C sort -u
)

FIRST_FILE=$(printf '%s\n' "$CHANGED_FILES" | sed -n '1p')

[ -n "$FIRST_FILE" ] || exit 0

printf '%s\n' "$FIRST_FILE"

if git ls-files --error-unmatch -- "$FIRST_FILE" >/dev/null 2>&1; then
  git diff --relative HEAD -- "$FIRST_FILE"
else
  diff -u /dev/null "$FIRST_FILE" || true
fi
