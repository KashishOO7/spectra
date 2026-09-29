
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';
import { parseControl } from './control-md.js';

export interface LoadedControl {
  file: string;
  item: Record<string, any>;
}

const YAML_DIR = 'content/items';
const NOTE_DIR = 'wiki/controls';

function notesUnder(root: string, dir: string, acc: string[] = []): string[] {
  if (!existsSync(join(root, dir))) return acc;
  for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) notesUnder(root, rel, acc);
    else if (entry.name.endsWith('.md')) acc.push(rel);
  }
  return acc;
}

export function readControls(
  root: string,
  source: (rel: string) => string | null = rel => readFileSync(join(root, rel), 'utf-8')
): LoadedControl[] {
  const out: LoadedControl[] = [];

  if (existsSync(join(root, YAML_DIR))) {
    for (const name of readdirSync(join(root, YAML_DIR)).filter(f => /\.ya?ml$/.test(f))) {
      const rel = `${YAML_DIR}/${name}`;
      const text = source(rel);
      if (text === null) continue;
      for (const part of text.replace(/\r\n/g, '\n').split(/^---\s*$/m).filter(s => s.trim())) {
        const parsed = yaml.load(part.trim());
        if (parsed && typeof parsed === 'object') out.push({ file: rel, item: parsed as Record<string, any> });
      }
    }
  }

  for (const rel of notesUnder(root, NOTE_DIR)) {
    const text = source(rel);
    if (text === null) continue;
    const item = parseControl(text, rel);
    const expected = rel.split('/').pop()!.replace(/\.md$/, '');
    if (item.id !== expected) throw new Error(`control ${rel}: the file is named ${expected} and the note says id ${String(item.id)}`);
    out.push({ file: rel, item });
  }

  const seen = new Map<string, string>();
  for (const { file, item } of out) {
    const id = String(item.id ?? '');
    if (!id) continue;
    if (seen.has(id)) throw new Error(`control ${id} is in both ${seen.get(id)} and ${file}`);
    seen.set(id, file);
  }

  return out.sort((a, b) => {
    const x = String(a.item.id ?? ''), y = String(b.item.id ?? '');
    return x < y ? -1 : x > y ? 1 : 0;
  });
}
