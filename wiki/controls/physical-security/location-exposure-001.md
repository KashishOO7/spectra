---
id: location-exposure-001
schema_version: 1.0.0
version: 1.2.0
title: Check every app and account that can see where you are
category: physical_security
subcategory: device_physical
tracks:
  - known_person_risk
  - general
platforms:
  - ios
  - android
not_applicable_if: []
sensitive: true
difficulty:
  technical: 1
  disruption: 2
  reversibility: 1
time_estimate:
  setup: 30min
  ongoing: low
maturity_level: 1
adversaries:
  - intimate_partner
  - targeted_individual
attack_vectors:
  - physical_access
  - insider_access
  - osint_passive
assets_protected:
  - location
  - behavioral_data
  - relationships
controls_implemented: []
score_weight: 8.5
threat_model_multipliers:
  intimate_partner: 2
  targeted_individual: 1.6
  opportunistic: 0.2
  data_broker: 0.5
compensating_controls: []
depends_on: []
related_items:
  - id: stalkerware-check-001
    relationship: required_companion
    note: Stalkerware and hidden location sharing can both be used to watch you, so check for both at the same time.
  - id: data-permissions-001
    relationship: complementary
    note: That step covers every app permission, not only location.
status: active
superseded_by: null
last_verified: '2026-03-04'
verified_by:
  - org:eff.org
sources:
  - url: https://www.techsafety.org/resources-survivors
    title: Technology Safety Resources for Survivors — NNEDV TechSafety
    type: primary
    accessed: '2026-03-06'
  - url: https://support.apple.com/guide/personal-safety/safety-check-iphone-ios-16-ips2aad835e1/web
    title: 'Safety Check for an iPhone with iOS 16 or later - Apple Support'
    type: primary
    accessed: '2026-09-27'
  - url: https://support.apple.com/guide/personal-safety/checklist-2-manage-location-information-ips3dbc70436/1.0/web/1.0
    title: 'Checklist 2: Manage location information - Apple Support'
    type: primary
    accessed: '2026-09-27'
  - url: https://support.google.com/accounts/answer/9363497?hl=en
    title: 'Manage your Location Sharing settings - Google Account Help'
    type: primary
    accessed: '2026-09-27'
  - url: https://support.google.com/maps/answer/6258979?hl=en
    title: 'Manage your Google Maps Timeline - Google Maps Help'
    type: primary
    accessed: '2026-09-27'
  - url: https://support.google.com/accounts/answer/3067630?hl=en
    title: 'See devices with account access - Google Account Help'
    type: primary
    accessed: '2026-09-27'
emotional_register: null
tags:
  - free
  - sensitive
  - intimate_partner_threat
  - safety_planning_required
  - location_privacy
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
Your location can reach someone else through a shared account, a family locator app, or sharing you agreed to once and never turned off. That sharing keeps running after trust between you ends, until someone turns it off. You cannot control who can find you until you know what is sharing it.
## What
Go through every app and account that can report where you are, and switch off the sharing you did not intend. Chat apps, social apps, photo apps and the account your phone signs in with can all share a location, sometimes all the time. Between people who trust each other this is useful. When that trust ends, the sharing does not end with it.
## How
### all
Before you start
If you may be in danger, do not do this on a device that might be watched.

Do this
Check the five places that share your location, in your phone settings and your accounts, and switch off anything you did not choose.

Five places to check
- People you share with. iPhone: Safety Check lists everyone who can see your location. Search Settings for Safety Check, and look before you change anything. Google: open your Google Account. Location Sharing is under People & sharing, and it covers Maps, Messages and Find Hub.
- Apps with location permission. Set games and shopping apps to Never, and the rest to While using the app. iPhone: search Settings for Location Services. Android: search Settings for App location permissions.
- Location history, which is separate from sharing. A maps app can keep a record of the places you have been, often called Timeline or location history. Search the maps app's settings for Timeline to turn it off and delete it. Deleting it also deletes your own record of where you have been.
- Photos you send. A photo can carry the place it was taken, and the person you send it to may be able to read it. To stop that, set your camera app's location permission to Never.
- Devices signed in to your account. Safety Check on iPhone, or Your devices in your Google Account's security settings, shows every one. Remove anything you do not recognise or no longer use.

The one people miss
A shared account shares your location with no app installed at all.
If someone else knows your account password, none of the settings above will stop them.
If it is safe to, change that password and turn on two-factor authentication.
## By situation
### known_person_risk
Before you switch this off
Turning off location sharing is visible to whoever was receiving it, and for some readers that is the dangerous part rather than a side effect.
If the person who may react is someone close to you, make a safety plan before you change anything. A domestic abuse service will help you decide the order.
The Coalition Against Stalkerware lists services that can help: stopstalkerware.org/resources/
