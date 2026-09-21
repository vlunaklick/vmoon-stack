# vmoon-stack

Skills para Claude Code y Codex. Cada skill es una carpeta en `skills/` con un `SKILL.md`. Se agregan de a una.

## Skills

- `unslop`: saca las marcas de texto generado por IA de cualquier prosa.
- `deslop`: lo mismo para codigo, sobre el diff contra main.
- `bro`: reformula el ultimo mensaje en lenguaje llano.

## Instalacion

Claude Code lee `~/.claude/skills/<nombre>`. Codex lee `~/.agents/skills/<nombre>`. Copiar o enlazar ahi.

## Invocacion

- Claude Code: `/unslop`.
- Codex: "usa unslop en este texto".

## Origen

Las skills vienen de [pstack-claude](https://github.com/michael-denyer/pstack-claude), MIT, y se adaptan aca.
