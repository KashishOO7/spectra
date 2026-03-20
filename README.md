# Spectra

**Personal Security Self-Audit Framework** — by [FPS Zero](https://fpszero.com)

Spectra builds a weighted security checklist around your actual threat model — not a generic best-practices wall. A journalist, a parent, and a domestic abuse survivor face fundamentally different adversaries. The scoring engine knows the difference.

Everything runs in the browser. No server, no accounts, no data collection. Your assessment state lives in IndexedDB on your device.

**Live:** [spectra.fpszero.com](https://spectra.fpszero.com/)

## What it does

**Threat-model-driven scoring.** You answer three questions (adversaries, tracks, platforms). The engine applies per-adversary multipliers to every checklist item, so your priorities reflect your actual risk, not someone else's.

**Human vulnerability audit.** A 7-question social engineering susceptibility quiz identifies which manipulation techniques (authority, urgency, scarcity, trust exploitation) you're most exposed to. Results weight the human vulnerability items in your score.

**Knowledge graph, not a flat list.** Four schema types — checklist items, abstract controls, threat nodes, and curated resources — are cross-referenced. The threat graph visualises which adversaries reach which assets through which controls.

**Landscape-aware.** Active security events (e.g., automated SIM swap toolkits, AI phishing at scale) apply real-time multipliers to affected items. Your score responds to the world, not just your checkbox state.

**Security timeline.** Every action is logged locally — items completed, score milestones crossed, life events applied. Your security posture is a story over time, not a snapshot.

## Disclaimer

Spectra is an open-source educational tool. It does not constitute professional security, legal, or medical advice. Implementations vary by jurisdiction. If you are facing an active threat, contact local authorities or a professional incident response team.

## Getting started

Node.js 20+, npm 10+.

```bash
git clone https://github.com/KashishOO7/spectra.git
cd spectra
npm install

# Validate content schemas
npm run validate

# Dev server
npm run dev
```

## Architecture

Static content engine + SvelteKit frontend. Content is YAML, loaded at build time via Node `fs`, baked into the static output. Deployed to GitHub Pages via `adapter-static`.

```
spectra/
├── .github/
│   ├── scripts/            # RSS landscape scanner, content gatekeeper, internal audit
│   ├── workflows/          # CI pipeline, content review bot, URL health checks
│   └── CODEOWNERS
├── content/                # CC BY-SA 4.0
│   ├── controls/           # Abstract security mechanisms (MFA, FDE)
│   ├── items/              # Checklist items (one YAML per item)
│   ├── resources/          # Curated tools with privacy posture ratings
│   ├── threats/            # Adversary × attack vector threat nodes
│   └── landscape-feed.yaml # Active global threat events with scoring multipliers
├── scripts/
│   └── validate.ts         # Schema validator (taxonomy + cross-reference checks)
├── src/
│   ├── lib/
│   │   ├── content/        # YAML parser and graph builder
│   │   ├── engine/         # Scoring engine and IndexedDB store
│   │   └── types.ts        # Canonical TypeScript types
│   └── routes/
│       ├── audit/          # Checklist, onboarding, SE quiz, incident triage
│       ├── graph/          # Interactive threat graph (SVG, pan/zoom)
│       ├── resources/      # Tool browser with posture filtering
│       ├── threats/        # Threat landscape feed
│       └── timeline/       # Personal security history
├── static/                 # PWA manifest, service worker, CNAME
├── CONTRIBUTING.md
└── LICENSE
```

## Scoring

Each item has a base `score_weight` (0-10). The engine applies:

```
effective_score = base × threat_multiplier × landscape_multiplier × (1 - compensating_factor) × staleness_decay
```

Threat multipliers are per-adversary. Staleness decay penalises items whose content hasn't been verified recently. Landscape multipliers elevate items affected by active global events. Compensating controls reduce urgency when a stronger alternative is implemented.

## Contributing

See `CONTRIBUTING.md`. The short version:

All content changes in `/content` must pass `npm run validate`. Factual claims need primary sources in the YAML. Edits to women's safety or children's tracks require specialised maintainer review. Score weights and threat multipliers are protected fields - changes require maintainer approval.

## License

Code (`/src`, `/scripts`): MIT. Content (`/content`): CC BY-SA 4.0.

Built by FPS Zero.