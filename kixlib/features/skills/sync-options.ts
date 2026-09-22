import { homedir } from 'node:os';
import type { Field, Values } from '../../core/automation.js';
import type { SyncOptions } from './sync.js';

export const syncFields: readonly Field[] = [
  { key: 'target', label: 'Destino', description: 'Elegí qué herramientas sincronizar.', kind: 'choice', choices: ['both', 'claude', 'codex'], default: 'both', positional: true },
  { key: 'dry-run', label: 'Vista previa', description: 'Mostrar cambios sin escribir ni instalar dependencias.', kind: 'toggle', default: false, tuiDefault: true },
  { key: 'replace', label: 'Respaldar conflictos', description: 'Mover entradas en conflicto a un respaldo antes de reemplazarlas.', kind: 'toggle', default: false },
  { key: 'user-home', label: 'Carpeta de usuario', description: 'Destino de los enlaces. También permite probar en una carpeta temporal.', kind: 'text', default: homedir() },
  { key: 'legacy-codex-prompts', label: 'Prompts legacy', description: 'Enlazar commands/codex en .codex/prompts.', kind: 'toggle', default: false },
];

export function syncOptions(values: Values): SyncOptions {
  const target = values.target;
  if (target !== 'both' && target !== 'claude' && target !== 'codex') throw new Error('Invalid sync target.');
  return {
    target,
    dryRun: values['dry-run'] === true,
    replace: values.replace === true,
    userHome: String(values['user-home']),
    legacyCodexPrompts: values['legacy-codex-prompts'] === true,
  };
}
