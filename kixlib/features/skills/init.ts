import { accessSync, appendFileSync, constants, existsSync, lstatSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, isAbsolute, join, resolve } from 'node:path';
import type { Automation } from '../../core/automation.js';
import { KixError } from '../../core/errors.mjs';
import { resolveHome, sync } from './sync.js';
import type { SyncOptions, SyncResult } from './sync.js';
import { syncFields, syncOptions } from './sync-options.js';

const shells = ['zsh', 'bash', 'fish', 'none'] as const;
type Shell = typeof shells[number];
type ShellFileResult = { file: string; target: string; state: 'planned' | 'applied' | 'unchanged' };
export type InitResult = {
  sync: SyncResult;
  shell: { name: Shell; mode: 'planned' | 'applied'; files: ShellFileResult[] };
};
const detected = basename(process.env.SHELL ?? '');
const defaultShell = shells.find(shell => shell === detected) ?? 'none';
const start = '# >>> kix PATH >>>';
const end = '# <<< kix PATH <<<';

function shellFiles(home: string, shell: Shell): string[] {
  const currentUser = home === resolveHome(homedir());
  if (shell === 'zsh') return [join(currentUser && process.env.ZDOTDIR ? resolve(process.env.ZDOTDIR) : home, '.zshrc')];
  if (shell === 'fish') {
    const configured = currentUser ? process.env.XDG_CONFIG_HOME : undefined;
    return [join(configured && isAbsolute(configured) ? configured : join(home, '.config'), 'fish/config.fish')];
  }
  if (shell === 'bash') {
    const profiles = ['.bash_profile', '.bash_login', '.profile'].map(name => join(home, name));
    return [join(home, '.bashrc'), profiles.find(file => existsSync(file)) ?? profiles[0]!];
  }
  return [];
}

function pathBlock(shell: Shell): string {
  const body = shell === 'fish'
    ? 'if not contains -- "$HOME/.local/bin" $PATH\n    set -gx PATH "$HOME/.local/bin" $PATH\nend'
    : 'case ":$PATH:" in\n  *":$HOME/.local/bin:"*) ;;\n  *) export PATH="$HOME/.local/bin:$PATH" ;;\nesac';
  return `${start}\n${body}\n${end}\n`;
}

function shellChange(file: string, block: string): { file: string; append: string } | undefined {
  const entry = lstatSync(file, { throwIfNoEntry: false });
  let content = '';
  if (entry) {
    if (!statSync(file).isFile()) throw new Error(`Shell configuration is not a file: ${file}`);
    content = readFileSync(file, 'utf8');
    if (content.includes(block)) return;
    if (content.includes(start) || content.includes(end)) throw new KixError('CONFLICT', `Review the existing kix PATH block in ${file} before running init.`, {
      stage: 'shell-preflight', paths: [file], hint: 'Review the existing kix PATH block before running init.', partialChanges: false,
    });
    accessSync(file, constants.W_OK);
  } else {
    let parent = dirname(file);
    while (!existsSync(parent)) parent = dirname(parent);
    if (!statSync(parent).isDirectory()) throw new Error(`Shell configuration parent is not a directory: ${parent}`);
    accessSync(parent, constants.W_OK);
  }
  return { file, append: `${content && !content.endsWith('\n') ? '\n' : ''}\n${block}` };
}

export async function initialize(root: string, options: SyncOptions & { shell: Shell }, log: (line: string) => void): Promise<InitResult> {
  const home = resolveHome(options.userHome);
  const files: ShellFileResult[] = [];
  const seen = new Set<string>();
  try {
    for (const file of shellFiles(home, options.shell)) {
      const target = resolveHome(file);
      if (seen.has(target)) continue;
      seen.add(target);
      const change = shellChange(file, pathBlock(options.shell));
      files.push({ file, target, state: change ? 'planned' : 'unchanged' });
    }
  } catch (error) {
    throw new KixError(error instanceof KixError ? error.code : 'INIT_FAILED', error instanceof Error ? error.message : String(error), {
      ...(error instanceof KixError ? error.details : {}), stage: 'shell-preflight', partialChanges: false,
      causeCode: error instanceof KixError ? error.details?.causeCode ?? null : (error as NodeJS.ErrnoException).code ?? null,
    });
  }
  log(`Preparando máquina · Node ${process.versions.node} · destino ${options.target}`);
  for (const file of files) if (file.state === 'planned') log(`PATH: agregar ${file.file}`);
  const synchronized = await sync(root, { ...options, userHome: home }, log);
  const result: InitResult = { sync: synchronized, shell: { name: options.shell, mode: options.dryRun ? 'planned' : 'applied', files } };
  if (options.dryRun) {
    log('Vista previa de init. No se modificaron enlaces ni archivos del shell.');
    return result;
  }
  let writesStarted = false;
  let operation: { kind: string; file: string; target: string } | null = null;
  const completedFiles: ShellFileResult[] = [];
  try {
    for (const file of files) {
      if (file.state !== 'planned') continue;
      operation = { kind: 'check-shell', file: file.file, target: file.target };
      const change = shellChange(file.file, pathBlock(options.shell));
      file.target = resolveHome(file.file);
      if (!change) {
        file.state = 'unchanged';
        continue;
      }
      operation = { kind: 'mkdir', file: file.file, target: dirname(file.target) };
      writesStarted = true;
      mkdirSync(dirname(change.file), { recursive: true });
      operation = { kind: 'append-shell', file: file.file, target: file.target };
      appendFileSync(change.file, change.append);
      file.state = 'applied';
      completedFiles.push({ ...file });
    }
  } catch (error) {
    const syncChanged = synchronized.dependencies.state === 'installed' || synchronized.links.updates.length > 0
      || synchronized.links.removals.length > 0 || synchronized.backups.length > 0 || synchronized.index.changed;
    throw new KixError(error instanceof KixError ? error.code : 'INIT_FAILED', error instanceof Error ? error.message : String(error), {
      ...(error instanceof KixError ? error.details : {}), stage: 'shell-write', operation,
      completed: { sync: synchronized, shellFiles: completedFiles }, shellFiles: files,
      partialChanges: syncChanged || writesStarted,
      causeCode: error instanceof KixError ? error.details?.causeCode ?? null : (error as NodeJS.ErrnoException).code ?? null,
    });
  }
  if (options.shell === 'none') log(`Setup listo. Ejecutá ${join(home, '.local/bin/kix')} o agregá ${join(home, '.local/bin')} a tu PATH.`);
  else log('Setup listo. Abrí una terminal nueva y ejecutá kix.');
  return result;
}

export const initAutomation: Automation = {
  id: 'init',
  title: 'Preparar esta máquina',
  description: 'Instalar helpers, enlazar skills y configurar kix en el PATH.',
  mutates: true,
  fields: [
    ...syncFields,
    { key: 'shell', label: 'Shell', description: 'Agregar kix al PATH de este shell. none conserva la configuración actual.', kind: 'choice', choices: shells, default: defaultShell },
  ],
  async run({ root, log }, values) {
    const shell = shells.find(item => item === values.shell);
    if (!shell) throw new Error('Invalid shell. Choose zsh, bash, fish or none.');
    return initialize(root, { ...syncOptions(values), shell }, log);
  },
};
