import { KixError } from './errors.mjs';

export type Values = Record<string, string | boolean>;
export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

type FieldBase = { key: string; label: string; description: string };
export type Field = FieldBase & (
  | { kind: 'toggle'; default: boolean; tuiDefault?: boolean }
  | { kind: 'text'; default: string }
  | { kind: 'choice'; default: string; choices: readonly string[]; positional?: boolean }
);

export type Context = { root: string; log: (line: string) => void };

export type Automation = {
  id: string;
  title: string;
  description: string;
  mutates: boolean;
  fields: readonly Field[];
  run: (context: Context, values: Values) => JsonValue | void | Promise<JsonValue | void>;
};

export function defaults(automation: Automation, interactive = false): Values {
  return Object.fromEntries(automation.fields.map(field => [
    field.key,
    interactive && field.kind === 'toggle' ? field.tuiDefault ?? field.default : field.default,
  ]));
}

// All interfaces execute through this boundary before a feature can mutate state.
export async function execute(automation: Automation, context: Context, input: Values): Promise<JsonValue> {
  const values = { ...defaults(automation), ...input };
  for (const key of Object.keys(input)) {
    if (!automation.fields.some(field => field.key === key)) {
      throw new KixError('INVALID_ARGUMENT', `Unknown field: ${key}.`, { field: key });
    }
  }
  for (const field of automation.fields) {
    const value = values[field.key];
    if (typeof value !== (field.kind === 'toggle' ? 'boolean' : 'string')) {
      throw new KixError('INVALID_ARGUMENT', `Invalid type for ${field.key}.`, { field: field.key });
    }
    if (field.kind === 'choice' && !field.choices.includes(String(value))) {
      throw new KixError('INVALID_ARGUMENT', `${field.key} must be one of: ${field.choices.join(', ')}.`, { field: field.key, choices: [...field.choices] });
    }
    if (field.kind === 'text' && !String(value).trim()) {
      throw new KixError('INVALID_ARGUMENT', `${field.key} cannot be empty.`, { field: field.key });
    }
  }
  return await automation.run(context, values) ?? null;
}
