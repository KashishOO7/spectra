
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';
import { parseLookup } from './lookup-md.js';

export interface LoadedLookup {
  file: string;
  item: Record<string, any>;
}

const YAML_DIR = 'content/lookups';
const NOTE_DIR = 'wiki/lookups';

export function readLookups(
  root: string,
  source: (rel: string) => string | null = rel => readFileSync(join(root, rel), 'utf-8')
): LoadedLookup[] {
  const out: LoadedLookup[] = [];

  if (existsSync(join(root, YAML_DIR))) {
    for (const name of readdirSync(join(root, YAML_DIR)).filter(f => /\.ya?ml$/.test(f)).sort()) {
      const rel = `${YAML_DIR}/${name}`;
      const text = source(rel);
      if (text === null) continue;
      for (const part of text.replace(/\r\n/g, '\n').split(/^---\s*$/m).filter(s => s.trim())) {
        const parsed = yaml.load(part.trim());
        const entries = Array.isArray(parsed) ? parsed : [parsed];
        for (const e of entries) if (e && typeof e === 'object') out.push({ file: rel, item: e as Record<string, any> });
      }
    }
  }

  if (existsSync(join(root, NOTE_DIR))) {
    for (const name of readdirSync(join(root, NOTE_DIR)).filter(f => f.endsWith('.md')).sort()) {
      const rel = `${NOTE_DIR}/${name}`;
      const text = source(rel);
      if (text === null) continue;
      const item = parseLookup(text, rel);
      const expected = name.replace(/\.md$/, '');
      if (item.id !== expected) throw new Error(`lookup ${rel}: the file is named ${expected} and the note says id ${String(item.id)}`);
      out.push({ file: rel, item });
    }
  }

  const seen = new Map<string, string>();
  for (const { file, item } of out) {
    const id = String(item.id ?? '');
    if (!id) continue;
    if (seen.has(id)) throw new Error(`lookup ${id} is in both ${seen.get(id)} and ${file}`);
    seen.set(id, file);
  }

  return out.sort((a, b) => {
    const x = String(a.item.id ?? ''), y = String(b.item.id ?? '');
    return x < y ? -1 : x > y ? 1 : 0;
  });
}
