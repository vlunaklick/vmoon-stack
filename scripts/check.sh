#!/usr/bin/env bash
# Validate every skill under skills/ and work/skills/ for both platforms.
set -uo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"
fail=0
err() { echo "ERROR: $*" >&2; fail=1; }
seen=""

for s in skills/*/ work/skills/*/; do
  [[ -d "$s" ]] || continue
  s="${s%/}"; sn="$(basename "$s")"
  [[ -f "$s/SKILL.md" ]] || { err "$s: missing SKILL.md"; continue; }
  [[ "$sn" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]] || err "$s: skill dir must be kebab-case"
  head -1 "$s/SKILL.md" | grep -q '^---$' || err "$s: SKILL.md must start with frontmatter"
  fm_name="$(awk 'NR>1 && /^---$/{exit} /^name:/{sub(/^name:[ ]*/,""); print}' "$s/SKILL.md")"
  [[ "$fm_name" == "$sn" ]] || err "$s: frontmatter name '$fm_name' != directory name"
  awk 'NR>1 && /^---$/{exit} /^description:/{found=1} END{exit !found}' "$s/SKILL.md" || err "$s: missing description"
  grep -q 'SKILL_NAME' "$s/SKILL.md" && err "$s: template placeholders left in SKILL.md"
  case " $seen " in *" $sn "*) err "$s: duplicate skill name '$sn'";; esac
  seen="$seen $sn"
done

# Claude Code's own validator understands a skills directory
if command -v claude >/dev/null 2>&1; then
  claude plugin validate skills --strict || err "claude plugin validate failed on skills/"
  if [[ -d work/skills ]]; then
    claude plugin validate work/skills --strict || err "claude plugin validate failed on work/skills/"
  fi
else
  echo "note: claude CLI not found, skipped claude plugin validate"
fi

if [[ $fail -eq 0 ]]; then echo "OK"; else exit 1; fi
