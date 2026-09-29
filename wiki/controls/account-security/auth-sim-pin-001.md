---
id: auth-sim-pin-001
schema_version: 1.0.0
version: 1.0.0
title: Ask your mobile provider for a PIN that protects your phone number
category: account_security
subcategory: account_recovery
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
  setup: 15min
  ongoing: negligible
maturity_level: 2
adversaries:
  - targeted_individual
  - criminal_org
attack_vectors:
  - sim_swap
  - social_engineering
assets_protected:
  - credentials
  - financial
  - communications
controls_implemented: []
score_weight: 7
threat_model_multipliers:
  targeted_individual: 1.5
  criminal_org: 1.3
compensating_controls: []
depends_on: []
related_items:
  - id: auth-2fa-001
    relationship: complementary
    note: A code sent by text goes to whoever has your number. An authenticator app or a security key does not move with it.
status: active
superseded_by: null
last_verified: '2026-09-29'
verified_by:
  - org:ftc.gov
sources:
  - url: https://consumer.ftc.gov/consumer-alerts/2019/10/sim-swap-scams-how-protect-yourself
    title: 'SIM Swap Scams: How to Protect Yourself | Consumer Advice'
    type: primary
    accessed: '2026-09-29'
tags:
  - high_impact
  - free
  - no_tools_required
created_at: '2026-09-29'
created_by: github:KashishOO7
changelog:
  - version: 1.0.0
    date: '2026-09-29'
    changes: Initial item, phase 7 of NEXT §15.4, from the FTC's SIM swap advice.
    author: github:KashishOO7
---

## Why
Someone who knows a little about you can call your mobile provider, say your phone was lost, and ask for your number on a new SIM card in their own phone. From then on your calls and texts go to them, including the codes that sign you in to your email and your bank.
## What
Ask your mobile provider to put a PIN or password on your account. It makes it harder for someone else to move your number to their phone.
## How
### all
Do this
Set up a PIN or password on your mobile phone account. Your provider's website or app says how, or ask when you call it.

Choose and keep it
Make it a number you do not use for anything else.
Keep it somewhere safe, such as your password manager. Your provider may ask for it when you get a new SIM or move your number.

Signs your number was moved
Your phone suddenly has no signal, data, texts or calls where it normally does.
Your provider tells you that your SIM was activated on a new device, and it was not you.

If that happens
Contact your provider straight away, from another phone, to take your number back.
Then change your passwords and check your bank and card accounts for payments you did not make.

Codes by text
A code sent by text goes to whoever has your number. Where an account offers an authenticator app or a security key, add one, as the step linked below, Enable two-factor authentication on all critical accounts, explains.
