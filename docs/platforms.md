# Claude Code to Codex tool mapping

Skills in this repo are written once and run on both platforms. When a skill step names a Claude Code tool, use this table to find the Codex equivalent.

| Claude Code | Codex | Notes |
|---|---|---|
| Read a file | shell `cat` | Read a specific range with `sed -n` or `head`/`tail`. |
| Edit | `apply_patch` | Applies a diff-style patch to a file. |
| Run a command | shell | Codex runs shell commands directly, no separate tool. |
| Search (Grep/Glob) | shell `rg` or `grep` | Use `rg --files` for glob-style file listing. |
| Fetch a URL | shell `curl` | No dedicated fetch tool; goes through the shell. |
| Web search | `web_search` | Built-in tool, no shell needed. |
| Skill tool / slash command | native skill loading | Codex loads skills by name from the prompt, for example "use new-skill". No slash command syntax. |
| Agent tool | `spawn_agent` | Requires `[features] multi_agent = true` in `~/.codex/config.toml`. Without it, `spawn_agent` is unavailable. |
| Parallel agents | multiple `spawn_agent` calls | Issue several `spawn_agent` calls in the same turn to run them concurrently. |
| Waiting on a subagent | `wait_agent` | Blocks until the named agent finishes. |
| TodoWrite | `update_plan` | Both track a step list for the current task. |
| AskUserQuestion | plain text question | Codex has no structured question tool. Ask in the response text and wait for the reply. |

## Instructions file

Claude Code reads `CLAUDE.md`. Codex reads `AGENTS.md`. In this repo, `CLAUDE.md` is a single line that imports `AGENTS.md`, so both tools follow the same rules.

## Hooks

Hooks are a Claude Code feature and only apply inside plugins or `settings.json`. This repo ships plain skill directories, so the session mandate lives in the global instructions files instead. See `docs/session-context.md`.

## Invocation syntax

- Claude Code: `/<skill>`, for example `/new-skill`.
- Codex: name the skill in plain text, for example "use new-skill for this".
