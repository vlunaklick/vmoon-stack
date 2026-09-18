# AGENTS.md

Instructions for agents working on this repo (vmoon-stack itself, not a job that installs it). Codex reads this file directly. CLAUDE.md imports it.

## Layout

- `skills/<name>/SKILL.md`: portable skills, used in any project.
- `work/skills/<name>/SKILL.md`: skills for the current job only.
- `agents/<name>.md`: Claude Code subagent definitions.

## Rules

- One shared skill tree. A skill lives once. Never fork a skill per platform.
- Platform differences go in `docs/platforms.md`, not inline in a skill body.
- Nothing job-specific goes in `skills/`. Company names, internal tools, client names, and private URLs belong in `work/skills/`.
- Skill names are kebab-case, match the directory name exactly, and are unique across `skills/` and `work/skills/`.
- Keep `SKILL.md` short, under about 150 lines. Long reference material goes in `references/*.md` inside the skill directory.
- Commit messages are always in English.
- Keep `docs/session-context.md` in sync when the base skills change.
