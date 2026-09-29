---
id: image-abuse-001
schema_version: 1.0.0
version: 1.1.0
title: Know your options if an intimate image is shared without consent
category: data_management
subcategory: data_deletion
tracks:
  - known_person_risk
platforms:
  - all
not_applicable_if: []
sensitive: true
difficulty:
  technical: 1
  disruption: 1
  reversibility: 1
time_estimate:
  setup: 30min
  ongoing: negligible
maturity_level: 2
adversaries:
  - targeted_individual
  - intimate_partner
  - ai_automated
attack_vectors:
  - deepfake
  - insider_access
  - social_engineering
assets_protected:
  - reputation
  - relationships
  - behavioral_data
  - identity
controls_implemented: []
score_weight: 8
threat_model_multipliers:
  targeted_individual: 1.8
  intimate_partner: 2
  ai_automated: 1.6
compensating_controls: []
depends_on: []
related_items:
  - id: stalkerware-check-001
    relationship: related_concept
    note: A partner who shares or threatens to share images may also have put an app on your phone.
  - id: harassment-plan-001
    relationship: related_concept
    note: Shared images can come with a wider harassment campaign.
  - id: ai-voice-clone-001
    relationship: related_concept
    note: How AI can fake a real person's voice or face.
status: active
superseded_by: null
last_verified: '2026-03-01'
verified_by:
  - org:eff.org
sources:
  - url: https://stopncii.org
    title: StopNCII — Non-Consensual Intimate Image Platform
    type: primary
    accessed: '2026-03-01'
  - url: https://cybercivilrights.org/ccri-safety-center/
    title: Cyber Civil Rights Initiative
    type: supporting
    accessed: '2026-03-01'
  - url: https://stopncii.org/how-it-works/
    title: "How StopNCII.org Works | StopNCII.org"
    type: primary
    accessed: '2026-09-27'
  - url: https://takeitdown.ncmec.org/
    title: "Take It Down"
    type: primary
    accessed: '2026-09-27'
  - url: https://www.ic3.gov/PSA/2024/PSA241203
    title: "Criminals Use Generative Artificial Intelligence to Facilitate Financial Fraud"
    type: primary
    accessed: '2026-09-27'
emotional_register: null
tags:
  - free
  - high_impact
  - response_pathway
  - prevention_and_response
  - ai_threat_relevant
created_at: '2026-03-04'
created_by: github:@KashishOO7
changelog:
  - version: 1.0.0
    date: '2026-03-04'
    changes: Initial item creation.
    author: github:@KashishOO7
---

## Why
Intimate images shared without consent, or the threat to share them, are used to control, pressure and hurt people. AI tools can now make a fake intimate image of a real person from ordinary photos, so this can happen even if you never shared one. The routes for getting an image blocked or removed exist now, and some of them work before anything is posted.

## What
Learn how to get a private image taken down before you need to. Sharing one without consent, or threatening to, is abuse, and it is not your fault for having shared it. There are set routes for getting it removed, and you can use some of them before anything is posted.
## How
### all
Before you start
You have done nothing wrong, and there are people whose whole job is this.

Do this
You can have intimate images blocked across many platforms without sending anyone the image.

How that works
StopNCII.org turns the picture into a digital fingerprint, called a hash, on your own device, and sends only the hash.
Platforms that work with it use the hash to find and block matching uploads.
The picture itself never leaves your phone.
You can do it before anything is shared, as well as afterwards.
For images taken when you were under 18, takeitdown.ncmec.org does the same thing.

Also
Search engines run their own removal request, separate from the platforms, so a picture can be taken out of search results while it is still on a site. Search the engine's own name together with remove personal information, and use only a result on that search engine's own web address.
Before you report anything already posted, keep a dated record of it: the web address, the account that posted it and the date. Reporting often makes the post disappear, and the proof of what was there goes with it.
If the image was taken when you were under 18, do not download, send or share it, even to report it. Keep the web address instead.

Where to get help
If you are in danger or being threatened, contact your local police, and tell someone you trust.
The Cyber Civil Rights Initiative has a help page for people whose images were shared: cybercivilrights.org/ccri-safety-center/
## Law
### global
Sharing intimate images without consent is a crime in many countries. What you can do, and against whom, depends on where you live, and a lawyer can explain your options. This is general information, not legal advice.
