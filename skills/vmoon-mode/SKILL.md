---
name: vmoon-mode
description: Entry point for the vmoon stack. Use at the start of any non-trivial task (feature, bug, refactor, investigation, writing) to pick the right skill from the stack before doing work. Also use when the user says "vmoon mode" or asks which skill applies.
---

# vmoon-mode

Route the task to the right skill, then follow that skill. Do not do the work inside this skill.

## Steps

1. Read the task. Classify it as one of: code change, investigation, writing, or workflow setup.
2. If a `work-context` skill is installed, read it first. Its conventions override the defaults below.
3. Pick the skill:

| Task | Skill |
|------|-------|
| Non-trivial code change, bug, refactor, perf, investigation | `poteto-mode` (it routes to the rest of pstack) |
| Any prose a human will read | `unslop`, applied to the final text |
| A repeated workflow the user wants reusable | `new-skill` |
| Work-specific task with a matching skill under `work/skills` | that skill |
| Anything else | proceed normally with the platform's own tools |

4. State in one line which skill you chose and why, then invoke it.

## Platform notes

Skill files are shared between Claude Code and Codex. Where a skill names a Claude Code tool (`Skill`, `Agent`, `AskUserQuestion`), resolve it with the mapping in `docs/platforms.md` at the repo root. On Claude Code invoke skills as `/<name>`; on Codex ask for them by name ("use unslop on this").
