




## title
Under the hood | Spectra

## description
Everything technical in one place: how the priority order is worked out, what coverage measures, the invariants that hold it together, the standards behind it, and what it is not good at.

## eyebrow
Under the hood

## heading
How the numbers are made

## lead
Everything technical, in one place, for the person who wants to check the work. Spectra is a **prioritisation engine**, not a calibrated risk calculator. Its job is to answer "what should {me} do next?" for {your} situation.
### me
I
### your
your

## standards
Written for Spectra, not taken from a standard. Every weight is set by judgement, against the rubric below.

## sections
### split
Three jobs
### priority
Priority
### coverage
Coverage
### freshness
Freshness
### contract
The contract
### maturity
Maturity levels
### integrity
Content integrity
### home-numbers
Home page numbers
### references
References
### limits
Honest limitations

## split-heading
One number was doing two jobs

## split-body
A single score answered "what should this person do next" and "how well is this person doing" at the same time. Those are different questions with different rules, and every scoring defect in this project came from the collision: skip inflation, silent decay, and the audit and the timeline disagreeing about the same profile. It is split into three, and they never mix again.

## jobs
### A
Priority
What should this person do next?
Nobody, ever, as a number
### B
Coverage
How much ground is covered?
The reader, as counts: harms covered and steps done
### C
Freshness
What is worth re-checking?
The reader, as a count and a list

## priority-heading
Job A: priority

## priority-body
Internal. Never rendered as a number, a badge, a percentage or a rank anywhere in the product. It orders the queue and chooses the action card, and that is all it does, which is why it can afford to stay sophisticated.

## formula-base
priority = base_weight

## formula-threat
× threat_multiplier {why}
### why
(max across your adversaries, never compounded)

## formula-compensating
× (1 − compensating_factor) {why}
### why
(a stronger control you already have)

## formula-note
A round of Real or scam or the quiz can then move a scam step earlier in the order, never later, by the social-engineering weight explained below. It changes the order only, never the weight.

## rubric-heading
base_weight, and the rubric

## rubric-body
Each step’s {field} (0 to 10) is set by judgement along two axes, **impact** and **prevalence**. The rubric below keeps those weights consistent with each other. It is careful estimation, not a number produced by a formula.
### field
score_weight

## impact-label
Impact (1 to 5), severity if the threat this control mitigates succeeds

## impact
### 1
Minor or cosmetic
### 2
Limited data exposure
### 3
Account or device compromise
### 4
Financial loss, identity theft
### 5
Harm to someone's physical safety, or harm that cannot be undone

## prevalence-label
Prevalence (1 to 5), how common the attack is

## prevalence-anchors
set by judgement, not measured from a dataset

## prevalence
### 1
Rare or theoretical
### 2
Occasional, targeted
### 3
Common
### 4
Very common
### 5
Near-universal, automated at scale

## examples-label
How the rubric reads a few items

## examples
### auth-2fa-001
weight 9.5
High impact (account takeover cascades) by very high prevalence (credential attacks are the dominant breach vector). Near the top of the scale.
### net-vpn-001
weight 7.5
Moderate impact (network exposure), common but largely mitigated by HTTPS. Upper-mid and situational.
### stalkerware-check-001
weight 9.0
Maximum impact (physical safety) sets a high base, then the intimate-partner multiplier below elevates it further.

## multipliers-heading
The multipliers

## multipliers
### threat_multiplier
0.1 to 2.0
Per-adversary relevance, taken as the maximum across the adversaries you selected. Maximum, not product: two elevated adversaries do not compound into a number neither of them justifies.
### compensating_factor
0 to 1
If you have already implemented a stronger control, the urgency of a weaker alternative drops by that item’s documented urgency_reduction. Asymmetric, and modelled per item rather than inferred.

## relevance
### 0.1 to 0.3
Largely irrelevant to this adversary
### 0.8 to 1.0
Baseline relevance
### 1.2 to 1.5
Elevated. This adversary actively uses the attack this control blocks
### 1.6 to 2.0
This adversary is the reason the control exists

## stalkerware-example
{id} carries {partner} and {opportunistic}. That is why a survivor and a casual reader get very different orderings, and it is the core differentiator.
### id
stalkerware-check-001
### partner
intimate_partner: 2.0
### opportunistic
opportunistic: 0.1

## se-label
Social-engineering weight

## se-body
A round of Real or scam, or the social engineering quiz, can move a scam step earlier in your playbook. It never moves one later, and never changes a count, the coverage or the score. A scam that got past you, or a high answer in the quiz, raises the step for the feeling it used by {formula}, never below 1.0, so 1.0 to 1.4.
### formula
0.8 + score/100 × 0.6

## protected
{field} and the threat multipliers are sealed: a check that runs before every build refuses any change to them that the maintainer has not approved, so the order cannot be changed quietly.
### field
score_weight

## coverage-heading
Job B: coverage

## coverage-lead
What a reader sees as progress, worked out from this.

## coverage-formula
{coverage} = earned weight ÷ total applicable weight
### coverage
coverage

## coverage-rules
- **Skipped items stay in the denominator.** They were offered and declined, and a number that rises when you dismiss the list is measuring the wrong thing.
- **Ageing does not touch it.** Not the numerator, not the denominator.
- **100 means finished**, and there is exactly one way to reach it.

## coverage-headline
The weighted figure is {not} shown as a percentage anywhere. What a reader sees is counts: how many of the harms on the front page are covered, and how many steps are done. A count of things a person recognises is easier to read than a percentage.
### not
not

## freshness-heading
Job C: freshness

## freshness-body
Content ages, and that must never silently erode somebody’s progress. Freshness is a count and a list, never a deduction: {example}, then the three names. An action, not a punishment.
### example
3 things are worth re-checking

## freshness-ageing
Ageing is **not** measured in elapsed time. With one maintainer, every item eventually crosses every age threshold, and the product would end up claiming its content had rotted because a file had not been touched. An item is worth re-reading when the guidance actually changed: the profile records the item’s version at the moment it was marked done, and the item is flagged when that version moves. {field}, the date a step's sources were last checked, stays in the step's file for the maintainer and is not shown on any page.
### field
last_verified

## contract-heading
The contract

## contract-body
Five rules the engine keeps.

## invariants
### I1
Coverage is monotonic across every reachable state transition
Doing something never lowers it. Doing nothing never raises it. This kills skip inflation and silent decay in one line.
### I2
Coverage is 100 only when every applicable item is implemented
Honest bounds. Reachable, but only one way.
### I3
Every item resolves to at least one harm
A check that runs before every build stops any step with no harm. A step with no harm cannot be found by anyone using the front page.
### I4
No two counters on one screen can disagree
Two progress numbers on one screen that disagree tell the reader two different things about the same setup.
### I5
No engine internal renders outside this page
A check that runs before every build keeps multipliers, verification dates, points and raw scores off every other screen.

## maturity-heading
Maturity levels

## maturity-body
Every step has a level. Level 1 steps are the essentials everyone needs, and they are what coverage counts.

## maturity-map
### L1 Essential, L2 Baseline
Basic habits everyone needs
### L3 Hardened
For people at higher risk
### L4 Advanced, L5 Expert
For people facing a serious threat, or specialists

## integrity-heading
Content integrity

## integrity-body
Every step and guide is checked before each build: its shape, and the links between them. Most checks stop the build; a few only warn.

## integrity-rules
- Every item must resolve to at least one harm, or it cannot be found by anyone using the front page. That is invariant I3 and it is a hard failure.
- No rendered string may carry a maintainer placeholder, so unfinished copy cannot reach a reader.
- No rendered string may carry a phone number, because a helpline for one country is wrong for every other.
- No engine internal may render outside this page. That is invariant I5, enforced as a lint pass over every component rather than as a convention.
- Spectra does not copy framework text into its database. Items carry light references only, and the standards themselves are listed below.

## home-numbers-heading
Where the home page numbers come from

## home-numbers-body
Each card on the home page states one fact. Here is each fact again with the pages it comes from. The cards themselves link only to Spectra's own steps.

## references-heading
References

## references-body
What each one is, and how Spectra uses it. Only what Spectra actually uses is listed, and none of them is a commercial relationship. Each step also lists its own sources under it.

## how-used
how Spectra uses it

## groups
### controls
Standards
Standards a step cites as a source.
### human
Human factors
Where the quiz's names for kinds of manipulation come from.
### implementation
How-to guides and tools
The guides the steps cite and send you to, and the sites they send you to.

## refs-controls
### NIST SP 800-63B
authentication
NIST's guidelines on passwords, two-factor authentication and how strong each way of signing in is.
Cited as a source by the step on recovery routes.
https://pages.nist.gov/800-63-4/sp800-63b.html

## refs-human
### Cialdini, Principles of Influence
social engineering
Principles of persuasion, among them authority, social proof, reciprocity and scarcity.
Four of the quiz's seven kinds of manipulation come from them: authority, social proof, reciprocity and scarcity.
https://en.wikipedia.org/wiki/Influence:_Science_and_Practice

## refs-implementation
### EFF Surveillance Self-Defense
how-to
The Electronic Frontier Foundation’s guides to protecting against surveillance.
Cited as a source by many of the steps, and listed under them as a guide.
https://ssd.eff.org/
### Privacy Guides
tools
A community-run, non-commercial site that recommends privacy tools and explains how it chooses them.
Most of the guides under the steps are its pages. Spectra sends you there to choose a tool instead of naming one.
https://www.privacyguides.org/
### Have I Been Pwned
breaches
A free site that tells you whether your email address appears in known data breaches.
The breach step sends you there to check your address.
https://haveibeenpwned.com/

## limits-heading
Honest limitations

## limitations
- The rubric makes every number justifiable and consistent, but impact and prevalence are still judgement, not measured from data or a calibrated probabilistic model. The output is a sound relative priority, not an absolute risk percentage.
- Coverage weights every item by its own weight, so a category holding more items carries more of the figure. That is deliberate, since it reflects how much of the covered ground is done, but it means breadth across categories is not rewarded for its own sake.
- The threat multiplier uses the maximum across your selected adversaries, which is conservative, rather than an additive or probabilistic combination.
- The harms are worked out from what each step is tagged to protect and the attacks it is tagged against, so how many steps a harm holds reflects that tagging. A harm with few steps, such as "Someone pretends to be you", is a real gap in what Spectra covers, and it is shown rather than hidden.
- The weights are set by hand in steps of 0.5, not calculated from the rubric above, which keeps them consistent with each other. No step carries its written reasoning yet.

## limits-close
Spectra is an educational prioritisation tool. It is honest about being **principled estimation** rather than validated quantitative risk scoring, which is the appropriate standard for a personal, local-first framework.

## back-link
- [How Spectra works](/how-it-works)
