---
id: home-car-001
schema_version: 1.0.0
version: 1.0.0
title: "Check who can track your car or unlock it through its app"
category: physical_security
subcategory: smart_home
tracks:
  - general
platforms:
  - iot
not_applicable_if: []
sensitive: false
difficulty:
  technical: 2
  disruption: 1
  reversibility: 1
time_estimate:
  setup: 15min
  ongoing: low
maturity_level: 1
adversaries:
  - intimate_partner
  - targeted_individual
attack_vectors:
  - credential_stuffing
  - insider_access
assets_protected:
  - location
  - credentials
controls_implemented: []
score_weight: 6.5
threat_model_multipliers:
  intimate_partner: 2
  targeted_individual: 1.4
multiplier_reasons:
  intimate_partner: 'Family and domestic violence workers report partners and former partners using car apps to track where someone drives and to unlock or start the car, so this step counts most against them.'
  targeted_individual: 'Someone set on following one person can use the trip history and live location of a car they can sign in to, so this step counts more against them.'
compensating_controls: []
depends_on: []
related_items:
  - id: location-exposure-001
    relationship: complementary
    note: The linked step checks what else can show where you are, such as your phone and its apps.
status: active
superseded_by: null
last_verified: '2026-10-19'
verified_by:
  - org:esafety.gov.au
  - org:ncsc.gov.uk
sources:
  - url: https://www.esafety.gov.au/newsroom/blogs/from-smart-cars-to-tracking-devices-technologys-increasing-role-in-coercive-control-and-family-and-domestic-violence
    title: "From smart cars to tracking devices: Technology's increasing role in coercive control and family and domestic violence | eSafety Commissioner"
    type: primary
    accessed: '2026-10-19'
  - url: https://www.ncsc.gov.uk/guidance/smart-devices-in-the-home
    title: "Smart devices: using them safely in your home | National Cyber Security Centre"
    type: supporting
    accessed: '2026-10-19'
emotional_register: null
tags:
  - free
  - no_tools_required
  - location_privacy
created_at: '2026-10-19'
created_by: github:KashishOO7
changelog:
  - version: 1.0.0
    date: '2026-10-19'
    changes: Initial item, row 7 batch E (NEXT §15.6 item 20), in the Smart home chapter.
    author: github:KashishOO7
---

## Why
Many cars connect to the car maker's app, which can show where the car is, list its past trips, and lock, unlock or start it from a phone. Anyone signed in to the account linked to the car can see the same location and send the same commands, including a former partner, a previous owner of the car, or someone who has guessed or stolen the password.

## What
Check who has access to your car's app and account, take away access from anyone who should not have it, and protect the account. Access given to a partner, a family member or a second driver usually lasts until the owner removes it, and selling the car does not always end it.

## How
### all
Before you start
If you may be in danger, talk to someone you trust before you change anything, because the person you are worried about may notice when they can no longer see or unlock the car.

Do this
Open your car's app and find the list of drivers, users and digital keys.

Where to look
- In the app, if someone is on the list you did not expect, take screenshots of the list first, and of the app's record of remote unlocks and location checks if it has one. Then remove anyone who should no longer have access, and sign out any phones that are not yours.
- In the car, check the settings on its screen for paired phones and user profiles, and delete any that are not yours or no longer used.
- If you are not sure who has access, ask the dealer or the car maker to show you and to remove former users.

Protect the account
Change the account's password to one you use nowhere else, especially if anyone else has ever known it, and turn on two-factor authentication if the app offers it.

Location and trips
Look for the settings for location sharing, trip history and alerts, such as a notice when the car leaves an area, and turn off what you do not use. Turning off location also stops the app from finding the car if it is stolen.

Buying or selling a car
When you sell a car, remove it from your account and factory reset the car's built-in system from its screen, which deletes paired phones and saved places. When you buy a used one, check in the app that you are the only owner, and ask the seller or dealer to remove the previous owner if you are not.
