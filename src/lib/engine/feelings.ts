

import type { SEQuizResult } from '../types.js';

export const FEELING_STEPS: Readonly<Record<string, readonly string[]>> = {
  urgency: ['human-urgency-001', 'human-qr-code-001'],
  fear: ['human-urgency-001'],
  scarcity: ['human-fake-shop-001', 'human-urgency-001'],
  authority: ['ai-phishing-detect-001', 'human-verify-001'],
  reciprocity: ['ai-phishing-detect-001'],
  trust_exploitation: ['human-verify-001', 'human-investment-scam-001'],
  social_proof: ['human-verify-001', 'human-investment-scam-001']
};

export const feelingsFor = (stepId: string): string[] =>
  Object.entries(FEELING_STEPS).filter(([, steps]) => steps.includes(stepId)).map(([f]) => f);

export const NO_SIGNAL = 100 / 3;
export const PART = 200 / 3;
export const GOT_PAST = 100;

export type SignalSources = NonNullable<SEQuizResult['sources']>;

export function sourcesOf(previous: SEQuizResult | null | undefined): SignalSources {
  if (!previous) return {};
  if (previous.sources) return previous.sources;
  return { legacy: { ...(previous.susceptibilities ?? {}) } };
}

export function combine(sources: SignalSources): Record<string, number> {
  const out: Record<string, number> = {};
  for (const f of Object.keys(FEELING_STEPS)) {
    out[f] = Math.max(NO_SIGNAL, ...[sources.game, sources.quiz, sources.legacy].map(s => s?.[f] ?? NO_SIGNAL));
  }
  return out;
}
