# vmoon-stack

Mi stack personal de IA: un arbol de skills que leen Claude Code y Codex por igual. Sin marketplace ni plugins, cada skill es una carpeta con un `SKILL.md` que se enlaza a los directorios donde cada herramienta busca skills.

La idea es un solo arbol de skills compartido entre las dos herramientas, sin la capa de plugins. La atribucion del material de terceros esta en `NOTICE.md`.

## Que es

- `skills/`: skills base que uso todos los dias, en cualquier proyecto. Portables, sin nada especifico de un trabajo. Incluye el arbol completo de vstack (`vmoon-mode`, `architect`, `arena`, `interrogate`, los `principle-*`) mas `new-skill`.
- `agents/`: subagentes (`vmoon-agent`, `comment-sicko`, los `vstack-*` por modelo). Solo Claude Code; Codex no tiene archivos de agentes y los skills lo resuelven con `spawn_agent`.
- `work/skills/`: skills especificas del trabajo actual. Arranca con una plantilla (`work-context`) y crece dentro de cada copia del repo por trabajo.

Un skill vive una sola vez. Claude Code lo lee desde `~/.claude/skills/<nombre>` y Codex desde `~/.agents/skills/<nombre>`; `scripts/install.sh` crea esos symlinks apuntando a este repo.

## Arbol

```
.
├── skills/                      base, portable (56 skills)
│   ├── vmoon-mode/             punto de entrada de vstack, con playbooks y scripts
│   ├── architect/ arena/ how/ why/ interrogate/ tdd/ swarm/ ...
│   ├── principle-*/             los 23 principios de vstack
│   ├── unslop/                  saca las marcas de texto generado por IA
│   └── new-skill/               scaffoldea un skill nuevo en el lugar correcto
├── agents/                      subagentes de vstack, solo Claude Code
├── work/skills/                 del trabajo actual
│   └── work-context/            plantilla con las convenciones del laburo
├── scripts/
│   ├── install.sh               enlaza los skills en ~/.claude/skills y ~/.agents/skills
│   ├── uninstall.sh             borra esos enlaces
│   ├── new-skill.sh             crea un skill desde la plantilla
│   └── check.sh                 valida frontmatter y nombres, corre claude plugin validate
├── templates/skill/SKILL.md     plantilla base de un SKILL.md
├── docs/
│   ├── platforms.md             mapeo de herramientas Claude Code a Codex
│   ├── adding-a-skill.md        checklist para agregar un skill
│   └── session-context.md       bloque para pegar en CLAUDE.md y AGENTS.md globales
└── AGENTS.md                    reglas para agentes que trabajen sobre este repo
```

## Instalacion

```bash
git clone <este-repo> ~/vmoon-stack
cd ~/vmoon-stack
scripts/install.sh          # enlaza skills/
scripts/install.sh --work   # enlaza tambien work/skills/
```

El script es idempotente: reemplaza enlaces que ya apuntan a este repo y no toca carpetas reales ni enlaces a otros lugares. Despues de correrlo, reinicia Claude Code y Codex.

Para que ambas herramientas apliquen el mandato de sesion (unslop siempre, new-skill cuando pido un skill, work-context antes de tocar codigo de trabajo), pega el bloque de `docs/session-context.md` en `~/.claude/CLAUDE.md` y en `~/.codex/AGENTS.md`.

Para desinstalar: `scripts/uninstall.sh`.

## Como se invocan los skills

- Claude Code: `/vmoon-mode`, `/architect`, `/unslop`. El formato es `/<nombre>`.
- Codex: por nombre en el prompt, por ejemplo "usa vmoon-mode para esto". Los skills que despachan subagentes necesitan la feature `multi_agent` de Codex, que hoy viene habilitada por defecto.

`vmoon-mode` es el punto de entrada para cualquier tarea de codigo no trivial.

## Flujo por trabajo

Cada trabajo nuevo arranca con una copia o fork de este repo:

1. `skills/` queda intacto. No se le agrega nada especifico de un trabajo. Se sincroniza desde el repo base cuando hay skills nuevos que sirven en cualquier lado.
2. Todo lo especifico del trabajo va en `work/skills/`.
3. Lo primero que se completa es `work/skills/work-context/SKILL.md`: stack, repos, branching, reglas de review, deploy, a quien preguntar. `vmoon-mode` lo lee antes de tocar codigo en un repo de trabajo.

Asi `skills/` sigue siendo reusable entre trabajos y la informacion privada de un cliente nunca termina en un skill portable.

## Como agregar un skill

1. `scripts/new-skill.sh <base|work> <nombre>` desde la raiz del repo. Copia `templates/skill/SKILL.md` al lugar correcto.
2. O pedirlo con `/new-skill` (Claude Code) o "usa new-skill" (Codex), que decide en que arbol va y completa el frontmatter.
3. `scripts/check.sh` para validar y `scripts/install.sh` para enlazarlo.

## Diferencias entre plataformas

Los skills son los mismos archivos en las dos herramientas. Cuando un skill nombra una herramienta de Claude Code, `docs/platforms.md` tiene el equivalente en Codex.
