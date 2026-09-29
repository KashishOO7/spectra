
import note from '#spectra-wiki/page/chapters';
import { items, inNote } from '../wiki/page.js';
import type { AssessmentResult, ScoredItem } from '../types.js';

export interface Chapter {
  id: string;
  name: string;
  steps: readonly string[];
  story: readonly string[];
}

const DECIDED: ReadonlyArray<Pick<Chapter, 'id' | 'steps' | 'story'>> = [
  { id: 'lock-your-accounts', story: ['auth-2fa-001'], steps: ['auth-password-manager-001', 'auth-2fa-001', 'recovery-email-first-001',
    'auth-backup-codes-001', 'recovery-routes-001', 'incident-breach-monitor-001', 'auth-sim-pin-001'] },
  { id: 'spot-a-scam', story: ['human-urgency-001', 'human-verify-001'], steps: ['human-urgency-001', 'human-verify-001', 'human-fake-shop-001', 'human-qr-code-001',
    'human-investment-scam-001'] },
  { id: 'ai-and-fakes', story: ['ai-voice-clone-001'], steps: ['ai-phishing-detect-001', 'ai-voice-clone-001', 'ai-chatbot-privacy-001'] },
  { id: 'protect-your-phone', story: ['device-screenlock-001', 'device-encrypt-001'], steps: ['device-updates-001', 'device-screenlock-001', 'device-encrypt-001',
    'data-permissions-001', 'stalkerware-check-001', 'data-backup-001'] },
  { id: 'who-can-find-you', story: ['data-broker-optout-001'], steps: ['location-exposure-001', 'data-social-visibility-001', 'osint-self-001',
    'data-broker-optout-001', 'physical-travel-001',
    'location-tracker-alerts-001'] },
  { id: 'cut-down-tracking', story: ['data-browser-hygiene-001'], steps: ['data-browser-hygiene-001', 'data-ecosystem-audit-001',
    'data-payment-privacy-001', 'net-dns-001', 'net-vpn-001', 'comm-messaging-001'] },
  { id: 'if-something-happens', story: ['money-scam-first-hour-001'], steps: ['money-scam-first-hour-001', 'recovery-locked-out-001',
    'impersonation-report-001', 'harassment-document-001', 'harassment-plan-001', 'image-abuse-001',
    'image-threat-001'] },
  { id: 'looking-after-someone', story: ['guardian-manipulation-001'], steps: ['guardian-passwords-001', 'guardian-manipulation-001',
    'guardian-oversharing-001', 'guardian-social-privacy-001', 'guardian-location-001'] }
];

const names = inNote('wiki/pages/chapters.md', () => {
  const found = items(note, 'chapters');
  const out: Record<string, string> = {};
  for (const it of found) {
    if (!DECIDED.some(d => d.id === it.title)) throw new Error(`"${it.title}" has words and no chapter in chapters.ts`);
    const [line] = it.lines;
    if (it.lines.length !== 1 || line.length !== 1 || line[0].kind !== 'text') throw new Error(`"${it.title}" needs one plain line: its name`);
    out[it.title] = line[0].value;
  }
  for (const d of DECIDED) if (!out[d.id]) throw new Error(`chapters.ts has "${d.id}" and the note has no name for it`);
  for (const d of DECIDED) for (const s of d.story) if (!d.steps.includes(s)) throw new Error(`"${d.id}"'s story names ${s}, which is not one of its steps`);
  return out;
});

export const CHAPTERS: readonly Chapter[] = DECIDED.map(d => ({ ...d, name: names[d.id] }));

export const chapterOf = (stepId: string): Chapter | undefined => CHAPTERS.find(c => c.steps.includes(stepId));

export interface ChapterProgress {
  chapter: Chapter;
  steps: ScoredItem[];
  done: number;
  total: number;
}

export function chapterProgress(chapter: Chapter, result: Pick<AssessmentResult, 'all_items'>): ChapterProgress {
  const byId = new Map(result.all_items.map(i => [i.id, i]));
  const steps = chapter.steps.map(id => byId.get(id)).filter((i): i is ScoredItem => !!i);
  return { chapter, steps, done: steps.filter(i => i.is_implemented && !i.is_skipped).length, total: steps.length };
}
