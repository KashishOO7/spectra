---
id: guardian-passwords-001
schema_version: 1.0.0
version: 1.1.0
title: Help your child set strong, unique passwords for their accounts
category: account_security
subcategory: authentication
tracks:
  - caring_for_someone
platforms:
  - all
not_applicable_if: []
sensitive: false
difficulty:
  technical: 1
  disruption: 2
  reversibility: 1
time_estimate:
  setup: 30min
  ongoing: negligible
maturity_level: 1
adversaries:
  - opportunistic
  - targeted_individual
attack_vectors:
  - credential_stuffing
  - phishing
assets_protected:
  - credentials
  - communications
  - identity
controls_implemented: []
score_weight: 7
threat_model_multipliers:
  opportunistic: 1.2
  targeted_individual: 1.3
  criminal_org: 1.1
compensating_controls: []
depends_on: []
related_items:
  - id: auth-password-manager-001
    relationship: adult_equivalent
    note: The same step written for adults, with more detail.
  - id: auth-2fa-001
    relationship: required_companion
    note: Once the passwords are sorted, add two-factor authentication to the accounts that offer it.
  - id: guardian-oversharing-001
    relationship: related_concept
    note: A password is one of the things a child should not share, even with friends.
status: active
superseded_by: null
last_verified: '2026-03-01'
verified_by:
  - org:eff.org
sources:
  - url: https://ssd.eff.org/module/creating-strong-passwords
    title: Creating Strong Passwords — EFF Surveillance Self-Defense
    type: primary
    accessed: '2026-03-06'
emotional_register: null
tags:
  - free
  - open_source_options
  - guardian_action
  - kids_safe
  - foundational_habit
created_at: '2026-03-04'
created_by: github:@KashishOO7
changelog:
  - version: 1.0.0
    date: '2026-03-04'
    changes: Initial item creation.
    author: github:@KashishOO7
lookups:
  - lookup-choosing-a-tool-001
---

## Why
If your child uses one password everywhere, anyone who learns it, from a friend they told or a website that leaked it, can get into every account that uses it, including their email and games.
## What
Sit with your child and give each of their accounts its own password, kept in a password manager so they do not have to remember them.
## How
### all
Do this
Help your child use a different password for every account, kept in one place.

How
The password manager already built into your phone or browser is enough for a younger child.
An older teen who wants their own may prefer one they control.
Sit with them for the first few. After that they carry on, because it is easier than remembering.

What to teach
Let the password manager make each password, so no two are the same.
For the one password they have to remember, the one that opens their email or the password manager, use a passphrase of six random words.
A password is not something to share with friends.

Test it
Ask them what happens if their game account leaks.
If the answer is that someone would have their email too, there is still work to do.
## Where
### res-guide-passwords-001
lists recommended password managers, synced and offline.

