# Contributing to Spectra

Glad you want to help out! Spectra relies on accurate, well-sourced data to generate realistic threat models. Since people use this to assess their actual security posture, content quality is our highest priority. 

Here is how you can get involved.

## What we need right now

- **New Checklist Items:** Adding actionable security controls to `/content/items/`.
- **Resources:** Curating high-signal tools and guides in `/content/resources/tools.yaml`.
- **Maintenance:** Fixing broken URLs, updating outdated platform instructions, or verifying the `last_verified` dates on existing items.

## The Golden Rules (Enforced by CI)

Before you open a Pull Request, make sure your changes align with the engine's requirements. Our CI pipeline will block merges that fail schema validation.

1. **Pass the Validator:** Always run `npm run validate` locally before committing. It will catch missing fields or broken references.
2. **Cite Your Sources:** Every active item requires at least one `type: primary` source. We do not accept "trust me bro" security advice.
3. **No Deletions:** Never delete an item entirely. If a control is outdated, set `status: deprecated` and link it using `superseded_by`.
4. **Human Vulnerability:** If you are adding an item with `category: human_vulnerability`, the `emotional_register` field must be populated (e.g., urgency, authority).

*Note: If you aren't sure how to format a new YAML item, look at the inline comments in the existing files inside `/content/items/`—they document the entire schema.*

## How to submit a PR

1. Fork the repo and create your branch (`git checkout -b feature/add-yubikey-item`).
2. Make your additions or fixes.
3. Run `npm run validate` and fix any terminal errors.
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