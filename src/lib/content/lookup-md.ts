
import yaml from 'js-yaml';

type Lookup = Record<string, any>;

const FIELD_ORDER = [
  'id', 'schema_version', 'version', 'title', 'intro', 'status', 'last_verified', 'verified_by',
  'rows', 'notes', 'sources', 'verify_yourself'
];
const BODY_FIELDS = ['title', 'intro', 'rows', 'notes', 'verify_yourself'];

const oneLine = (id: unknown, what: string, s: unknown) => {
  const v = String(s ?? '');
  if (!v || v.includes('\n') || v !== v.trim()) throw new Error(`lookup ${id}: ${what} must be one line of text`);
  return v;
};

export function serializeLookup(item: Lookup): string {
  const front: Lookup = {};
  for (const [k, v] of Object.entries(item)) if (!BODY_FIELDS.includes(k)) front[k] = v;
  const out = [`---\n${yaml.dump(front, { lineWidth: -1, noRefs: true })}---\n`];
  out.push(`# ${oneLine(item.id, 'the title', item.title)}\n${oneLine(item.id, 'the intro', item.intro)}\n`);
  out.push(`## Rows\n`);
  for (const r of item.rows ?? []) {
    out.push(`### ${oneLine(item.id, 'look_for', r.look_for)}\n${oneLine(item.id, 'also_called', r.also_called)}\n${oneLine(item.id, 'why', r.why)}\n`);
    const extra = Object.keys(r).filter(k => !['look_for', 'also_called', 'why'].includes(k));
    if (extra.length) throw new Error(`lookup ${item.id}: a row carries ${extra.join(', ')}, which the note does not hold`);
  }
  if (item.notes?.length) out.push(`## Notes\n${item.notes.map((n: unknown) => `- ${oneLine(item.id, 'a note', n)}`).join('\n')}\n`);
  if (item.verify_yourself !== undefined) out.push(`## Verify yourself\n${oneLine(item.id, 'verify_yourself', item.verify_yourself)}\n`);
  return out.join('\n');
}

export function parseLookup(raw: string, file: string): Lookup {
  const text = raw.replace(/\r\n/g, '\n');
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`lookup ${file}: no frontmatter between --- lines`);
  const front = yaml.load(m[1]) as Lookup;
  if (!front || typeof front !== 'object') throw new Error(`lookup ${file}: frontmatter is not a mapping`);
  for (const k of BODY_FIELDS) if (k in front) throw new Error(`lookup ${file}: "${k}" belongs in the body, not in frontmatter`);

  const lines = m[2].replace(/%%[\s\S]*?%%/g, '').split('\n').filter(l => l.trim() !== '');
  const item: Lookup = { ...front };
  let i = 0;
  const next = () => lines[i++];
  const title = next();
  if (!title?.startsWith('# ')) throw new Error(`lookup ${file}: the body starts with "# title", found "${title ?? ''}"`);
  item.title = title.slice(2);
  const intro = next();
  if (!intro || intro.startsWith('#')) throw new Error(`lookup ${file}: one line of intro goes under the title`);
  item.intro = intro;

  const sections = new Set<string>();
  while (i < lines.length) {
    const h = next();
    if (!h.startsWith('## ')) throw new Error(`lookup ${file}: "${h.slice(0, 40)}" is outside a ## section`);
    const name = h.slice(3);
    if (sections.has(name)) throw new Error(`lookup ${file}: "## ${name}" appears twice`);
    sections.add(name);
    if (name === 'Rows') {
      item.rows = [];
      while (i < lines.length && lines[i].startsWith('### ')) {
        const look_for = next().slice(4);
        const also_called = next(), why = next();
        for (const [what, v] of [['also_called', also_called], ['why', why]] as const) {
          if (!v || v.startsWith('#')) throw new Error(`lookup ${file}: row "${look_for}" needs two lines under it, also_called then why; ${what} is missing`);
        }
        item.rows.push({ look_for, also_called, why });
      }
    } else if (name === 'Notes') {
      item.notes = [];
      while (i < lines.length && lines[i].startsWith('- ')) item.notes.push(next().slice(2));
    } else if (name === 'Verify yourself') {
      const v = next();
      if (!v || v.startsWith('#')) throw new Error(`lookup ${file}: "## Verify yourself" needs one line`);
      item.verify_yourself = v;
    } else {
      throw new Error(`lookup ${file}: "## ${name}" is not Rows, Notes or Verify yourself`);
    }
  }
  if (!sections.has('Rows')) throw new Error(`lookup ${file}: no "## Rows"`);

  const rank = (k: string) => { const r = FIELD_ORDER.indexOf(k); return r === -1 ? FIELD_ORDER.length : r; };
  return Object.fromEntries(Object.keys(item).map((k, j) => ({ k, j }))
    .sort((a, b) => rank(a.k) - rank(b.k) || a.j - b.j)
    .map(({ k }) => [k, item[k]]));
}
