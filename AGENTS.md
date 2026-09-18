# AGENTS.md

Instructions for agents working on this repo (vmoon-stack itself, not a job that installs it). Codex reads this file directly. CLAUDE.md imports it.

## Layout

- `skills/<name>/SKILL.md`: portable skills, used in any project.
- `work/skills/<name>/SKILL.md`: skills for the current job only.
- `scripts/install.sh` symlinks each skill into `~/.claude/skills` (Claude Code) and `~/.agents/skills` (Codex). There is no marketplace and no plugin manifest.

## Rules

- One shared skill tree. A skill lives once. Never fork a skill per platform, and never write a Claude-only or Codex-only copy of the same skill.
- Platform differences go in `docs/platforms.md`, not inline in a skill body. If a skill needs a platform-specific tool, name the Claude Code tool and point to the mapping for the Codex equivalent.
- Nothing job-specific goes in `skills/`. Company names, internal tools, client names, and private URLs belong in `work/skills/`.
- Skill names are kebab-case and match the directory name exactly. Names must be unique across `skills/` and `work/skills/`. `scripts/check.sh` enforces both.
- Keep `SKILL.md` short, under about 150 lines. Put long reference material in `references/*.md` inside the skill directory and link to it.
- Run `scripts/check.sh` before finishing any change. Fix everything it reports.
- Commit messages are always in English.
- After adding a skill, run `scripts/install.sh` so both tools pick it up.

## Session mandate

The block in `docs/session-context.md` is meant for the user's global `~/.claude/CLAUDE.md` and `~/.codex/AGENTS.md`. Keep that file in sync when the base skills change.
