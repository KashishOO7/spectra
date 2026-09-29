---
id: physical-travel-001
schema_version: 1.0.0
version: 2.1.0
title: Prepare devices before crossing international borders
category: physical_security
subcategory: travel_security
tracks:
  - general
  - public_work
platforms:
  - all
not_applicable_if: []
sensitive: false
difficulty:
  technical: 1
  disruption: 3
  reversibility: 1
time_estimate:
  setup: 30min
  ongoing: negligible
maturity_level: 2
adversaries:
  - domestic_government
  - foreign_government
  - targeted_individual
attack_vectors:
  - physical_access
assets_protected:
  - local_data
  - communications
  - credentials
controls_implemented: []
score_weight: 7.5
threat_model_multipliers:
  domestic_government: 2
  foreign_government: 2
  targeted_individual: 1.4
  intimate_partner: 1
compensating_controls: []
depends_on:
  - id: device-encrypt-001
    reason: Turning a device off helps only if it is encrypted. Without encryption, what is on it can be read with the right tools, whether it is on or off.
    hard_dependency: true
related_items:
  - id: device-screenlock-001
    relationship: required_companion
    note: How to set a strong code, and how to make the phone ask for it instead of your face or fingerprint.
status: active
superseded_by: null
last_verified: '2026-03-04'
verified_by:
  - org:eff.org
sources:
  - url: https://www.eff.org/wp/digital-privacy-us-border-2017
    title: Digital Privacy at the US Border — EFF
    type: primary
    accessed: '2026-03-04'
  - url: https://www.cbsa-asfc.gc.ca/travel-voyage/edd-ean-eng.html
    title: Examining personal digital devices at the Canadian border — CBSA
    type: supporting
    accessed: '2026-09-25'
  - url: https://ssd.eff.org/module/how-enable-two-factor-authentication
    title: How to Enable Two-Factor Authentication | Surveillance Self-Defense
    type: supporting
    accessed: '2026-09-27'
emotional_register: null
tags:
  - travel
  - legal_defense
created_at: '2026-02-25'
created_by: github:@KashishOO7
changelog:
  - version: 2.0.0
    date: '2026-03-04'
    changes: Updated with EFF's protocol for RAM clearing and biometric disabling. Removed non-taxonomy attack vector.
    author: github:@KashishOO7
---

## Why
In some countries, border officers have the power to search your phone or laptop, and some can require your password. Refusing can mean the device is kept. Encryption stops protecting what is on a device once you have unlocked it, so what protects you at a border is what you leave off the device before you travel.

## What
Before you cross a border, remove from your phone and laptop anything you would not want an officer to read, and turn them fully off. In some countries, officers at a border can look through a phone without a warrant or any reason.
## How
### all
Do this
Do all of this at home before you travel, not at the border.

Before you go
Back up at home first. Then remove from the device anything you will not need on the trip, since the backup is what makes removing it safe.
A deleted file can often still be recovered from the device with the right tools, so for anything that must not be found, leave that device at home and travel with one that never held it.
Sign out of the apps and websites you would not want read, including your password manager, so they cannot be opened from the device.
Before you sign out, check that you can sign back in during the trip without anything you are leaving at home: your password manager's password from memory, and a second step that works abroad, such as an authenticator app, because text-message codes may not arrive if your phone has no service there.

At the crossing
Turn your phone and laptop fully off shortly before you reach the border. On a laptop, shut it down, because closing the lid only puts it to sleep.
When a phone is switched back on, it asks for your code before it will accept your face or fingerprint, so it cannot be opened by holding it up to your face or pressing your finger on it.

Worth knowing
Decide before you travel what you will do if an officer asks you to unlock a device. In some countries, refusing can mean the device is kept, or you are held for longer or refused entry.
If an officer made you unlock a device or give a password, change the passwords of the accounts on it once you are through.
## Where you are
### border_device_inspection
Do this before you leave
Back up at home, then take the sensitive apps and accounts off the devices travelling with you. Put them back once you have arrived.
In some countries, officers can ask for access to a device without a warrant, and refusing can carry a penalty.

Why remove it rather than rely on the lock
A strong code and encryption protect a device only while it stays locked. If you are ordered to unlock it, or refusing is not safe for you, what is on it can be read.
What you removed before the trip is not there to be read.
### govt_monitors_traffic
Hotel and airport networks
Treat the network as watched, and assume anything not encrypted is being recorded.
Turn your VPN on as soon as you have joined the network, before you open anything else.
## Law
### global
The powers of border officers to search devices differ from country to country. This is general information, not legal advice.
