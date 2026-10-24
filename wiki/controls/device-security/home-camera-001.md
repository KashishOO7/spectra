---
id: home-camera-001
schema_version: 1.0.0
version: 1.0.0
title: "Check who can watch your smart cameras and video doorbell"
category: device_security
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
  - opportunistic
attack_vectors:
  - credential_stuffing
  - insider_access
assets_protected:
  - devices
  - location
controls_implemented: []
score_weight: 6
threat_model_multipliers:
  intimate_partner: 1.8
  targeted_individual: 1.3
multiplier_reasons:
  intimate_partner: 'A partner or former partner who was given access to the cameras can go on watching the home until the owner removes them, which the eSafety Commissioner describes as a common pattern after separation.'
  targeted_individual: 'Someone set on one person can learn from a camera when that person is at home and when they leave, so this step counts more against them.'
compensating_controls: []
depends_on: []
related_items:
  - id: location-exposure-001
    relationship: related_concept
    note: The linked step checks the other apps and accounts that can show where you are.
status: active
superseded_by: null
last_verified: '2026-10-19'
verified_by:
  - org:ftc.gov
  - org:ncsc.gov.uk
  - org:esafety.gov.au
sources:
  - url: https://consumer.ftc.gov/articles/how-secure-your-home-security-cameras
    title: "How To Secure Your Home Security Cameras | Consumer Advice"
    type: primary
    accessed: '2026-10-19'
  - url: https://www.ncsc.gov.uk/guidance/smart-security-cameras-using-them-safely-in-your-home
    title: "'Smart' security cameras: Using them safely in your home | National Cyber Security Centre"
    type: primary
    accessed: '2026-10-19'
  - url: https://www.esafety.gov.au/newsroom/blogs/from-smart-cars-to-tracking-devices-technologys-increasing-role-in-coercive-control-and-family-and-domestic-violence
    title: "From smart cars to tracking devices: Technology's increasing role in coercive control and family and domestic violence | eSafety Commissioner"
    type: supporting
    accessed: '2026-10-19'
emotional_register: null
tags:
  - free
  - no_tools_required
  - physical_security
created_at: '2026-10-19'
created_by: github:KashishOO7
changelog:
  - version: 1.0.0
    date: '2026-10-19'
    changes: Initial item, row 7 batch E (NEXT §15.6 item 9), in the Smart home chapter.
    author: github:KashishOO7
---

## Why
A smart camera or video doorbell usually sends its video through its maker's servers to an app, and anyone signed in to your account, or given access to it, can watch your home live in the app, see when you come and go, and often look back through recordings. Strangers get into camera accounts with weak or reused passwords. People you know may still have access because they were added once and never removed, such as a former partner or someone who used to live with you.

## What
Check who can see your cameras and doorbell, take away access from anyone who should not have it, and protect the account that controls them. Most camera apps let the owner give other people access, some with full control and some only to watch, and that access usually lasts until the owner removes it.

## How
### all
Before you start
If you may be in danger, talk to someone you trust before you change anything, because the person you are worried about may notice when they can no longer see the cameras.

Do this
In the camera or doorbell app, open the list of people who have access.

Where to look
The list is usually in the app's settings, under a name like shared users, members or household. If someone is on it you did not expect, take screenshots of the list and of the app's activity history first, because the history can show when they watched. Then remove anyone who should no longer see your home. Also look for the list of phones and computers signed in to your account, often under security, and sign out any that are not yours.

Protect the account
Change the password, especially if anyone else has ever known it, to one you have not used on any other website, because passwords stolen from one website are tried on others. Turn on two-factor authentication if the app offers it, and turn on automatic updates for the camera and the app.

Share less
- When you give someone access, give only what they need. Some apps let a person watch without changing any settings, or watch only at certain times.
- If you only watch the cameras at home, look for a setting that turns off viewing from outside your home. Not every camera has one, and turning it off may also stop motion alerts reaching your phone while you are out.
- Avoid pointing a camera at a bedroom or bathroom, because everyone with access sees whatever is in view.

Before you sell or give away a camera
Remove it from your account, then factory reset it, so it is no longer linked to you.
