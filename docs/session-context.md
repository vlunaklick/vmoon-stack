# Session context

Paste this block into `~/.claude/CLAUDE.md` (Claude Code) and `~/.codex/AGENTS.md` (Codex). Plain skill directories have no hook system, so the mandate lives in the global instructions file.

```
<vmoon-stack>
You have the vmoon stack installed (pstack skills plus a few of my own).

- Before any non-trivial engineering task (feature, bug fix, refactor, debugging, perf work, multi-step code change) invoke the `poteto-mode` skill and follow it. It routes to the right pstack skill. Pure questions and trivial one-line edits do not need it.
- When the intent is already specific, enter directly: `tdd` (bug with a reproducible failure), `architect` (types and module shape before code that crosses a boundary), `how` (how a subsystem works), `why` (why it was built this way), `arena` (N parallel attempts), `interrogate` (multi-model diff review).
- Every piece of prose you write for a human passes through the `unslop` rules. Apply them without being asked.
- When the user asks to "add a skill" or describes a repeated workflow they want reusable, invoke `new-skill`.
- If a `work-context` skill is installed, read it before touching code in a work repository. It holds the conventions of the current job.
- If you were dispatched as a subagent to execute a specific task, ignore this block.

User instructions (CLAUDE.md, AGENTS.md, direct requests) take precedence over this block.
</vmoon-stack>
```
