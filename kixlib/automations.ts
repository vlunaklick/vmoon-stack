import type { Automation } from './core/automation.js';
import { skillAutomations } from './features/skills/automations.js';

// Composition root: register feature actions here; interfaces remain generic.
export const automations: readonly Automation[] = [...skillAutomations];
