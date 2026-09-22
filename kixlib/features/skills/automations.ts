import type { Automation } from '../../core/automation.js';
import { sync } from './sync.js';
import { syncFields, syncOptions } from './sync-options.js';
import { initAutomation } from './init.js';
import { listAutomation } from './list.js';

const syncAutomation: Automation = {
  id: 'sync',
  title: 'Sincronizar skills',
  description: 'Actualizar enlaces e índice para Claude Code y Codex.',
  mutates: true,
  fields: syncFields,
  async run({ root, log }, values) {
    return sync(root, syncOptions(values), log);
  },
};

export const skillAutomations: readonly Automation[] = [initAutomation, syncAutomation, listAutomation];
