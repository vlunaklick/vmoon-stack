# vmoon-stack

Mi stack personal de IA: un arbol de skills que leen Claude Code y Codex por igual. Cada skill es una carpeta con un `SKILL.md`.

## Que hay

- `skills/`: skills base, portables, para cualquier proyecto. `vmoon-mode` es el punto de entrada para cualquier tarea de codigo no trivial y rutea al resto (`architect`, `arena`, `how`, `why`, `interrogate`, `tdd`, `swarm`, los `principle-*`). `new-skill` crea skills nuevas. `unslop` limpia texto.
- `work/skills/`: skills del trabajo actual. Arranca con `work-context`, una plantilla para las convenciones del laburo.
- `agents/`: subagentes para Claude Code (`vmoon-agent`, `comment-sicko`, `vstack-*` por modelo y esfuerzo). Codex no los carga; los skills lo resuelven con `spawn_agent`.
- `docs/platforms.md`: equivalencias de herramientas entre Claude Code y Codex.
- `docs/session-context.md`: bloque para pegar en `~/.claude/CLAUDE.md` y `~/.codex/AGENTS.md`.

## Donde van los skills

Claude Code lee `~/.claude/skills/<nombre>` y `~/.claude/agents/<nombre>.md`. Codex lee `~/.agents/skills/<nombre>`. Copia o enlaza ahi lo que quieras usar.

## Invocacion

- Claude Code: `/vmoon-mode`, `/architect`, `/unslop`.
- Codex: por nombre en el prompt, "usa vmoon-mode para esto".

## Flujo por trabajo

Cada trabajo arranca con una copia de este repo. `skills/` queda intacto y se sincroniza desde la base. Todo lo especifico del trabajo va en `work/skills/`, empezando por completar `work-context`. Si un skill nombra a la empresa, un cliente o una herramienta interna, va en `work/`. Si no, va en `skills/`.

## Reglas

- Un skill vive una sola vez. Nunca una copia por plataforma.
- `name` en el frontmatter es kebab-case e igual al nombre de la carpeta.
- `description` dice que hace el skill y cuando usarlo, con las frases que dispararian su uso.
- `SKILL.md` corto. Referencias largas en `references/`.
