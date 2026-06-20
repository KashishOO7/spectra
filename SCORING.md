# Spectra Scoring Methodology

*How Spectra turns a checklist into a personalised, defensible priority order — and where the
numbers come from.*

Spectra is a **prioritisation engine**, not a calibrated risk calculator. Its job is to answer
"what should *I* do next?" for *your* threat model. This document explains the formula, justifies
every number with a documented rubric, and maps the framework to recognised standards so the
scoring is auditable rather than arbitrary.

---

## 1. The formula

For each checklist item:

```
effective_score = base_weight
                × threat_multiplier        (your adversaries)
                × landscape_multiplier      (active real-world events)
                × (1 − compensating_factor) (a stronger control you already have)
                × staleness_multiplier      (how recently the guidance was verified)
```

- **Per-category score** = earned ÷ available effective_score (saturation %, 0–100).
- **Overall score** = mean of category percentages.
- **Maturity** = banded (≤20 L1 · ≤40 L2 · ≤65 L3 · ≤85 L4 · ≤100 L5).

This is a multiplicative model in the spirit of **NIST SP 800-30** (`risk ≈ threat × likelihood ×
impact`) and CVSS-style environmental scoring. It is bespoke — there is no single standard for
personal-security prioritisation — but every input is rubric-driven (below), not hand-waved.

---

## 2. `base_weight` (`score_weight`, 0–10) — the rubric

`score_weight` is set by expert judgement along two axes — **impact** and **prevalence** — using the
rubric below to keep the 0–10 weights consistent. The rubric is a consistency guide and a defensible
justification framework, **not** a mechanical formula: the weights are principled estimation anchored
to public data and hand-tuned to 0.5 granularity, not the arithmetic output of `impact × prevalence`.

**Impact (1–5)** — severity if the threat this control mitigates succeeds:

| 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|
| Minor / cosmetic | Limited data exposure | Account or device compromise | Financial loss / identity theft | Physical-safety or catastrophic, irreversible harm |

**Prevalence (1–5)** — how common the attack is in the real world, anchored to public data
(Verizon **DBIR**, FBI **IC3**, **HIBP**):

| 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|
| Rare / theoretical | Occasional, targeted | Common | Very common | Near-universal / automated at scale |

**Worked examples** (stored weights, with the impact/prevalence reasoning behind them):
- `auth-2fa-001` — **9.5**. High impact (account takeover → cascading) × very high prevalence
  (credential attacks are the dominant breach vector, DBIR). Near the top of the scale.
- `net-vpn-001` — **7.5**. Moderate impact (network exposure) × common but largely HTTPS-mitigated.
  Upper-mid and situational.
- `womens-stalkerware-001` — **9.0**. Maximum impact (physical safety) sets a high base, then the
  `intimate_partner` multiplier (below) elevates it further.

Changes to `score_weight` and the threat multipliers require maintainer review (CODEOWNERS), so the
priority order can't be quietly skewed. Tightening every weight to the rubric and recording a per-item
`weight_rationale` is ongoing calibration work — not yet complete across all items.

---

## 3. `threat_multiplier` — per-adversary relevance

Each item carries `threat_model_multipliers` keyed by adversary. The engine takes the **maximum**
across the adversaries you selected (worst-case-relevant), then multiplies by the social-engineering
weight for human-vulnerability items.

Relevance scale (documented, not free-form):

| Value | Meaning |
|---|---|
| `0.1–0.3` | Control is largely irrelevant to this adversary |
| `0.8–1.0` | Baseline relevance |
| `1.2–1.5` | Elevated — this adversary actively uses the attack this control blocks |
| `1.6–2.0` | This adversary is *the* reason the control exists |

Example: `womens-stalkerware-001` → `intimate_partner: 2.0` (defining threat), `opportunistic: 0.1`
(irrelevant). This is why a survivor and a casual user get very different orderings — the core
differentiator of Spectra.

**Social-engineering weight** (`human_vulnerability` items only): the SE quiz maps your answers
(1–5) to a susceptibility score (0–100) per Cialdini register; `seWeight = 0.8 + score/100 × 0.6`
(range 0.8–1.4). Grounded in **Cialdini's principles of influence**.

---

## 4. The other multipliers

- **`landscape_multiplier` (1.1–1.5)** — a curated, expiring real-world event (e.g. "SMS 2FA bypass
  automated") temporarily elevates affected items. Hand-curated, source-backed, capped at 4 active
  events to prevent alert fatigue. *Not* a live feed — durability over timeliness.
- **`compensating_factor` (0–1)** — if you've implemented a stronger control, the urgency of a
  weaker alternative drops by its documented `urgency_reduction`. Asymmetric, modelled per item.
- **`staleness_multiplier`** — `1.0 / 0.9 / 0.75 / 0.5` at `<6 / 6–12 / 12–18 / >18` months since
  `last_verified`. This is a **trust/freshness** signal, not a risk metric: stale guidance counts
  for less until re-verified.

---

## 5. Framework mapping (auditability, kept light)

Spectra does **not** copy framework text into its DB. The standards it builds on are surfaced on the
dedicated **[references page](https://spectra.fpszero.com/references)**, with what each one is and how
Spectra uses it. Per-item, machine-readable `frameworks:` refs are a **planned** field (part of the
score re-calibration pass) — not yet populated on items:

```yaml
# planned per-item field — not yet on items
frameworks:
  nist_csf:    ["PR.AC-1"]          # NIST Cybersecurity Framework function/category
  cis_controls: ["6.3"]            # CIS Controls v8 safeguard
  mitre_attack: ["T1566"]          # MITRE ATT&CK technique (phishing)
```

**Maturity ↔ CIS Implementation Groups** (recognised meaning for the levels):

| Spectra | CIS IG | Meaning |
|---|---|---|
| L1 Essential / L2 Baseline | **IG1** | Basic cyber hygiene everyone needs |
| L3 Hardened | **IG2** | Elevated-risk individuals |
| L4 Advanced / L5 Expert | **IG3** | High-threat / specialist |

**Sources of record:** NIST SP 800-30 (risk model) · NIST SP 800-53 & 800-63B (controls) · NIST CSF
(structure) · CIS Controls v8 + Implementation Groups · MITRE ATT&CK (techniques) · Cialdini
(influence) · EFF Surveillance Self-Defense & Privacy Guides (implementation).

---

## 6. Honest limitations

- The rubric makes every number **justifiable and consistent**, but impact/prevalence are still
  **expert judgement** anchored to public data, not a calibrated probabilistic model. The output is
  a sound **relative priority**, not an absolute risk percentage.
- Overall score weights categories **equally** (a 1-item category counts like a 6-item one). This is
  intentional — it rewards breadth across security domains — but is a design choice, documented here.
- `threat_multiplier` uses **max** (conservative), not additive/probabilistic combination.

Spectra is an educational prioritisation tool. It is honest about being principled estimation rather
than validated quantitative risk scoring — which is the appropriate standard for a personal,
local-first framework.
