---
id: data-payment-privacy-001
schema_version: 1.0.0
version: 1.1.0
title: Review privacy and data sharing settings in payment apps
category: data_management
subcategory: data_minimization
tracks:
  - general
  - known_person_risk
platforms:
  - android
  - ios
  - web
not_applicable_if: []
sensitive: false
difficulty:
  technical: 1
  disruption: 1
  reversibility: 1
time_estimate:
  setup: 30min
  ongoing: low
maturity_level: 1
adversaries:
  - data_broker
  - intimate_partner
  - opportunistic
  - targeted_individual
  - employer
attack_vectors:
  - data_broker_aggregation
  - osint_passive
  - insider_access
assets_protected:
  - financial
  - behavioral_data
  - location
  - identity
controls_implemented: []
score_weight: 6.5
threat_model_multipliers:
  data_broker: 1.8
  intimate_partner: 1.6
  opportunistic: 0.8
  targeted_individual: 1.3
  employer: 1.2
compensating_controls: []
depends_on: []
related_items:
  - id: data-ecosystem-audit-001
    relationship: complementary
    note: That step covers what the companies behind your main accounts record about you.
status: active
superseded_by: null
last_verified: '2026-08-26'
verified_by:
  - org:eff.org
sources:
  - url: https://ssd.eff.org/module/protecting-yourself-social-networks
    title: Protecting Yourself on Social Networks — EFF SSD
    type: primary
    accessed: '2026-08-26'
  - url: https://news.mit.edu/2015/identify-from-credit-card-metadata-0129
    title: "Privacy challenges | MIT News"
    type: primary
    accessed: '2026-09-27'
emotional_register: null
tags:
  - free
  - quick_win
  - financial
  - data_leakage
created_at: '2026-04-01'
created_by: github:@KashishOO7
changelog:
  - version: 1.0.0
    date: '2026-04-01'
    changes: Initial item.
    author: github:@KashishOO7
lookups:
  - lookup-account-settings-001
---

## Why
What you pay for shows where you live, work, eat and travel, and who you spend time with. MIT researchers took three months of card records for 1.1 million people, with names removed, and found that the dates and places of four purchases were enough to pick out 90 percent of them. Anyone who can see a shared payment account can follow your movements through it.

## What
Turn off the marketing and data-sharing settings in the apps you pay with. What you buy shows where you live, where you eat and who you see, so keep that record with the app that needs it. Look in each app's own privacy settings and switch the sharing off.
## How
### all
Do this
Turn off data sharing and marketing in the payment and banking apps you use.

What to look for
In each app's settings, look under Privacy or Marketing.
Turn off offers picked for you, sharing with partners, and anything about using what you buy to suggest things. You will see fewer offers chosen for you.
Remove cards and accounts you no longer use while you are in there.

Worth knowing
Do not assume a payment app passes nothing on. Open its privacy settings and read what it says it does.

Test it
Find the ad or interests page on the same account. If it lists shops or brands you know, your purchases are probably being used to choose ads.
## Where you are
### has_data_protection_rights
You can ask what they hold and who else has it
Where you live, a payment or banking provider has to tell you what it keeps about your spending and who it has passed that to, and it has to answer within a set time.

How to ask
Write to each provider separately and use the words subject access request, or data access request. Using those words makes clear what you are asking for.
Ask two things plainly: what do you hold about me, and who have you shared it with.
Where to send it is in the privacy section of their site or app, usually as a form or an address for their data protection contact.
## Law
### global
Rules on what banks and payment apps may share differ from country to country, and in some countries you can opt out of some of that sharing. This is general information, not legal advice.
