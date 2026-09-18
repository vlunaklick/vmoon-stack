---
name: new-skill
description: Scaffold a new skill in the vmoon stack, in the right tree (skills/ for portable skills, work/skills/ for job-specific ones), with frontmatter that loads correctly on both Claude Code and Codex. Use when the user says "add a skill", "make this a skill", "new skill", or describes a workflow they want to reuse.
---

# new-skill

Create one skill directory with a `SKILL.md` that works on Claude Code and Codex, link it, and validate it.

## Decide where it goes

Ask yourself one question: would this skill make sense in a different job or a personal project?

- Yes: `skills/<name>/`
- No (company conventions, internal tools, client names, private URLs): `work/skills/<name>/`

If the answer is unclear, ask the user in plain text. Do not guess with private information.

## Write the skill

1. Run `scripts/new-skill.sh <base|work> <name>` from the repo root. It copies `templates/skill/SKILL.md` into place. If the script is unavailable, copy the template by hand.
2. Fill the frontmatter:
   - `name`: kebab-case, identical to the directory name.
   - `description`: one paragraph. Say what the skill does AND when to use it, with the trigger phrases the user would actually say. This is the only text the model sees before deciding to load the skill.
3. Write the body:
   - Numbered steps the model follows in order.
   - Concrete commands and file paths. No motivational prose.
   - Keep `SKILL.md` under about 150 lines. Move long references into `references/*.md` and link them.
4. Do not use platform-specific tool names unless necessary. If you must, name the Claude Code tool and add the Codex equivalent from `docs/platforms.md`.
5. Do not add job-specific content to `skills/`.

## Link and validate

Run from the repo root:

```bash
scripts/check.sh
scripts/install.sh        # re-links skills into ~/.claude/skills and ~/.agents/skills
```

Fix everything `check.sh` reports. Then tell the user the skill name, its path, and how to invoke it:

- Claude Code: `/<name>`
- Codex: "use <name>" in the prompt
