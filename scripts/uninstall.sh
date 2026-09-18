#!/usr/bin/env bash
# Remove every symlink in ~/.claude/skills and ~/.agents/skills that points into this repo.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
for t in "$HOME/.claude/skills" "$HOME/.agents/skills"; do
  [[ -d "$t" ]] || continue
  for l in "$t"/*; do
    [[ -L "$l" && "$(readlink "$l")" == "$root"/* ]] && { rm "$l"; echo "removed $l"; }
  done
done
echo "done"
