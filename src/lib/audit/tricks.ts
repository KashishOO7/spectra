
import note from '#spectra-wiki/page/tricks';
import { items, inNote } from '../wiki/page.js';
import type { SEQuizResult } from '../types.js';
import { FEELING_STEPS, NO_SIGNAL, PART, GOT_PAST, sourcesOf, combine } from '../engine/feelings.js';

export interface Situation {
  id: string;
  register: string;
  step: string;
  also?: string;
  text: string;
  answers: [string, string, string];
  order: [0 | 1 | 2, 0 | 1 | 2, 0 | 1 | 2];
  why: string;
}

const DECIDED: Array<Pick<Situation, 'id' | 'register' | 'step' | 'also' | 'order'>> = [
  { id: 'authority', register: 'authority', step: 'human-verify-001', order: [2, 0, 1] },
  { id: 'urgency', register: 'urgency', step: 'human-urgency-001', order: [0, 2, 1] },
  { id: 'trust', register: 'trust_exploitation', step: 'human-verify-001', order: [1, 2, 0] },
  { id: 'fear', register: 'fear', step: 'human-urgency-001', also: 'image-threat-001', order: [2, 1, 0] },
  { id: 'scarcity', register: 'scarcity', step: 'human-fake-shop-001', order: [0, 1, 2] },
  { id: 'reciprocity', register: 'reciprocity', step: 'ai-phishing-detect-001', order: [1, 0, 2] },
  { id: 'social', register: 'social_proof', step: 'human-investment-scam-001', order: [2, 0, 1] }
];

const words = inNote('wiki/pages/tricks.md', () => {
  const out: Record<string, string[]> = {};
  for (const it of items(note, 'situations')) {
    if (!DECIDED.some(d => d.id === it.title)) throw new Error(`"${it.title}" has words and no situation in tricks.ts`);
    const lines = it.lines.map(l => (l.length === 1 && l[0].kind === 'text' ? l[0].value : null));
    if (lines.length !== 5 || lines.some(l => l === null)) throw new Error(`"${it.title}" needs five plain lines: the situation, three answers, what works`);
    out[it.title] = lines as string[];
  }
  for (const d of DECIDED) if (!out[d.id]) throw new Error(`tricks.ts has "${d.id}" and the note has no words for it`);
  return out;
});

export const SITUATIONS: Situation[] = DECIDED.map(d => {
  const [text, a, b, c, why] = words[d.id];
  return { ...d, text, answers: [a, b, c], why };
});

export const SIGNAL = [GOT_PAST, PART, NO_SIGNAL] as const;

export type Picks = Record<string, 0 | 1 | 2>;

export function quizResult(previous: SEQuizResult | null | undefined, picks: Picks, now = new Date()): SEQuizResult {
  const answers: Record<string, number> = Object.fromEntries(
    Object.entries(previous?.answers ?? {}).filter(([id]) => !id.startsWith('t-') && !id.startsWith('q_')));
  const quiz: Record<string, number> = {};
  for (const s of SITUATIONS) {
    const pick = picks[s.id];
    if (pick === undefined) continue;
    answers[`t-${s.id}`] = pick;
    quiz[s.register] = SIGNAL[pick];
  }
  const { game } = sourcesOf(previous);
  const sources = { ...(game ? { game } : {}), quiz };
  const susceptibilities = combine(sources);
  const top = Math.max(...Object.values(susceptibilities));
  const top_register = SITUATIONS.find(s => quiz[s.register] === top && top > NO_SIGNAL)?.register ?? '';
  const at = now.toISOString();
  return { completed_at: at, quiz_at: at, answers, susceptibilities, top_register, sources };
}

export function lastPicks(result: SEQuizResult | null | undefined): Picks | null {
  const picks: Picks = {};
  for (const s of SITUATIONS) {
    const v = result?.answers?.[`t-${s.id}`];
    if (v !== 0 && v !== 1 && v !== 2) return null;
    picks[s.id] = v;
  }
  return picks;
}

for (const s of SITUATIONS) {
  if (!FEELING_STEPS[s.register]?.includes(s.step)) {
    throw new Error(`tricks.ts: "${s.id}" names ${s.step}, which engine/feelings.ts does not raise for ${s.register}`);
  }
}
