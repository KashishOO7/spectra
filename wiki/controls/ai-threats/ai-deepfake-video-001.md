---
id: ai-deepfake-video-001
schema_version: 1.0.0
version: 1.0.0
title: Check who is on a video call before you pay
category: ai_threats
subcategory: deepfake_defense
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
  ongoing: low
maturity_level: 1
adversaries:
  - targeted_individual
  - criminal_org
  - ai_automated
attack_vectors:
  - deepfake
  - social_engineering
assets_protected:
  - financial
controls_implemented: []
score_weight: 6
threat_model_multipliers:
  targeted_individual: 1.4
  criminal_org: 1.4
  ai_automated: 2.0
multiplier_reasons:
  targeted_individual: "A fake video of someone you know can be made from that person's photos and videos and aimed at the people close to them, so this step counts more against someone who has chosen you."
  criminal_org: 'Organised groups use fake video calls to pose as company managers and get large payments sent, so this step counts more against them.'
  ai_automated: 'This step exists for faked video made by AI, so it counts twice as much for a reader worried about attacks that use AI.'
compensating_controls: []
depends_on: []
related_items:
  - id: ai-voice-clone-001
    relationship: complementary
    note: Agree a safe word with your family, so a caller who looks or sounds like a relative can prove it is really them.
status: active
superseded_by: null
last_verified: '2026-10-19'
verified_by:
  - org:ic3.gov
sources:
  - url: https://www.ic3.gov/PSA/2024/PSA241203
    title: Criminals Use Generative Artificial Intelligence to Facilitate Financial Fraud | Internet Crime Complaint Center (IC3)
    type: primary
    accessed: '2026-10-19'
tags:
  - behavioral
  - ai_threat_relevant
  - free
  - no_tools_required
created_at: '2026-10-19'
created_by: github:KashishOO7
changelog:
  - version: 1.1.0
    date: '2026-10-21'
    changes: Rewritten so each block opens on the reader's situation, then what to do, then an example.
    author: github:@KashishOO7
  - version: 1.0.0
    date: '2026-10-19'
    changes: Initial item, row 7 batch C (NEXT §15.6 item 10), from the FBI's public warning on generative AI fraud; written against ai-voice-clone-001.
    author: github:KashishOO7
---

## Why
AI tools can copy a real person's face and voice from photos and videos of that person, and scammers use these copies in live video calls. A scammer appears on a call as a manager, a police officer or a relative and asks for money urgently, or someone you met online sends a video to make you believe they are real.
## What
AI can copy a person's face and voice on a live video call, so seeing someone's face does not prove who they are. So before you send money or private details because of a video, contact the person through a phone number or email address you already had for them.
## How
### all
Do this
If someone on a video call or in a video message asks you for money or private details, stop, and check with the real person another way, such as a number you already have for them.

Signs of a fake video
The lips do not match the words, or the face, eyes, teeth or hands look wrong.
The edges of the face blur when the person moves, or the shadows do not match the room.
A good fake can look and sound perfect, so a video without these faults proves nothing. Do not rely on what you can see.
Treat these as the sign instead, because they show even with a perfect fake: the person keeps the call short, asks you to keep it secret, or pushes you to pay before you can check.

Someone you have met only online
If someone you have never met in person sends you videos to show they are real, and then asks for money, send nothing. The face in the video may be someone else's, or made by AI.

At work
If a manager or a supplier on a video call asks you to make a payment or change the bank details a payment goes to, check it before anything is paid. Use a contact detail you already have for them, or ask a colleague, however senior the caller seems.

Family calls
If a relative on a video call asks for money, ask for your family's safe word if you have agreed one, as the step linked below explains, or call them back on their usual number.

Make it harder to copy you
Set your social media accounts so only people you know can see your photos and videos, because fakes can be made from photos and videos posted online. The cost is that people who do not know you will see less of you there.
