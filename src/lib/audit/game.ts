
import note from '#spectra-wiki/page/real-or-scam';
import { items, inNote } from '../wiki/page.js';
import type { SEQuizResult } from '../types.js';
import { FEELING_STEPS, NO_SIGNAL, GOT_PAST, sourcesOf, combine } from '../engine/feelings.js';

export interface GameMessage {
  id: string;
  verdict: 'scam' | 'real';
  register?: string;
  step?: string;
  channel: 'text' | 'email' | 'group' | 'post' | 'notification';
  from: string;
  sender: string;
  body: string;
  why: string;
}

const DECIDED: Array<Pick<GameMessage, 'id' | 'verdict' | 'register' | 'channel'>> = [
  { id: 'msg-urgency', verdict: 'scam', register: 'urgency', channel: 'text' },
  { id: 'msg-authority', verdict: 'scam', register: 'authority', channel: 'email' },
  { id: 'msg-trust', verdict: 'scam', register: 'trust_exploitation', channel: 'text' },
  { id: 'msg-fear', verdict: 'scam', register: 'fear', channel: 'text' },
  { id: 'msg-scarcity', verdict: 'scam', register: 'scarcity', channel: 'post' },
  { id: 'msg-reciprocity', verdict: 'scam', register: 'reciprocity', channel: 'email' },
  { id: 'msg-social', verdict: 'scam', register: 'social_proof', channel: 'group' },
  { id: 'real-code', verdict: 'real', channel: 'text' },
  { id: 'real-delivery', verdict: 'real', channel: 'text' },
  { id: 'real-friend', verdict: 'real', channel: 'text' },
  { id: 'real-bank', verdict: 'real', channel: 'notification' }
];

const words = inNote('wiki/pages/real-or-scam.md', () => {
  const found = items(note, 'messages');
  const out: Record<string, [string, string, string, string]> = {};
  for (const it of found) {
    if (!DECIDED.some(d => d.id === it.title)) throw new Error(`"${it.title}" has words and no message in game.ts`);
    const lines = it.lines.map(l => (l.length === 1 && l[0].kind === 'text' ? l[0].value : null));
    if (lines.length !== 4 || lines.some(l => l === null)) throw new Error(`"${it.title}" needs four plain lines: from, sender, message, why`);
    out[it.title] = lines as [string, string, string, string];
  }
  for (const d of DECIDED) if (!out[d.id]) throw new Error(`game.ts has "${d.id}" and the note has no words for it`);
  return out;
});

export const GAME_MESSAGES: GameMessage[] = DECIDED.map(d => {
  const [from, sender, body, why] = words[d.id];
  const step = d.register ? FEELING_STEPS[d.register]?.[0] : undefined;
  if (d.register && !step) throw new Error(`"${d.id}" uses "${d.register}", which engine/feelings.ts gives no step`);
  return { ...d, step, from, sender, body, why };
});

export const ROUND_SIZE = 4;

export { NO_SIGNAL, GOT_PAST };

const registers = [...new Set(DECIDED.filter(d => d.register).map(d => d.register!))];

export function pickRound(previous?: SEQuizResult | null): GameMessage[] {
  const played = Object.fromEntries(Object.entries(previous?.answers ?? {}).filter(([id]) => GAME_MESSAGES.some(m => m.id === id)));
  const byNew = (list: GameMessage[]) => [...list].sort((a, b) => (a.id in played ? 1 : 0) - (b.id in played ? 1 : 0));
  const scams = byNew(GAME_MESSAGES.filter(m => m.verdict === 'scam')).slice(0, ROUND_SIZE - 1);
  const [real] = byNew(GAME_MESSAGES.filter(m => m.verdict === 'real'));
  const at = Object.keys(played).length % ROUND_SIZE;
  return [...scams.slice(0, at), real, ...scams.slice(at)];
}

export const isRight = (m: GameMessage, said: 'real' | 'scam') => m.verdict === said;

export function verdictLine(m: GameMessage, said: 'real' | 'scam'): 'spotted' | 'got-past' | 'right-real' | 'called-scam' {
  if (m.verdict === 'scam') return said === 'scam' ? 'spotted' : 'got-past';
  return said === 'real' ? 'right-real' : 'called-scam';
}

export function roundResult(previous: SEQuizResult | null | undefined, said: Record<string, 'real' | 'scam'>, now = new Date()): SEQuizResult {
  const answers = { ...(previous?.answers ?? {}) };
  const sources = sourcesOf(previous);
  const game: Record<string, number> = { ...(sources.game ?? {}) };
  const missedNow: string[] = [];
  for (const [id, call] of Object.entries(said)) {
    const m = GAME_MESSAGES.find(x => x.id === id);
    if (!m) continue;
    const right = isRight(m, call);
    answers[id] = right ? 1 : 0;
    if (m.register) {
      game[m.register] = right ? NO_SIGNAL : GOT_PAST;
      if (!right) missedNow.push(m.register);
    }
  }
  const next = { ...sources, game };
  const susceptibilities = combine(next);
  const top = Math.max(...Object.values(susceptibilities));
  const top_register = missedNow.find(r => susceptibilities[r] === top)
    ?? registers.find(r => susceptibilities[r] === top) ?? '';
  return { ...(previous?.quiz_at ? { quiz_at: previous.quiz_at } : {}), completed_at: now.toISOString(), answers, susceptibilities, top_register, sources: next };
}
