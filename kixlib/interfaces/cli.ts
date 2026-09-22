import { parseArgs } from 'node:util';
import type { ParseArgsConfig } from 'node:util';
import { automations } from '../automations.js';
import { defaults, execute } from '../core/automation.js';
import type { Automation, JsonValue } from '../core/automation.js';
import { KixError } from '../core/errors.mjs';
import { describe, describeAll } from '../core/schema.js';

type Outcome = { command: string; data: JsonValue };
const globalOptions = { help: { type: 'boolean', short: 'h' }, json: { type: 'boolean' } } as const;

function help(automation?: Automation): string {
  if (!automation) return [
    'kix · Automatizaciones personales',
    '',
    'Usage: kix [--json] [command] [options]',
    '       kix                     Abrir la TUI en una terminal',
    '',
    ...automations.map(action => `  ${action.id.padEnd(12)} ${action.description}`),
    '  schema [command] Consultar comandos, opciones y tipos de datos.',
    '',
    'kix <command> --help muestra sus opciones. --json devuelve datos para agentes.',
  ].join('\n');
  return [
    `Usage: kix ${automation.id} ${automation.fields.filter(field => field.kind === 'choice' && field.positional).map(field => `[${field.key}] `).join('')}[options]`,
    automation.description,
    '',
    ...automation.fields.map(field => {
      const name = field.kind === 'toggle' ? `--[no-]${field.key}` : `--${field.key} <value>`;
      const positional = field.kind === 'choice' && field.positional ? ` También acepta [${field.choices.join('|')}].` : '';
      return `  ${name.padEnd(26)} ${field.description}${positional}`;
    }),
    '  --json                    Un documento JSON en stdout; progreso en stderr.',
    '  -h, --help                Mostrar ayuda.',
  ].join('\n');
}

function findAutomation(command: string): Automation {
  const action = automations.find(item => item.id === command);
  if (!action) throw new KixError('UNKNOWN_COMMAND', `Unknown command: ${command}. Run kix schema --json.`, { command, available: automations.map(item => item.id) });
  return action;
}

export async function main(root: string, args: string[], output: { json: boolean } = { json: false }): Promise<Outcome | undefined> {
  if (args.length === 0) {
    if (output.json) return { command: 'schema', data: describeAll(automations) };
    if (process.stdin.isTTY && process.stdout.isTTY) {
      const { openTui } = await import('./tui.js');
      await openTui(root, automations);
    } else console.log(help());
    return;
  }
  const [command, ...rest] = args;
  if (command === '--help' || command === '-h') {
    const parsed = parseArgs({ args: rest, options: globalOptions, allowNegative: true, strict: true });
    if (output.json || parsed.values.json) return { command: 'schema', data: describeAll(automations) };
    console.log(help());
    return;
  }
  if (command === 'schema') {
    const parsed = parseArgs({ args: rest, options: globalOptions, allowNegative: true, allowPositionals: true, strict: true });
    if (parsed.positionals.length > 1) throw new KixError('INVALID_ARGUMENT', 'Usage: kix schema [command] [--json].');
    const name = parsed.positionals[0];
    const data = name ? describe(findAutomation(name)) : describeAll(automations);
    if (output.json || parsed.values.json) return { command: 'schema', data };
    if (parsed.values.help) console.log('Usage: kix schema [command] [--json]\nDescribe las automatizaciones sin ejecutarlas.');
    else console.log(JSON.stringify(data, null, 2));
    return;
  }
  const automation = findAutomation(command!);
  const options: ParseArgsConfig['options'] = { ...globalOptions };
  for (const field of automation.fields) options[field.key] = { type: field.kind === 'toggle' ? 'boolean' : 'string' };
  const parsed = parseArgs({ args: rest, options, allowNegative: true, allowPositionals: true, strict: true });
  const positionalFields = automation.fields.filter(field => field.kind === 'choice' && field.positional);
  if (parsed.positionals.length > positionalFields.length) throw new KixError('INVALID_ARGUMENT', 'Too many positional arguments.');
  const json = output.json || parsed.values.json === true;
  if (parsed.values.help) {
    if (json) return { command: automation.id, data: describe(automation) };
    console.log(help(automation));
    return;
  }
  const values = defaults(automation);
  for (const field of automation.fields) {
    const positional = field.kind === 'choice' && field.positional ? parsed.positionals[positionalFields.indexOf(field)] : undefined;
    const named = parsed.values[field.key];
    if (positional !== undefined && named !== undefined) throw new KixError('INVALID_ARGUMENT', `Use either [${field.key}] or --${field.key}, not both.`, { field: field.key });
    const argument = named ?? positional;
    if (argument !== undefined) values[field.key] = argument as string | boolean;
  }
  const data = await execute(automation, { root, log: line => json ? console.error(line) : console.log(line) }, values);
  if (json) return { command: automation.id, data: data ?? null };
}
