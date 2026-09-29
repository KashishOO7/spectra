---
id: guardian-location-001
schema_version: 1.0.0
version: 1.1.0
title: Review which apps can see your child's location
category: physical_security
subcategory: surveillance_awareness
tracks:
  - caring_for_someone
platforms:
  - android
  - ios
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
  - targeted_individual
attack_vectors:
  - osint_passive
  - malware
assets_protected:
  - location
  - relationships
controls_implemented: []
score_weight: 6.5
threat_model_multipliers:
  opportunistic: 1
  targeted_individual: 1.6
  intimate_partner: 1.4
compensating_controls: []
depends_on: []
related_items:
  - id: guardian-oversharing-001
    relationship: related_concept
    note: A child's location is one of the most sensitive things they can share. That step covers the wider habit of what to leave out of posts.
  - id: location-exposure-001
    relationship: related_concept
    note: The same checks, for your own phone.
  - id: data-permissions-001
    relationship: related_concept
    note: That step covers every app permission, not only location.
status: active
superseded_by: null
last_verified: '2026-03-01'
verified_by:
  - org:eff.org
sources:
  - url: https://www.eff.org/issues/privacy
    title: EFF — Privacy Issues
    type: primary
    accessed: '2026-03-01'
  - url: https://support.apple.com/guide/iphone/control-the-location-information-you-share-iph3dd5f9be/ios
    title: 'Control the location information you share on iPhone - Apple Support'
    type: primary
    accessed: '2026-09-27'
  - url: https://support.google.com/android/answer/6179507?hl=en
    title: 'Manage location permissions for apps - Android Help'
    type: primary
    accessed: '2026-09-27'
  - url: https://support.apple.com/en-us/105121
    title: "Set up parental controls to manage your child's iPhone or iPad - Apple Support"
    type: primary
    accessed: '2026-09-27'
  - url: https://support.google.com/accounts/answer/9363497?hl=en
    title: 'Manage your Location Sharing settings - Google Account Help'
    type: primary
    accessed: '2026-09-27'
emotional_register: null
tags:
  - free
  - no_account_needed
  - guardian_action
  - kids_safe
  - high_impact_low_effort
created_at: '2026-03-04'
created_by: github:@KashishOO7
changelog:
  - version: 1.0.0
    date: '2026-03-04'
    changes: Initial item creation.
    author: github:@KashishOO7
lookups:
  - lookup-account-settings-001
---

## Why
Location shared in a game or app can tell a stranger where a child lives, goes to school or spends time. A child will rarely notice that it is being shared, so an adult has to check.

## What
Go through the apps on your child's phone and see which ones know where they are. Some games and chat apps can show a player's location to other people. Sit down together, read the list, and turn off what does not need it.
## How
### all
Do this
Check which apps can see where your child is. Turn off the ones that do not need it.

What to change
Set games and social apps to Never. Set the few that need it, like maps, to While using the app. Where an app does not need an exact place, turn off precise location.
- iPhone: search Settings for Location Services, tap each app, and turn off Precise Location where it is not needed.
- Android: search Settings for App location permissions, tap each app, and turn off Use precise location where it is not needed.
On iPhone, Screen Time also has parental controls for the apps your child can use. Search Settings for Screen Time.

Also check
Family and find-my-device features share location between accounts. They are easy to set up once and forget.
Check who is on that list and whether it is still who you expect. On Android, open your Google Account. Location Sharing is under People & sharing.
Sharing your child's location with you in a family feature is not what this step is about, when your child knows it is on.

Test it
Open your child's location settings and look for anything set to Always, or Allow all the time on Android. That is the list worth going through.
