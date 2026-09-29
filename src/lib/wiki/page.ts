
export type Part =
  | { kind: 'text'; value: string }
  | { kind: 'strong'; value: string }
  | { kind: 'link'; value: string; href: string }
  | { kind: 'slot'; value: string };

export interface Item { title: string; lines: Part[][] }
export interface Block { lines: Part[][]; items: Item[] }
export type WikiPage = Record<string, Block>;

const INLINE = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|\{([a-zA-Z][a-zA-Z0-9]*)\}/g;

export function parseLine(line: string, where: string): Part[] {
  if (/<[a-zA-Z/!]/.test(line)) throw new Error(`wiki ${where}: markup is not allowed in a note: "${line}"`);
  const parts: Part[] = [];
  let at = 0;
  for (const m of line.matchAll(INLINE)) {
    const i = m.index ?? 0;
    if (i > at) parts.push({ kind: 'text', value: line.slice(at, i) });
    if (m[1] !== undefined) parts.push({ kind: 'strong', value: m[1] });
    else if (m[4] !== undefined) parts.push({ kind: 'slot', value: m[4] });
    else parts.push({ kind: 'link', value: m[2], href: m[3] });
    at = i + m[0].length;
  }
  if (at < line.length) parts.push({ kind: 'text', value: line.slice(at) });
  return parts;
}

export function parsePage(raw: string, file: string): WikiPage {
  const text = raw.replace(/\r\n/g, '\n').replace(/%%[\s\S]*?%%/g, '');
  const page: WikiPage = {};
  let key: string | null = null;
  let item: Item | null = null;

  text.split('\n').forEach((line, n) => {
    const where = `${file}:${n + 1}`;
    if (line.trim() === '') return;
    if (line.startsWith('## ')) {
      key = line.slice(3);
      if (!/^[a-z0-9-]+$/.test(key)) throw new Error(`wiki ${where}: a key is lowercase letters, digits and dashes: "${key}"`);
      if (page[key]) throw new Error(`wiki ${where}: "${key}" is used twice`);
      page[key] = { lines: [], items: [] };
      item = null;
      return;
    }
    if (key === null) throw new Error(`wiki ${where}: a line before the first ## key: "${line}"`);
    if (line.startsWith('### ')) {
      item = { title: line.slice(4), lines: [] };
      page[key].items.push(item);
      return;
    }
    const body = line.startsWith('- ') ? line.slice(2) : line;
    (item ? item.lines : page[key].lines).push(parseLine(body, where));
  });

  for (const [k, b] of Object.entries(page)) {
    if (!b.lines.length && !b.items.length) throw new Error(`wiki ${file}: "${k}" has nothing in it`);
    for (const it of b.items) if (!it.lines.length) throw new Error(`wiki ${file}: "${k}" / "${it.title}" has nothing in it`);
  }
  return page;
}

function block(page: WikiPage, key: string): Block {
  const b = page[key];
  if (!b) throw new Error(`wiki: the page asks for "${key}" and the note has no such key`);
  return b;
}

export function text(page: WikiPage, key: string): string {
  const b = block(page, key);
  const [line] = b.lines;
  if (b.lines.length !== 1 || b.items.length || line.length !== 1 || line[0].kind !== 'text') {
    throw new Error(`wiki: "${key}" is read as one plain line`);
  }
  return line[0].value;
}

export function fill(page: WikiPage, key: string, values: Record<string, string | number>): string {
  return pieces(page, key, values).join('');
}

export function pieces(page: WikiPage, key: string, values: Record<string, string | number>): string[] {
  const b = block(page, key);
  const [line] = b.lines;
  if (b.lines.length !== 1 || b.items.length) throw new Error(`wiki: "${key}" is read as one line`);
  const used = new Set<string>();
  const out = line.map(p => {
    if (p.kind === 'slot') {
      if (!(p.value in values)) throw new Error(`wiki: "${key}" has {${p.value}} and the page does not fill it`);
      used.add(p.value);
      return String(values[p.value]);
    }
    if (p.kind !== 'text') throw new Error(`wiki: "${key}" is read as plain text with places, and is marked up`);
    return p.value;
  });
  for (const name of Object.keys(values)) {
    if (!used.has(name)) throw new Error(`wiki: the page fills {${name}} and "${key}" has no such place`);
  }
  return out;
}

export function placed(page: WikiPage, key: string, names: string[]): Part[] {
  const b = block(page, key);
  const [line] = b.lines;
  if (b.lines.length !== 1 || b.items.length) throw new Error(`wiki: "${key}" is read as one line`);
  const found = line.filter(p => p.kind === 'slot').map(p => p.value);
  if (line.some(p => p.kind !== 'text' && p.kind !== 'slot')) throw new Error(`wiki: "${key}" is read as plain text with places, and is marked up`);
  if ([...found].sort().join() !== [...names].sort().join()) {
    throw new Error(`wiki: "${key}" has {${found.join('}, {')}} and the page places {${names.join('}, {')}}`);
  }
  return line;
}

export type Span = Exclude<Part, { kind: 'slot' }> | { kind: 'slot'; value: string; words: string };

export function spans(page: WikiPage, key: string, names: string[]): Span[] {
  const b = block(page, key);
  const [line] = b.lines;
  if (b.lines.length !== 1) throw new Error(`wiki: "${key}" is read as one line with its places under it`);
  const found = line.filter(p => p.kind === 'slot').map(p => p.value);
  const rowNames = b.items.map(i => i.title);
  const same = (a: string[], c: string[]) => [...a].sort().join() === [...c].sort().join();
  if (!same(found, names) || !same(rowNames, names)) {
    throw new Error(`wiki: "${key}" has places {${found.join('}, {')}} and rows ${rowNames.join(', ') || 'none'}; ` +
      `the page draws {${names.join('}, {')}}`);
  }
  const words: Record<string, string> = {};
  for (const it of b.items) {
    const [l] = it.lines;
    if (it.lines.length !== 1 || l.length !== 1 || l[0].kind !== 'text') {
      throw new Error(`wiki: "${key}" / "${it.title}" is read as one plain line`);
    }
    words[it.title] = l[0].value;
  }
  return line.map(p => p.kind === 'slot' ? { kind: 'slot', value: p.value, words: words[p.value] } : p);
}

export function lines(page: WikiPage, key: string): Part[][] {
  const b = block(page, key);
  if (b.items.length) throw new Error(`wiki: "${key}" is read as paragraphs and has ### items`);
  return b.lines;
}

export function labels(page: WikiPage, key: string, count: number): string[] {
  const out = lines(page, key).map(line => {
    if (line.length !== 1 || line[0].kind !== 'text') throw new Error(`wiki: "${key}" is read as plain labels`);
    return line[0].value;
  });
  if (out.length !== count) throw new Error(`wiki: "${key}" needs exactly ${count} lines and has ${out.length}`);
  return out;
}

export function links(page: WikiPage, key: string): Array<{ text: string; href: string }> {
  return lines(page, key).map(line => {
    const [p] = line;
    if (line.length !== 1 || p.kind !== 'link') throw new Error(`wiki: "${key}" is read as a list of links`);
    return { text: p.value, href: p.href };
  });
}

export function link(page: WikiPage, key: string): { text: string; href: string } {
  const all = links(page, key);
  if (all.length !== 1) throw new Error(`wiki: "${key}" is read as one link and has ${all.length}`);
  return all[0];
}

export function items(page: WikiPage, key: string): Item[] {
  const b = block(page, key);
  if (b.lines.length || !b.items.length) throw new Error(`wiki: "${key}" is read as ### items only`);
  return b.items;
}

export function rows<K extends string>(page: WikiPage, key: string, values: readonly K[], count: number): Record<K, string[]> {
  const out = {} as Record<K, string[]>;
  for (const it of items(page, key)) {
    if (!(values as readonly string[]).includes(it.title)) {
      throw new Error(`wiki: "${key}" has "${it.title}", which is not a value the code knows (${values.join(', ')})`);
    }
    if (it.title in out) throw new Error(`wiki: "${key}" names "${it.title}" twice`);
    if (it.lines.length !== count || it.lines.some(l => l.length !== 1 || l[0].kind !== 'text')) {
      throw new Error(`wiki: "${key}" / "${it.title}" needs exactly ${count} plain line(s)`);
    }
    out[it.title as K] = it.lines.map(l => (l[0] as { value: string }).value);
  }
  for (const v of values) if (!(v in out)) throw new Error(`wiki: "${key}" has no "### ${v}", and the code needs it`);
  return out;
}

export function notesFor(notes: Record<string, WikiPage>, folder: string, ids: readonly string[], keys: readonly string[]): Record<string, WikiPage> {
  const twice = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (twice.length) throw new Error(`wiki ${folder}: the code lists "${twice[0]}" twice, and both would show the same note`);
  const orphans = Object.keys(notes).filter(name => !ids.includes(name));
  if (orphans.length) {
    throw new Error(`wiki ${folder}: ${orphans.map(n => `${n}.md`).join(', ')} has nothing in the code that shows it. ` +
      `Add its id there, or delete the note.`);
  }
  for (const id of ids) {
    const note = notes[id];
    if (!note) throw new Error(`wiki ${folder}: the code lists "${id}" and there is no note at ${folder}/${id}.md`);
    const missing = keys.filter(k => !(k in note));
    const unknown = Object.keys(note).filter(k => !keys.includes(k));
    if (missing.length || unknown.length) {
      throw new Error(`wiki ${folder}/${id}.md: needs exactly ## ${keys.join(', ## ')}` +
        (missing.length ? `; missing ${missing.join(', ')}` : '') +
        (unknown.length ? `; not read, so never shown: ${unknown.join(', ')}` : ''));
    }
  }
  return notes;
}

export function inNote<T>(where: string, read: () => T): T {
  try {
    return read();
  } catch (e) {
    throw new Error(`${where}: ${(e as Error).message}`);
  }
}

export function plainLines(page: WikiPage, key: string): string[] {
  return lines(page, key).map(line => {
    if (line.length !== 1 || line[0].kind !== 'text') {
      throw new Error(`wiki: "${key}" is read as plain lines, and one is marked up`);
    }
    return line[0].value;
  });
}

export function named(page: WikiPage, key: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const it of items(page, key)) {
    const [line] = it.lines;
    if (it.lines.length !== 1 || line.length !== 1 || line[0].kind !== 'text') {
      throw new Error(`wiki: "${key}" / "${it.title}" is read as one plain line`);
    }
    if (it.title in out) throw new Error(`wiki: "${key}" names "${it.title}" twice`);
    out[it.title] = line[0].value;
  }
  return out;
}
