
import glossary from '#spectra-wiki/glossary';
import type { GlossaryEntry } from './glossary-md.js';

export type { GlossaryEntry };

const ORDER = ['accounts-and-login', 'attacks-and-scams', 'data-and-tracking', 'devices-and-disks', 'networks-and-traffic'];

for (const name of Object.keys(glossary)) {
  if (!ORDER.includes(name)) throw new Error(`glossary: wiki/glossary/${name}.md is not in ORDER in glossary.ts, so no page would read it.`);
}

function read(): GlossaryEntry[] {
  const out: GlossaryEntry[] = [];
  const seen = new Map<string, string>();
  for (const file of ORDER) {
    const rows = glossary[file];
    if (!rows) throw new Error(`glossary: wiki/glossary/${file}.md is missing.`);
    for (const row of rows) {
      for (const name of [row.term, ...(row.also ?? [])]) {
        const key = name.toLowerCase();
        const already = seen.get(key);
        if (already && already !== file) {
          throw new Error(`glossary: "${name}" is defined in both ${already} and ${file}. A word gets one entry.`);
        }
        seen.set(key, file);
      }
      out.push(row);
    }
  }
  return out;
}

export const GLOSSARY: GlossaryEntry[] = read();

export const GLOSSARY_TERMS: Array<{ match: string; entry: GlossaryEntry }> = GLOSSARY
  .flatMap(entry => [entry.term, ...(entry.also ?? [])].map(match => ({ match, entry })))
  .sort((a, b) => b.match.length - a.match.length);
