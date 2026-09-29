---
id: impersonation-report-001
schema_version: 1.0.0
version: 1.1.0
title: If someone is pretending to be you, screenshot it before you report it
category: incident_response
subcategory: impersonation
tracks:
  - general
  - public_work
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
  - targeted_individual
  - opportunistic
attack_vectors:
  - social_engineering
  - identity_fraud
assets_protected:
  - reputation
  - identity
controls_implemented: []
score_weight: 5.5
threat_model_multipliers:
  targeted_individual: 1
  opportunistic: 1
compensating_controls: []
depends_on: []
related_items:
  - id: osint-self-001
    relationship: required_companion
    note: Searching your own name is how a second fake account gets found. That step is the same search, done before anything has happened rather than after.
  - id: harassment-plan-001
    relationship: related_concept
    note: A fake account can be one part of wider harassment, used to turn other people against you.
status: active
superseded_by: null
last_verified: '2026-09-07'
verified_by:
  - github:@KashishOO7
sources:
  - url: https://www.esafety.gov.au/lgbtiq/learning-lounge/meeting-online/impersonation-catfishing-identity-theft
    title: 'eSafety Commissioner: Impersonation, catfishing and identity theft'
    type: primary
    accessed: '2026-09-07'
  - url: https://onlineharassmentfieldmanual.pen.org/defining-online-harassment-a-glossary-of-terms/
    title: 'PEN America Online Harassment Field Manual: Defining Online Abuse, a Glossary of Terms'
    type: primary
    accessed: '2026-09-07'
emotional_register: null
tags:
  - free
  - incident_response
  - impersonation
created_at: '2026-09-07'
created_by: github:@KashishOO7
changelog:
  - version: 1.1.0
    date: '2026-09-07'
    changes: Tagged with the new identity_fraud vector, so the step now resolves to the harm it is about.
    author: github:@KashishOO7
  - version: 1.0.0
    date: '2026-09-07'
    changes: Initial item. The research ranks identity misuse and online impersonation second by measured prevalence, and the corpus had nothing on what to do once it has happened.
    author: github:@KashishOO7
---

## Why
Someone can open an account with your name and your photo and use it to talk to your friends, family or colleagues as if they were you. It may be done to embarrass you, damage your reputation or turn other people against you.
## What
Take screenshots of the fake account before you report it, then report it through the app or website it is on. A removed account takes its posts with it, so the screenshots are your record of what it said.
## How
### all
Screenshot it first
Capture the profile, the name, the picture and anything it has posted, before you report anything. A removed account takes its contents with it, and you may need to show somebody later what it said.

Then report it to the service it is on
Report the account through the app or website it is on, and ask friends who have seen it to report it too.
Reporting is not instant, so do the next steps while you wait.

Do not send your own identity documents
Send a copy of your ID only if the app or website asks for it in its own report form. Do not send it to anyone who contacts you about the fake account.

Say something on your real account
Post on your real account that the other one is not you, so the people it is talking to know.
If it has named your employer, your family or a friend, tell them directly.

Then check what else carries your name
Search for your name and your usual username, on the same app and on others. Someone who made one fake account may have made more.
