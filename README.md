# Spectra

### Most security advice is a hundred-item wall. This asks what you're worried about, then hands you a short list.

[![CI](https://github.com/KashishOO7/spectra/actions/workflows/ci.yml/badge.svg)](https://github.com/KashishOO7/spectra/actions/workflows/ci.yml)
[![Code: AGPL-3.0](https://img.shields.io/badge/code-AGPL--3.0-blue)](LICENSE)
[![Content: CC BY-SA 4.0](https://img.shields.io/badge/content-CC%20BY--SA%204.0-blue)](LICENSE-CONTENT)
[![No accounts](https://img.shields.io/badge/accounts-none-brightgreen)]()
[![No server](https://img.shields.io/badge/server-none-brightgreen)]()
[![No analytics](https://img.shields.io/badge/analytics-none-brightgreen)]()

Someone worried about a partner, someone worried about scams and someone worried about data
brokers get different priorities out of the same steps, because the order follows what the reader
says is going on. That is a measurable claim, so here is the measurement: the first step for one
answer, and how many of its top ten it shares with someone who said nothing.

```
said nothing                          #1  auth-2fa-001               shares 10/10
worry: someone talks you into it      #1  human-verify-001           shares  5/10
worry: someone follows where you go   #1  device-encrypt-001         shares  7/10
someone: a current or former partner  #1  device-encrypt-001         shares  5/10
someone: data brokers                 #1  data-browser-hygiene-001   shares  3/10
```

**Of the 22 single answers a reader can give, 16 change the first step, and 8 different steps come
first.** A situation, such as looking after someone, adds steps written for it lower in the list
rather than reordering the top. Reproduce it from `scoreAssessment` in
`src/lib/engine/scoring.ts`; nothing here is hand-ordered.

Everything runs in the browser. Your state lives in IndexedDB on your own device and never leaves
it, and the page ships `connect-src 'self'`, so the browser itself forbids the app from contacting
anything. The privacy claim is one auditable line, enforced by something that is not us.

**Live at [spectra.fpszero.com](https://spectra.fpszero.com/)** &nbsp;·&nbsp; by [FPS Zero](https://fpszero.com)

---

## The whole product in one picture

```mermaid
flowchart LR
    A["Tap what<br/>worries you"] --> B["Weighted by<br/>your situation"] --> C["A short<br/>ordered list"]
    A -.->|"or skip entirely"| C
    style A stroke:#f59e0b,stroke-width:2px
    style C stroke:#14b8a6,stroke-width:2px
```

No signup screen. Tapping the harms, or answering five yes-or-no questions, is all the setup there
is, and everything works for someone who taps nothing at all.

---

## The model: four layers

Only the bottom two ever move. That is the whole design. New technology arrives as a new *method*
plus some new steps, slotted under a harm that already exists, so nothing at the top gets rewritten.

```mermaid
flowchart TD
    L1["WHO YOU ARE<br/>you pick, or skip<br/>· rarely changes ·"]
    L2["WHAT CAN HAPPEN<br/>10 harms<br/>· NEVER CHANGES ·"]
    L3["HOW IT HAPPENS<br/>17 attack vectors<br/>· changes with technology ·"]
    L4["WHAT YOU DO<br/>45 steps<br/>· grows forever ·"]

    L1 --- L2 --- L3 --- L4

    style L1 stroke:#94a3b8,stroke-width:1px
    style L2 stroke:#f59e0b,stroke-width:3px
    style L3 stroke:#14b8a6,stroke-width:2px
    style L4 stroke:#14b8a6,stroke-width:2px
```

The two outlined in teal are where all the movement is. The amber layer is fixed, and the one above
it barely moves.

### The ten harms

Plain sentences, and they are the front page.

|  |  |
|---|---|
| Someone gets into your accounts | Someone reads what you say |
| Someone takes your money | Someone uses your device against you |
| Someone talks you into it | Someone pretends to be you |
| Someone follows where you go | Someone already has your details |
| Someone will not leave you alone | You are locked out of your own account |

Harm membership is **derived**, from the `assets_protected` and `attack_vectors` every item already
carries. There is no harm field on a step and no manual tagging to keep in step. An item belongs
to every harm whose assets or vectors it covers, so items land in about three of them on purpose:
several doors into the same content.

> A blocking validator rule fails the build if any item resolves to no harm at all.

---

## Three numbers, three jobs

Three questions get three separate numbers, and they never mix.

| | What it answers | Who sees it |
|---|---|---|
| **Priority** | What should I offer next? | Nobody. Internal, never rendered as a number, badge or rank |
| **Coverage** | How am I doing? | The reader, as counts: `N of 10 covered` and steps done |
| **Freshness** | What changed? | The reader, as a count and a list. Never a deduction |

```
priority = base_weight                    (0 to 10, judgement against a rubric, sealed by a check)
         × threat_multiplier              (max across your actors, never compounded)
         × (1 − compensating_factor)      (a stronger control you already have)
order    = priority × order_weight        (1.0 to 1.4, from Real or scam and the quiz; order only)
```

Behind the count sits a weighted figure, `earned weight ÷ total applicable weight`, which is never
shown. **Skipped steps stay in its denominator, because declining is not progress.**

Nothing else enters the order: no outside events feed, which would count facts already in
`base_weight` twice, and no discount for time passing, which would lower a finished score for a
reason nobody could act on.

Full contract in [SCORING.md](SCORING.md), and on the on-site
[methodology page](https://spectra.fpszero.com/methodology).

> **Spectra is a prioritisation engine, not a calibrated risk calculator.** The weights are
> judgement, set against a written rubric, not measured from data, and SCORING.md says so
> plainly rather than implying more.

---

## What you get

| | |
|---|---|
| **Your list** | One step at a time, not the whole list at once. Each carries a sentence written for someone who was never taught this, a how-to written as steps, and a primary source. You never see the engine's numbers, and a lint gate makes that permanent rather than a habit. |
| **Say it in your own words** | Type *"my ex knows where I am"* and the step that covers it comes first. Below its threshold it says **Spectra does not cover that, and stops**, instead of handing you the closest thing on the shelf. No model, no download, nothing generated. |
| **Your map** | Who might try, the steps that help, and what those steps protect, drawn as a graph. Tap a person and the steps against them are picked out. |
| **Something happened** | Five incident paths for the reader already in trouble, in the order that matters when the device in your hand may be the compromised one. Reachable from every page, because that reader cannot start with a checklist. |
| **Move it to another device** | Your setup in seven characters, short enough to read down a phone or write on paper, and it does not get longer as the list grows. A link or a QR carries your progress as well. Both ride in the URL fragment, which browsers never transmit, so we never receive either. Both are a fixed width, so the length of a code cannot leak how far through the list you are, and both carry a checksum, so a mis-heard character is refused rather than quietly loading somebody else's setup. |
| **Print** | `/playbook` turns the list into paper with tick boxes, via the browser's own Save as PDF. Choose still to do, already done (which prints ticked, as a record), or set aside. No PDF library, so nobody downloads 300KB for it. |
| **Guides, not a catalogue** | Spectra names no app to go and get, and rates nobody, because a recommendation that suits us is worth nothing to you. It teaches what to look for and links a directory someone else maintains. |
| **Timeline** | What you finished and when, kept in your browser, so change is visible over months rather than felt. |

There is also Real or scam and a seven-situation quiz, four of whose seven kinds of manipulation are
named after Cialdini's principles. A trick that gets past you moves the step for it earlier in your
list, by a factor from 1.0 to 1.4; it never moves a step later and never changes a count.

### Why the plain-sentence search cannot lie to you

It downloads nothing and generates nothing. It ranks sentences that already exist, so its entire
output space is steps a person wrote, a source backs and twenty-six validators passed. **A fabricated
recommendation is impossible by construction rather than unlikely by supervision**, and an engine
test asserts every id it returns resolves to something real.

The refusal is the part worth stealing. For a reader in danger, a confident wrong answer is worse
than no answer, so the threshold was measured rather than chosen: swept against 24 covered
questions and 23 out-of-scope ones, eight of the latter built deliberately from vocabulary the
corpus does carry, like *"my printer will not connect to wifi"*. The threshold is a named constant
in `src/lib/engine/router.ts`, so you can read the number rather than take it on trust.

---

## How it's built

```mermaid
flowchart LR
    Y["wiki/**.md<br/>steps, guides, lookup tables"]
    L["loader.ts<br/>build the graph"]
    S["+page.server.ts<br/>serialise to page"]
    E["scoring.ts<br/>weight and order"]
    DB[("IndexedDB<br/>your profile")]
    UI["Your list"]

    Y -->|"parsed at build time"| L --> S --> E --> UI
    DB -->|"read at runtime"| E
    UI -->|"your progress"| DB

    style DB stroke:#f59e0b,stroke-width:3px
    style UI stroke:#14b8a6,stroke-width:2px
```

The amber node is the only thing that persists, and it never leaves the browser.

SvelteKit 2, Svelte 4, TypeScript and Tailwind, built with `adapter-static` to GitHub Pages as a
PWA. Content is markdown notes under `wiki/`, compiled to a graph at build time and baked into the
static output.
**There is no backend.**

### What stops it rotting

Most of the failure modes here are editorial, not technical, so most of the gates are too.

| Gate | What it refuses to let through |
|---|---|
| **Twenty-six blocking validators, on the content** | An item that resolves to no harm. A claim about what a company does with your data. A country-specific helpline. A tracking parameter in a source URL. A step with no primary source. Prose gates, run in CI, not just a linter over code. |
| **`check-internals.ts`, invariant I5** | Any engine internal reaching a user screen. No multiplier, no raw score, no `+9pts`, no internal date, on any of 33 components. The one page allowed to show them is named in the script. |
| **CI, on every push and pull request** | Both gates above run, plus `npm run check` and a full build, before anything deploys. A broken item cannot reach the site by being merged on a busy day. |

**Nothing names a tool you have to go and get.** That is not a style preference, it is
`NO_COMPANY_CONDUCT` and `LOOKUP_NAMES_NO_ONE`. A favourable claim is the worst
kind: a wrong warning costs a reader a minute, a wrong reassurance stops them checking at all.

---

## Getting started

Requires Node.js 20+ and npm 10+.

```bash
git clone https://github.com/KashishOO7/spectra.git
cd spectra
npm install
npm run dev
```

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run validate` | Content, taxonomy and no-internals-on-screen gates. **Blocking, runs in CI** |
| `npm run check` | `svelte-check` over `src/` |
| `npm run build` | Static production build |
| `npm run maintain` | Content-health report |
| `npm run new:item` | Scaffold a new checklist item |
| `npm run check:links` | Resolve every source URL |

The last three are run locally rather than on a cron.

---

## Project layout

```
spectra/
├── wiki/                   # CC BY-SA 4.0 · every word the site shows, one note each
│   ├── controls/           # the 45 checklist steps, one note each, by category
│   ├── resources/          # the guides our steps point at
│   ├── lookups/            # vocabulary many steps share, authored once, printed in each
│   ├── pages/              # each page's own words, and the names of every list option
│   ├── playbooks/          # what to do first when something has already happened
│   └── glossary/           # one line per term, grouped by subject
├── scripts/                # validate, check-internals, maintain, new:item, check:links
├── src/
│   ├── lib/
│   │   ├── audit/          # static data and pure helpers (harms, quiz, playbooks, life events)
│   │   ├── components/     # presentational views
│   │   ├── content/        # note reader and graph builder
│   │   ├── engine/         # scoring, coverage, the IndexedDB store, the profile codec
│   │   │                   # (fingerprint.ts, qr.ts) and the plain-sentence router
│   │   │                   # (router.ts, vocabulary.ts)
│   │   └── types.ts        # canonical TypeScript types and taxonomy
│   ├── routes/             # audit, checklist/[id], chapter/[id], start, quiz, real-or-scam,
│   │                       # you, graph, resources, timeline, incident, playbook,
│   │                       # how-it-works, methodology, about, and sitemap.xml,
│   │                       # generated from the content at build time
│   └── styles/             # app.css: the tokens both colour themes resolve to
├── .github/workflows/      # ci.yml deploys; the content automation is dormant by design
├── static/                 # PWA manifest, icons, robots, CNAME
└── SCORING.md  LICENSE  LICENSE-CONTENT
```

---

## The corpus today

| | |
|---|---|
| **Steps** | 45, all active |
| **By situation** | 37 general · 9 someone I know · 9 public work · 5 caring for someone · 2 work accounts · 2 AI-focused *(overlapping)* |
| **Also** | 8 guides · 3 lookups |
| **Taxonomy** | 10 categories · 10 actor types · 17 attack vectors · 14 assets · 6 tracks · 11 platforms · 10 emotional registers |

All canonical in `src/lib/types.ts`. The 10 harms are a projection over two of those, not a taxonomy
of their own.

**What 1.0 claims:** the essentials, done properly, for people who were never taught this. Not
comprehensive. Nothing in the corpus sits above maturity level 2, which is the right tier for the
default reader, and the UI does not imply depth that is not there.

---

## Contributions

**Spectra is not accepting contributions yet.** It is still being built, and the content is being
rewritten, so a pull request today would be reviewed against a moving target. Please do not open
one; it will not be merged.

This will change. The gates that decide what good looks like are already in the repo and runnable:
`npm run validate` refuses an item that resolves to no harm, a factual claim with no primary
source, or a source URL carrying a tracking parameter. When
contributions open, those are the bar.

## License

Code (`/src`, `/scripts`): [**AGPL-3.0-only**](LICENSE) &nbsp;·&nbsp;
Content (`/wiki`): [**CC BY-SA 4.0**](LICENSE-CONTENT)

Copyright (C) 2026 Kashish (fpszero). Two licences, two files, and the split is by directory: the
prose that ships inside `src/` is covered by the code licence.
