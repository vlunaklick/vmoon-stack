# Session context

Paste this block into `~/.claude/CLAUDE.md` (Claude Code) and `~/.codex/AGENTS.md` (Codex). Neither tool has a hook system for plain skill directories, so the mandate lives in the global instructions file.

```
<vmoon-stack>
You have the vmoon skills installed.

- Every piece of prose you write for a human (PR descriptions, docs, messages, commit bodies) passes through the `unslop` rules. Apply them without being asked.
- When the user asks to "add a skill", "make this a skill", or describes a repeated workflow they want reusable, invoke `new-skill`.
- If a `work-context` skill is installed, read it before touching code in a work repository. It holds the conventions of the current job.

User instructions (CLAUDE.md, AGENTS.md, direct requests) take precedence over this block.
</vmoon-stack>
```
