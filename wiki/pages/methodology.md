
## title
Method and sources | Spectra

## description
Method and sources explains how the order of your playbook is calculated and what its coverage figure measures. It also lists the standards behind both, and what neither can tell you.

## eyebrow
Method and sources

## heading
How the numbers are made

## lead
This page explains, in technical detail, how Spectra puts your steps in order and counts your progress, so you can check it yourself. Spectra **sets priorities**; it does not measure your risk. Its job is to answer "what should {me} do next?" for {your} situation.
### me
I
### your
your

## standards
Written for Spectra, not taken from a standard. Every weight is set by judgement, against the rubric below.

## sections
### split
Three questions
### priority
Priority
### coverage
Coverage
### freshness
Freshness
### contract
Guarantees
### maturity
Step levels
### integrity
Content integrity
### home-numbers
Home page numbers
### references
References
### limits
Limitations

## split-heading
Three questions, kept apart

## split-body
Spectra answers three different questions: which step you should do next, how many of the harms you picked are covered, and which of your finished steps have changed since you did them. Each is calculated by its own rules, so setting a step aside never makes your progress look better, and a step being rewritten never makes it look worse.

## jobs
### A
Priority
What should this person do next?
Nobody, ever, as a number
### B
Coverage
How much have you covered?
The reader, as counts: harms covered and steps done
### C
Freshness
What is worth re-checking?
The reader, as a count and a list

## priority-heading
Job A: priority

## priority-body
You never see priority as a number, a badge, a percentage or a rank. Its only use is to put the steps of your playbook in order.

## formula-base
priority = score_weight

## formula-threat
× threat_multiplier {why}
### why
(the highest for the kinds of attacker that match your setup, never multiplied together; 1.0 if none match)

## formula-compensating
× (1 − compensating_factor) {why}
### why
(when you have already done a stronger step)

## formula-note
Two of your own answers come before the formula. A step you answered No or Not sure to in the five questions on the start page goes first, in the order the questions were asked, and a step you put off with Not now goes to the end. Among the rest, a round of Real or scam or the quiz can move a scam step earlier, never later, as explained below under Social-engineering weight.

## rubric-heading
score_weight, and the rubric

## rubric-body
Each step’s {field} (0 to 10) is set by judgement from two things, **impact** and **prevalence**. The rubric below keeps those weights consistent with each other. It is careful estimation, not a number produced by a formula.
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
High impact, because one account taken over can lead to others, and very high prevalence, because stolen passwords are tried on other sites all the time. Near the top of the scale.
### net-vpn-001
weight 7.5
Moderate impact, because most websites already encrypt what you send, so others on the network see mainly which sites you visit. The attack is common and matters more on some networks than others, so the weight sits in the upper middle.
### stalkerware-check-001
weight 9.0
The highest impact, because it is about physical safety, with lower prevalence than stolen passwords, so its weight is high but below two-factor authentication. The intimate-partner multiplier below then raises it for the readers it fits.

## multipliers-heading
The multipliers

## multipliers
### threat_multiplier
0.1 to 2.0
How much a step matters against each kind of attacker. Spectra takes the highest value among the kinds that match your setup. Two kinds that both raise a step are not multiplied together, so a step never gets a value that neither of them justifies alone.
### compensating_factor
0 to 1
If you have already done a stronger step, a weaker step that does part of the same job weighs less, both in the order and in the weighted figure, by a share set by hand for that pair. It works one way only: doing the weaker step never lowers the stronger one. For example, the private DNS step counts for 60 percent less once you have done the VPN step.

## relevance
### 0.1 to 0.7
The step matters less against this kind of attacker, down to hardly at all
### 0.8 to 1.1
The step matters about as much as it does for anyone
### 1.2 to 1.5
This kind of attacker often uses what the step blocks
### 1.6 to 2.0
This kind of attacker is the reason the step exists

## stalkerware-example
{id} carries {partner} and {opportunistic}. That is why someone whose partner may be watching them gets this step near the top, and someone worried only about strangers who attack at random gets it much lower.
### id
stalkerware-check-001
### partner
intimate_partner: 2.0
### opportunistic
opportunistic: 0.1

## se-label
Social-engineering weight

## se-body
A round of Real or scam, or the social engineering quiz, can move a scam step earlier in your playbook. It never moves one later, and never changes a count or the weighted figure. A scam that got past you, or a high answer in the quiz, raises the step for the kind of manipulation that scam used by {formula}, where score is your result for that kind from 0 to 100. The value is never below 1.0, so it runs from 1.0 to 1.4.
### formula
0.8 + score/100 × 0.6

## protected
{field} and the threat multipliers cannot change without the maintainer's approval: a check that runs before every build refuses any change to them until the maintainer approves it in a separate step, so the order cannot be changed quietly.
### field
score_weight

## coverage-heading
Job B: coverage

## coverage-lead
The progress you see on your playbook is two counts: how many of the harms you picked are covered (all of them count if you picked none), and how many steps are done. A harm counts as covered when every step marked One of the basics for it is done. Spectra also keeps one weighted figure, calculated with this formula.

## coverage-formula
{coverage} = earned weight ÷ total applicable weight
### coverage
coverage

## coverage-rules
- **A step you mark Doesn't apply to me stays in the total.** It was offered and set aside, and a figure that rises when you set steps aside would be measuring the wrong thing. The same holds for the counts: a basic step set aside keeps its harm uncovered until you put it back.
- **Time passing does not change the figure.**

## coverage-headline
The weighted figure is {not} shown on any screen. Your browser saves it with each change you make, and that is all. You see counts instead, because a count of things you recognise is easier to read than a percentage.
### not
not

## freshness-heading
Job C: freshness

## freshness-body
When a step you finished is rewritten, your progress stays as it was. Your playbook tells you which ones changed: {example}, followed by up to three of their names.
### example
3 of your finished steps changed after you did them, so check them again

## freshness-ageing
Time passing does **not** make a step worth re-checking, because a step that has not changed for a year is not wrong for that reason. A step is flagged only when its guidance is rewritten: your browser saves the step's version number when you mark it done, and flags the step when a newer version is published. {field}, the date a step's sources were last checked, is used only by the maintainer, and no page shows it.
### field
last_verified

## contract-heading
Five guarantees about the numbers

## contract-body
Each one is checked by a test, or by a check that runs before every build.

## invariants
### I1
Finishing a step never lowers coverage
Setting a step aside never raises it, and time passing never moves it.
### I2
The weighted figure reaches 100 percent only when every step in your playbook is done
Setting steps aside cannot get it there.
### I3
Every step belongs to at least one harm
A check before every build refuses a step that belongs to no harm, because such a step could never count towards covering one.
### I4
No two counts on one screen can disagree
Two progress numbers on one screen that disagree tell the reader two different things about the same setup.
### I5
No engine internal renders outside this page
A check that runs before every build keeps weights, multipliers, scores, step level numbers and verification dates off every other screen.

## maturity-heading
Step levels

## maturity-body
Every step has a level from 1 to 5. Level 1 steps are marked One of the basics, and they decide whether a harm counts as covered. Every step in Spectra today is level 1 or 2.

## maturity-map
### Level 1
One of the basics: steps everyone needs
### Level 2
Worth doing for everyone, but not needed for a harm to count as covered
### Levels 3 to 5
For people at higher risk or facing a serious threat

## integrity-heading
Content integrity

## integrity-body
Every step and guide is checked before each build: its shape, and the links between them. Most checks stop the build; a few only warn.

## integrity-rules
- No link to a source or a guide may carry a tracking code, so the address you open from Spectra holds nothing added to follow you.
- No text on screen may carry a note left for the maintainer, so unfinished text cannot reach a reader.
- No text on screen may carry a phone number, because a helpline for one country is wrong for every other.
- No step may say what a named company does with your data, because Spectra cannot check how a company behaves.
- Every step must have a description and at least one primary source, so no step reaches a reader without saying what it is and where its facts come from.

## home-numbers-heading
Where the home page numbers come from

## home-numbers-body
Each card on the home page states one fact. Here is each fact again with the pages it comes from. The cards themselves link only to Spectra's own steps.

## references-heading
References

## references-body
What each one is, and how Spectra uses it. Only what Spectra actually uses is listed, and none of them is a commercial relationship. Spectra takes facts from them and writes its own sentences; it does not copy their text. Each step also lists its own sources under it.

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
Cited as a source by the step on checking you could still get into your important accounts.
https://pages.nist.gov/800-63-4/sp800-63b.html

## refs-human
### Cialdini, Principles of Influence
social engineering
Principles of persuasion, among them authority, social proof, reciprocity and scarcity.
Four of the quiz's seven kinds of manipulation come from them.
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
The step for a data breach and the step for looking yourself up both use it to check your address.
https://haveibeenpwned.com/

## limits-heading
Limitations

## limitations
- The rubric keeps every weight consistent with the others, but impact and prevalence are still judgement, not measured from data or a calibrated probabilistic model. The output is a sound relative priority, not an absolute risk percentage.
- The weighted figure gives each step its own weight, so a chapter holding more steps carries more of it. That is deliberate, since it reflects how much of the covered ground is done, but it means breadth across categories is not rewarded for its own sake.
- The threat multiplier takes the highest value among the kinds of attacker that match your setup, which is cautious, rather than adding them up or combining them as probabilities.
- A harm's steps are the steps tagged against it, so the number under a harm shows how much Spectra has written for it, not how serious the harm is. "Someone pretends to be you" has few, and that is a gap in what Spectra covers.
- The weights are set by hand in multiples of 0.5, not calculated from the rubric above, which keeps them consistent with each other. The reasoning is written out only for the three examples above; the steps themselves do not carry theirs yet.

## limits-close
The order of your playbook is **careful estimation**, made by hand against the rubric above. It is not a measured risk score, and Spectra does not claim it is.

## back-link
- [How Spectra works](/how-it-works)
