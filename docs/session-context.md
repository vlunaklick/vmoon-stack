# Session context

Paste this block into `~/.claude/CLAUDE.md` (Claude Code) and `~/.codex/AGENTS.md` (Codex). Plain skill directories have no hook system, so the mandate lives in the global instructions file.

Update this block every time a base skill is added or removed.

```
<vmoon-stack>
You have the vmoon stack installed.

- When the user asks to "add a skill" or describes a repeated workflow they want reusable, invoke `new-skill`.
- If a `work-context` skill is installed, read it before touching code in a work repository. It holds the conventions of the current job.
- If you were dispatched as a subagent to execute a specific task, ignore this block.

User instructions (CLAUDE.md, AGENTS.md, direct requests) take precedence over this block.
</vmoon-stack>
```
