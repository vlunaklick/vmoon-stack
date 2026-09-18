#!/usr/bin/env bash
# Scaffold a skill: scripts/new-skill.sh <base|work> <skill-name>
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
tree="${1:-}"; name="${2:-}"
case "$tree" in
  base) dir="$root/skills/$name" ;;
  work) dir="$root/work/skills/$name" ;;
  *) echo "usage: scripts/new-skill.sh <base|work> <skill-name>" >&2; exit 2 ;;
esac
if [[ ! "$name" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo "skill name must be kebab-case: $name" >&2; exit 2
fi
if [[ -e "$dir" ]]; then
  echo "already exists: $dir" >&2; exit 1
fi
mkdir -p "$dir"
sed "s/SKILL_NAME/$name/g" "$root/templates/skill/SKILL.md" > "$dir/SKILL.md"
echo "created $dir/SKILL.md"
echo "next: scripts/install.sh   (links it into ~/.claude/skills and ~/.agents/skills)"
echo "invoke: Claude Code /$name | Codex \"use $name\""
