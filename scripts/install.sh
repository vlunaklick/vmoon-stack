#!/usr/bin/env bash
# Symlink every skill into the directories Claude Code and Codex read.
#   Claude Code: ~/.claude/skills/<name>
#   Codex:       ~/.agents/skills/<name>
# Usage: scripts/install.sh [--work]   (--work also links work/skills)
# Re-run after adding a skill. Idempotent: replaces links that point into this repo, never touches other dirs.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
with_work=0; [[ "${1:-}" == "--work" ]] && with_work=1
targets=("$HOME/.claude/skills" "$HOME/.agents/skills")

link() { # link <src-dir>
  local src="$1" name; name="$(basename "$src")"
  for t in "${targets[@]}"; do
    mkdir -p "$t"
    local dst="$t/$name"
    if [[ -L "$dst" ]]; then
      [[ "$(readlink "$dst")" == "$root"/* ]] || { echo "skip $dst: symlink to something else"; continue; }
      rm "$dst"
    elif [[ -e "$dst" ]]; then
      echo "skip $dst: real directory exists, remove it by hand if you want the repo version"; continue
    fi
    ln -s "$src" "$dst"; echo "linked $dst"
  done
}

for s in "$root"/skills/*/; do link "${s%/}"; done

# Agents are Claude Code only. Codex ignores them.
mkdir -p "$HOME/.claude/agents"
for a in "$root"/agents/*.md; do
  dst="$HOME/.claude/agents/$(basename "$a")"
  if [[ -L "$dst" ]]; then
    [[ "$(readlink "$dst")" == "$root"/* ]] || { echo "skip $dst: symlink to something else"; continue; }
    rm "$dst"
  elif [[ -e "$dst" ]]; then
    echo "skip $dst: real file exists"; continue
  fi
  ln -s "$a" "$dst"; echo "linked $dst"
done
if [[ $with_work -eq 1 ]]; then
  for s in "$root"/work/skills/*/; do [[ -d "$s" ]] && link "${s%/}"; done
fi
echo "done. Restart Claude Code and Codex to pick up new skills. See docs/session-context.md for the global instructions block."
