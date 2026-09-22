# vstack and kix

This is a local skills collection shared by Claude Code and Codex, not a plugin.

- `vstack/skills/<name>/SKILL.md`: canonical base skills and their resources.
- `vstack/agents/`: Claude agent definitions; Codex uses native delegation.
- `skills/<name>/SKILL.md`: independent skills installed into both hosts.
- `commands/claude/*.md`: Claude user commands; `commands/codex/*.md`: legacy prompts, explicit opt-in only.
- `specialties/<area>/<skill-name>/SKILL.md`: optional area-specific workflows and supporting skills.
- `specialties/INDEX.md`: generated entrypoint index for vmoon-mode. Names ending in `-workflow` are indexed.
- `kix`: Node.js entrypoint; requires Node.js 22+ and npm. Run `./kix init` on a new machine, then `kix`, `npm start` or `./kix` to open the Ink/TypeScript TUI. Without a TTY, no arguments prints help. CLI init bootstraps root npm dependencies before loading TypeScript; help and dry-run never install.
- `kixlib/interfaces/cli.ts` and `kixlib/interfaces/tui.tsx`: CLI and interactive views of the shared automation registry.
- `kixlib/core/automation.ts`: automation/field/context types, defaults and shared `execute` input validation. Both interfaces must dispatch through `execute`. `kixlib/automations.ts`: explicit registry; importing and adding an action makes it available in both interfaces. Declare `mutates`, keep `fields: []` for actions without options, log progress via context.log, and return JSON-serializable data. Reserve field names `help` and `json`.
- `kixlib/features/skills/catalog.ts`: collection discovery, validation and specialty index generation. `kixlib/features/skills/sync.ts`: shared synchronization service. Group additional functionality under `kixlib/features/<area>/`. Core must not import features or interfaces; features must not import interfaces. `kixlib/automations.ts` composes feature actions without implementing them.
- `kix sync`: validate/discover sources, update the index, link skills and prune only stale symlinks owned by this checkout. `--replace` backs up conflicts.
- `kix init`: machine setup in `kixlib/features/skills/init.ts`, reusing sync and adding an idempotent PATH block for zsh/bash/fish. `--shell none` skips shell configuration. Every destination honors `--user-home`. TUI init never reinstalls its own loaded root dependencies.
- `kixlib/features/skills/sync-options.ts`: shared init/sync fields and option conversion.
- `kix list`: list available skills and commands. Init and sync default to preview in the TUI; CLI writes unless `--dry-run` is set.
- Agent interface: `kix schema [command] --json` describes the registry, input JSON Schema and CLI mappings. `--json` emits one schemaVersion=1 envelope to stdout, sends progress to stderr, and never opens the TUI. The native launcher alone writes envelopes, including bootstrap/argument failures. Exit 0 means success; exit 1 means error. `kixlib/core/errors.mjs` owns stable errors; service results distinguish planned/applied changes and report completed work on partial failures.
- Use explicit arguments for agents, for example `kix sync --target codex --dry-run --json`. Named and positional target forms are alternatives. Cold init previews report limited/unvalidated results and never install dependencies. CLI writes remain subject to the user's requested scope.
- `install.sh`: forward to `kix init` with the supplied arguments.

Keep a single copy per skill. Names must match folders and remain unique across the whole collection. A skill directory is a discovery boundary; do not nest installable skills under it. Preserve licenses. Follow `vstack/skills/vmoon-mode/references/local-policy.md` when changing workflow behavior.

Do not add plugins, CI, a persistent test suite or upstream synchronization. Verify changes with `npm run typecheck` and targeted temporary checks, including real terminal interaction when changing the TUI. Generic reflect/automate-me improvements are supported; private company context stays outside this repository. Commit messages are in English.
