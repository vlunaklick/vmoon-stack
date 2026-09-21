#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
exec python3 - "$ROOT" "$@" <<'PY'
import argparse
import os
from pathlib import Path
import shutil
import subprocess
import sys
from datetime import datetime

root = Path(sys.argv[1])
parser = argparse.ArgumentParser(description='Link vstack skills locally, without plugins.')
parser.add_argument('target', nargs='?', choices=['both', 'claude', 'codex'], default='both')
parser.add_argument('--dry-run', action='store_true')
parser.add_argument('--replace', action='store_true', help='Back up conflicting skills/agents before replacing them.')
args = parser.parse_args(sys.argv[2:])
home = Path.home()
links = []
for directory in sorted((root / 'skills').iterdir()):
    if not (directory / 'SKILL.md').is_file():
        continue
    if args.target in ('both', 'claude'):
        links.append((directory, home / '.claude/skills' / directory.name))
    if args.target in ('both', 'codex'):
        links.append((directory, home / '.agents/skills' / directory.name))
if args.target in ('both', 'claude'):
    links.extend((p, home / '.claude/agents' / p.name) for p in sorted((root / 'agents').glob('*.md')))

def owned(target):
    if not target.is_symlink():
        return False
    destination = Path(os.path.abspath(target.parent / os.readlink(target)))
    return destination.is_relative_to(root)

conflicts = [target for source, target in links if os.path.lexists(target) and not owned(target) and target.resolve() != source.resolve()]
if conflicts and not args.replace:
    print('Existing skills/agents would conflict. No files changed:', file=sys.stderr)
    for target in conflicts:
        print(f'  {target}', file=sys.stderr)
    print('Use --replace to back them up and install vstack instead.', file=sys.stderr)
    sys.exit(1)
if args.dry_run:
    print(f'Would link {len(links)} skills/agents; {len(conflicts)} existing entries need backup. No files changed.')
    sys.exit(0)
if not shutil.which('node') or not shutil.which('npm'):
    sys.exit('Node.js 20+ and npm are required.')
version = subprocess.check_output(['node', '--version'], text=True).strip()
if int(version.lstrip('v').split('.')[0]) < 20:
    sys.exit('Node.js 20+ is required.')
subprocess.run(['npm', 'ci', '--prefix', str(root / 'skills/vstack/scripts'), '--no-audit', '--no-fund'], check=True)
backup = home / '.config/vstack/backups' / datetime.now().strftime('%Y%m%d-%H%M%S-%f')
for source, target in links:
    target.parent.mkdir(parents=True, exist_ok=True)
    if target in conflicts:
        destination = backup / target.relative_to(home)
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(target), str(destination))
    elif target.is_symlink():
        target.unlink()
    elif target.exists():
        continue
    target.symlink_to(source, target_is_directory=source.is_dir())
print(f'Linked {len(links)} skills/agents for {args.target}. Start a new session and invoke vstack, then setup-vstack.')
if conflicts:
    print(f'Previous entries preserved in {backup}')
PY
