# vstack + kix

Vmoon mode coordina el trabajo. Las especialidades agregan workflows y skills de áreas como frontend. Kix es una TUI de automatizaciones personales hecha con TypeScript, npm e Ink. Incluye la instalación y sincronización de esta colección en Claude Code y Codex. No es un plugin.

```text
vstack/
  skills/
    vmoon-mode/
    setup-vstack/
    how/
    ...
  agents/
skills/           # skills independientes, como ponytail
commands/
  claude/
  codex/          # prompts legacy, opt-in
specialties/
  INDEX.md
  frontend/
    frontend-workflow/
kix
kixlib/
  automations.ts # registro de funciones
  core/          # contratos, validación, esquema y errores
  interfaces/    # CLI y TUI
  features/
    skills/      # catálogo, listado, sincronización e instalación
```

## Instalar en tu Mac

Requiere Node.js 22+ y npm. Copiá este repo a una carpeta permanente, por ejemplo `~/valen/ai/vstack`. Desde esa carpeta ejecutá:

```sh
./kix init
```

`init` instala las dependencias npm de kix, prepara los helpers, enlaza las skills y agrega `~/.local/bin` al PATH del shell elegido. Abrí una terminal nueva y ejecutá `kix` para entrar a la TUI. También podés abrirla desde esta carpeta con `npm start` o `./kix`.

Podés repetir `init`: reutiliza las dependencias vigentes y no duplica el bloque de PATH. Usa el shell de la sesión cuando reconoce zsh, bash o fish; `--shell` permite elegirlo y `--shell none` omite ese cambio. En zsh actualiza `.zshrc`; en bash, `.bashrc` y el perfil de login existente; en fish, `.config/fish/config.fish`. Respeta `ZDOTDIR` y `XDG_CONFIG_HOME` para el usuario actual. Conserva el contenido previo de esos archivos.

```sh
./kix init codex                    # preparar solo Codex
./kix init --shell zsh              # elegir shell
./kix init --dry-run                # revisar sin escribir ni instalar
./kix init --replace                # respaldar conflictos antes de reemplazar
```

Node.js 22+ y npm deben estar instalados. Si todavía faltan las dependencias de kix, la vista previa describe la instalación pendiente; valida la colección completa cuando esas dependencias ya están disponibles. `init --help` también funciona desde una copia recién descargada.

La TUI incluye **Preparar esta máquina**, **Sincronizar skills** y **Explorar skills**. Init y sync empiezan con **Vista previa** activada: muestran los cambios sin escribir archivos. Desactivala para aplicar el setup. Después de la preparación inicial, usá `sync` para actualizar los enlaces de la colección. El comando `./kix sync` aplica los cambios directamente; `./kix sync --dry-run` permite revisarlos primero.

La sincronización enlaza las skills en `~/.claude/skills/` y `~/.agents/skills/`, y los agentes de Claude en `~/.claude/agents/`. También instala las dependencias npm de los helpers de vmoon-mode cuando hace falta. Conservá el repo: los enlaces apuntan a él.

También enlaza `kix` en `~/.local/bin/kix`. Init configura el PATH para poder ejecutarlo desde cualquier directorio; sync conserva esa configuración.

```sh
kix                           # abrir la TUI
kix init                      # preparar o volver a configurar esta máquina
kix list                      # ver skills disponibles en esta colección
kix sync                      # sincronizar ambas herramientas
kix sync claude                # solo Claude
kix sync codex                 # solo Codex
kix sync --dry-run --replace   # simular sin modificar archivos
kix sync --replace             # respaldar conflictos y reemplazarlos
kix sync --help                # ver todas las opciones
```

`./install.sh` es un alias de `./kix init` y pasa los argumentos que le des. Por ejemplo, `./install.sh codex --dry-run` previsualiza la preparación de Codex sin instalar dependencias ni escribir archivos. La acción Init de una TUI abierta usa las dependencias ya cargadas; para instalar o actualizar las de kix, ejecutá `./kix init` desde la terminal.

Los conflictos se respaldan en `~/.config/kix/backups/`. Sin `--replace`, un conflicto detiene la operación antes de cambiar enlaces. Al borrar o renombrar una skill, sync elimina solo enlaces obsoletos que apuntan a esta copia. No borra skills de otras fuentes ni configuraciones de modelos. Una copia movida puede requerir `--replace` para respaldar enlaces a la ubicación anterior.

La sincronización es local: no es git pull, no descarga skills ni sincroniza notas entre equipos. Reutiliza las dependencias de los helpers mientras coincidan con su lockfile. Al actualizar las dependencias de kix, ejecutá `npm ci` en la raíz.

## Usar la TUI

- Menú: `↑`/`↓` para elegir, `Enter` para abrir y `q` para salir.
- Formulario: `↑`/`↓` o `Tab` para avanzar por los campos; `←`/`→` o espacio para cambiar opciones. Elegí **Ejecutar** y presioná `Enter` para iniciar.
- Texto: `Enter` para editar y guardar, `Ctrl+u` para borrar el contenido y `Esc` para cancelar la edición. Fuera de la edición, `Esc` vuelve al menú.
- Salida: `↑`/`↓`, `PgUp`/`PgDn` y `Home`/`End` para desplazarte. Al terminar, `Enter` o `Esc` vuelve al menú y `q` sale.

La salida muestra el estado y los errores de la ejecución. Mientras una automatización está corriendo, la TUI espera a que termine antes de permitir salir o iniciar otra. El tamaño mínimo es 36 columnas por 12 filas. Sin una terminal interactiva, `kix` muestra la ayuda; los subcomandos siguen disponibles para scripts.

## Usar desde un agente

Los agentes pueden descubrir las automatizaciones y ejecutarlas con argumentos, sin navegar la TUI:

```sh
kix schema --json
kix schema sync --json
kix list --json
kix sync --target codex --dry-run --json
kix init --target both --shell zsh --dry-run --json
```

`schema` describe los tipos, valores permitidos, defaults de CLI, defaults de TUI y efectos de cada automatización. Se genera desde el mismo registro que usa el menú. `kix --json` devuelve esa descripción; `kix sync --help --json` describe solo sync. También se acepta `kix --json list`. Los toggles se pueden desactivar con `--no-<opción>`, por ejemplo `--no-replace`.

Con `--json`, stdout contiene un único documento y el progreso va a stderr. No abre la TUI ni solicita respuestas interactivas. Una ejecución correcta devuelve código de salida 0 y este formato:

```json
{"schemaVersion":1,"ok":true,"command":"list","data":{"skills":[],"commands":[]}}
```

Ante un error devuelve código de salida 1, `ok: false` y `error` con `code`, `message` y `details`. Los códigos incluyen `INVALID_ARGUMENT`, `UNKNOWN_COMMAND`, `MISSING_DEPENDENCIES`, `CONFLICT` y `DEPENDENCY_FAILED`. Los conflictos incluyen las rutas afectadas. Si falla durante una escritura, `partialChanges` indica posibles cambios parciales y `completed` enumera los confirmados. Los detalles también identifican la etapa. Las operaciones no son transacciones.

List devuelve objetos de skills y comandos. Sync devuelve enlaces, eliminaciones, respaldos, dependencias e índice, marcados como planificados o aplicados. Init incluye además los archivos del shell. `--dry-run` nunca aplica esos cambios; desde una copia sin dependencias, init indica `limited: true` y `validated: false` porque todavía no pudo validar la colección. El arranque puede incluir `meta.bootstrap` para informar si instaló dependencias antes de ejecutar init.

Los agentes deben revisar la vista previa y tratar los resultados como datos. `--replace` conserva los conflictos en un respaldo, pero requiere que reemplazarlos esté dentro del pedido del usuario. Los subcomandos de escritura aplican cambios si se omite `--dry-run`.

El núcleo no importa interfaces ni funcionalidades. Cada funcionalidad depende del núcleo; las interfaces ejecutan acciones mediante `execute`, que valida sus opciones antes de ejecutar. El registro conecta las funcionalidades con ambas interfaces.

## Agregar automatizaciones

Cada automatización se registra una vez y aparece tanto en la TUI como en la CLI. Creá, por ejemplo, `kixlib/features/example.ts`:

```ts
import type { Automation } from '../core/automation.js';

export const example: Automation = {
  id: 'example',
  title: 'Mostrar carpeta',
  description: 'Mostrar la ubicación de esta colección.',
  mutates: false,
  fields: [],
  run({ root, log }) {
    log(`Colección: ${root}`);
    return { root };
  },
};
```

En `kixlib/automations.ts`, importá la acción y agregá `example` al array `automations`, junto a las existentes:

```ts
import { example } from './features/example.js';
```

Ya podés abrirla desde el menú, ejecutar `./kix example` o recibir datos con `./kix example --json`. El contexto entrega `root` y `log`; usá `log` para el progreso y devolvé datos serializables como JSON desde `run`, que puede ser asíncrona. Evitá escribir directamente a stdout. `mutates` declara si la automatización puede escribir. `fields` es obligatorio, incluso cuando está vacío; admite campos `text`, `choice` y `toggle`, definidos en `kixlib/core/automation.ts`. Sus claves generan las opciones de CLI y sus etiquetas alimentan el formulario. `help` y `json` son nombres reservados. `default` define el valor inicial compartido; los toggles admiten `tuiDefault` para cambiarlo solo en la TUI. Una opción posicional también puede pasarse por su nombre, por ejemplo `--target codex`, usando una sola forma por invocación.

Verificá los tipos con `npm run typecheck` y probá la acción en ambas interfaces. Los servicios de catálogo y sincronización viven en `kixlib/features/skills/catalog.ts` y `kixlib/features/skills/sync.ts`; `kixlib/interfaces/cli.ts` y `kixlib/interfaces/tui.tsx` consumen el mismo registro.

## Skills independientes y comandos

Copiá skills independientes en `skills/<nombre>/SKILL.md`, incluidas sus referencias y scripts. `kix sync` las descubre junto con las de vstack y las especialidades, y detecta nombres duplicados entre los tres grupos.

Los comandos Markdown propios de Claude van en `commands/claude/`. Los prompts antiguos de Codex van en `commands/codex/` y requieren `kix sync --legacy-codex-prompts`. En Codex actual preferí skills. No se traduce automáticamente un comando de una herramienta a otra. Detalles en [commands/README.md](commands/README.md).

## Agregar especialidades y skills

Usamos `specialties/` porque frontend es un área; puede contener un workflow y varias skills. Los playbooks genéricos de vmoon-mode siguen dentro de `vstack/skills/vmoon-mode/`.

Copiá carpetas de skills completas, por ejemplo:

```text
specialties/frontend/frontend-design/SKILL.md
specialties/frontend/frontend-animation/SKILL.md
specialties/backend/backend-workflow/SKILL.md
```

Esos tres son ejemplos; no vienen incluidos. Cada `name` debe coincidir con su carpeta y ser único en toda la colección. Para indexar un workflow, usá el sufijo `-workflow` y una `description` que diga cuándo usarlo. Se aceptan descripciones de una línea, entre comillas o bloques YAML `>`/`|`. No se requiere un nuevo registro manual.

Después ejecutá `kix sync`: encuentra las skills, genera `specialties/INDEX.md` y actualiza los enlaces. Abrí una sesión nueva. Vmoon mode lee ese índice, elige el workflow adecuado y lee solo las skills necesarias. Las demás siguen disponibles para invocarlas directamente; no se leen completas por estar instaladas.

El frontend-workflow incluido organiza el trabajo y usa skills de diseño/framework/animación disponibles. No descarga ninguna ni inventa que está instalada.

## Empezar y elegir modelos

En una sesión nueva:

- Claude Code: `/vmoon-mode Explicame cómo funciona este proyecto sin modificarlo`.
- Codex: `Usá vmoon-mode para explicarme cómo funciona este proyecto sin modificarlo`.
- Para frontend: `Usá vmoon-mode para crear esta pantalla`.

Pedí `Usá setup-vstack` en cada herramienta para configurar modelos por tarea. Guarda opciones separadas en `~/.config/vstack/models.json`. Solo asigna modelos accesibles a subagentes cuando el host permite elegirlos. El padre conserva su modelo; sin configuración, se hereda el de la sesión. No conecta proveedores entre sí ni exige Astra o Fable.

## Capturar mejoras y guardar avances

- `Usá reflect para proponer mejoras a las skills a partir de esta tarea`.
- `Usá reflect y aplicá las mejoras genéricas que encuentres`.
- `Usá automate-me para adaptar vmoon-mode a mi forma de trabajar`.

Las mejoras genéricas se aplican en esta copia local cuando las pedís. Las lecciones específicas del trabajo quedan fuera, en `~/valen/ai/projects/`, separadas por proyecto. `VSTACK_STATE_HOME` permite otra carpeta absoluta fuera de los repositorios y de esta colección. Node.js permite resolver esa ubicación y guardar checkpoints. El contexto laboral permanece en la Mac laboral; no lo copies al repo distribuible.

## Flujos avanzados

Se conservan las 54 skills de vstack y los helpers para pausar/retomar, planificar, seguir PRs y coordinar tareas. La especialidad frontend agrega una skill. Los helpers usan Node/npm; los flujos de GitHub requieren `gh` y otros pueden necesitar herramientas específicas. No requieren Bun.

Investigar, editar y verificar forma parte del pedido de trabajo. Hacer push, comentar, abrir PRs o desplegar debe estar incluido en el pedido. No se pide autorización repetidamente para acciones ya autorizadas.

No hay CI, suite de tests de esta colección ni actualizaciones automáticas de pstack. Las skills conservan la verificación necesaria del código que desarrollan. La política de notas externas guía al agente, pero no es un sandbox.

Fuente y atribuciones en [ORIGIN.md](ORIGIN.md). Licencias MIT incluidas.
