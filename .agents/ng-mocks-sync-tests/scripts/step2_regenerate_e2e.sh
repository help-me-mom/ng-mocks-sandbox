#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/../../.." && pwd)
SRC_DIR="$ROOT_DIR/src"
OUT_FILE="$SRC_DIR/e2e.ts"
TMP_FILE="$(mktemp)"
trap 'rm -f "$TMP_FILE"' EXIT

emit_imports() {
  subdir="$1"

  find "$SRC_DIR/$subdir" -type f -name '*.spec.ts' \
    | LC_ALL=C sort \
    | while IFS= read -r file; do
        rel="${file#$SRC_DIR/}"
        rel="./${rel%.ts}"
        printf "import '%s';\n" "$rel"
      done
}

{
  printf "import './test.spec';\n"
  printf "\n"
  emit_imports "examples"
  printf "\n"
  emit_imports "tests"
} >"$TMP_FILE"

mv "$TMP_FILE" "$OUT_FILE"

echo "Regenerated $OUT_FILE"
