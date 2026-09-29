---
id: ai-voice-clone-001
schema_version: 1.0.0
version: 1.2.0
title: Agree a safe word with your family for calls asking for money or help
category: ai_threats
subcategory: voice_clone_defense
tracks:
  - general
  - ai_focused
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
maturity_level: 2
adversaries:
  - targeted_individual
  - criminal_org
  - ai_automated
attack_vectors:
  - voice_clone
  - social_engineering
  - deepfake
assets_protected:
  - financial
  - identity
  - relationships
controls_implemented: []
score_weight: 7.5
threat_model_multipliers:
  targeted_individual: 1.6
  criminal_org: 1.5
  ai_automated: 2
  foreign_government: 1.8
compensating_controls: []
depends_on: []
related_items:
  - id: human-urgency-001
    relationship: complementary
    note: A call in a copied voice asks for money straight away. That step is about stopping when a call rushes you.
status: active
superseded_by: null
last_verified: '2026-03-04'
verified_by:
  - org:eff.org
sources:
  - url: https://consumer.ftc.gov/consumer-alerts/2023/03/scammers-use-ai-enhance-their-family-emergency-schemes
    title: 'FTC Consumer Advice: Scammers use AI to enhance their family emergency schemes'
    type: primary
    accessed: '2026-09-27'
  - url: https://www.ic3.gov/PSA/2024/PSA241203
    title: 'FBI IC3: Criminals Use Generative Artificial Intelligence to Facilitate Financial Fraud'
    type: supporting
    accessed: '2026-09-27'
  - url: https://consumer.ftc.gov/articles/how-avoid-scam
    title: 'FTC Consumer Advice: How To Avoid a Scam'
    type: supporting
    accessed: '2026-09-27'
emotional_register: null
tags:
  - behavioral
  - family_safety
created_at: '2026-02-25'
created_by: github:KashishOO7
changelog:
  - version: 1.1.0
    date: '2026-03-04'
    changes: Clarified in-person/E2EE transmission requirement for the safe word.
    author: github:KashishOO7
lookups:
  - lookup-is-this-a-scam-001
---

## Why
Scammers can copy the voice of someone you love from a short clip of them talking, such as a video posted online. They call as that person in a crisis, in an accident, arrested or held for ransom, and ask for money straight away. The call can sound exactly like them, and the number on your screen can be faked too, so neither proves who is calling.
## What
Agree a secret word with your family, and ask for it whenever a caller who sounds like family asks for money or help. If they cannot say it, hang up and call them back on the number you already have for them.
## How
### all
Do this
Agree a word with your family that a caller has to say if they ring claiming to be in trouble.

Setting it up
Agree it in person if you can, or in your family's own private chat. Do not post it or put it anywhere people outside the family can see.
Pick a word that is easy to say but would never come up in that conversation by itself, like a fruit or a piece of furniture. Not a birthday, not a pet's name, nothing a stranger could look up or guess from what your family posts.

When to use it
Any call where someone sounds like family and needs money or help right now.
Ask them to say the word. Never say it first, and never ask "is it still such and such", because that hands the word straight to whoever is on the line.
A real relative can tell you the word. A copied voice cannot.
If they cannot say it, that on its own does not prove they are fake, because a frightened person forgets things. Hang up anyway and ring them back on the number you already have for them.
If you cannot reach them, contact another family member or one of their friends.
