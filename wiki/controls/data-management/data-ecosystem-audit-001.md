---
id: data-ecosystem-audit-001
schema_version: 1.0.0
version: 1.1.0
title: Check the privacy settings on the accounts you use most
category: data_management
subcategory: data_minimization
tracks:
  - general
platforms:
  - android
  - ios
  - windows
  - macos
  - web
not_applicable_if: []
sensitive: false
difficulty:
  technical: 1
  disruption: 1
  reversibility: 1
time_estimate:
  setup: 2hr
  ongoing: low
maturity_level: 1
adversaries:
  - opportunistic
  - data_broker
  - criminal_org
  - targeted_individual
  - intimate_partner
  - employer
  - ai_automated
attack_vectors:
  - data_broker_aggregation
  - osint_passive
  - insider_access
assets_protected:
  - behavioral_data
  - location
  - communications
  - identity
  - relationships
controls_implemented: []
score_weight: 8.5
threat_model_multipliers:
  opportunistic: 1
  data_broker: 2
  criminal_org: 1.1
  targeted_individual: 1.4
  intimate_partner: 1.5
  employer: 1.3
  ai_automated: 1
multiplier_reasons:
  opportunistic: 'About the same for anyone.'
  data_broker: 'The settings this step checks decide what your accounts share for advertising, which is why it exists.'
  criminal_org: 'Shared data helps fraud a little, so a small rise.'
  targeted_individual: 'Settings that show your activity or location help a person after you, so a rise.'
  intimate_partner: 'Shared accounts and family settings left from a relationship let a partner see activity, so a rise.'
  employer: 'Accounts linked to work can share with an employer, so a rise.'
  ai_automated: 'Advertising and sharing settings are not what voice-copying or faked-video scams use, so no rise. Was 1.3 until 2026-10-19.'
compensating_controls: []
depends_on: []
related_items:
  - id: data-permissions-001
    relationship: complementary
    note: That step controls what apps can reach on your phone. This one controls what the company behind your account collects.
  - id: data-browser-hygiene-001
    relationship: complementary
    note: That step stops other sites following you in the browser. This one covers what the company you sign in with keeps.
status: active
superseded_by: null
last_verified: '2026-04-01'
verified_by:
  - org:eff.org
sources:
  - url: https://ssd.eff.org/module/how-to-get-to-know-android-privacy-and-security-settings
    title: Android Privacy and Security Settings — EFF Surveillance Self-Defense
    type: primary
    accessed: '2026-04-01'
  - url: https://ssd.eff.org/module/protecting-yourself-social-networks
    title: 'Surveillance Self-Defense: Protecting Yourself on Social Networks'
    type: supporting
    accessed: '2026-09-27'
  - url: https://support.google.com/websearch/answer/6096136?hl=en
    title: Find & erase your Google Search history - Google Search Help
    type: supporting
    accessed: '2026-09-27'
emotional_register: null
tags:
  - free
  - high_impact
  - default_settings
  - data_leakage
created_at: '2026-04-01'
created_by: github:@KashishOO7
changelog:
  - version: 1.1.0
    date: '2026-10-21'
    changes: Rewritten so each block opens on the reader's situation, then what to do, then an example.
    author: github:@KashishOO7
  - version: 1.0.0
    date: '2026-04-01'
    changes: Initial item.
    author: github:@KashishOO7
lookups:
  - lookup-account-settings-001
---

## Why
The accounts you sign in with know more about you than any single app, because they see you across all of it. Say your main account keeps your search history, the places you have been and your voice recordings. Anyone who gets into that account gets all of it, not just the login, and what is shared with advertisers cannot be taken back. That holds whichever provider you use, which is why the fix is the same everywhere: open the dashboard and see for yourself.
## What
The big account providers keep a history of what you do and use it to pick ads, and you will not know what is switched on until you look. So open the privacy dashboard or privacy check-up of the accounts you use most, and switch off what you never chose. The settings for activity history, ad personalisation, location history and voice recordings are usually there, and some accounts also have one for whether your data is used to train AI.
## How
### all
Do this
Open the privacy settings on the accounts you use most, and turn off the collecting you never asked for.

Which ones first
Start with your main email and the main account your phone signs in to, such as a Google account or an Apple Account, because you often use those to log in to other apps and sites too. Then the other accounts you use most:
- Your social apps
- Your shopping account
- Your games console

What to turn off
- Ads picked for you, also called personalised ads, interest-based ads, or ads based on your activity.
- History keeping: web and app activity, location history, voice recordings, watch and search history. Turn off the ones you do not use. Turning history off stops new history being kept but does not delete what is already stored, and it also turns off the suggestions built from it, and deleting is permanent, so for history you do use, choose automatic deletion of older activity where the account offers it.
- Activity shared between the different products you use under one account.
- Sharing with partners and advertisers.

Leave these alone
Sign-in alerts, and your recovery phone number and email. Alerts tell you about new or unusual sign-ins, so you notice one that is not yours, and the recovery number and email are how you get back in if you are locked out, so keep all of them.

Test it
Find the ad settings page in one of them. If it lists interests you never picked, ads are still being aimed at you.
