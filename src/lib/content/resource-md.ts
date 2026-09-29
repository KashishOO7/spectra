
import yaml from 'js-yaml';

type Resource = Record<string, unknown>;

const FIELD_ORDER = [
  'id', 'schema_version', 'version', 'type', 'title', 'url', 'description', 'platforms', 'cost',
  'open_source', 'privacy_posture', 'status', 'last_verified', 'verified_by', 'sources'
];

const BODY_FIELDS = ['title', 'description'];

export function serializeResource(item: Resource): string {
  const front: Resource = {};
  for (const [k, v] of Object.entries(item)) if (!BODY_FIELDS.includes(k)) front[k] = v;
  const title = String(item.title ?? '');
  const description = String(item.description ?? '');
  if (!title || title.includes('\n')) throw new Error(`resource ${item.id}: the title must be one line`);
  if (!description) throw new Error(`resource ${item.id}: no description`);
  return `---\n${yaml.dump(front, { lineWidth: -1, noRefs: true })}---\n\n# ${title}\n\n${description}\n`;
}

export function parseResource(raw: string, file: string): Resource {
  const text = raw.replace(/\r\n/g, '\n');
  const m = text.match(/^---\n([\s\S]*?)\n---\n\n# ([^\n]+)\n\n([\s\S]+?)\n$/);
  if (!m) {
    throw new Error(`resource ${file}: expected frontmatter between --- lines, a blank line, "# title", a blank line, and the description`);
  }
  const front = yaml.load(m[1]) as Resource;
  if (!front || typeof front !== 'object') throw new Error(`resource ${file}: frontmatter is not a mapping`);
  for (const k of BODY_FIELDS) {
    if (k in front) throw new Error(`resource ${file}: "${k}" belongs in the body, not in frontmatter`);
  }
  const item: Resource = { ...front, title: m[2], description: m[3] };
  const rank = (k: string) => { const i = FIELD_ORDER.indexOf(k); return i === -1 ? FIELD_ORDER.length : i; };
  return Object.fromEntries(Object.keys(item).map((k, i) => ({ k, i }))
    .sort((a, b) => rank(a.k) - rank(b.k) || a.i - b.i)
    .map(({ k }) => [k, item[k]]));
}
