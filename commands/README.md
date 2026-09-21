# Comandos por herramienta

- `commands/claude/nombre.md` se enlaza en `~/.claude/commands/nombre.md` con `kix sync` o `kix sync claude`.
- `commands/codex/nombre.md` es para prompts del formato antiguo de Codex. Solo se enlaza en `~/.codex/prompts/nombre.md` si agregás `--legacy-codex-prompts`. Para Codex actual preferí una skill en `skills/nombre/SKILL.md`.

No se convierten formatos ni se copian comandos entre herramientas. Colocá los Markdown directamente en la carpeta de cada herramienta; no se admiten subcarpetas. Un comando Claude no puede tener el mismo nombre que una skill de la colección. `kix list` muestra ambos tipos.

Al borrar un comando, repetí sync para quitar únicamente su enlace propio. Los prompts Codex se sincronizan y limpian solo con el flag explícito. Los conflictos externos requieren `--replace` y se respaldan antes de reemplazarlos.

Documentación: [Claude commands y skills](https://code.claude.com/docs/en/skills), [Codex custom prompts](https://developers.openai.com/codex/custom-prompts).
