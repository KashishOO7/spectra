---
id: guardian-social-privacy-001
schema_version: 1.0.0
version: 1.1.0
title: Set all social and gaming accounts to private or friends-only
category: osint_footprint
subcategory: social_media_exposure
tracks:
  - caring_for_someone
platforms:
  - all
not_applicable_if: []
sensitive: false
difficulty:
  technical: 1
  disruption: 1
  reversibility: 1
time_estimate:
  setup: 30min
  ongoing: negligible
maturity_level: 1
adversaries:
  - opportunistic
  - targeted_individual
attack_vectors:
  - osint_passive
  - social_engineering
assets_protected:
  - location
  - relationships
  - identity
  - reputation
controls_implemented: []
score_weight: 7.5
threat_model_multipliers:
  opportunistic: 1.2
  targeted_individual: 1.5
compensating_controls: []
depends_on: []
related_items:
  - id: osint-self-001
    relationship: complementary
    note: After setting the accounts private, look up your child's name and username the way a stranger would, to see what is still public.
  - id: guardian-oversharing-001
    relationship: required_companion
    note: Private settings decide who sees a post. What your child leaves out of posts still helps when a post spreads further than they meant.
  - id: guardian-manipulation-001
    relationship: related_concept
    note: If someone is already contacting your child in a way that worries you, that step says who to tell, including the police.
status: active
superseded_by: null
last_verified: '2026-08-26'
verified_by:
  - org:eff.org
sources:
  - url: https://ssd.eff.org/module/protecting-yourself-social-networks
    title: Protecting Yourself on Social Networks — EFF SSD
    type: primary
    accessed: '2026-08-26'
emotional_register: null
tags:
  - free
  - quick
  - high_impact
  - kids_appropriate
created_at: '2026-03-04'
created_by: github:KashishOO7
changelog:
  - version: 1.0.0
    date: '2026-03-04'
    changes: Initial item.
    author: github:KashishOO7
lookups:
  - lookup-account-settings-001
---

## Why
A public profile lets anyone see a child's posts, friend list and name, and message them, including people who want to trick or hurt them. A private account shows those only to people the child has accepted.
## What
Set your child's gaming and social accounts to private, so only people they have accepted can see their posts and friend list or message them. A private account does not stop someone your child has already accepted.
## How
### all
Do this
Set every social and gaming account your child uses to private, or to friends only.

What to change
Look under Privacy in each app.
Set the account to private. Limit who can message them.
Limit who can see posts and stories, and turn off anything that suggests their account to strangers.
Gaming accounts have the same controls under Account or Privacy. Set who can see what they play and who can send friend requests.

Do it together
Change it with them rather than behind them. Anything they do not understand, they will undo.

Test it
Search for their username while logged out. If you can see their posts, so can anyone.

If someone is already in touch
If someone is already contacting your child in a way that worries you, the step on warning signs, linked below, says who to tell, including the police.
