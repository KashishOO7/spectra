---
id: location-tracker-alerts-001
schema_version: 1.0.0
version: 1.0.0
title: Check that your phone alerts you to an unknown tracker moving with you
category: physical_security
subcategory: device_physical
tracks:
  - general
platforms:
  - all
not_applicable_if: []
sensitive: true
difficulty:
  technical: 1
  disruption: 1
  reversibility: 1
maturity_level: 1
adversaries:
  - intimate_partner
  - targeted_individual
attack_vectors: []
assets_protected:
  - location
controls_implemented: []
score_weight: 7
threat_model_multipliers:
  intimate_partner: 2
  targeted_individual: 1.6
compensating_controls: []
depends_on: []
related_items:
  - id: stalkerware-check-001
    relationship: complementary
    note: If someone may also have got into your phone itself, this step says how to check it safely.
  - id: location-exposure-001
    relationship: complementary
    note: Apps and accounts can share where you are as well, and this step says how to check who can see it.
status: active
superseded_by: null
last_verified: '2026-09-29'
verified_by:
  - org:apple.com
  - org:google.com
sources:
  - url: https://support.apple.com/en-us/119874
    title: What to do if you get an alert that an AirTag, set of AirPods, Find My network accessory, or compatible Bluetooth location-tracking device is with you - Apple Support
    type: primary
    accessed: '2026-09-29'
  - url: https://support.google.com/android/answer/13658562?hl=en
    title: Find unknown trackers - Android Help
    type: primary
    accessed: '2026-09-29'
  - url: https://www.techsafety.org/resources-survivors/technology-safety-plan
    title: Technology Safety Plan — Safety Net Project
    type: supporting
    accessed: '2026-09-29'
emotional_register: null
tags:
  - free
  - no_tools_required
created_at: '2026-09-29'
created_by: github:KashishOO7
changelog:
  - version: 1.0.0
    date: '2026-09-29'
    changes: Initial item, phase 7 of NEXT §15.4 (§15.6 item 6), from Apple's and Google's unknown tracker pages and the Safety Net Project's technology safety plan.
    author: github:KashishOO7
---

## Why
A Bluetooth tracker is a small tag, such as an AirTag, that people attach to their keys or bag so their phone can show where it is. Hidden in someone else's bag, coat or car, the same tag shows its owner where that person goes. iPhones and Android phones can alert you when a tracker that is away from its owner keeps moving with you, and the alerts work between the two kinds of phone.
## What
Check that your phone alerts you when an unknown Bluetooth tracker is moving with you. If an alert arrives, find the tracker before you decide what to do with it, and if you think someone you know put it there, talk to the police, a domestic abuse service or someone you trust before you turn it off.
## How
### all
Before you start
If you think you are in danger now, go to a safe public place and contact the police.

Do this
- iPhone: search Settings for Tracking Notifications and check that Allow Notifications is on. Bluetooth and Location Services need to be on too, and Airplane Mode off.
- Android: the alerts are on unless someone turned them off. Search Settings for Unknown tracker alerts to check, and tap Scan now to look for a tracker near you at any time.

What an alert does and does not tell you
The alerts cover only trackers made to work with them, and one arrives only after a tracker has moved with you for a while. No alert is not proof that nothing is there.
An alert is not proof that someone is following you either. It can come from something you borrowed, or from a tracker carried by someone you are travelling with.
Turning off Bluetooth or location on your phone, or turning on Airplane Mode, does not stop the tracker sharing where it is.

When an alert arrives
Tap the alert to open a map of where the tracker has been with you.
Tap Play sound to make the tracker ring, then follow the sound. On Android, playing the sound does not tell the owner.
If the tracker does not ring, search your things: jacket pockets, the outer pockets of a bag, and your car.
On iPhone, the Find My app lists every tracker you were alerted about: open Items and scroll to the bottom.

If you find the tracker
Before you turn the tracker off, take a screenshot of what your phone shows about it.
With an AirTag, hold the top of your iPhone, or of an Android phone that has NFC, near the AirTag's white side. A page opens with its serial number and the last four digits of the phone number of the person who registered it.
To turn the tracker off, follow the steps your phone shows: Instructions to Disable on iPhone, Next steps on Android. Its owner then stops seeing where it is now, but may still see the last place it was.

If you think someone you know put it there
Once the tracker is off, that person stops seeing where you are, and they may notice. Some people become more dangerous when they feel they have lost that kind of access.
Talk to the police, a domestic abuse service or someone you trust before you turn it off. They can help you decide what to do and in what order. Keep the tracker and its serial number for the police. With an AirTag, they can ask the company that made it for information about it.
