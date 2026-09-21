# vstack

Skills basadas en pstack-claude, para usar en Claude Code y Codex por separado. Una sola copia de las skills. Sin plugin, marketplace, CI ni sincronización con el proyecto original.

## Instalar en tu Mac

Descargá o copiá este repositorio a una carpeta permanente, por ejemplo `~/valen/ai/vstack`. Desde esa carpeta:

```sh
./install.sh
```

Necesita Python 3, Node.js 20+ y npm. Instala las dependencias de los helpers con npm dentro de esta colección. Enlaza las skills en `~/.claude/skills/` y `~/.agents/skills/`, y los agentes de Claude en `~/.claude/agents/`. No modifica los repositorios donde trabajás, no instala plugins ni cambia modelos. No necesitás tener ambos programas abiertos o instalados para crear los enlaces.

También podés usar `./install.sh claude` o `./install.sh codex`. Si hay skills del mismo nombre ajenas a esta copia, se detiene sin cambiar archivos. `./install.sh --replace` guarda las anteriores en `~/.config/vstack/backups/` y coloca las de vstack. `./install.sh --dry-run --replace` muestra un resumen sin modificar nada.

Conservá la carpeta: los enlaces apuntan a ella. Si la movés, volvé a instalar; si aparece un conflicto con los enlaces anteriores, usá `--replace` para conservarlos como respaldo. Los cambios a skills existentes se leen desde esta misma copia; después de crear o renombrar skills, ejecutá el instalador y abrí una sesión nueva.

## Empezar

Abrí una sesión nueva en tu proyecto:

- Claude Code: `/vstack Explicame cómo funciona este proyecto sin modificarlo`.
- Codex: `Usá vstack para explicarme cómo funciona este proyecto sin modificarlo`.

Para configurar modelos, pedí `Usá setup-vstack`. Hacelo en cada herramienta: sus modelos disponibles pueden ser diferentes.

## Modelos por tarea

`setup-vstack` te ayuda a asignar modelos para tareas simples, implementación, debugging, arquitectura, investigación, revisión y reflexión. Guarda las preferencias de cada herramienta en `~/.config/vstack/models.json`, fuera del repo. No exige Astra, Fable ni ningún modelo concreto.

Las selecciones se aplican a subagentes si la herramienta permite elegir su modelo. El agente principal conserva el modelo seleccionado en la sesión. Sin configuración, usa ese mismo modelo. No conecta Claude con Codex ni convierte una cuenta en acceso a modelos de otro proveedor. Si un modelo no está disponible, informa la limitación y usa el de la sesión. Un panel con un único modelo no equivale a una revisión entre modelos diferentes.

## Capturar mejoras

- `Usá reflect para proponer mejoras a las skills a partir de esta tarea`.
- `Usá reflect y aplicá las mejoras genéricas que encuentres`.
- `Usá automate-me para adaptar vstack a mi forma de trabajar`.

Las mejoras genéricas se aplican en esta copia local cuando las pedís. Las lecciones específicas del trabajo quedan en las notas externas, sin copiar código, tickets o datos de la empresa al repo de skills. No hay actualizaciones automáticas desde pstack.

## Notas y avances

Se guardan bajo `~/valen/ai/projects/`, separados por proyecto. `VSTACK_STATE_HOME` permite otra carpeta absoluta fuera del proyecto y de esta colección. Node.js es necesario para resolver esa ubicación y guardar checkpoints. Sin Node, el agente conserva el resumen en la conversación y avisa que no quedó persistido.

En la Mac laboral, ese contexto permanece allí. Copiá el repo de skills entre equipos; no la carpeta de notas laborales ni configuraciones privadas.

## Flujos avanzados

Conservamos 54 skills y los helpers para pausar/retomar, planificar, seguir PRs y coordinar tareas. Los helpers avanzados usan Node.js y las dependencias npm instaladas por install.sh. Los flujos de GitHub requieren además `gh`; otros pueden necesitar herramientas específicas. No requieren Bun ni descargan dependencias al ejecutar una tarea.

El agente puede investigar, editar y verificar dentro de tu pedido. Hacer push, publicar comentarios, abrir PRs o desplegar requiere que esas acciones estén incluidas en lo que pediste. No necesita pedir permiso para cada paso de un pedido que ya las autoriza.

No hay una suite de tests de vstack. Las skills conservan la verificación y los tests relevantes para el código que les pidas desarrollar. La política de archivos externos es una instrucción al agente, no un sandbox: revisá los cambios del proyecto.

Fuente y modificaciones: [ORIGIN.md](ORIGIN.md). Licencias MIT incluidas.
