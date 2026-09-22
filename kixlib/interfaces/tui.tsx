import { useRef, useState } from 'react';
import { Box, Text, render, useApp, useInput, useWindowSize } from 'ink';
import { stripVTControlCharacters } from 'node:util';
import wrapAnsi from 'wrap-ansi';
import { defaults, execute } from '../core/automation.js';
import type { Automation, Values } from '../core/automation.js';

type Screen = 'menu' | 'form' | 'output';
type Status = 'running' | 'success' | 'error';

function App({ root, actions }: { root: string; actions: readonly Automation[] }) {
  const { exit } = useApp();
  const { columns, rows } = useWindowSize();
  const [screen, setScreen] = useState<Screen>('menu');
  const [selected, setSelected] = useState(0);
  const [fieldIndex, setFieldIndex] = useState(0);
  const [values, setValues] = useState<Values>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>('success');
  const [offset, setOffset] = useState<number | null>(null);
  const busy = useRef(false);
  const action = actions[selected];
  const field = action?.fields[fieldIndex];
  const width = Math.max(1, columns - 4);
  const contentRows = Math.max(1, rows - 10);
  const output = wrapAnsi(lines.join('\n'), width, { hard: true, trim: false }).split('\n');
  const lastOffset = Math.max(0, output.length - contentRows);
  const scroll = Math.min(offset ?? lastOffset, lastOffset);

  async function run() {
    if (!action || busy.current) return;
    busy.current = true;
    setScreen('output');
    setStatus('running');
    setOffset(null);
    setLines([]);
    try {
      await execute(action, { root, log: line => setLines(previous => [...previous, stripVTControlCharacters(line)]) }, values);
      setStatus('success');
    } catch (error) {
      setLines(previous => [...previous, error instanceof Error ? error.message : String(error)]);
      setStatus('error');
    } finally {
      busy.current = false;
    }
  }

  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      if (!busy.current) exit();
      return;
    }
    if (columns < 36 || rows < 12) {
      if (input === 'q' && !busy.current) exit();
      return;
    }
    if (screen === 'output') {
      if (key.upArrow) setOffset(Math.max(0, scroll - 1));
      if (key.downArrow) setOffset(Math.min(lastOffset, scroll + 1));
      if (key.pageUp) setOffset(Math.max(0, scroll - contentRows));
      if (key.pageDown) setOffset(Math.min(lastOffset, scroll + contentRows));
      if (key.home) setOffset(0);
      if (key.end) setOffset(null);
      if (!busy.current) {
        if (key.escape || key.return) setScreen('menu');
        if (input === 'q') exit();
      }
      return;
    }
    if (screen === 'menu') {
      if (input === 'q' || key.escape) exit();
      if (key.upArrow) setSelected(index => Math.max(0, index - 1));
      if (key.downArrow) setSelected(index => Math.min(actions.length - 1, index + 1));
      if (key.return && action) {
        setValues(defaults(action, true));
        setFieldIndex(0);
        setScreen('form');
      }
      return;
    }
    if (editing !== null && field) {
      if (key.escape) setEditing(null);
      else if (key.return) {
        if (editing.trim()) {
          setValues(previous => ({ ...previous, [field.key]: editing }));
          setEditing(null);
        }
      } else if (key.backspace || key.delete) setEditing(editing.slice(0, -1));
      else if (key.ctrl && input === 'u') setEditing('');
      else if (!key.ctrl && !key.meta && !key.tab && !key.upArrow && !key.downArrow && !key.leftArrow && !key.rightArrow) {
        setEditing(editing + input.replace(/[\x00-\x1f\x7f]/g, ''));
      }
      return;
    }
    if (key.escape) setScreen('menu');
    if (key.upArrow) setFieldIndex(index => Math.max(0, index - 1));
    if (key.downArrow || key.tab) setFieldIndex(index => Math.min(action?.fields.length ?? 0, index + 1));
    if (!field && key.return) void run();
    if (!field) return;
    if (key.return || input === ' ' || key.leftArrow || key.rightArrow) {
      if (field.kind === 'toggle') setValues(previous => ({ ...previous, [field.key]: !previous[field.key] }));
      if (field.kind === 'choice') {
        const current = field.choices.indexOf(String(values[field.key]));
        const step = key.leftArrow ? -1 : 1;
        const choice = field.choices[(current + step + field.choices.length) % field.choices.length];
        if (choice) setValues(previous => ({ ...previous, [field.key]: choice }));
      }
      if (field.kind === 'text' && key.return) setEditing(String(values[field.key]));
    }
  });

  if (columns < 36 || rows < 12) return <Text>Ampliá a 36×12. {busy.current ? 'En ejecución.' : 'q salir'}</Text>;

  const visibleCount = Math.max(1, contentRows - 1);
  const menuStart = Math.max(0, selected - visibleCount + 1);
  const formStart = Math.max(0, fieldIndex - visibleCount + 1);
  const footer = screen === 'menu'
    ? '↑↓ elegir · enter abrir · q salir'
    : screen === 'output'
      ? busy.current ? '↑↓ / PgUp/PgDn desplazar · esperá a que termine' : '↑↓ desplazar · enter volver · q salir'
      : editing !== null ? 'enter guardar · esc cancelar · ctrl+u borrar' : '↑↓ elegir · ←→ / espacio cambiar · enter · esc volver';

  return (
    <Box flexDirection="column" height={rows - 1} paddingX={1}>
      <Box justifyContent="space-between">
        <Text bold color="cyan">kix</Text>
        <Text dimColor>automatizaciones personales</Text>
      </Box>
      <Text dimColor wrap="truncate-middle">{root}</Text>
      <Box marginY={1}><Text bold>{screen === 'menu' ? 'Automatizaciones' : action?.title}</Text></Box>
      <Box flexDirection="column" flexGrow={1} overflow="hidden">
        {screen === 'menu' ? <>
          {actions.slice(menuStart, menuStart + visibleCount).map((item, index) => (
            <Text key={item.id} color={selected === menuStart + index ? 'cyan' : undefined} bold={selected === menuStart + index} wrap="truncate-end">
              {selected === menuStart + index ? '› ' : '  '}{item.title}
            </Text>
          ))}
          {actions.length === 0 ? <Text dimColor>No hay automatizaciones registradas.</Text> : null}
        </> : null}
        {screen === 'form' ? <>
          {[...(action?.fields ?? []), null].slice(formStart, formStart + visibleCount).map((item, index) => {
            const active = fieldIndex === formStart + index;
            const value = item ? editing !== null && active ? `${editing}▏` : item.kind === 'toggle' ? values[item.key] ? 'sí' : 'no' : String(values[item.key]) : '';
            return <Text key={item?.key ?? 'run'} color={active ? 'cyan' : undefined} bold={active} wrap="truncate-middle">
              {active ? '› ' : '  '}{item ? `${item.label}: ${value}` : 'Ejecutar'}
            </Text>;
          })}
        </> : null}
        {screen === 'output' ? <>
          {output.slice(scroll, scroll + contentRows).map((line, index) => <Text key={scroll + index}>{line || ' '}</Text>)}
        </> : null}
      </Box>
      <Box marginTop={1} flexDirection="column">
        {screen === 'output' ? <Text color={status === 'error' ? 'red' : status === 'success' ? 'green' : 'cyan'} wrap="truncate-end">
          {status === 'running' ? 'En ejecución' : status === 'success' ? 'Completado' : 'Error'} · {Math.min(scroll + 1, output.length)}–{Math.min(scroll + contentRows, output.length)} / {output.length}
        </Text> : <Text dimColor wrap="truncate-end">{screen === 'menu' ? action?.description : field?.description ?? 'Enter para ejecutar con estas opciones.'}</Text>}
        <Text dimColor wrap="truncate-end">{footer}</Text>
      </Box>
    </Box>
  );
}

export async function openTui(root: string, actions: readonly Automation[]): Promise<void> {
  const app = render(<App root={root} actions={actions} />, { alternateScreen: true, exitOnCtrlC: false });
  try {
    await app.waitUntilExit();
  } finally {
    app.cleanup();
  }
}
