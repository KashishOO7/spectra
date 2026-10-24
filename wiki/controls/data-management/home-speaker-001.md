---
id: home-speaker-001
schema_version: 1.0.0
version: 1.0.0
title: "Delete your smart speaker's recordings and put a PIN on voice purchases"
category: data_management
subcategory: smart_home
tracks:
  - general
platforms:
  - iot
not_applicable_if: []
sensitive: false
difficulty:
  technical: 2
  disruption: 1
  reversibility: 1
time_estimate:
  setup: 15min
  ongoing: low
maturity_level: 1
adversaries:
  - intimate_partner
  - opportunistic
attack_vectors:
  - physical_access
assets_protected:
  - communications
  - behavioral_data
  - financial
controls_implemented: []
score_weight: 5
threat_model_multipliers:
  intimate_partner: 1.2
multiplier_reasons:
  intimate_partner: 'Someone who shares the account that controls the speaker can listen back to its recordings and use the accounts linked to it, so a small rise.'
compensating_controls: []
depends_on: []
related_items:
  - id: data-ecosystem-audit-001
    relationship: complementary
    note: The linked step checks the privacy settings on the accounts you use most, which often include the one your speaker uses.
status: active
superseded_by: null
last_verified: '2026-10-19'
verified_by:
  - org:ftc.gov
  - org:ncsc.gov.uk
sources:
  - url: https://consumer.ftc.gov/articles/how-secure-your-voice-assistant-protect-your-privacy
    title: "How To Secure Your Voice Assistant and Protect Your Privacy | Consumer Advice"
    type: primary
    accessed: '2026-10-19'
  - url: https://consumer.ftc.gov/articles/securing-your-internet-connected-devices-home
    title: "Securing Your Internet-Connected Devices at Home | Consumer Advice"
    type: supporting
    accessed: '2026-10-19'
  - url: https://www.ncsc.gov.uk/guidance/smart-devices-in-the-home
    title: "Smart devices: using them safely in your home | National Cyber Security Centre"
    type: supporting
    accessed: '2026-10-19'
emotional_register: null
tags:
  - free
  - no_tools_required
  - privacy
created_at: '2026-10-19'
created_by: github:KashishOO7
changelog:
  - version: 1.1.0
    date: '2026-10-21'
    changes: Rewritten so each block opens on the reader's situation, then what to do, then an example.
    author: github:@KashishOO7
  - version: 1.0.0
    date: '2026-10-19'
    changes: Initial item, row 7 batch E (NEXT §15.6 item 18), in the Smart home chapter.
    author: github:KashishOO7
---

## Why
A smart speaker records what you say after it hears its wake word, and it sometimes mistakes ordinary talk for the wake word and records that too. The recordings usually go to the company that made it and may be kept until you delete them, and some companies have had people listen to recordings to improve the product. If voice purchasing is on, anyone in your home can also buy things with your account just by asking. Say a child asks the speaker for a toy: with voice purchasing on, the order goes through on your account.

## What
A smart speaker keeps what it records, and anyone in the room can order with your account just by asking. So set your speaker to delete its recordings automatically, and put a PIN on voice purchases or turn them off. If you use a voice assistant on your phone or tablet, check its settings for the same delete option.

## How
### all
Do this
Open the app that controls your speaker and go to its privacy settings. If the app has none, look in your account on the maker's website.

What to change
- Choose the shortest time the app offers for keeping recordings, and delete the recordings already kept.
- Turn off the option for people at the speaker's maker to review your recordings, if there is one. It is often worded as using your recordings to improve the service.
- Add a PIN that has to be said before anything is bought, or turn voice purchasing off, so visitors and children cannot order with your account. Anyone in the room can hear a spoken PIN, so change it if someone you did not mean to tell learns it.
- Check which accounts are linked to the speaker, such as your email, your calendar or a shopping account, and unlink any you do not use through it, because anyone who talks to the speaker may be able to use them too.
- If your speaker has a guest mode, turn it on when visitors stay, to limit what they can do with your account.

When you want privacy
Most speakers have a button or switch that turns the microphone off, with a light that shows it is off. Press it before conversations you do not want recorded. The speaker does not respond until you turn the microphone back on.

Before you sell or give away a speaker
Remove it from your account, then factory reset it.

Test it
Look at the recording history in the app and check that the recordings you deleted are gone. Then open the purchase setting and check that it asks for a PIN or that purchasing is off.
