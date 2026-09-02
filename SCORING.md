# Spectra: the brain

Everything technical, in one place, for the person who wants to check the work. How the numbers are
made, where they come from, which one you are allowed to see, and the contract they have to keep.

Spectra is a **prioritisation engine**, not a calibrated risk calculator. Its job is to answer
"what should *I* do next?" for *your* situation.

> **Build status.** Sections 1 to 5 describe the engine as it is. M4a split the number and removed
> time; M4d removed the events-feed multipliers and L1 archived the feed itself; M4b and M4c made
> I5 a lint gate. I1, I2 and I4 are covered by the maintainer's engine test suite and carry no
> expected-failure markers. Section 6 records what changed and what it cost.

---

## 1. One number was doing two jobs

`effective_score` answered "what should this person do next" and "how well is this person doing" at
the same time. Those are different questions with different rules, and every scoring defect in the
project came from the collision: skip inflation, silent decay, the audit and timeline disagreeing
about the same profile.

Split into three. They never mix again.

| | Job | Who sees it |
|---|---|---|
| **A** | Priority: what to offer next | nobody, ever, as a number |
| **B** | Coverage: how much ground is covered | the user, and it is the only number they see |
| **C** | Freshness: what is worth re-checking | the user, as a count and a list |

---

## 2. Job A: priority

Internal. Never rendered as a number, a badge, a percentage or a rank. It orders the queue and
chooses the action card. That is all it does, which is why it can stay sophisticated.

```
priority = base_weight
         × threat_multiplier      (max across chosen adversaries, never compounded)
         × (1 − compensating)
```

Two things that used to be in it are not:

- **A curated events feed no longer multiplies anything**, and the feed itself is archived. A
  permanent fact ("SMS is the weakest second factor") is not a temporary elevation; it belongs in
  `base_weight`. This removes the case where two multipliers resting on weak sources decided row 01
  for everybody.
- **Staleness has left priority entirely.** It is Job C now, and it is not a multiplier there
  either.

### 2.1 `base_weight` (`score_weight`, 0 to 10)

Set by expert judgement along two axes, **impact** and **prevalence**, using the rubric below to
keep the weights consistent. The rubric is a consistency guide and a justification framework, **not**
a mechanical formula. The stored weights are principled estimation anchored to public data and
hand-tuned to 0.5 granularity, not the arithmetic output of `impact × prevalence`.

**Impact (1 to 5).** Severity if the threat this control mitigates succeeds.

| 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|
| Minor or cosmetic | Limited data exposure | Account or device compromise | Financial loss, identity theft | Physical-safety or catastrophic, irreversible harm |

**Prevalence (1 to 5).** How common the attack is, anchored to Verizon **DBIR**, FBI **IC3**, **HIBP**.

| 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|
| Rare or theoretical | Occasional, targeted | Common | Very common | Near-universal, automated at scale |

Worked examples, with the reasoning behind the stored number:

- `auth-2fa-001` is **9.5**. High impact (account takeover cascades) by very high prevalence
  (credential attacks are the dominant breach vector, DBIR). Near the top of the scale.
- `net-vpn-001` is **7.5**. Moderate impact (network exposure) by common, but largely mitigated by
  HTTPS. Upper-mid and situational.
- `womens-stalkerware-001` is **9.0**. Maximum impact (physical safety) sets a high base, then the
  `intimate_partner` multiplier elevates it further.

`score_weight` and `threat_model_multipliers` cannot be changed quietly. Every value is recorded in
`scripts/protected-baseline.json` and `scripts/check-protected.ts` fails the build when one moves,
with no flag to argue past it, so a recalibration has to be a deliberate, visible act rather than a
side effect. Item files are also owner-reviewed on GitHub. Tightening every weight to the rubric and
recording a per-item `weight_rationale` is ongoing calibration work, not yet complete.

### 2.2 `threat_multiplier`

Each item carries `threat_model_multipliers` keyed by adversary. The engine takes the **maximum**
across the adversaries the user selected. Maximum, not product: two elevated adversaries do not
compound into a number neither of them justifies.

| Value | Meaning |
|---|---|
| `0.1` to `0.3` | Largely irrelevant to this adversary |
| `0.8` to `1.0` | Baseline relevance |
| `1.2` to `1.5` | Elevated. This adversary actively uses the attack this control blocks |
| `1.6` to `2.0` | This adversary is *the* reason the control exists |

`womens-stalkerware-001` carries `intimate_partner: 2.0` and `opportunistic: 0.1`. That is why a
survivor and a casual user get very different orderings, and it is the core differentiator.

**Social-engineering weight**, `human_vulnerability` items only. The SE quiz maps answers (1 to 5) to
a susceptibility score (0 to 100) per Cialdini register, and `seWeight = 0.8 + score/100 × 0.6`,
range 0.8 to 1.4. Grounded in Cialdini's principles of influence.

### 2.3 `compensating`

If a stronger control is already implemented, the urgency of a weaker alternative drops by that
item's documented `urgency_reduction`, in the range 0 to 1. Asymmetric, and modelled per item rather
than inferred.

---

## 3. Job B: coverage

The only number a user sees.

```
coverage = earned weight ÷ total applicable weight
```

- **Skipped items stay in the denominator.** They were offered and declined. Declining is not
  progress, and a score that rises when you dismiss the list is measuring the wrong thing.
- **Staleness does not touch it.** Not the numerator, not the denominator. Ageing content is Job C.
- **100 means finished**, and there is exactly one way to reach it.

**Coverage is not the headline.** The headline is harms, because a count of eight things a person
recognises is legible in a way a percentage is not:

> **2 of 8 covered**

The percentage lives here, on this page, and in the graph, where it earns its keep.

---

## 4. Job C: freshness

Content ages. That is real, and it must never silently erode someone's progress.

> **3 things are worth re-checking**, then the three names.

A count and a list. An action, not a punishment, and never a deduction from a number.

Ageing is **not** measured in elapsed time. With one maintainer every item eventually crosses every
age threshold, and the product would end up claiming its content had rotted because a file was not
touched. An item is worth re-reading when the guidance actually changed: the profile records the
item's `version` at the moment it was marked done, and the item is flagged when that version moves.
`last_verified` stays in the YAML as maintenance metadata and renders on this page, nowhere else.

---

## 5. The contract

Five invariants. They are written as tests before they are written as code, and they are the reason
the split holds instead of drifting back together.

```
I1  coverage is monotonic across every reachable state transition
I2  coverage = 100 iff every applicable item is implemented
I3  every item resolves to at least one harm
I4  no two counters on one screen can disagree
I5  no engine internal renders outside the brain page
```

- **I1** kills skip inflation and silent decay in one line. Doing something never lowers coverage;
  doing nothing never raises it.
- **I2** is honest bounds. Reachable, but only one way.
- **I3** is a blocking gate in `scripts/validate.ts` (`EVERY_ITEM_RESOLVES_TO_A_HARM`). An item with
  no harm cannot be found by anyone using the front page, so it may as well not exist.
- **I4** is why the exposure strip was removed: two progress models on one screen told the reader
  two different things about the same profile.
- **I5** is a lint gate, and it is the one that permanently keeps `×1.30`, `last_verified`, `+9pts`
  and raw scores off user screens. This page is the only place they are allowed.

---

## 6. What the engine does today

Sections 2 to 4 are now the engine, not a target. M4a and M4d closed the gap:

```
priority = base_weight × threat_multiplier × (1 − compensating)
coverage = earned weight ÷ total applicable weight
```

- **Staleness is gone** (M4a). It discounted the numerator and not the denominator, so someone who
  had done everything watched the number fall on a date. Freshness is Job C: a count and a list,
  driven by an item's `version` changing since the reader marked it done, not by elapsed time.
- **The curated events feed no longer multiplies anything** (M4d), and the feed itself is archived
  (L1). The multipliers compounded, and `auth-2fa-001` sat in both active entries at
  `9.5 × 1.25 × 1.3 = 15.44`. Measured, both facts were already priced into `base_weight`: that
  item's own `threat_narrative` names SIM-swapping, and its 9.5 rests on credential attacks being
  the dominant breach vector. The multipliers were a double count, so removing them corrects an
  inflation. No `base_weight` was changed. With the multiplier gone the page was the feed's only
  consumer and duplicated the checklist it pointed at, so L1 removed the whole unit. The
  maintainer keeps it as a restorable archive with its reasoning and restore order.
- Skipped items are in the denominator (`total_applicable`), and the maturity band is capped at L3
  once more than 20% of available weight has been set aside, so the top bands cannot be reached by
  dismissing the list.

**Removing the multipliers reorders the queue, which is the point.** Measured across three
profiles, eight to ten of the top ten positions move. For someone whose adversary is an intimate
partner, row 01 changes from `auth-2fa-001` to `device-encrypt-001`: the generic phishing
multiplier had been deciding row 01 for a reader it did not describe.

---

## 7. Framework mapping

Spectra does not copy framework text into its database. The standards are surfaced on the
[references page](https://spectra.fpszero.com/references), with what each one is and how Spectra
uses it. Per-item machine-readable refs are a **planned** field, not yet populated:

```yaml
# planned per-item field, not yet on items
frameworks:
  nist_csf:     ["PR.AC-1"]   # NIST Cybersecurity Framework function/category
  cis_controls: ["6.3"]       # CIS Controls v8 safeguard
  mitre_attack: ["T1566"]     # MITRE ATT&CK technique (phishing)
```

**Maturity against CIS Implementation Groups**, which gives the levels a recognised meaning:

| Spectra | CIS IG | Meaning |
|---|---|---|
| L1 Essential, L2 Baseline | **IG1** | Basic cyber hygiene everyone needs |
| L3 Hardened | **IG2** | Elevated-risk individuals |
| L4 Advanced, L5 Expert | **IG3** | High-threat or specialist |

**Sources of record.** NIST SP 800-30 (risk model) · NIST SP 800-53 and 800-63B (controls) · NIST CSF
(structure) · CIS Controls v8 and Implementation Groups · MITRE ATT&CK (techniques) · Cialdini
(influence) · EFF Surveillance Self-Defense and Privacy Guides (implementation).

The priority model is multiplicative in the spirit of NIST SP 800-30 (`risk ≈ threat × likelihood ×
impact`) and CVSS-style environmental scoring. It is bespoke, because there is no standard for
personal-security prioritisation, but every input is rubric-driven rather than hand-waved.

---

## 8. Honest limitations

- The rubric makes every number justifiable and consistent, but impact and prevalence are still
  expert judgement anchored to public data, not a calibrated probabilistic model. The output is a
  sound **relative priority**, not an absolute risk percentage.
- Coverage weights every item by its own weight, so a category holding more items carries more of
  the figure. Deliberate, since it reflects how much of the covered ground is done, but it means
  breadth across categories is not rewarded for its own sake.
- `threat_multiplier` uses max, which is conservative, rather than additive or probabilistic
  combination.
- The eight harms are a projection over `assets_protected` and `attack_vectors`, so their sizes
  reflect how the corpus is tagged. Four items under *Someone pretends to be you* is a real content
  gap and is shown rather than hidden.

Spectra is an educational prioritisation tool. It is honest about being principled estimation rather
than validated quantitative risk scoring, which is the appropriate standard for a personal,
local-first framework.
