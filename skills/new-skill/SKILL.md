---
name: new-skill
description: Create a new skill in the vmoon stack, in the right tree (skills/ for portable skills, work/skills/ for job-specific ones), with frontmatter that loads correctly on both Claude Code and Codex. Use when the user says "add a skill", "make this a skill", "new skill", or describes a workflow they want to reuse.
---

# new-skill

Create one skill directory with a `SKILL.md` that works on Claude Code and Codex.

## Decide where it goes

Would this skill make sense in a different job or a personal project?

- Yes: `skills/<name>/`
- No (company conventions, internal tools, client names, private URLs): `work/skills/<name>/`

If unclear, ask the user in plain text. Do not guess with private information.

## Write it

1. Create `<tree>/<name>/SKILL.md`. `<name>` is kebab-case and unique across both trees.
2. Frontmatter:
   - `name`: identical to the directory name.
   - `description`: one paragraph. What the skill does AND when to use it, with the trigger phrases the user would actually say. This is the only text the model sees before deciding to load the skill.
3. Body:
   - Numbered steps the model follows in order.
   - Concrete commands and file paths. No motivational prose.
   - Under about 150 lines. Long references go in `references/*.md`.
4. Avoid platform-specific tool names. If one is needed, name the Claude Code tool and add the Codex equivalent from `docs/platforms.md`.
5. No job-specific content in `skills/`.

## Finish

Tell the user the skill name, its path, and how to invoke it: `/<name>` on Claude Code, "use <name>" on Codex. Remind them to copy or link it into `~/.claude/skills` and `~/.agents/skills` if they keep those separate.
