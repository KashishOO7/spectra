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
  ai_automated: 1
multiplier_reasons:
  opportunistic: 'Apps asking for more than they need are common for everyone.'
  targeted_individual: 'A person after you could learn where you are from an app that shares it, so a rise.'
  criminal_org: 'Harmful apps sold by groups ask for camera and microphone, so a small rise.'
  intimate_partner: 'A partner can use an app on your phone that already has location or microphone access, so removing access helps.'
  employer: 'Work apps on a personal phone can ask for more than they need.'
  isp_network: 'Your internet provider does not see app permissions, so this step does little against it.'
  data_broker: 'Apps with location access are a main source of the location data brokers buy and sell.'
  domestic_government: 'Location data from apps can be bought or requested, so a small rise.'
  foreign_government: 'No particular rise; a foreign service has better ways in.'
  ai_automated: 'Copied voices and faces come from public recordings and photos, not from app permissions, so no rise. Was 1.5 until 2026-10-19.'
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
  - version: 1.1.0
    date: '2026-10-21'
    changes: Rewritten so each block opens on the reader's situation, then what to do, then an example.
    author: github:@KashishOO7
  - version: 1.0.0
    date: '2026-02-25'
    changes: Initial item.
    author: github:KashishOO7
lookups:
  - lookup-account-settings-001
---

## Why
An app you allow to use your camera, microphone, location, contacts or photos can use them whenever that permission lets it, and some apps ask for more than they need to work. Say a torch app asks for your location and your contacts: it can use both whenever the permission lets it, though a torch needs neither. Taking back what an app does not need limits what it can collect about you.
## What
An app you allow to use your camera, microphone or location can use it whenever the permission lets it, even if it does not need it to work. So go through the apps on your phone and turn off camera, microphone, location, contacts and photo access for any app that does not need it to do its job. Your phone can also show you which apps used them recently.
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
