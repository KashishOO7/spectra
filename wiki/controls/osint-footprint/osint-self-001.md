---
id: osint-self-001
schema_version: 1.0.0
version: 2.1.0
title: Look yourself up the way a stranger would
category: osint_footprint
subcategory: self_osint_audit
tracks:
  - general
  - public_work
  - known_person_risk
platforms:
  - web
not_applicable_if: []
sensitive: true
difficulty:
  technical: 1
  disruption: 1
  reversibility: 1
time_estimate:
  setup: 2hr
  ongoing: low
maturity_level: 2
adversaries:
  - targeted_individual
  - data_broker
  - opportunistic
  - intimate_partner
attack_vectors:
  - osint_passive
  - data_broker_aggregation
assets_protected:
  - location
  - identity
  - relationships
  - reputation
controls_implemented: []
score_weight: 8
threat_model_multipliers:
  targeted_individual: 2
  data_broker: 1.6
  intimate_partner: 1.8
  opportunistic: 0.8
compensating_controls: []
depends_on: []
related_items:
  - id: data-broker-optout-001
    relationship: complementary
    note: When your searches find a people-search site that lists you, that step shows how to have your page removed.
status: active
superseded_by: null
last_verified: '2026-03-04'
verified_by:
  - org:eff.org
sources:
  - url: https://inteltechniques.com/workbook.html
    title: IntelTechniques Data Removal Workbook
    type: primary
    accessed: '2026-03-04'
  - url: https://haveibeenpwned.com/
    title: 'Have I Been Pwned'
    type: primary
    accessed: '2026-09-27'
emotional_register: null
tags:
  - audit
  - discovery
created_at: '2026-02-25'
created_by: github:KashishOO7
changelog:
  - version: 2.0.0
    date: '2026-03-04'
    changes: Explicit OSINT mapping steps added.
    author: github:KashishOO7
---

## Why
Someone who wants to find or trick you can start with what a search already shows: your address, your phone number, old accounts and past leaks. You cannot fix what you have not seen, and you see it by searching for yourself the way they would.

## What
Search for yourself the way a stranger would, and keep a list of what you find. Try your name and any old names, your email addresses, your phone number, and your name with each town you have lived in. What turns up is what anyone who means you harm starts with, and you cannot clean up a page you have not seen.
## How
### all
Do this
Look yourself up the way a stranger would, and write down what you find.

What to search
1. Your full name, in quotes.
2. Your name with your town.
3. Your phone number, and each email address you use, in quotes.
4. Your usual username. Old accounts you forgot about can still hold old details.

Also check
Put your main email into Have I Been Pwned at haveibeenpwned.com.
Searching is free and needs no account, and it tells you which known leaks your address turned up in.

What to do with the list
What you find here sets the order you clean things up in. Start with anything that could lead someone to your home, then whatever surprised you most.
