# vmoon-stack

Skills para Claude Code y Codex. Cada skill es una carpeta en `skills/` con un `SKILL.md`. Se agregan de a una.

## Skills

- `unslop`: saca las marcas de texto generado por IA de cualquier prosa.
- `deslop`: lo mismo para codigo, sobre el diff contra main.
- `bro`: reformula el ultimo mensaje en lenguaje llano.
- `fix-ci`: encuentra checks fallidos en el PR, lee logs y aplica fixes puntuales.
- `fix-merge-conflicts`: resuelve conflictos sin interaccion y valida build y tests.
- `get-pr-comments`: trae y resume los comentarios de review del PR activo.
- `make-pr-easy-to-review`: limpia el historial, mejora la descripcion y guia al reviewer.
- `babysit`: cuida un PR abierto hasta que sea mergeable. Usa las cuatro anteriores.
- `what-did-i-get-done`: resume commits propios en un periodo.

## Instalacion

Claude Code lee `~/.claude/skills/<nombre>`. Codex lee `~/.agents/skills/<nombre>`. Copiar o enlazar ahi.

## Invocacion

- Claude Code: `/unslop`.
- Codex: "usa unslop en este texto".

## Origen

Las skills vienen de [pstack-claude](https://github.com/michael-denyer/pstack-claude), MIT, y se adaptan aca.
