from ..catalog import discover


def register(commands):
    parser = commands.add_parser('list', help='List installed-source skills and their groups.')
    parser.set_defaults(run=run)


def run(args, root):
    for skill in discover(root):
        group = 'specialty' if skill.specialty else 'vstack'
        print(f'{skill.name:40} {group:10} {skill.path.relative_to(root)}')
