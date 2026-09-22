#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
if ! command -v node >/dev/null 2>&1; then
  printf '%s\n' 'kix requires Node.js 22+ and npm. Install them, then run ./install.sh again.' >&2
  exit 1
fi
exec "$ROOT/kix" init "$@"
