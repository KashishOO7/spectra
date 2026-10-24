---
id: ai-phishing-detect-001
schema_version: 1.0.0
version: 1.2.0
title: Check who a message is really from, however well written
category: ai_threats
subcategory: ai_phishing_detection
tracks:
  - general
  - ai_focused
platforms:
  - all
platform_notes_verified:
  all: '2026-03-04'
not_applicable_if: []
sensitive: false
difficulty:
  technical: 1
  disruption: 1
  reversibility: 1
time_estimate:
  setup: 5min
  ongoing: low
maturity_level: 2
adversaries:
  - opportunistic
  - targeted_individual
  - criminal_org
  - ai_automated
  - foreign_government
attack_vectors:
  - phishing
  - spear_phishing
  - social_engineering
assets_protected:
  - credentials
  - financial
  - cloud_data
  - identity
controls_implemented: []
score_weight: 8
threat_model_multipliers:
  opportunistic: 1.2
  targeted_individual: 1.6
  criminal_org: 1.4
  ai_automated: 2
  foreign_government: 1.6
multiplier_reasons:
  opportunistic: 'Bulk phishing is now written by AI too, and checking who really sent a message catches it however well written.'
  targeted_individual: 'A person after you can write a message in the voice of someone you know, so checking the real sender matters more.'
  criminal_org: 'Groups send convincing phishing at scale, and checking the sender address and link is what stops it.'
  ai_automated: 'This step exists because AI removed the spelling mistakes people used to spot scams by.'
  foreign_government: 'Foreign services send carefully written phishing to chosen people, so checking the real sender is a main defence.'
compensating_controls: []
depends_on:
  - id: human-urgency-001
    reason: A message that rushes you is the one to check most carefully, however well it is written.
    hard_dependency: false
related_items:
  - id: human-verify-001
    relationship: required_companion
    note: Check a request by contacting the person or company through a number or website you found yourself.
status: active
superseded_by: null
last_verified: '2026-09-02'
verified_by:
  - org:arxiv.org
sources:
  - url: https://arxiv.org/abs/2305.06972
    title: Spear Phishing With Large Language Models — Julian Hazell
    type: primary
    accessed: '2026-09-02'
  - url: https://support.google.com/mail/answer/180707?hl=en
    title: Check if your Gmail message is authenticated - Gmail Help
    type: supporting
    accessed: '2026-09-27'
  - url: https://www.acma.gov.au/about-register
    title: About the register | ACMA
    type: supporting
    accessed: '2026-09-27'
  - url: https://www.fcc.gov/consumers/guides/spoofing
    title: Caller ID Spoofing | Federal Communications Commission
    type: supporting
    accessed: '2026-09-27'
emotional_register: null
tags:
  - behavioral
  - ai_defense
created_at: '2026-02-25'
created_by: github:KashishOO7
changelog:
  - version: 1.2.0
    date: '2026-10-21'
    changes: Rewritten so each block opens on the reader's situation, then what to do, then an example.
    author: github:@KashishOO7
  - version: 1.1.0
    date: '2026-03-04'
    changes: Formalized Zero-Trust Evaluation model in platform notes.
    author: github:KashishOO7
lookups:
  - lookup-is-this-a-scam-001
---

## Why
Anyone can give an AI tool what you have posted publicly, like your job, your employer or last week's trip, and get back a scam message written for you. Say you posted about a trip last week: a message arrives that names the trip, says it is from your airline, and asks you to confirm your card details through a link. In a study, a researcher used AI to write a personal scam email for each of more than 600 members of a national parliament, to test how easily it could be done. Each email cost almost nothing to produce, and simple instructions were enough to bypass the AI's built-in protections against this.
## What
AI tools now write scam messages with correct spelling, and they can use your real name, so a well-written message is no longer a sign that it is genuine. So check who a message is really from and how it reached you, not how well it is written. Scam messages used to be easy to spot because they had spelling mistakes and began with a general greeting like "Dear customer".
## How
### all
Do this
Check where a message came from before you act on it, even when it is well written.

How to see who really sent it
The name shown at the top of a message proves nothing on its own: on an email the sender types it in, and on a text or call the number behind it can be faked.
- Email: read the whole address, including the part after the @. On a phone it is often hidden until you tap the sender's name, or the details link under it. Scammers often use a lookalike address that changes one letter or adds a word, and reading it closely catches many of those. A correct address is still not proof. The account may have been broken into, and some messages carry a forged address. Some email apps show a question mark or a warning beside the sender when they cannot confirm who sent it.
- Text message or call: the name or number shown can be faked, even to match a company or a person you have saved, and a scam text can appear in the same conversation as real ones from that company. In some countries, company names on texts are registered, and a text from an unregistered name is marked as unverified.
- Chat apps: anyone can make an account with any name and photo.
So never check a message using anything inside it: do not open its link, call its number or reply to it. Contact the organisation yourself.

Test it
Next time a message says there is a problem with an account, do not use its link.
Open the company's own app, or type its web address yourself, or use your saved bookmark.
Sign in there and look for the problem the message described, such as a blocked payment or a locked account. If your account shows no sign of it, do not trust the message, and do not use its link.
