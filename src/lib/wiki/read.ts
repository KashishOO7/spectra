
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseGlossary, type GlossaryEntry } from '../audit/glossary-md.js';
import { parsePage, type WikiPage } from './page.js';

export interface Wiki {
  glossary: Record<string, GlossaryEntry[]>;
  pages: Record<string, WikiPage>;
  playbooks: Record<string, WikiPage>;
}

export const WIKI_FOLDERS = ['glossary', 'pages', 'playbooks'] as const;

export function readWiki(root: string, watch: (file: string) => void = () => {}): Wiki {
  const notes = <T>(dir: string, parse: (raw: string, name: string) => T): Record<string, T> => {
    const abs = join(root, 'wiki', dir);
    if (!existsSync(abs)) return {};
    return Object.fromEntries(readdirSync(abs).filter(f => f.endsWith('.md')).sort().map(f => {
      const file = join(abs, f);
      watch(file);
      return [f.slice(0, -3), parse(readFileSync(file, 'utf-8'), `${dir}/${f}`)];
    }));
  };
  return {
    glossary: notes('glossary', parseGlossary),
    pages: notes('pages', parsePage),
    playbooks: notes('playbooks', parsePage)
  };
}
