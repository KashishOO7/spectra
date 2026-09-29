---
id: stalkerware-check-001
schema_version: 1.0.0
version: 1.1.0
title: Check your devices for hidden tracking apps
category: device_security
subcategory: malware_protection
tracks:
  - known_person_risk
platforms:
  - android
  - ios
not_applicable_if: []
sensitive: true
difficulty:
  technical: 2
  disruption: 2
  reversibility: 2
time_estimate:
  setup: 2hr
  ongoing: low
maturity_level: 2
adversaries:
  - intimate_partner
  - targeted_individual
attack_vectors:
  - malware
  - physical_access
  - insider_access
assets_protected:
  - location
  - communications
  - local_data
  - relationships
  - behavioral_data
controls_implemented: []
score_weight: 9
threat_model_multipliers:
  intimate_partner: 2
  targeted_individual: 1.5
  opportunistic: 0.1
  criminal_org: 0.2
compensating_controls: []
depends_on:
  - id: device-screenlock-001
    reason: Stalkerware is usually put on by someone who had your unlocked phone in their hands, or who knows your account password. A screen lock they cannot guess makes the first of those harder, but changing it can be noticed by whoever put stalkerware there.
    hard_dependency: false
related_items:
  - id: location-exposure-001
    relationship: required_companion
    note: Someone can also keep track of you without stalkerware, for example through location sharing you did not agree to, so check for both at the same time.
  - id: device-screenlock-001
    relationship: complementary
    note: Stalkerware is usually put on by someone who had your unlocked phone in their hands, or who knows your account password, so a screen lock they cannot guess helps only against the first of those.
status: active
superseded_by: null
last_verified: '2026-03-04'
verified_by:
  - org:eff.org
sources:
  - url: https://stopstalkerware.org/information-for-survivors/
    title: Information for Survivors — Coalition Against Stalkerware
    type: primary
    accessed: '2026-03-06'
  - url: https://stopstalkerware.org/resources/
    title: Resources — Coalition Against Stalkerware
    type: supporting
    accessed: '2026-03-04'
  - url: https://support.apple.com/guide/personal-safety/safety-check-iphone-ios-16-ips2aad835e1/web
    title: Safety Check for an iPhone with iOS 16 or later - Apple Support
    type: primary
    accessed: '2026-09-27'
  - url: https://support.google.com/accounts/answer/3067630?hl=en
    title: See devices with account access - Google Account Help
    type: primary
    accessed: '2026-09-27'
emotional_register: null
tags:
  - sensitive
  - intimate_partner_threat
  - safety_planning_required
  - high_impact
created_at: '2026-03-04'
created_by: github:KashishOO7
changelog:
  - version: 1.0.0
    date: '2026-03-04'
    changes: Initial item. Reviewed for trauma-informed framing.
    author: github:KashishOO7
---

## Why
Stalkerware lets someone else see your messages, calls, location and photos, usually with no sign on the phone. It is usually put there by someone who had your unlocked phone in their hands, or who knows your account password. It is built to stay hidden, so it is hard to find. If it is there, someone has chosen to watch you without telling you, and that can be part of wider abuse.
## What
Check your phone for an app you never put there, and for apps with more access than they need. Stalkerware hides on the phone and sends your location, messages and calls to someone else. It is usually put on by someone who had your unlocked phone in their hands.
## How
### all
Before you start
If you think you may be in danger, do not look into this on the device you suspect.
Use a friend's phone, or a computer at a library.
Whoever is watching the phone can see what you look up on it.

Do this
Look for apps you did not install, and for permissions that give an app more reach than it needs.

What to look for
Apps you do not recognise. Look at the full list, not the home screen, because anything meant to hide will not have an icon there.
- iPhone: search Settings for iPhone Storage.
- Android: search Settings for Apps, open the full list, and choose to show system apps from its menu.
On Android, any app holding accessibility permission that you did not grant. That permission is how an app reads your messages, so these tools nearly always ask for it. Search Settings for Accessibility to see which apps have it.
On Android, any app listed as a device admin app, which is how these tools resist being deleted. Search Settings for Device admin apps.
A device management profile or work profile you did not set up. On iPhone, search Settings for VPN & Device Management.
A shared account. Someone who knows your Apple or Google password can see your location, photos and messages without any app on your phone.
- iPhone: Safety Check shows who can see your location and which devices are signed in to your Apple Account. Search Settings for Safety Check, and look before you change anything.
- Google account: in your Google Account's security settings, open Your devices to see every phone and computer signed in.

Do not rush to delete it
Removing it tells whoever installed it that you know.
If that person could become dangerous, talk to a domestic abuse service before you change anything.
They handle this every day and will help you plan the order.
The same goes for stopping sharing in Safety Check or signing someone out of your account, because the other person may notice.
The Coalition Against Stalkerware lists organisations that can help: stopstalkerware.org
## Law
### global
Installing monitoring software on another person's device without their knowledge or consent is illegal in most countries.
