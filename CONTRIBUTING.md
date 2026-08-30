# Contributing to Spectra

Glad you want to help out. Spectra turns accurate, well-sourced content into a short ordered list of what someone should do about their own security, so content quality is our highest priority.

Here is how you can get involved.

## What we need right now

- **New Checklist Items:** Adding actionable security controls to `/content/items/`.
- **Guides:** The maintained directories our steps point at, in `/content/resources/tools.yaml`. These are guide sections, not products: Spectra does not keep a tool catalogue and does not name apps to go and get.
- **Lookups:** Vocabulary many items share, authored once in `/content/lookups/` and printed inside each item that asks for it.
- **Maintenance:** Fixing broken URLs and updating platform instructions that no longer match the current OS.

`last_verified` is not a maintenance field. It moves only when someone has actually opened every source on an item and confirmed it still supports the claim it is attached to, so please leave it alone and say in your PR what you checked.

## The Golden Rules (Enforced by CI)

Before you open a Pull Request, make sure your changes align with the engine's requirements. Our CI pipeline will block merges that fail schema validation.

1. **Pass the Validator:** Always run `npm run validate` locally before committing. It will catch missing fields or broken references.
2. **Cite Your Sources:** Every active item requires at least one `type: primary` source, and the source has to actually support the sentence it is attached to. A citation that looks checked and is not is worse than none.
3. **No Deletions:** Never delete an item entirely. If a control is outdated, set `status: deprecated` and link it using `superseded_by`.
4. **Human Vulnerability:** If you are adding an item with `category: human_vulnerability`, the `emotional_register` field must be populated (e.g., urgency, authority).

These are the content rules the validator blocks on, and they catch most first PRs:

- **Never say what a company does with your data.** Naming a platform the reader already has is fine and necessary. Asserting what a named business does with personal data is not, because we cannot verify it, it varies by country and year, and it rots in silence. A favourable claim is the worst kind: a wrong warning costs a minute, a wrong reassurance stops someone checking at all.
- **Name no tool you tell someone to go and get.** Link a maintained directory instead. A product recommendation is a claim about a business that goes stale without anyone noticing.
- **No placeholders and no country assumptions.** No `TODO`, `TBD` or maintainer notes in a rendered field, and no phone numbers: Spectra has a global audience.
- **Plain words only on screen.** "Adversary", "threat model", "vector", "posture", "exposure", "OSINT" and "dork" are blocked on user-facing surfaces. The 32 plain one-sentence descriptions read at grade 5.3, and they are the best thing in the product.
- **No em dashes anywhere on the site.** Use a full stop or a comma.

*Note: `npm run new:item` scaffolds a correctly shaped YAML file. The canonical schema and the whole taxonomy live in `src/lib/types.ts`.*

## How to submit a PR

1. Fork the repo and create your branch (`git checkout -b feature/add-hardware-key-item`).
2. Make your additions or fixes.
3. Run `npm run validate` and `npm run check`, and fix any terminal errors.
4. Push and open a PR. Briefly explain what you added and link your primary sources in the PR description.

## Specialized Tracks (Requires Maintainer Review)

Certain topics require strict editorial oversight due to their real-world impact. If your PR touches these tracks, expect a slightly longer review process:

- **Women's Safety** (`tracks: [womens_safety]`): Content must be strictly trauma-informed and pragmatic.
- **Children & Teens** (`tracks: [kids_teen]`): Content must be age-appropriate and focused on harm reduction rather than surveillance.
- **Core Engine Changes:** Any tweaks to `score_weight` or `threat_model_multipliers`.

## Reporting Issues

- **Standard fixes:** Found a broken link or outdated guide? Open a standard GitHub issue with the item ID.
- **Factual disputes:** Think one of our controls is wrong? Open an issue, drop your source, and let's discuss it. 
- **Security vulnerabilities:** If you find a flaw in the Spectra framework itself (e.g., an XSS vector in the SvelteKit frontend), **do not open a public issue**. Please use GitHub's private security advisory feature to report it directly to the maintainers.

## Code of Conduct

Keep it strictly technical. Be accurate. Cite your sources. Disclose trade-offs. Never recommend a tool or practice because of a commercial relationship.