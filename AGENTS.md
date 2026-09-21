# vstack

This is a local skills collection based on pstack-claude, shared by Claude Code and Codex. It is not a plugin.

- `skills/<name>/SKILL.md`: one canonical copy per skill, including its references and runtime scripts.
- `skills/vstack/`: main workflow.
- `skills/setup-vstack/`: host-specific model configuration by task.
- `agents/`: Claude user agent definitions. Codex uses its native delegation tools.
- `install.sh`: creates user-level symlinks; refuses conflicting files unless --replace preserves them in a backup.

Do not add plugin manifests, CI, a test suite or upstream synchronization. Keep skill names unique and matched to their folders. Preserve licenses. Follow `skills/vstack/references/local-policy.md` for workflow changes. Generic improvements through reflect/automate-me are supported; private company context remains outside this repository. Commit messages are in English.
