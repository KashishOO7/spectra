---
id: incident-breach-monitor-001
schema_version: 1.0.0
version: 1.2.0
title: Set up breach monitoring for your email addresses
category: incident_response
subcategory: breach_detection
tracks:
  - general
platforms:
  - all
not_applicable_if: []
sensitive: false
difficulty:
  technical: 1
  disruption: 1
  reversibility: 1
time_estimate:
  setup: 5min
  ongoing: negligible
maturity_level: 1
adversaries:
  - opportunistic
  - criminal_org
  - targeted_individual
attack_vectors:
  - credential_stuffing
  - data_broker_aggregation
assets_protected:
  - credentials
  - cloud_data
  - financial
controls_implemented: []
score_weight: 6.5
threat_model_multipliers:
  opportunistic: 1.2
  criminal_org: 1.3
  targeted_individual: 1.1
compensating_controls: []
depends_on: []
related_items:
  - id: auth-password-manager-001
    relationship: required_companion
    note: When an alert arrives, a password manager means there is only one password to change, because no other account shares it.
status: active
superseded_by: null
last_verified: '2026-08-26'
verified_by:
  - org:eff.org
sources:
  - url: https://haveibeenpwned.com/FAQs
    title: Have I Been Pwned FAQ — How breach monitoring works
    type: primary
    accessed: '2026-08-26'
emotional_register: null
tags:
  - free
  - quick
  - monitoring
  - incident_response
created_at: '2025-01-01'
created_by: github:@KashishOO7
changelog:
  - version: 1.1.0
    date: '2026-04-01'
    changes: Firefox Monitor renamed to Mozilla Monitor. Updated URL and added 20-email limit detail. Monitor Plus shut down Dec 2025; free tier unaffected.
    author: github:@KashishOO7
  - version: 1.0.0
    date: '2025-01-01'
    changes: Initial item.
    author: github:@KashishOO7
lookups:
  - lookup-choosing-a-tool-001
---

## Why
When a website is broken into, the email addresses and passwords taken from it can end up in lists that other people use to try those logins on other sites. If you hear about the leak, you can change the password before someone uses it.
## What
Ask to be told when your email address shows up in a data breach, so you can change that password straight away. A breach checking service can tell you about leaks it already knows of and email you about new ones.
## How
### all
Do this
Set up an alert so you hear about it when your email turns up in a leak.

How
Go to haveibeenpwned.com and put in each address you use. Searching is free, needs no account, and tells you which known leaks already include you.
Searching does not sign you up for anything. Being told about future leaks is a separate step: use the notify option on the same site, give the address, and click the link in the mail it sends you. Repeat it for each address, because one signup covers one address.
The alert goes only to the address being watched, so you need to be able to open that inbox.
Many password managers run the same check on the accounts they hold, so look there too if you use one.

When one arrives
Change that password, then change it anywhere else you used the same one, because a leaked password works on every account that shares it.

Test it
Search an address you have had for a long time and see which leaks it was in. Not appearing does not prove it was never leaked, only that no leak the service knows of includes it.
## Where
### res-guide-passwords-001
lists managers, some of which check for breaches for you.
