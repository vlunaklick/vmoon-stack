# vmoon-stack

Mi stack personal de IA: un arbol de skills que leen Claude Code y Codex por igual. Cada skill es una carpeta con un `SKILL.md`.

Se construye de a poco. Cada skill entra cuando hace falta, no antes.

## Que hay

- `skills/`: skills base, portables, para cualquier proyecto. Por ahora solo `new-skill`, que crea skills nuevas en el lugar correcto.
- `work/skills/`: skills del trabajo actual. Arranca con `work-context`, una plantilla para las convenciones del laburo.
- `agents/`: subagentes para Claude Code. Vacio por ahora. Codex no los carga; los skills lo resuelven con `spawn_agent`.
- `docs/platforms.md`: equivalencias de herramientas entre Claude Code y Codex.
- `docs/session-context.md`: bloque para pegar en `~/.claude/CLAUDE.md` y `~/.codex/AGENTS.md`.

## Donde van los skills

Claude Code lee `~/.claude/skills/<nombre>` y `~/.claude/agents/<nombre>.md`. Codex lee `~/.agents/skills/<nombre>`. Copia o enlaza ahi lo que quieras usar.

## Invocacion

- Claude Code: `/<skill>`, por ejemplo `/new-skill`.
- Codex: por nombre en el prompt, "usa new-skill para esto".

## Flujo por trabajo

Cada trabajo arranca con una copia de este repo. `skills/` queda intacto y se sincroniza desde la base. Todo lo especifico del trabajo va en `work/skills/`, empezando por completar `work-context`. Si un skill nombra a la empresa, un cliente o una herramienta interna, va en `work/`. Si no, va en `skills/`.

## Reglas

- Un skill vive una sola vez. Nunca una copia por plataforma.
- `name` en el frontmatter es kebab-case e igual al nombre de la carpeta.
- `description` dice que hace el skill y cuando usarlo, con las frases que dispararian su uso.
- `SKILL.md` corto. Referencias largas en `references/`.

## Referencia

La base de ideas es [pstack-claude](https://github.com/michael-denyer/pstack-claude), port de pstack para Claude Code y Codex. Se usa como referencia para escribir skills propias, no se copia entero.
