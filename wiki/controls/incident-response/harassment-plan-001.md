---
id: harassment-plan-001
schema_version: 1.0.0
version: 1.1.0
title: Prepare a response plan for targeted online harassment
category: incident_response
subcategory: reporting
tracks:
  - known_person_risk
platforms:
  - all
not_applicable_if: []
sensitive: true
difficulty:
  technical: 1
  disruption: 2
  reversibility: 1
time_estimate:
  setup: 2hr
  ongoing: low
maturity_level: 2
adversaries:
  - targeted_individual
  - opportunistic
  - ai_automated
attack_vectors:
  - osint_passive
  - social_engineering
  - data_broker_aggregation
  - phishing
assets_protected:
  - reputation
  - location
  - relationships
  - identity
  - financial
controls_implemented: []
score_weight: 7.5
threat_model_multipliers:
  targeted_individual: 1.8
  opportunistic: 1.2
  ai_automated: 1.5
compensating_controls: []
depends_on: []
related_items:
  - id: image-abuse-001
    relationship: related_concept
    note: Intimate images shared without consent can be part of a harassment campaign.
  - id: stalkerware-check-001
    relationship: related_concept
    note: If the person harassing you has had your phone, check it for hidden apps too.
  - id: osint-self-001
    relationship: related_concept
    note: Shows what someone could find about you and post. Do it first.
  - id: data-broker-optout-001
    relationship: related_concept
    note: People-search sites show your home address and phone number to anyone who searches your name, and those are the details harassers post online to intimidate or stalk someone.
  - id: incident-breach-monitor-001
    relationship: related_concept
    note: Someone harassing you may try passwords from a data breach on your accounts, so an alert when your address turns up in a breach helps.
status: active
superseded_by: null
last_verified: '2026-03-01'
verified_by:
  - org:pen.org
sources:
  - url: https://onlineharassmentfieldmanual.pen.org
    title: PEN America Online Harassment Field Manual
    type: primary
    accessed: '2026-03-01'
  - url: https://onlineviolenceresponsehub.org/
    title: "Home | Coalition Against Online Violence"
    type: primary
    accessed: '2026-09-27'
emotional_register: null
tags:
  - free
  - response_pathway
  - requires_preparation
  - high_impact
  - documentation_required
created_at: '2026-03-04'
created_by: github:@KashishOO7
changelog:
  - version: 1.0.0
    date: '2026-03-04'
    changes: Initial item creation.
    author: github:@KashishOO7
---

## Why
When many people target you online at once, it can move fast: many accounts, your home address or employer posted, messages sent to people you know. Deciding in advance what you will do means you act straight away instead of working it out while it happens. A plan does not stop harassment, but it keeps the evidence and gets you help sooner.

## What
Decide now what you would do if many people targeted you online at once. It often follows the same pattern: many accounts at once, posts written to spread, your address posted, messages sent to your work. Write down who you would tell and what you would save, while you are calm.
## How
### all
Before you start
Keep the evidence before you block or report anything: screenshots that show the date, the platform and the username.
Once you block an account, you may no longer be able to see what it posted.

Do this
Decide what you will do now, so you are not deciding it while it is happening.

Your plan, in order
1. Record first. A dated folder of screenshots is enough.
2. Lock your accounts. These campaigns often come with attempts to get into your accounts, so check that two-factor authentication is on for your email and social media.
3. Report it as coordinated harassment when several accounts are involved, not as a single incident.
4. Do not reply. Replying usually brings more of it.

Where to get help
If you are in danger now, call your local emergency number, and tell someone you trust what is happening.
PEN America's Online Harassment Field Manual explains how to prepare for and respond to online harassment, in several languages: onlineharassmentfieldmanual.pen.org
If you are a journalist, the Coalition Against Online Violence has a help hub: onlineviolenceresponsehub.org
## Law
### global
Laws on harassment, posting someone's address and threats differ from country to country. A lawyer who works on online abuse can explain your options where you live. This is general information, not legal advice.
