# Local runtime policy

Read this before the inherited workflow. These local rules override conflicting workflow instructions, examples and templates, subject to the user's request and the host's system instructions. Pass them and the resolved project state directory to every delegate.

## Models and tools

Read `~/.config/vstack/models.json` if present and use only the active host's section (`claude` or `codex`). Resolve each task stage through [setup-vstack](../../setup-vstack/SKILL.md): quick, coding, debugging, architecture, investigation, review or reflection. The configured role takes priority over inherited workflow examples. Use its model or panel only when supported by the actual delegate tool and account. Missing role/configuration falls back to `default`, then the session model. Omit the model argument for `inherit`, `inherit-parent` or `auto`. The parent session does not change models automatically.

For panels, use distinct configured models when available. If only one model is accessible, use separate review criteria and disclose the lack of model diversity. If delegation is unavailable, perform the stages sequentially and disclose that limitation. Never invoke Claude from Codex or vice versa. Do not infer availability from model names in old examples. If a requested model fails, report it and fall back to the session model; do not modify configuration without a setup request.

Use tools actually exposed by the host. On Codex read [codex-tools.md](codex-tools.md). On Claude Code use native tools; custom agent types are `vstack-agent` and `comment-sicko` only when discovered from the installed user agent files. Otherwise use the available general agent with the corresponding agent reference. Missing optional drivers, MCPs or authoring plugins are limitations to report, not dependencies to install automatically. Do not change global settings to enable tools.

## Project state outside repositories

Before writing notes, run `node <this-skill>/scripts/project-state.mjs <project-directory>`. Use its absolute output as STATE_DIR. The default storage root is `~/valen/ai/projects`; Vmoon mode does not infer it from the collection's installation directory. `VSTACK_STATE_HOME` can explicitly override it with an absolute path outside the project and collection. If Node is unavailable, keep notes in the conversation and disclose that persistence is unavailable.

Write every new plan, todo, decision trail, research report, checkpoint, generated verification skill and workflow store under STATE_DIR. Use task-specific subdirectories to separate concurrent tasks. Locate verification instructions at STATE_DIR/skills/verify/SKILL.md and read them explicitly; host discovery is not required. Pass STATE_DIR paths explicitly to helper CLIs, including orch's store argument. Code and relevant product tests may still be changed in the target repository when the task calls for it.

Do not create documentation or agent metadata in the target repository, even when ignored by Git. This includes `.git` state, `AGENTS.md`, `CLAUDE.md`, `.claude/`, `.agents/`, `docs/`, `todo.md` and decision TSVs. Existing project instructions may be read. Never stage or commit workflow notes. Replace inherited artifact paths before executing commands. If a helper cannot accept external storage, perform that step manually or report the limitation.

On resume, use the external checkpoint helper and read the task notes before proceeding. Keep all work context on the work machine. Never copy it into the distributable collection or synchronize it with the personal machine.

## Scope and distribution

This is a personal skills collection, with no plugin registration, upstream synchronization or automatic routing hook. Invoke vmoon-mode explicitly. Configure per-task models with setup-vstack. These files may evolve through explicit reflect and automate-me requests; no upstream maintenance is required.

Invoking reflect requests improvement proposals. If the request includes applying improvements, apply relevant generic edits to the canonical skills after resolving their installation symlinks. Otherwise present concrete proposed edits before applying them. Automate-me creates or updates the user's working conventions when requested. Keep project/company-specific lessons under STATE_DIR; never embed company code, names, tickets or transcripts in portable skills. Do not post backlog issues automatically. Ordinary coding tasks can suggest reflection, but should not silently rewrite skills.

Proceed with authorized local work. A workflow is not permission to post messages, create issues or PRs, push, merge, deploy or delete data. Do those only when covered by the user's request. Opening a PR is optional, not the mandatory end of every task.

The omitted tests and CI belong to this collection's distribution. Verification and relevant tests for the user's actual coding task still apply.
