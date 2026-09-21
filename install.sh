#!/bin/sh
# Link every skill in this repo into the Claude Code and Codex skill directories.
# Skills are grouped in folders here, but both tools only look one level deep,
# so each skill directory is linked flat by its own name. Safe to re-run.
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
for target in "$HOME/.claude/skills" "$HOME/.agents/skills"; do
  mkdir -p "$target"
  find "$ROOT/skills" -name SKILL.md | while read -r f; do
    dir="$(dirname "$f")"
    name="$(basename "$dir")"
    ln -sfn "$dir" "$target/$name"
  done
done
echo "Linked $(find "$ROOT/skills" -name SKILL.md | wc -l | tr -d ' ') skills into ~/.claude/skills and ~/.agents/skills"
