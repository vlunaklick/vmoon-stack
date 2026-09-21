from ..catalog import discover, discover_commands


def register(commands):
    parser = commands.add_parser('list', help='List installed-source skills and their groups.')
    parser.set_defaults(run=run)


def run(args, root):
    for skill in discover(root):
        print(f'{skill.name:40} {skill.group:12} {skill.path.relative_to(root)}')
    for host in ('claude', 'codex'):
        for path in discover_commands(root, host):
            print(f'{path.stem:40} {host + " command":12} {path.relative_to(root)}')
