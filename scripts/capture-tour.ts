
import { chromium, type Page } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.BASE ?? 'http://localhost:5173';
const SHOTS = join(ROOT, 'static', 'tour');
const DATA = join(ROOT, 'src', 'routes', 'tour', 'tour-data.ts');

const WIDTH = 1280;
const HEIGHT = 1000;

interface SpotSpec {
  find: (page: Page) => ReturnType<Page['locator']>;
  label: string;
  body: string;
}

interface StopSpec {
  id: string;
  file: string;
  title: string;
  blurb: string;
  arrange: (page: Page) => Promise<void>;
  spots: SpotSpec[];
}


const PROFILE = {
  id: 'user_default',
  assessment_version: '1.0.0',
  assessment_started: '2026-01-01T00:00:00.000Z',
  created_at: '2026-01-01T00:00:00.000Z',
  last_active: '2026-01-01T00:00:00.000Z',
  easy_mode: true,
  environment_flags: [] as string[],
  life_events_applied: [] as string[],
  notes: {}, timeline: [] as unknown[], use_cases: [] as string[],
  tracks: ['general'], platforms: ['all'],
  harms: ['Someone gets into your accounts', 'Someone takes your money'],
  adversariesManual: ['opportunistic'],
  implemented: { 'device-updates-001': true, 'auth-backup-codes-001': true },
  skipped: {}, snoozed: {}
};

async function seed(page: Page, profile: Record<string, unknown> | null) {
  await page.goto(BASE + '/audit', { waitUntil: 'networkidle' });
  await page.evaluate(async (p) => {
    await new Promise<void>((res) => {
      const del = indexedDB.deleteDatabase('spectra');
      del.onsuccess = del.onerror = (del as unknown as { onblocked: () => void }).onblocked = () => res();
    });
    if (!p) return;
    await new Promise<void>((res, rej) => {
      const r = indexedDB.open('spectra');
      r.onupgradeneeded = () => {
        const db = r.result;
        if (!db.objectStoreNames.contains('profile')) db.createObjectStore('profile', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('results')) db.createObjectStore('results', { keyPath: 'id' });
      };
      r.onsuccess = () => {
        const tx = r.result.transaction('profile', 'readwrite');
        tx.objectStore('profile').put(p);
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      };
      r.onerror = () => rej(r.error);
    });
  }, profile);
}

const settle = (page: Page, ms = 900) => page.waitForTimeout(ms);

async function bringIntoFrame(page: Page, targets: Array<ReturnType<Page['locator']>>) {
  const boxes = (await Promise.all(targets.map(t => t.boundingBox()))).filter(Boolean) as Array<{ y: number; height: number }>;
  if (!boxes.length) return;
  const top = Math.min(...boxes.map(b => b.y));
  const bottom = Math.max(...boxes.map(b => b.y + b.height));
  const MARGIN = 24;
  let by = 0;
  if (bottom + MARGIN > HEIGHT) by = bottom + MARGIN - HEIGHT;
  if (top - by < MARGIN) by = top - MARGIN;
  if (Math.abs(by) < 1) return;
  await page.evaluate((dy) => window.scrollBy(0, dy), by);
  await page.waitForTimeout(400);
}

async function centreInPanel(page: Page, target: ReturnType<Page['locator']>) {
  await target.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(400);
}

async function openSetupForm(page: Page, step: number) {
  await page.getByRole('button', { name: /Your setup/i }).first().click();
  await page.getByRole('button', { name: /^Change this$/ }).click();
  await settle(page, 700);
  for (let i = 1; i < step; i++) {
    await page.getByRole('button', { name: /Next →/ }).click();
    await settle(page, 500);
  }
}


const STOPS: StopSpec[] = [
  {
    id: 'front',
    file: '01-front.jpg',
    title: 'The front page asks one question',
    blurb: 'No sign-up and no wall of a hundred items. Eight plain sentences and a button.',
    arrange: async (page) => {
      await seed(page, null);
      await page.goto(BASE + '/', { waitUntil: 'networkidle' });
      await settle(page);
    },
    spots: [
      {
        find: (p) => p.getByRole('button', { name: /Someone gets into your accounts/i }).first(),
        label: 'The eight harms',
        body: 'Tap as many as you like, or none at all. These are the eight things people are usually afraid of, and your taps decide the order of everything that follows.'
      },
      {
        find: (p) => p.locator('a,button').filter({ hasText: /^Show me what to do$/ }).first(),
        label: 'Show me what to do',
        body: 'Takes you to your list. If you tapped nothing, you still get a sensible place to start.'
      },
      {
        find: (p) => p.getByRole('button', { name: /Your setup/i }).first(),
        label: 'Your setup',
        body: 'On every page. What you are worried about, how far you have got, and the code that moves your setup to another device.'
      }
    ]
  },
  {
    id: 'setup-who',
    file: '02-setup-who.jpg',
    title: 'It asks who you are protecting yourself from',
    blurb: 'Four short screens, and every one of them can be skipped. This is the one that does the most work: your answers here reweight the whole list, which is why two people never get the same order.',
    arrange: async (page) => {
      await seed(page, PROFILE);
      await page.goto(BASE + '/audit', { waitUntil: 'networkidle' });
      await settle(page);
      await openSetupForm(page, 1);
      await bringIntoFrame(page, [page.getByRole('button', { name: /Next →/ }).first()]);
    },
    spots: [
      {
        find: (p) => p.getByText('How common:', { exact: true }),
        label: 'How common each one is',
        body: 'Common, elevated, high risk. It is a note about how often this happens to people, not a guess about you, and picking a rare one does not make the list longer.'
      },
      {
        find: (p) => p.getByRole('button', { name: /A current or former partner/i }).first(),
        label: 'Pick as many as apply',
        body: 'Each one changes the weighting behind your list. Choosing a former partner, for example, pushes device encryption and screen locks above the things that would otherwise come first.'
      },
      {
        find: (p) => p.getByRole('button', { name: /Next →/ }).first(),
        label: 'Or skip the lot',
        body: 'Answer nothing and you still get a list. There is no wrong answer here and none of it leaves the browser.'
      }
    ]
  },
  {
    id: 'setup-tracks',
    file: '03-setup-tracks.jpg',
    title: 'And whether anything else applies to you',
    blurb: 'This is the screen that adds whole sets of steps. Nothing here is a category to browse: each one unlocks items written for that situation.',
    arrange: async (page) => {
      await seed(page, PROFILE);
      await page.goto(BASE + '/audit', { waitUntil: 'networkidle' });
      await settle(page);
      await openSetupForm(page, 3);
    },
    spots: [
      {
        find: (p) => p.locator('div.panel').filter({ hasText: 'General baseline' }).first(),
        label: 'The baseline is always there',
        body: 'Whatever else you pick, the steps everyone needs stay on your list. Nothing you choose here can make it shorter.'
      },
      {
        find: (p) => p.getByRole('button', { name: /I have kids or teens at home/i }).first(),
        label: 'Each one adds real steps',
        body: 'Picking this puts items about children on your list, written for the person doing the protecting rather than for the child.'
      },
      {
        find: (p) => p.getByRole('button', { name: /Women's safety concerns/i }).first(),
        label: "Women's safety",
        body: 'Adds the items on stalking, tracking apps and images shared without consent. Several of them open by telling you not to use the device you are worried about.'
      }
    ]
  },
  {
    id: 'list',
    file: '04-list.jpg',
    title: 'Your list leads with one step',
    blurb: 'Two people who tapped different worries get different first steps. That is the point of it.',
    arrange: async (page) => {
      await seed(page, null);
      await page.goto(BASE + '/audit', { waitUntil: 'networkidle' });
      await settle(page);
    },
    spots: [
      {
        find: (p) => p.getByText(/^\d+ of \d+ covered$/).first(),
        label: 'Coverage, the only number you see',
        body: 'Covered means you have done the essentials for one of the eight worries. It is a count of those, not a mark out of a hundred, and a step you set aside still counts against it.'
      },
      {
        find: (p) => p.locator('a,button').filter({ hasText: /^Your map$/ }).first(),
        label: 'Your map',
        body: 'Draws the worries you tapped, who might act on them, and the steps that stand in the way.'
      },
      {
        find: (p) => p.locator('a,button').filter({ hasText: /^Print$/ }).first(),
        label: 'Print',
        body: 'Turns this list into a sheet of paper you can tick off by hand.'
      },
      {
        find: (p) => p.locator('main h2').first(),
        label: 'The one thing to do next',
        body: 'One step, not a list of thirty-two. Chosen from your answers, and written so you can act on it without looking anything up.'
      },
      {
        find: (p) => p.getByRole('button', { name: /^Mark as done$/ }).first(),
        label: 'Mark as done',
        body: 'Saves it on this device and brings up the next step. Nothing is sent anywhere.'
      },
      {
        find: (p) => p.getByRole('button', { name: /^Show me how$/ }).first(),
        label: 'Show me how',
        body: 'Opens the instructions for your phone or computer, a few lines at a time.'
      },
      {
        find: (p) => p.getByRole('button', { name: /Why this one\?/ }).first(),
        label: 'Why this one?',
        body: 'Explains, in plain words, why this step came first for you.'
      },
      {
        find: (p) => p.getByRole('button', { name: /Doesn't apply to me/ }).first(),
        label: "Doesn't apply to me",
        body: 'Takes it off your list. The count stays on screen and one tap puts it back.'
      },
      {
        find: (p) => p.getByPlaceholder('Say it in your own words…'),
        label: 'Say it in your own words',
        body: 'Type what is worrying you as a sentence. If Spectra has nothing for it, it says so instead of guessing.'
      }
    ]
  },
  {
    id: 'queue',
    file: '05-queue.jpg',
    title: 'The rest of the list is one tap away',
    blurb: 'The front of the list holds one step because a wall of thirty-two is what makes people close the tab. The rest is right here, in the order the engine put them in.',
    arrange: async (page) => {
      await seed(page, null);
      await page.goto(BASE + '/audit', { waitUntil: 'networkidle' });
      await settle(page);
      await page.locator('button,summary').filter({ hasText: /more, ordered for you/ }).first().click();
      await settle(page, 700);
    },
    spots: [
      {
        find: (p) => p.locator('button,summary').filter({ hasText: /more, ordered for you/ }).first(),
        label: 'Everything else, in order',
        body: 'Opens the rest of your list. It is ordered, not alphabetical: what sits at the top is what your answers pushed there.'
      },
      {
        find: (p) => p.locator('main select').first(),
        label: 'Narrow it down',
        body: 'Filter by the kind of thing a step is about, if you already know what you came for. Leaving it alone is the normal way to use this.'
      },
      {
        find: (p) => p.locator('label,button').filter({ hasText: /Easy mode/ }).first(),
        label: 'Easy mode',
        body: 'On by default, and it shows one plain sentence per step. Switch it off and each step carries the full detail: the effort, what it protects, and the sources behind it.'
      }
    ]
  },
  {
    id: 'ask-hit',
    file: '06-ask-hit.jpg',
    title: 'Ask it in your own words',
    blurb: 'It works out what you mean without sending your words anywhere, and without downloading anything.',
    arrange: async (page) => {
      await seed(page, null);
      await page.goto(BASE + '/audit', { waitUntil: 'networkidle' });
      await settle(page);
      await page.getByPlaceholder('Say it in your own words…').fill('my ex knows where I am');
      await settle(page, 800);
    },
    spots: [
      {
        find: (p) => p.getByPlaceholder('Say it in your own words…'),
        label: 'A whole sentence',
        body: 'You do not need the right keyword. Describe the situation and Spectra finds the steps that match it.'
      }
    ]
  },
  {
    id: 'ask-miss',
    file: '07-ask-miss.jpg',
    title: 'And it tells you when it cannot help',
    blurb: 'Most search boxes always hand you something. This one would rather tell you the truth.',
    arrange: async (page) => {
      await seed(page, null);
      await page.goto(BASE + '/audit', { waitUntil: 'networkidle' });
      await settle(page);
      await page.getByPlaceholder('Say it in your own words…').fill('how do I back up my car into a garage');
      await settle(page, 800);
      await bringIntoFrame(page, [page.getByText('Spectra does not cover that.', { exact: true }).first()]);
    },
    spots: [
      {
        find: (p) => p.getByText('Spectra does not cover that.', { exact: true }).first(),
        label: 'The refusal',
        body: 'Spectra is a short list of things worth doing, not an answer to everything. When nothing on it fits, it says so and stops.'
      }
    ]
  },
  {
    id: 'map',
    file: '08-map.jpg',
    title: 'Your map, if you want to see the shape of it',
    blurb: 'Read it left to right: who might try, the steps that stand in the way, and what those steps protect. It is drawn from your own answers, so somebody else\'s map is a different picture.',
    arrange: async (page) => {
      await seed(page, PROFILE);
      await page.goto(BASE + '/graph', { waitUntil: 'networkidle' });
      await settle(page, 2500);
    },
    spots: [
      {
        find: (p) => p.getByText(/Click a name in the left column to filter/).first(),
        label: 'It is not just a picture',
        body: 'Tap any name on the left to see only what touches it. Tap a step to open it. Scroll to zoom, drag to move around.'
      },
      {
        find: (p) => p.getByRole('button', { name: /^Full screen$/ }).first(),
        label: 'Full screen',
        body: 'Gives the whole window to the drawing, which is the only comfortable way to read it on a small display.'
      },
      {
        find: (p) => p.getByRole('link', { name: /Go to your list/i }).first(),
        label: 'Back to the list',
        body: 'The map is for understanding. The list is for doing, and this goes back to it.'
      }
    ]
  },
  {
    id: 'incident',
    file: '09-incident.jpg',
    title: 'Something already happened',
    blurb: 'A separate way in, on every page, for anyone who cannot start with a checklist.',
    arrange: async (page) => {
      await seed(page, null);
      await page.goto(BASE + '/incident', { waitUntil: 'networkidle' });
      await settle(page);
    },
    spots: [
      {
        find: (p) => p.locator('main button').first(),
        label: 'Five incident paths',
        body: 'Five situations, each with what to do first. The order matters when the phone in your hand might be the one that is affected.'
      }
    ]
  },
  {
    id: 'setup-panel',
    file: '10-setup-panel.jpg',
    title: 'Everything you have told it, in one panel',
    blurb: 'Reachable from every page. It is the only place your own answers are gathered together, and every one of them can be changed or thrown away here.',
    arrange: async (page) => {
      await seed(page, PROFILE);
      await page.goto(BASE + '/audit', { waitUntil: 'networkidle' });
      await settle(page);
      await page.getByRole('button', { name: /Your setup/i }).first().click();
      await settle(page, 600);
    },
    spots: [
      {
        find: (p) => p.getByRole('button', { name: /^Change this$/ }).first(),
        label: 'Change this',
        body: 'Reopens the four setup screens with your answers still in them. Changing what you are worried about reorders the list straight away, and nothing you have already done is lost.'
      },
      {
        find: (p) => p.getByRole('button', { name: /See everything, in detail/i }).first(),
        label: 'See everything, in detail',
        body: 'Turns off the simplified view and shows the whole list at once, with the effort, the sources and the related steps behind each one.'
      },
      {
        find: (p) => p.getByRole('button', { name: /Something changed in my life/i }).first(),
        label: 'Something changed in my life',
        body: 'A move, a break-up, a new baby, a new job. Each one adds the steps that matter now and moves them to the front, without you having to work out which ones they were.'
      }
    ]
  },
  {
    id: 'share',
    file: '11-share.jpg',
    title: 'A whole profile in twenty characters',
    blurb: 'It travels inside the link itself. Your browser never sends that part to us, so we never see it.',
    arrange: async (page) => {
      await seed(page, PROFILE);
      await page.goto(BASE + '/audit', { waitUntil: 'networkidle' });
      await settle(page);
      await page.getByRole('button', { name: /Your setup/i }).first().click();
      await page.getByRole('button', { name: /Show my setup code/i }).click();
      await settle(page, 600);
      await centreInPanel(page, page.locator('p.font-mono')
        .filter({ hasText: /^[A-Za-z0-9_-]{20}$/ }).first());
    },
    spots: [
      {
        find: (p) => p.locator('div.bg-white svg').first(),
        label: 'Scan it',
        body: 'Point another phone camera at this and it opens Spectra with your setup already in place.'
      },
      {
        find: (p) => p.locator('p.font-mono').filter({ hasText: /^[A-Za-z0-9_-]{20}$/ }).first(),
        label: 'Twenty characters',
        body: 'Your whole setup, short enough to read down a phone or write on paper. It is always this length, so nobody can tell from the code how much you have done.'
      },
      {
        find: (p) => p.getByRole('link', { name: /Print this list on paper/i }).first(),
        label: 'Print this setup',
        body: 'Prints the same list on paper, for someone who would rather not use a website at all.'
      }
    ]
  },
  {
    id: 'playbook',
    file: '12-playbook.jpg',
    title: 'Hand it to someone on paper',
    blurb: 'Because the person who most needs this is often the one who will not use a website.',
    arrange: async (page) => {
      await seed(page, PROFILE);
      await page.goto(BASE + '/playbook', { waitUntil: 'networkidle' });
      await settle(page);
    },
    spots: [
      {
        find: (p) => p.locator('fieldset').first(),
        label: 'Choose what prints',
        body: 'Choose what goes on the page: what is left to do, what is already done (which prints already ticked), or what you set aside.'
      },
      {
        find: (p) => p.getByRole('button', { name: /Print this page/i }).first(),
        label: 'Print this page',
        body: "Uses your browser's own Save as PDF, or a real printer. The text stays proper text, so it prints sharply at any size."
      }
    ]
  }
];


const round = (n: number) => Math.round(n * 1000) / 1000;

async function run() {
  mkdirSync(SHOTS, { recursive: true });
  const browser = await chromium.launch();
  const problems: string[] = [];
  const out: unknown[] = [];

  for (const stop of STOPS) {
    const context = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT } });
    const page = await context.newPage();
    await stop.arrange(page);

    const spots: unknown[] = [];
    for (const spec of stop.spots) {
      const locator = spec.find(page);
      const count = await locator.count();
      if (count === 0) { problems.push(`${stop.id}: no element for "${spec.label}"`); continue; }

      const box = await locator.boundingBox();
      if (!box) { problems.push(`${stop.id}: "${spec.label}" has no box (not rendered)`); continue; }

      if (box.y < 0 || box.x < 0 || box.y + box.height > HEIGHT || box.x + box.width > WIDTH) {
        problems.push(
          `${stop.id}: "${spec.label}" is not fully inside the ${WIDTH}x${HEIGHT} capture ` +
          `(x ${Math.round(box.x)}..${Math.round(box.x + box.width)}, ` +
          `y ${Math.round(box.y)}..${Math.round(box.y + box.height)}). Fix the arrange step.`);
        continue;
      }

      spots.push({
        left: round((box.x / WIDTH) * 100),
        top: round((box.y / HEIGHT) * 100),
        width: round((box.width / WIDTH) * 100),
        height: round((box.height / HEIGHT) * 100),
        label: spec.label,
        body: spec.body
      });
    }

    await page.screenshot({ path: join(SHOTS, stop.file), type: 'jpeg', quality: 82 });
    console.log(`  ${stop.file}  ${spots.length}/${stop.spots.length} boxes`);

    out.push({ id: stop.id, file: stop.file, title: stop.title, blurb: stop.blurb, spots });
    await context.close();
  }

  await browser.close();

  if (problems.length) {
    console.error('\nNot written. Problems:\n' + problems.map(p => '  ' + p).join('\n'));
    process.exit(1);
  }

  const header = `// The guided tour, as data. One entry per screen.
//
// GENERATED by scripts/capture-tour.ts. Do not edit the numbers by hand; edit the prose and the
// selectors in that script and re-run it against a dev server:
//
//     npm run dev
//     BASE=http://localhost:5173 npx tsx scripts/capture-tour.ts
//
// The screenshots under static/tour/ are captured from the running app, and every highlight box is
// the control's real getBoundingClientRect() turned into a percentage of the image. Nothing here
// is hand-placed, so a box cannot drift away from the button it points at without the capture
// being re-run.
//
// Percentages rather than pixels because the image scales with the column it sits in. The
// container that holds them must not stretch past the image: as a stretched grid item it grew to
// the height of the taller notes column and every box landed hundreds of pixels low.

export interface TourSpot {
  /** all four are percentages of the screenshot, not pixels */
  left: number;
  top: number;
  width: number;
  height: number;
  label: string;
  body: string;
}

export interface TourStop {
  id: string;
  file: string;
  title: string;
  blurb: string;
  spots: TourSpot[];
}

/** Every screenshot is captured at this size, so the percentages above resolve against it. */
export const TOUR_IMAGE = { width: ${WIDTH}, height: ${HEIGHT} };

export const TOUR: TourStop[] = ${JSON.stringify(out, null, 2)};
`;

  writeFileSync(DATA, header, 'utf-8');
  console.log(`\nWrote ${STOPS.length} stops to src/routes/tour/tour-data.ts`);
}

run();
