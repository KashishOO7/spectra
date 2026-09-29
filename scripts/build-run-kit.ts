#!/usr/bin/env tsx

import { chromium } from '@playwright/test';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const AGENTS = join(ROOT, '.claude', 'agents');
const SHOTS = join(ROOT, 'peer-review', 'design', 'shots');
const KIT = join(ROOT, 'peer-review', 'personas', 'run-kit');

const RUNS: Array<{ n: string; persona: string; shot: string }> = [
  { n: '01', persona: 'cold-link', shot: 'main.phone.png' },
  { n: '02', persona: 'cold-link', shot: 'homealtb.phone.png' },
  { n: '03', persona: 'night-android', shot: 'homealtb.phone-small.png' },
  { n: '04', persona: 'night-android', shot: 'main.phone-small.png' },
  { n: '05', persona: 'teen-scroll', shot: 'main.phone.png' },
  { n: '06', persona: 'teen-scroll', shot: 'homealtb.phone.png' },
  { n: '07', persona: 'worried-parent', shot: 'homedesktop.desktop.png' },
  { n: '08', persona: 'just-breached', shot: 'homedesktop.desktop.png' },
  { n: '09', persona: 'older-tablet', shot: 'main.tablet-large-text.png' },
  { n: '10', persona: 'second-language', shot: 'main.phone.png' },
  { n: '11', persona: 'skeptic', shot: 'homedesktop.desktop.png' },
  { n: '12', persona: 'night-android', shot: 'main.phone-small.png' },
  { n: '13', persona: 'teen-scroll', shot: 'main.phone.png' },
  { n: '14', persona: 'cold-link', shot: 'homelist.phone.png' },
  { n: '15', persona: 'night-android', shot: 'homelist.phone-small.png' },
  { n: '16', persona: 'teen-scroll', shot: 'homelist.phone.png' },
  { n: '17', persona: 'cold-link', shot: 'homelist.phone.png' },
  { n: '18', persona: 'night-android', shot: 'homelist.phone-small.png' },
  { n: '19', persona: 'teen-scroll', shot: 'homelist.phone.png' }
];

const PREAMBLE = `Read all of this before you answer anything.

You are about to be given a description of a person, and one picture of a screen on a device.
You are that person, from your first word to your last, and you are looking at that screen on
your own device.

The picture is the entire screen at your device's size. Nothing is cut off and there is nothing
below it, so you are not missing anything by not scrolling.

Analyse only what you have been given here. Do not search the web, do not open any link, do not
look anything up, and do not use any tool. If a word or a name on the screen is unfamiliar, it
stays unfamiliar, because that is what would happen to the person you are.

Answer in the seven fields at the end of the description, in that order, and write nothing
before them or after them.

---
`;

const AFTER = `Two last questions, out of character. Did you search the web or look anything up at
any point? And had you heard of this project before this conversation?`;

const REVIEW_PROMPT = `This is a brief for a simulated user who will be asked to look at a website
screen and report what happened. Review the brief itself, not the website. Answer only these:

1. Does the brief tell this person what to think about the site, expect to find, or feel? Quote
   anything that does.
2. Does it hint at what the site is or does? The person must arrive genuinely not knowing.
3. Is this a real person? Name anything implausible, stereotyped, or assembled from traits rather
   than from a life.
4. Could this brief only produce a negative verdict, or only a positive one? If either, say which
   and why.
5. Is the task concrete enough to act on without being so specific it scripts the route?

Do not rewrite the brief. Quote the problems.

---
`;

function briefBody(persona: string): string {
  const raw = readFileSync(join(AGENTS, `persona-${persona}.md`), 'utf-8');
  return raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').trim();
}

function verdictFile(title: string, shot: string, rendered: string): string {
  return `# ${title}

Fill the header before you paste the answer. **A verdict without it cannot be compared to another
one**, which is the only reason eight of these are being run.

    Run date          :
    Model             :
    Thread            : incognito, fresh, one persona only   [ ] confirmed
    Shot              : ${shot}
    Shot rendered     : ${rendered}
    Searched the web  : (ask after the verdict, not before)
    Heard of it before: (ask after the verdict, not before)

Web search cannot be turned off in Perplexity. Measured 2026-09-07. The prompt asks it not to and
**the two questions above are the only control that exists**, so ask them, every run, after the
verdict is written. The first four runs skipped them.

Two models per run. Not for a bigger sample: for the disagreement. On the first four, the two
models agreed on what the screen was and contradicted each other on whether they stayed, which is
how we know the category reading is signal and the abandonment is noise. **One model would have
made that noise look like a result.** If credits run short, drop whole runs from the end, never
drop the second model.

---

Paste the seven fields below, exactly as they came back. Do not tidy them, do not reorder them,
and do not drop a field the model refused to answer. A refusal is a finding.

${MARKER}

`;
}


if (!existsSync(SHOTS)) {
  console.error('\nNo shots. Run this first:\n\n  npx tsx scripts/shoot-mocks.ts\n');
  process.exit(1);
}
const rendered = readFileSync(join(SHOTS, 'MANIFEST.txt'), 'utf-8').split('\n')[0];

mkdirSync(KIT, { recursive: true });
const kept: string[] = [];

const MARKER = '<!-- Paste the answer below this line. Nothing above it is yours to keep. -->';

function writeAnswerUnlessFilled(path: string, body: string): void {
  if (existsSync(path)) {
    const disk = readFileSync(path, 'utf-8');
    const below = disk.includes(MARKER) ? disk.slice(disk.lastIndexOf(MARKER) + MARKER.length) : '';
    const legacy = !disk.includes(MARKER) && /FIRST IMPRESSION|^## \d\./m.test(disk);
    if (below.trim() || legacy) {
      kept.push(path.slice(ROOT.length + 1));
      return;
    }
  }
  writeFileSync(path, body);
}

const personas = [...new Set(RUNS.map(r => r.persona))];

for (const [i, persona] of personas.entries()) {
  const dir = join(KIT, `review-${String(i + 1).padStart(2, '0')}-${persona}-TEXT-ONLY`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'PASTE-THIS.md'), REVIEW_PROMPT + briefBody(persona) + '\n');
  writeAnswerUnlessFilled(
    join(dir, 'ANSWER-HERE.md'),
    `# Pre-flight review: ${persona}\n\n    Run date :\n    Models   :\n\n---\n\n` +
      'Paste the answers to questions 1 to 5. **Anything quoted under 1 or 4 is fixed before this\n' +
      'persona runs**, and an edited brief is re-reviewed.\n\n'
  );
}

for (const run of RUNS) {
  const dir = join(KIT, `run-${run.n}-${run.persona}-${run.shot.split('.')[0]}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'PASTE-THIS.md'), PREAMBLE + briefBody(run.persona) + '\n\n---\n\n' + AFTER + '\n');
  copyFileSync(join(SHOTS, run.shot), join(dir, `ATTACH-THIS.${run.shot}`));
  writeAnswerUnlessFilled(
    join(dir, 'ANSWER-HERE.md'),
    verdictFile(`${run.persona} on ${run.shot.split('.')[0]}`, run.shot, rendered)
  );
}

const baseDir = join(KIT, 'run-00-cold-link-BASELINE-live-site');
mkdirSync(baseDir, { recursive: true });
writeFileSync(join(baseDir, 'PASTE-THIS.md'), PREAMBLE + briefBody('cold-link') + '\n\n---\n\n' + AFTER + '\n');

const BASE = process.env.BASE;
if (BASE) {
  const browser = await chromium.launch();
  for (const scheme of ['light', 'dark'] as const) {
    const context = await browser.newContext({ viewport: { width: 393, height: 852 }, colorScheme: scheme });
    const tab = await context.newPage();
    await tab.goto(BASE + '/', { waitUntil: 'networkidle' });
    const name = scheme === 'light' ? 'ATTACH-THIS.live-home.phone.png' : 'alternative-dark.live-home.phone.png';
    await tab.screenshot({ path: join(baseDir, name), fullPage: false });
    await context.close();
  }
  await browser.close();
  writeAnswerUnlessFilled(
    join(baseDir, 'ANSWER-HERE.md'),
    verdictFile('cold-link on the LIVE site (baseline)', 'live-home.phone.png, light', `captured from ${BASE}`)
  );
} else {
  writeAnswerUnlessFilled(
    join(baseDir, 'ANSWER-HERE.md'),
    verdictFile('cold-link on the LIVE site (baseline)', 'live-home.phone.png, light', 'captured on an earlier build')
  );
}

const baseShot = join(baseDir, 'ATTACH-THIS.live-home.phone.png');
rmSync(join(baseDir, 'IMAGE-MISSING.txt'), { force: true });
const haveBaseline = existsSync(baseShot);

writeFileSync(join(KIT, 'START-HERE.md'), startHere(haveBaseline));

const dirs = readdirSync(KIT).filter(d => !d.endsWith('.md'));
console.log(`\nRun kit: peer-review/personas/run-kit/  (${dirs.length} folders)\n`);
for (const k of kept) console.log(`  kept, already filled: ${k}`);
console.log('  Read START-HERE.md, then work the folders in name order.\n');

function startHere(haveBaseline: boolean): string {
  return `# Start here

Two kinds of folder. Work them in name order.

| Folder | Holds | Is for |
|---|---|---|
| \`review-*-TEXT-ONLY\` | paste file, answer file | Checking the brief is not leading. **No image, and none is missing.** |
| \`run-*\` | paste file, image, answer file | The persona run itself |

In each: paste \`PASTE-THIS.md\`, attach the image if there is one, put the reply in
\`ANSWER-HERE.md\`.

**Three rules, each one voids a run.** One fresh incognito thread per folder. Web search off in the
setting, not just in the prompt. Ask the two questions at the foot of the paste file **after** the
verdict, never before.

**Short on credits?** Do \`review-01\` to \`03\`, then \`run-00\` to \`run-06\`. Ten threads,
and it still gives you a baseline plus the A against B on the three readers who decide.

**Nothing outside this repository ever runs a command.** A persona gets one image and one block of
text, pasted by you. It has no folder, no link, no repository and no terminal. Never hand over this
file, never hand over a run folder, and never hand over a localhost URL: the page it would need is
already a picture, which is why it is a picture.

**\`run-00\` is the site as it stands**, and the only one that can prove us wrong: if a stranger
can already say what Spectra is, the new first screen solves nothing. Baseline image: **${haveBaseline ? 'in the folder, ready' : 'MISSING, see the console output'}**.
Its folder holds a second image starting \`alternative-dark\`. **Do not attach it.** With nothing
stored the site follows the reader's machine, so light and dark are both real first visits; the mock
is cream, and light is what keeps this a test of the design instead of the theme.

**Results count in one direction only.** A persona that cannot say what this is, is evidence. One
that can proves nothing, because it reads better than any real visitor. Build gate: red if three or
more cannot say it in one sentence.

Hand the filled \`ANSWER-HERE.md\` files back when you have them.
`;
}
