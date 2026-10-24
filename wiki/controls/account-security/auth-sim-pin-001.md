---
id: auth-sim-pin-001
schema_version: 1.0.0
version: 1.0.0
title: Add a PIN to your mobile account
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
multiplier_reasons:
  targeted_individual: 'Moving a number to a new SIM needs your number and personal details, so it is aimed at one person, and the PIN blocks it.'
  criminal_org: 'Fraud groups do this to reach bank and crypto accounts that send codes by text; they choose victims, so below the targeted case.'
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
  - version: 1.1.0
    date: '2026-10-21'
    changes: Rewritten so each block opens on the reader's situation, then what to do, then an example.
    author: github:@KashishOO7
  - version: 1.0.0
    date: '2026-09-29'
    changes: Initial item, phase 7 of NEXT §15.4, from the FTC's SIM swap advice.
    author: github:KashishOO7
---

## Why
If someone calls your mobile provider, says your phone was lost and asks for your number on a new SIM card (the small chip that holds your number) in their own phone, your calls and texts go to them from then on, including the codes that sign you in to your email and your bank. Someone who knows a little about you can do this. For example, say a stranger knows your name and a few details: they pretend to be you on the phone and take your number, and the sign-in code for your bank arrives on their phone, not yours.
## What
If someone tricks your mobile provider into moving your number to their SIM card, they get your calls, texts and sign-in codes. So ask your provider to put a PIN or password on your account, which makes it harder for anyone to trick the provider into giving your number away. For example, with a PIN on your account, a caller who only knows your name and address also has to know the PIN.
## How
### all
Do this
Set up a PIN or password on your mobile phone account. Your provider's website or app says how, or ask when you call it.

Choose and keep it
Make the PIN a number you do not use for anything else.
Keep the PIN somewhere safe, such as your password manager. Your provider may ask for the PIN when you get a new SIM or switch to another provider.

Signs someone has taken your number
Your phone suddenly has no signal, data, texts or calls where it normally does.
Your provider tells you your number is now on a new SIM card, and you did not ask for one.

If that happens
Contact your provider straight away, from another phone, to take your number back.
Then change your email password first, and check your bank and card accounts for payments you did not make.

Codes by text
A code sent by text goes to whoever has your number. Where an account offers an authenticator app or a security key, add one, as the step linked below, Turn on two-factor authentication, explains.
