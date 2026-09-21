from datetime import datetime
import os
from pathlib import Path
import shutil
import subprocess

from ..catalog import discover, index_text


def register(commands):
    parser = commands.add_parser('sync', help='Update the index and user links for Claude and Codex.')
    parser.add_argument('target', nargs='?', choices=('both', 'claude', 'codex'), default='both')
    parser.add_argument('--dry-run', action='store_true', help='Preview changes without writing or installing anything.')
    parser.add_argument('--replace', action='store_true', help='Back up conflicting entries before replacing them.')
    parser.add_argument('--user-home', type=Path, default=Path.home(), help='Destination user directory; useful for an isolated preview.')
    parser.set_defaults(run=run)


def source_of(path):
    return Path(os.path.abspath(path.parent / os.readlink(path))) if path.is_symlink() else None


def owned(path, root):
    source = source_of(path)
    return source is not None and any(source.is_relative_to(root / prefix) for prefix in ('skills', 'agents', 'plugins/vmoon-ai', 'vstack', 'specialties'))


def dependencies(root):
    scripts = root / 'vstack/skills/vstack/scripts'
    if not shutil.which('node') or not shutil.which('npm'):
        raise ValueError('Node.js 20+ and npm are required.')
    version = subprocess.check_output(['node', '--version'], text=True).strip()
    if int(version.lstrip('v').split('.')[0]) < 20:
        raise ValueError('Node.js 20+ is required.')
    marker = scripts / 'node_modules/.kix-lock'
    lock = (scripts / 'package-lock.json').read_bytes()
    if marker.exists() and marker.read_bytes() == lock and all((scripts / f'node_modules/{package}/package.json').exists() for package in ('tsx', 'commander')):
        return
    result = subprocess.run(['npm', 'ci', '--prefix', str(scripts), '--no-audit', '--no-fund'])
    if result.returncode:
        raise ValueError('npm dependency installation failed; links were not changed.')
    marker.write_bytes(lock)


def run(args, root):
    home = args.user_home.expanduser().resolve()
    skills = discover(root)
    destinations = []
    if args.target in ('both', 'claude'):
        destinations.append(home / '.claude/skills')
    if args.target in ('both', 'codex'):
        destinations.append(home / '.agents/skills')
    links = [(skill.path, target / skill.name) for target in destinations for skill in skills]
    if args.target in ('both', 'claude'):
        agents = home / '.claude/agents'
        destinations.append(agents)
        links.extend((path, agents / path.name) for path in sorted((root / 'vstack/agents').glob('*.md')))
    links.append((root / 'kix', home / '.local/bin/kix'))
    conflicts = [target for source, target in links if os.path.lexists(target) and not owned(target, root) and source_of(target) != source]
    wanted = {target for _, target in links}
    stale = [path for folder in destinations if folder.exists() for path in folder.iterdir() if path not in wanted and owned(path, root)]
    if conflicts and not args.replace:
        raise ValueError('Conflicting entries; nothing changed:\n' + '\n'.join(str(path) for path in conflicts) + '\nUse --replace to back them up first.')
    changes = [(source, target) for source, target in links if source_of(target) != source]
    for _, target in changes:
        print(f'link {target}')
    for target in stale:
        print(f'unlink stale owned link {target}')
    print(f'{len(skills)} skills; {len(changes)} links to update; {len(stale)} stale links; {len(conflicts)} backups.')
    if args.dry_run:
        print('Preview only. No files changed.')
        return
    dependencies(root)
    backup = home / '.config/kix/backups' / datetime.now().strftime('%Y%m%d-%H%M%S-%f')
    for source, target in changes:
        target.parent.mkdir(parents=True, exist_ok=True)
        if target in conflicts:
            saved = backup / target.relative_to(home)
            saved.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(target), str(saved))
        elif target.is_symlink():
            target.unlink()
        target.symlink_to(source, target_is_directory=source.is_dir())
    for target in stale:
        target.unlink()
    index = root / 'specialties/INDEX.md'
    content = index_text(root, skills)
    if not index.exists() or index.read_text() != content:
        index.write_text(content)
    print('Synchronized. Start a new Claude/Codex session. Run kix sync after adding, removing or renaming skills.')
    print('kix is linked in ~/.local/bin; add that directory to PATH if your shell does not include it.')
    if conflicts:
        print(f'Previous entries preserved in {backup}')
