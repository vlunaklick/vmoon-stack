# vstack + kix

Vstack coordina el trabajo. Las especialidades agregan workflows y skills de áreas como frontend. Kix instala y sincroniza la colección en Claude Code y Codex. No es un plugin.

```text
vstack/
  skills/
    vstack/
    setup-vstack/
    how/
    ...
  agents/
specialties/
  INDEX.md
  frontend/
    frontend-workflow/
kix
kixlib/
  cli.py
  catalog.py
  commands/
    sync.py
    listing.py
```

## Instalar en tu Mac

Copiá este repo a una carpeta permanente, por ejemplo `~/valen/ai/vstack`. Desde esa carpeta ejecutá:

```sh
./kix sync
```

Requiere Python 3.9+, Node.js 20+ y npm. Instala dependencias de ejecución con npm y enlaza las skills en `~/.claude/skills/` y `~/.agents/skills/`. Los agentes de Claude se enlazan en `~/.claude/agents/`. Conservá el repo: los enlaces apuntan a él.

También enlaza `kix` en `~/.local/bin/kix`. Si esa carpeta está en tu PATH, después podés ejecutar `kix` desde cualquier directorio. Si no, agregá `export PATH="$HOME/.local/bin:$PATH"` a tu configuración de shell o seguí usando la ruta al comando.

```sh
kix list                      # ver skills disponibles en esta colección
kix sync                      # sincronizar ambas herramientas
kix sync claude                # solo Claude
kix sync codex                 # solo Codex
kix sync --dry-run --replace   # simular sin modificar archivos
kix sync --replace             # respaldar conflictos y reemplazarlos
```

`./install.sh` sigue funcionando como alias de `./kix sync`. Los conflictos se respaldan en `~/.config/kix/backups/`. Sin `--replace`, un conflicto detiene la operación antes de cambiar enlaces. Al borrar o renombrar una skill, sync elimina solo enlaces obsoletos que apuntan a esta copia. No borra skills de otras fuentes ni configuraciones de modelos. Una copia movida puede requerir `--replace` para respaldar enlaces a la ubicación anterior.

La sincronización es local: no es git pull, no descarga skills ni sincroniza notas entre equipos. Si cambian las dependencias npm, las reinstala; de lo contrario las reutiliza. Para nuevos comandos de terminal, agregá un módulo con `register(commands)` y `run(args, root)` y registralo en `kixlib/cli.py`.

## Agregar especialidades y skills

Usamos `specialties/` porque frontend es un área; puede contener un workflow y varias skills. Los playbooks genéricos de vstack siguen dentro de vstack.

Copiá carpetas de skills completas, por ejemplo:

```text
specialties/frontend/frontend-design/SKILL.md
specialties/frontend/frontend-animation/SKILL.md
specialties/backend/backend-workflow/SKILL.md
```

Esos tres son ejemplos; no vienen incluidos. Cada `name` debe coincidir con su carpeta y ser único en toda la colección. Para indexar un workflow, usá el sufijo `-workflow` y una `description` que diga cuándo usarlo. Se aceptan descripciones de una línea, entre comillas o bloques YAML `>`/`|`. No se requiere un nuevo registro manual.

Después ejecutá `kix sync`: encuentra las skills, genera `specialties/INDEX.md` y actualiza los enlaces. Abrí una sesión nueva. Vstack lee ese índice, elige el workflow adecuado y lee solo las skills necesarias. Las demás siguen disponibles para invocarlas directamente; no se leen completas por estar instaladas.

El frontend-workflow incluido organiza el trabajo y usa skills de diseño/framework/animación disponibles. No descarga ninguna ni inventa que está instalada.

## Empezar y elegir modelos

En una sesión nueva:

- Claude Code: `/vstack Explicame cómo funciona este proyecto sin modificarlo`.
- Codex: `Usá vstack para explicarme cómo funciona este proyecto sin modificarlo`.
- Para frontend: `Usá vstack para crear esta pantalla`.

Pedí `Usá setup-vstack` en cada herramienta para configurar modelos por tarea. Guarda opciones separadas en `~/.config/vstack/models.json`. Solo asigna modelos accesibles a subagentes cuando el host permite elegirlos. El padre conserva su modelo; sin configuración, se hereda el de la sesión. No conecta proveedores entre sí ni exige Astra o Fable.

## Capturar mejoras y guardar avances

- `Usá reflect para proponer mejoras a las skills a partir de esta tarea`.
- `Usá reflect y aplicá las mejoras genéricas que encuentres`.
- `Usá automate-me para adaptar vstack a mi forma de trabajar`.

Las mejoras genéricas se aplican en esta copia local cuando las pedís. Las lecciones específicas del trabajo quedan fuera, en `~/valen/ai/projects/`, separadas por proyecto. `VSTACK_STATE_HOME` permite otra carpeta absoluta fuera de los repositorios y de esta colección. Node.js permite resolver esa ubicación y guardar checkpoints. El contexto laboral permanece en la Mac laboral; no lo copies al repo distribuible.

## Flujos avanzados

Se conservan las 54 skills de vstack y los helpers para pausar/retomar, planificar, seguir PRs y coordinar tareas. La especialidad frontend agrega una skill. Los helpers usan Node/npm; los flujos de GitHub requieren `gh` y otros pueden necesitar herramientas específicas. No requieren Bun.

Investigar, editar y verificar forma parte del pedido de trabajo. Hacer push, comentar, abrir PRs o desplegar debe estar incluido en el pedido. No se pide autorización repetidamente para acciones ya autorizadas.

No hay CI, suite de tests de esta colección ni actualizaciones automáticas de pstack. Las skills conservan la verificación necesaria del código que desarrollan. La política de notas externas guía al agente, pero no es un sandbox.

Fuente y atribuciones en [ORIGIN.md](ORIGIN.md). Licencias MIT incluidas.
