# vmoon-stack

Skills para Claude Code y Codex. Cada skill es una carpeta con un `SKILL.md`, agrupada por para que sirve. Se agregan de a una.

## Instalacion

```sh
./install.sh
```

Enlaza cada skill, plana, en `~/.claude/skills` y `~/.agents/skills`. Se puede correr las veces que haga falta.

## Invocacion

- Claude Code: `/unslop`.
- Codex: "usa unslop en este texto".

## Skills

### writing

- `unslop`: saca las marcas de texto generado por IA de cualquier prosa.
- `bro`: reformula el ultimo mensaje en lenguaje llano.

### code-quality

- `deslop`: saca el slop de codigo del diff contra main.

### git

- `fix-ci`: encuentra checks fallidos en el PR, lee logs y aplica fixes puntuales.
- `fix-merge-conflicts`: resuelve conflictos sin interaccion y valida build y tests.
- `get-pr-comments`: trae y resume los comentarios de review del PR activo.
- `make-pr-easy-to-review`: limpia el historial, mejora la descripcion y guia al reviewer.
- `babysit`: cuida un PR abierto hasta que sea mergeable. Usa las cuatro anteriores.
- `what-did-i-get-done`: resume commits propios en un periodo.

### principles

Reglas de una pagina. Cada una dice cuando aplica.

- Diseño: `foundational-thinking`, `model-the-domain`, `type-system-discipline`, `boundary-discipline`, `redesign-from-first-principles`, `exhaust-the-design-space`, `experience-first`.
- Simplicidad: `laziness-protocol`, `subtract-before-you-add`, `minimize-reader-load`, `migrate-callers-then-delete-legacy-apis`, `outcome-oriented-execution`.
- Debugging y verificacion: `fix-root-causes`, `attack-the-premise`, `prove-it-works`, `test-behavior-not-implementation`.
- Ejecucion: `build-the-lever`, `encode-lessons-in-structure`, `sequence-verifiable-units`, `make-operations-idempotent`, `separate-before-serializing-shared-state`.
- Agente: `never-block-on-the-human`, `guard-the-context-window`.

Todas llevan el prefijo `principle-` en el nombre.

## Origen

Las skills vienen de [pstack-claude](https://github.com/michael-denyer/pstack-claude), MIT, y se adaptan aca.
