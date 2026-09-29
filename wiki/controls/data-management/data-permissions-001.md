---
id: data-permissions-001
schema_version: 1.0.0
version: 1.1.0
title: Check which apps can see your camera, mic and location
category: data_management
subcategory: data_minimization
tracks:
  - general
platforms:
  - android
  - ios
  - windows
  - macos
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
  - opportunistic
  - data_broker
  - criminal_org
  - intimate_partner
  - employer
  - ai_automated
attack_vectors:
  - malware
  - data_broker_aggregation
  - osint_passive
  - insider_access
assets_protected:
  - location
  - behavioral_data
  - relationships
  - communications
  - biometrics
controls_implemented: []
score_weight: 7
threat_model_multipliers:
  opportunistic: 1
  targeted_individual: 1.3
  criminal_org: 1.1
  intimate_partner: 1.4
  employer: 1.3
  isp_network: 0.4
  data_broker: 1.8
  domestic_government: 1.2
  foreign_government: 1
  ai_automated: 1.5
compensating_controls: []
depends_on: []
related_items:
  - id: device-updates-001
    relationship: complementary
    note: Updates fix security flaws in your phone and its apps, including the apps you have given these permissions to.
status: active
superseded_by: null
last_verified: '2026-02-25'
verified_by:
  - org:eff.org
  - org:privacyguides.org
sources:
  - url: https://ssd.eff.org/module/how-to-get-to-know-android-privacy-and-security-settings
    title: Android Privacy and Security Settings — EFF Surveillance Self-Defense
    type: primary
    accessed: '2026-03-06'
  - url: https://privacyguides.org/en/android/
    title: Android — Privacy Guides
    type: supporting
    accessed: '2026-02-25'
  - url: https://support.google.com/android/answer/9431959
    title: 'Android Help: Change app permissions on your Android phone'
    type: supporting
    accessed: '2026-09-27'
  - url: https://support.apple.com/en-us/102188
    title: 'Apple Support: About App Privacy Report'
    type: supporting
    accessed: '2026-09-27'
  - url: https://ssd.eff.org/module/protecting-yourself-social-networks
    title: 'Surveillance Self-Defense: Protecting Yourself on Social Networks'
    type: supporting
    accessed: '2026-09-27'
emotional_register: null
tags:
  - free
  - quick_win
  - mobile_focused
  - no_tools_required
  - high_impact_low_effort
created_at: '2026-02-25'
created_by: github:KashishOO7
changelog:
  - version: 1.0.0
    date: '2026-02-25'
    changes: Initial item.
    author: github:KashishOO7
lookups:
  - lookup-account-settings-001
---

## Why
An app you allow to use your camera, microphone, location, contacts or photos can use them whenever that permission lets it, and some apps ask for more than they need to work. Taking back what an app does not need limits what it can collect about you.
## What
Go through the apps on your phone and turn off camera, microphone, location, contacts and photo access for any app that does not need it to do its job. Your phone can also show you which apps used them recently.
## How
### all
Do this
Go through the apps on your phone and take back the permissions they do not need.

Where to find them
- iPhone: search Settings for Privacy & Security, then tap Camera, Microphone, Location Services or Contacts to see which apps have each.
- Android: search Settings for Permission manager, then tap a permission to see which apps have it.

The question to ask
If you cannot say why an app needs your camera, microphone, contacts or location to do its actual job, turn it off.
A torch app does not need to know where you are.
If a feature you use stops working, turn that permission back on in the same place.

Location especially
Change location from always to only while you are using the app. Very few apps need it when you are not using them.

Test it
Your phone can show which apps used your camera, microphone or location recently.
- iPhone: search Settings for App Privacy Report and turn it on. It records only from then on, and shows the last 7 days.
- Android: search Settings for Privacy dashboard, where your phone has one.
