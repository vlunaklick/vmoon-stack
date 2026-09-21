import argparse
from pathlib import Path
import sys

from .commands import listing, sync

COMMANDS = (sync, listing)
ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(prog='kix', description='Manage this local AI skills collection.')
    commands = parser.add_subparsers(dest='command', required=True)
    for module in COMMANDS:
        module.register(commands)
    args = parser.parse_args()
    try:
        return args.run(args, ROOT) or 0
    except (ValueError, OSError) as error:
        print(f'kix: {error}', file=sys.stderr)
        return 1
