import type { Automation, JsonValue } from './automation.js';

export function describe(automation: Automation): JsonValue {
  const properties: Record<string, JsonValue> = {};
  let positionalIndex = 0;
  const options = automation.fields.map(field => {
    properties[field.key] = {
      type: field.kind === 'toggle' ? 'boolean' : 'string',
      description: field.description,
      default: field.default,
      ...(field.kind === 'choice' ? { enum: [...field.choices] } : {}),
      ...(field.kind === 'text' ? { minLength: 1, pattern: '\\S' } : {}),
    };
    return {
      key: field.key,
      flag: `--${field.key}`,
      ...(field.kind === 'toggle' ? { negatedFlag: `--no-${field.key}` } : {}),
      ...(field.kind === 'choice' && field.positional ? { positionalIndex: positionalIndex++ } : {}),
      tuiDefault: field.kind === 'toggle' ? field.tuiDefault ?? field.default : field.default,
    };
  });
  return {
    command: automation.id,
    title: automation.title,
    description: automation.description,
    mutates: automation.mutates,
    supportsDryRun: automation.fields.some(field => field.key === 'dry-run'),
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties,
    },
    cli: { command: `kix ${automation.id}`, options, outputFlag: '--json', helpFlag: '--help' },
  };
}

export function describeAll(automations: readonly Automation[]): JsonValue {
  return {
    commands: automations.map(describe),
    discovery: 'kix schema [command] --json',
    output: { schemaVersion: 1, stdout: 'one JSON document', progress: 'stderr', successExitCode: 0, errorExitCode: 1 },
  };
}
