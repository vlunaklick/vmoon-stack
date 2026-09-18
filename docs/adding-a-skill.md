# Adding a skill

Checklist for adding a skill to this repo. Mirrors `skills/new-skill/SKILL.md`.

## 1. Pick the tree

Ask whether the skill would make sense in a different job or a personal project.

- Yes: `skills/<name>/`
- No, it depends on company conventions, internal tools, client names, or private URLs: `work/skills/<name>/`

If unclear, ask before guessing, especially with anything that touches private information.

## 2. Scaffold it

```bash
scripts/new-skill.sh <base|work> <skill-name>
```

This copies `templates/skill/SKILL.md` into the new skill directory.

## 3. Frontmatter rules

- `name`: kebab-case, identical to the directory name, unique across both trees.
- `description`: one paragraph that states what the skill does and when to use it, including the trigger phrases a user would actually say. This is the only text a model sees before deciding to load the skill.

## 4. Body rules

- Numbered steps, followed in order.
- Concrete commands and file paths, no motivational prose.
- Keep `SKILL.md` under about 150 lines. Move long reference material into `references/*.md` and link to it.
- Avoid platform-specific tool names unless necessary. If a step needs one, name the Claude Code tool and add the Codex equivalent from `docs/platforms.md`.
- No job-specific content in a `skills/` skill.

## 5. Validate and link

```bash
scripts/check.sh
scripts/install.sh          # or --work for work/skills
```

## 6. Test on both platforms

- Claude Code: run `/<name>` and confirm it loads and does what the description promises.
- Codex: ask for it by name, for example "use <name>", and confirm the same.
