import { relative, basename } from 'node:path';
import type { Automation } from '../../core/automation.js';
import { discover, discoverCommands } from './catalog.js';

export const listAutomation: Automation = {
  id: 'list',
  title: 'Explorar skills',
  description: 'Ver las skills y los comandos disponibles en esta colección.',
  mutates: false,
  fields: [],
  run({ root, log }) {
    const skills = discover(root);
    const commands = [];
    for (const skill of skills) {
      log(`${skill.name.padEnd(40)} ${skill.group.padEnd(12)} ${relative(root, skill.path)}`);
    }
    for (const host of ['claude', 'codex'] as const) {
      for (const path of discoverCommands(root, host)) {
        const name = basename(path, '.md');
        commands.push({ name, host, path });
        log(`${name.padEnd(40)} ${(host + ' command').padEnd(12)} ${relative(root, path)}`);
      }
    }
    return { skills: skills.map(skill => ({ ...skill })), commands };
  },
};
