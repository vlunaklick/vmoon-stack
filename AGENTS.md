# AGENTS.md

Instructions for agents working on this repo.

## Layout

- `skills/<group>/<name>/SKILL.md`: one skill per directory, grouped by purpose. Groups are for humans; the tools see a flat list.
- `install.sh`: links every skill flat into `~/.claude/skills` and `~/.agents/skills`. Run after adding or moving a skill.

## Groups

- `writing/`: prose for humans.
- `code-quality/`: cleaning and reviewing code.
- `git/`: commits, branches, PRs, CI.
- `principles/`: one-page rules with the condition that triggers each.
- `workflows/`: multi-step playbooks (architect, tdd, arena, swarm).
- `understand/`: explaining existing code (how, why, teach).

## Rules

- A skill lives once. Never one copy per platform.
- Skill names are kebab-case, match the directory name, and are unique across all groups.
- Keep `SKILL.md` short. Long reference material goes in `references/` inside the skill directory.
- Skills that mention a Claude Code tool with no Codex equivalent say inline what to do on Codex.
- Commit messages are always in English.
