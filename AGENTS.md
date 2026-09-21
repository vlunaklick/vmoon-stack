# vstack and kix

This is a local skills collection shared by Claude Code and Codex, not a plugin.

- `vstack/skills/<name>/SKILL.md`: canonical base skills and their resources.
- `vstack/agents/`: Claude agent definitions; Codex uses native delegation.
- `skills/<name>/SKILL.md`: independent skills installed into both hosts.
- `commands/claude/*.md`: Claude user commands; `commands/codex/*.md`: legacy prompts, explicit opt-in only.
- `specialties/<area>/<skill-name>/SKILL.md`: optional area-specific workflows and supporting skills.
- `specialties/INDEX.md`: generated entrypoint index for vstack. Names ending in `-workflow` are indexed.
- `kix`: terminal entrypoint. `kixlib/cli.py` registers command modules in `kixlib/commands/`.
- `kix sync`: validate/discover sources, update the index, link skills and prune only stale symlinks owned by this checkout. `--replace` backs up conflicts.
- `install.sh`: compatibility wrapper for kix sync.

Keep a single copy per skill. Names must match folders and remain unique across the whole collection. A skill directory is a discovery boundary; do not nest installable skills under it. Preserve licenses. Follow `vstack/skills/vstack/references/local-policy.md` when changing workflow behavior.

Do not add plugins, CI, a persistent test suite or upstream synchronization. Verify changes with targeted temporary checks. Generic reflect/automate-me improvements are supported; private company context stays outside this repository. Commit messages are in English.
