# Spectra: the brain

Everything technical, in one place, for the person who wants to check the work. How the numbers are
made, where they come from, which one you are allowed to see, and the contract they have to keep.

Spectra is a **prioritisation engine**, not a calibrated risk calculator. Its job is to answer
"what should *I* do next?" for *your* situation.

> Sections 1 to 5 describe the engine as it runs. Section 6 puts the whole calculation in one place.

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
| **B** | Coverage: how much ground is covered | the user, as counts: harms covered and steps done |
| **C** | Freshness: what is worth re-checking | the user, as a count and a list |

---

## 2. Job A: priority

Internal. Never rendered as a number, a badge, a percentage or a rank. It orders the queue and
chooses the action card. That is all it does, which is why it can stay sophisticated.

```
priority = base_weight
         × threat_multiplier      (max across chosen adversaries, never compounded)
         × (1 − compensating)
order    = priority × order_weight (1.0 to 1.4, from Real or scam and the quiz; see 2.2)
```

Nothing else enters it. No outside news or events feed multiplies a step: a lasting fact such as
"SMS is the weakest second factor" belongs in `base_weight`. Time does not either: how recently a
step was written is Job C, and it is never a multiplier.

### 2.1 `base_weight` (`score_weight`, 0 to 10)

Set by judgement along two axes, **impact** and **prevalence**, using the rubric below to keep the
weights consistent. The rubric is a consistency guide, **not** a mechanical formula. The stored
weights are estimation set by hand to 0.5 granularity, not the arithmetic output of
`impact × prevalence`.

**Impact (1 to 5).** Severity if the threat this control mitigates succeeds.

| 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|
| Minor or cosmetic | Limited data exposure | Account or device compromise | Financial loss, identity theft | Physical-safety or catastrophic, irreversible harm |

**Prevalence (1 to 5).** How common the attack is, set by judgement.

| 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|
| Rare or theoretical | Occasional, targeted | Common | Very common | Near-universal, automated at scale |

Worked examples, with the reasoning behind the stored number:

- `auth-2fa-001` is **9.5**. High impact (account takeover cascades) by very high prevalence
  (credential attacks are among the commonest). Near the top of the scale.
- `net-vpn-001` is **7.5**. Moderate impact (network exposure) by common, but largely mitigated by
  HTTPS. Upper-mid and situational.
- `stalkerware-check-001` is **9.0**. Maximum impact (physical safety) sets a high base, then the
  `intimate_partner` multiplier elevates it further.

`score_weight` and `threat_model_multipliers` cannot be changed quietly. Every value is recorded in
`scripts/protected-baseline.json` and `scripts/check-protected.ts` fails the build when one moves,
with no flag to argue past it, so a recalibration has to be a deliberate, visible act rather than a
side effect. Tightening every weight to the rubric and
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

**Social-engineering weight: the order only.** A round of Real or scam, or the SE quiz, gives a
susceptibility score (0 to 100) per feeling. The steps `src/lib/engine/feelings.ts` names for that
feeling, the same ones the game's reveal names, are raised by `0.8 + score/100 × 0.6`, never below
1.0, so 1.0 to 1.4. It multiplies `priority_score`, which decides the order, and never `full_weight`,
so no count, coverage, score or band changes with a round: it says which pressure works on the
reader, not what they have protected. Four of the seven registers are Cialdini's principles (authority, social proof, reciprocity,
scarcity); urgency, fear and trust are not.

### 2.3 `compensating`

If a stronger control is already implemented, the urgency of a weaker alternative drops by that
item's documented `urgency_reduction`, in the range 0 to 1. Asymmetric, and modelled per item rather
than inferred.

---

## 3. Job B: coverage

Never shown as a figure. What a reader sees is counts, worked out from the same state: how many
harms are covered, and how many steps are done.

```
coverage = earned weight ÷ total applicable weight
```

- **Skipped items stay in the denominator.** They were offered and declined. Declining is not
  progress, and a score that rises when you dismiss the list is measuring the wrong thing.
- **Staleness does not touch it.** Not the numerator, not the denominator. Ageing content is Job C.
- **100 means finished**, and there is exactly one way to reach it.

**Coverage is not the headline.** The headline is harms, because a count of things a person
recognises is easier to read than a percentage:

> **2 of 10 covered**

The weighted figure is not shown as a percentage anywhere; the map shows counts too.

---

## 4. Job C: freshness

Content ages. That is real, and it must never silently erode someone's progress.

> **3 things are worth re-checking**, then the three names.

A count and a list. An action, not a punishment, and never a deduction from a number.

Ageing is **not** measured in elapsed time. With one maintainer every item eventually crosses every
age threshold, and the product would end up claiming its content had rotted because a file was not
touched. An item is worth re-reading when the guidance actually changed: the profile records the
item's `version` at the moment it was marked done, and the item is flagged when that version moves.
`last_verified` stays in each step's note as maintenance metadata and is shown on no page.

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
- **I4**: two progress numbers on one screen that disagree tell the reader two different things
  about the same setup, so no screen carries two.
- **I5** is a lint gate, and it is the one that permanently keeps `×1.30`, `last_verified`, `+9pts`
  and raw scores off user screens. This page is the only place they are allowed.

---

## 6. The whole calculation

```
priority = base_weight × threat_multiplier × (1 − compensating)
order    = priority × order_weight
coverage = earned weight ÷ total applicable weight
```

- **Freshness is Job C**: a count and a list, driven by a step's `version` changing since the reader
  marked it done, never by time passing and never by lowering a number.
- **No outside feed multiplies anything.** A fact that stays true, such as SIM-swapping making text
  codes the weakest second factor, is part of a step's `base_weight`, so it is counted once.
- **Skipped steps are in the denominator** (`total_applicable`), and the maturity band is capped at
  L3 once more than 20% of available weight has been set aside, so the top bands cannot be reached
  by dismissing the list.

---

## 7. Framework mapping

**None.** Spectra does not map its steps to a security framework. `/methodology` lists only what
the steps use: NIST SP 800-63B (cited by `recovery-routes-001`), Cialdini (four of the quiz's seven
registers), EFF Surveillance Self-Defense and Privacy Guides (sources and guides), and Have I Been
Pwned (the breach step). The priority model is Spectra's own.

---

## 8. Honest limitations

- The rubric makes every number justifiable and consistent, but impact and prevalence are still
  judgement, not a calibrated probabilistic model. The output is a
  sound **relative priority**, not an absolute risk percentage.
- Coverage weights every item by its own weight, so a category holding more items carries more of
  the figure. Deliberate, since it reflects how much of the covered ground is done, but it means
  breadth across categories is not rewarded for its own sake.
- `threat_multiplier` uses max, which is conservative, rather than additive or probabilistic
  combination.
- The harms are a projection over `assets_protected` and `attack_vectors`, so their sizes reflect
  how the corpus is tagged. A harm with few steps, such as *Someone pretends to be you*, is a real
  content gap and is shown rather than hidden.

Spectra is an educational prioritisation tool. It is honest about being principled estimation rather
than validated quantitative risk scoring, which is the appropriate standard for a personal,
local-first framework.
