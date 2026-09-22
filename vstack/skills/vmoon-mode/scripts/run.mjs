#!/usr/bin/env node
const entries = {
  orch: './orch/orch.ts',
  'watch-pr': './watch-pr/cli.ts',
  'ship-pr': './watch-pr/shipping-cli.ts',
};
const [command, ...args] = process.argv.slice(2);
if (!Object.hasOwn(entries, command)) {
  console.error('Usage: node run.mjs orch|watch-pr|ship-pr [arguments]');
  process.exitCode = 2;
} else {
  try {
    const { register } = await import('tsx/esm/api');
    register();
    const { main } = await import(entries[command]);
    process.exitCode = await main(args);
  } catch (error) {
    console.error(error.message);
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      console.error('Run install.sh from the vstack repository to install its npm dependencies.');
    }
    process.exitCode = 1;
  }
}
