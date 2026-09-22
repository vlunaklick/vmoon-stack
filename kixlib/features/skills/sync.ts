import {spawn} from 'node:child_process';
import {
  cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, readlinkSync,
  realpathSync, renameSync, rmSync, statSync, symlinkSync, unlinkSync, writeFileSync,
} from 'node:fs';
import {homedir} from 'node:os';
import path from 'node:path';
import {createInterface} from 'node:readline';
import {discover, discoverCommands, indexText} from './catalog.js';
import {KixError} from '../../core/errors.mjs';

export interface SyncOptions {
  target: 'both' | 'claude' | 'codex';
  dryRun: boolean;
  replace: boolean;
  userHome: string;
  legacyCodexPrompts: boolean;
}

type Log = (line: string) => void;
type Link = {source: string; target: string};
type Backup = {target: string; state: 'planned'} | {target: string; state: 'applied'; path: string};
type DependencyResult = {path: string; state: 'planned' | 'reused' | 'installed'; installRequired: boolean};

export type SyncResult = {
  mode: 'planned' | 'applied';
  dryRun: boolean;
  target: SyncOptions['target'];
  home: string;
  skillCount: number;
  dependencies: DependencyResult;
  links: {updates: Link[]; removals: Link[]};
  backups: Backup[];
  index: {path: string; changed: boolean};
};

function causeCode(error: unknown): string | null {
  const code = (error as NodeJS.ErrnoException | null)?.code;
  return typeof code === 'string' ? code : null;
}

function entryExists(filename: string): boolean {
  try {
    lstatSync(filename);
    return true;
  } catch (error) {
    if (['ENOENT', 'ENOTDIR'].includes((error as NodeJS.ErrnoException).code ?? '')) return false;
    throw error;
  }
}

function sourceOf(filename: string): string | undefined {
  if (!entryExists(filename) || !lstatSync(filename).isSymbolicLink()) return undefined;
  // Resolve the spelling of the target, never its realpath: deleted and moved
  // sources still identify stale links owned by this checkout.
  return path.resolve(path.dirname(filename), readlinkSync(filename));
}

function owned(filename: string, root: string): boolean {
  const source = sourceOf(filename);
  if (!source) return false;
  return ['skills', 'agents', 'plugins/vmoon-ai', 'vstack', 'specialties', 'commands'].some(prefix => {
    const owner = path.join(root, prefix);
    return source === owner || source.startsWith(`${owner}${path.sep}`);
  });
}

export function resolveHome(value: string): string {
  const expanded = value === '~' ? homedir() : value.startsWith(`~${path.sep}`) ? path.join(homedir(), value.slice(2)) : value;
  const absolute = path.resolve(expanded);
  if (existsSync(absolute)) return realpathSync(absolute);
  const parent = path.dirname(absolute);
  return parent === absolute ? absolute : path.join(resolveHome(parent), path.basename(absolute));
}

async function command(commandName: string, args: string[], cwd: string, log?: Log): Promise<{code: number | null; output: string}> {
  return new Promise((resolve, reject) => {
    const child = spawn(commandName, args, {cwd, stdio: ['ignore', 'pipe', 'pipe']});
    let output = '';
    for (const stream of [child.stdout, child.stderr]) {
      const lines = createInterface({input: stream});
      lines.on('line', line => {
        if (log) log(line);
        else output += `${line}\n`;
      });
    }
    child.once('error', reject);
    child.once('close', code => resolve({code, output}));
  });
}

function dependencyPlan(root: string): {scripts: string; marker: string; lock: Buffer; installRequired: boolean} {
  const scripts = path.join(root, 'vstack/skills/vmoon-mode/scripts');
  const marker = path.join(scripts, 'node_modules/.kix-lock');
  try {
    const lock = readFileSync(path.join(scripts, 'package-lock.json'));
    const reusable = existsSync(marker) && readFileSync(marker).equals(lock)
      && ['tsx', 'commander'].every(packageName => existsSync(path.join(scripts, 'node_modules', packageName, 'package.json')));
    return {scripts, marker, lock, installRequired: !reusable};
  } catch (error) {
    throw new KixError('DEPENDENCY_FAILED', `Cannot inspect helper dependencies: ${error instanceof Error ? error.message : String(error)}`, {
      stage: 'dependency-check', path: scripts, partialChanges: false, causeCode: causeCode(error),
    });
  }
}

async function dependencies(root: string, plan: ReturnType<typeof dependencyPlan>, log: Log): Promise<DependencyResult> {
  let installStarted = false;
  try {
    const node = await command('node', ['--version'], root);
    const npm = await command('npm', ['--version'], root);
    if (node.code !== 0 || npm.code !== 0) throw new Error('Node.js 20+ and npm are required.');
    const major = Number(/^v?(\d+)/.exec(node.output.trim())?.[1]);
    if (!Number.isFinite(major) || major < 20) throw new Error('Node.js 20+ is required.');
    if (!plan.installRequired) return {path: plan.scripts, state: 'reused', installRequired: false};
    installStarted = true;
    const result = await command('npm', ['ci', '--prefix', plan.scripts, '--no-audit', '--no-fund'], root, log);
    if (result.code !== 0) {
      throw new KixError('DEPENDENCY_FAILED', 'npm dependency installation failed; links were not changed.', {exitCode: result.code});
    }
    writeFileSync(plan.marker, plan.lock);
    return {path: plan.scripts, state: 'installed', installRequired: true};
  } catch (error) {
    throw new KixError('DEPENDENCY_FAILED', error instanceof Error ? error.message : String(error), {
      ...(error instanceof KixError ? error.details : {}), stage: 'dependencies', path: plan.scripts,
      installStarted, partialChanges: installStarted, causeCode: causeCode(error),
    });
  }
}

function move(source: string, destination: string): void {
  try {
    renameSync(source, destination);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EXDEV') throw error;
    cpSync(source, destination, {recursive: true, force: false, errorOnExist: true, verbatimSymlinks: true});
    rmSync(source, {recursive: true});
  }
}

function backupName(): string {
  const now = new Date();
  const pad = (value: number, width = 2): string => String(value).padStart(width, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}-${pad(now.getMilliseconds(), 3)}${process.hrtime.bigint().toString().slice(-3)}`;
}

export async function sync(root: string, options: SyncOptions, log: Log): Promise<SyncResult> {
  root = realpathSync(root);
  const home = resolveHome(options.userHome);
  const skills = discover(root);
  const destinations: string[] = [];
  if (options.target === 'both' || options.target === 'claude') destinations.push(path.join(home, '.claude/skills'));
  if (options.target === 'both' || options.target === 'codex') destinations.push(path.join(home, '.agents/skills'));
  const links: Link[] = destinations.flatMap(target => skills.map(skill => ({source: skill.path, target: path.join(target, skill.name)})));
  if (options.target === 'both' || options.target === 'claude') {
    const agents = path.join(home, '.claude/agents');
    destinations.push(agents);
    const source = path.join(root, 'vstack/agents');
    if (existsSync(source)) {
      for (const name of readdirSync(source).filter(name => name.endsWith('.md')).sort()) {
        links.push({source: path.join(source, name), target: path.join(agents, name)});
      }
    }
  }
  for (const [host, destination] of [['claude', '.claude/commands'], ['codex', '.codex/prompts']] as const) {
    if (options.target !== 'both' && options.target !== host) continue;
    const commands = discoverCommands(root, host);
    if (host === 'codex' && !options.legacyCodexPrompts) {
      if (commands.length) log('Skipping legacy Codex prompts; use skills or opt in with --legacy-codex-prompts.');
      continue;
    }
    if (host === 'claude') {
      const skillNames = new Set(skills.map(skill => skill.name));
      const overlap = commands.map(filename => path.basename(filename, '.md')).filter(name => skillNames.has(name)).sort();
      if (overlap.length) throw new KixError('CONFLICT', `Claude command names conflict with skills: ${overlap.join(', ')}`, {
        stage: 'preflight', paths: commands.filter(filename => overlap.includes(path.basename(filename, '.md'))),
        names: overlap, hint: 'Rename the conflicting commands or skills.', partialChanges: false,
      });
    }
    const folder = path.join(home, destination);
    destinations.push(folder);
    links.push(...commands.map(source => ({source, target: path.join(folder, path.basename(source))})));
  }
  links.push({source: path.join(root, 'kix'), target: path.join(home, '.local/bin/kix')});
  const conflicts = links.filter(({source, target}) => entryExists(target) && !owned(target, root) && sourceOf(target) !== source).map(link => link.target);
  const wanted = new Set(links.map(link => link.target));
  const stale = destinations.flatMap(folder => existsSync(folder)
    ? readdirSync(folder).map(name => path.join(folder, name)).filter(filename => !wanted.has(filename) && owned(filename, root))
    : []);
  if (conflicts.length && !options.replace) {
    throw new KixError('CONFLICT', `Conflicting entries; nothing changed:\n${conflicts.join('\n')}\nUse --replace to back them up first.`, {
      stage: 'preflight', paths: conflicts, hint: 'Use --replace to back them up first.', partialChanges: false,
    });
  }
  const changes = links.filter(({source, target}) => sourceOf(target) !== source);
  const removals = stale.map(target => ({source: sourceOf(target)!, target}));
  const plan = dependencyPlan(root);
  const index = path.join(root, 'specialties/INDEX.md');
  const content = indexText(root, skills);
  const indexChanged = !existsSync(index) || readFileSync(index, 'utf8') !== content;
  const result: SyncResult = {
    mode: 'planned', dryRun: options.dryRun, target: options.target, home, skillCount: skills.length,
    dependencies: {path: plan.scripts, state: 'planned', installRequired: plan.installRequired},
    links: {updates: changes, removals}, backups: conflicts.map(target => ({target, state: 'planned'})),
    index: {path: index, changed: indexChanged},
  };
  for (const {target} of changes) log(`link ${target}`);
  for (const target of stale) log(`unlink stale owned link ${target}`);
  log(`${skills.length} skills; ${changes.length} links to update; ${stale.length} stale links; ${conflicts.length} backups.`);
  if (options.dryRun) {
    log('Preview only. No files changed.');
    return result;
  }
  const backup = path.join(home, '.config/kix/backups', backupName());
  const conflictSet = new Set(conflicts);
  const completed = {
    dependencies: null as DependencyResult | null,
    directories: [] as string[],
    linkUpdates: [] as Link[],
    linkRemovals: [] as Link[],
    replacementRemovals: [] as Link[],
    backups: [] as Extract<Backup, {state: 'applied'}>[],
    index: null as SyncResult['index'] | null,
  };
  let stage = 'dependencies';
  let writesStarted = false;
  let operation: {kind: string; source: string | null; target: string} | null = null;
  const ensureDirectory = (directory: string): void => {
    operation = {kind: 'mkdir', source: null, target: directory};
    writesStarted = true;
    if (mkdirSync(directory, {recursive: true}) !== undefined) completed.directories.push(directory);
  };
  try {
    result.dependencies = await dependencies(root, plan, log);
    completed.dependencies = result.dependencies;
    writesStarted = result.dependencies.state === 'installed';
    stage = 'link-update';
    for (const {source, target} of changes) {
      ensureDirectory(path.dirname(target));
      if (conflictSet.has(target)) {
        const saved = path.join(backup, path.relative(home, target));
        ensureDirectory(path.dirname(saved));
        operation = {kind: 'backup', source: target, target: saved};
        move(target, saved);
        completed.backups.push({target, state: 'applied', path: saved});
      } else {
        const previous = sourceOf(target);
        if (previous !== undefined) {
          operation = {kind: 'unlink-replacement', source: previous, target};
          unlinkSync(target);
          completed.replacementRemovals.push({source: previous, target});
        }
      }
      operation = {kind: 'symlink', source, target};
      symlinkSync(source, target, statSync(source, {throwIfNoEntry: false})?.isDirectory() ? 'dir' : 'file');
      completed.linkUpdates.push({source, target});
    }
    stage = 'stale-link-removal';
    for (const removal of removals) {
      operation = {kind: 'unlink-stale', ...removal};
      writesStarted = true;
      unlinkSync(removal.target);
      completed.linkRemovals.push(removal);
    }
    stage = 'index';
    if (indexChanged) {
      operation = {kind: 'write-index', source: null, target: index};
      writesStarted = true;
      writeFileSync(index, content);
    }
    completed.index = result.index;
  } catch (error) {
    throw new KixError(error instanceof KixError ? error.code : 'SYNC_FAILED', error instanceof Error ? error.message : String(error), {
      ...(error instanceof KixError ? error.details : {}), stage, operation, completed,
      partialChanges: writesStarted || (error instanceof KixError && error.details?.partialChanges === true),
      causeCode: error instanceof KixError ? error.details?.causeCode ?? null : causeCode(error),
    });
  }
  result.mode = 'applied';
  result.backups = completed.backups;
  log('Synchronized. Start a new Claude/Codex session. Run kix sync after adding, removing or renaming skills.');
  log('kix is linked in ~/.local/bin; add that directory to PATH if your shell does not include it.');
  if (conflicts.length) log(`Previous entries preserved in ${backup}`);
  return result;
}
