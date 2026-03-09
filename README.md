# Spectra

**Personal Security Self-Audit Framework** — by [FPS Zero](https://spectra.fpszero.com/)

Spectra is a local-first, threat-model-driven checklist to evaluate your digital, physical, and operational security posture. Instead of a generic "best practices" list, it weights recommendations based on your actual adversaries and threat vectors.

**Live App:** [spectra.fpszero.com](https://spectra.fpszero.com/)

### How it works

* **Threat-model driven:** A journalist, a student, and a target of stalking have different priorities. Spectra adjusts accordingly.
* **Local-first:** Your assessment state never leaves your browser. It uses IndexedDB. No accounts, no syncing, no backend servers.
* **Graph-based:** Items, threats, and assets are mapped as nodes. The scoring engine calculates your posture by tracing paths between attack vectors and your controls.
* **Human-centric:** We audit emotional triggers (urgency, authority manipulation) alongside technical controls like 2FA or FDE, because social engineering remains the highest-probability attack surface.

### ⚠️ Disclaimer

Spectra is an open-source educational tool. It does not constitute professional security, legal, or medical advice. Because everything runs locally, you are responsible for your data. Use at your own risk. *If you are facing an active, immediate threat, contact local authorities or a professional incident response team.*

### Getting Started

**Prerequisites:** Node.js 20+ & npm 10+

```bash
# Clone and install
git clone https://github.com/KashishOO7/spectra.git
cd spectra
npm install

# Validate YAML content schemas (Do this before opening a PR)
npm run validate

# Start dev server
npm run dev
# → http://localhost:5173

```

### Project Architecture

The app is split into a static content engine and a SvelteKit frontend.

```
spectra/
├── .github/
│   ├── scripts/            # Automations (e.g., RSS landscape scanner)
│   ├── workflows/          # CI schema validation and URL health checks
│   └── CODEOWNERS          # Required reviewers for sensitive content tracks
├── content/                # The Database (CC BY-SA 4.0)
│   ├── controls/           # Abstract mitigation nodes (e.g., MFA, encryption)
│   ├── items/              # Actionable checklist items (one YAML per item)
│   ├── resources/          # Curated privacy tools and guides
│   ├── threats/            # Specific threat models (e.g., AI voice cloning)
│   └── landscape-feed.yaml # Active security landscape events
├── scripts/
│   └── validate.ts         # Schema validator (run `npm run validate`)
├── src/                    # Application Code (MIT)
│   ├── lib/
│   │   ├── content/        # Parses YAML and maps the threat graph
│   │   ├── engine/         # Core scoring logic & local-first IndexedDB store
│   │   └── types.ts        # Canonical TypeScript shapes for the framework
│   └── routes/             # SvelteKit routing structure
│       ├── audit/          # Main checklist and scoring experience
│       ├── graph/          # Threat graph visualization
│       ├── resources/      # Curated tools repository
│       ├── threats/        # Threat node reference browser
│       └── timeline/       # Security posture history
├── static/                 # PWA manifest, favicon, CNAME
├── CONTRIBUTING.md
├── LICENSE                 # Code license (MIT)
└── LICENSE-CONTENT         # Content license (CC BY-SA 4.0)
```

### Contributing

PRs are welcome. See `CONTRIBUTING.md` for guidelines.

* **Rule 1:** All content modifications in `/content` must pass `npm run validate`.
* **Rule 2:** Factual claims or new security controls need primary sources linked in the YAML.
* *Note on Sensitive Content:* Edits related to physical safety, children's privacy, or women's safety require specialized maintainer review. See inline comments in the YAML files for schema definitions.

### License

* **Code (`/src`, `/scripts`):** MIT License
* **Content (`/content`):** CC BY-SA 4.0

Built from first principles by the FPS Zero lab.