
export interface GlossaryEntry {
  term: string;
  also?: string[];
  meaning: string;
}

export function parseGlossary(raw: string, file: string): GlossaryEntry[] {
  const text = raw.replace(/\r\n/g, '\n').replace(/%%[\s\S]*?%%/g, '');
  const out: GlossaryEntry[] = [];
  let term: string | null = null;
  let also: string[] | undefined;
  let meaning: string | null = null;

  const close = () => {
    if (term === null) return;
    if (meaning === null) throw new Error(`glossary ${file}: "${term}" has no meaning line.`);
    const entry: GlossaryEntry = { term } as GlossaryEntry;
    if (also) entry.also = also;
    entry.meaning = meaning;
    out.push(entry);
    term = null; also = undefined; meaning = null;
  };

  for (const line of text.split('\n')) {
    if (line.trim() === '') continue;
    if (line.startsWith('## ')) { close(); term = line.slice(3); continue; }
    if (term !== null && meaning === null && also === undefined && line.startsWith('also: ')) {
      also = line.slice(6).split(', ');
      continue;
    }
    if (term !== null && meaning === null) { meaning = line; continue; }
    throw new Error(`glossary ${file}: unexpected line "${line}".`);
  }
  close();
  return out;
}
