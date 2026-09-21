#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, realpathSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

function canonical(path) {
  if (existsSync(path)) return realpathSync(path);
  return join(canonical(dirname(path)), basename(path));
}
function within(root, path) {
  const delta = relative(root, path);
  return delta === '' || (!isAbsolute(delta) && delta !== '..' && !delta.startsWith(`..${sep}`));
}
export function projectState(directory) {
  const location = realpathSync(resolve(directory));
  let project = location;
  let identity = location;
  try {
    const git = (...args) => execFileSync('git', ['-C', location, 'rev-parse', ...args], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
    project = realpathSync(git('--show-toplevel'));
    identity = realpathSync(git('--path-format=absolute', '--git-common-dir'));
  } catch { /* Non-Git projects use their canonical directory as identity. */ }
  const configured = process.env.VSTACK_STATE_HOME || join(homedir(), 'valen', 'ai', 'projects');
  if (!isAbsolute(configured)) throw new Error('VSTACK_STATE_HOME must be absolute');
  const root = canonical(configured);
  const plugin = canonical(resolve(dirname(fileURLToPath(import.meta.url)), '../../..'));
  if (within(project, root) || within(identity, root) || within(plugin, root))
    throw new Error('Project state must be outside the project, Git directory and plugin');
  const key = createHash('sha256').update(identity).digest('hex').slice(0, 20);
  const store = join(root, key);
  if (existsSync(store) && !within(root, realpathSync(store)))
    throw new Error('Project state symlink escapes its storage root');
  mkdirSync(store, { recursive: true, mode: 0o700 });
  return realpathSync(store);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(projectState(process.argv[2] || '.')); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
