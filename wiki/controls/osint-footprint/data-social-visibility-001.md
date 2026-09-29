---
id: data-social-visibility-001
schema_version: 1.0.0
version: 1.1.0
title: Set your social media accounts so only people you choose can see them
category: osint_footprint
subcategory: social_media_exposure
tracks:
  - general
  - known_person_risk
  - public_work
platforms:
  - web
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
  - targeted_individual
  - data_broker
  - intimate_partner
  - opportunistic
  - ai_automated
  - employer
attack_vectors:
  - osint_passive
  - social_engineering
  - data_broker_aggregation
  - spear_phishing
assets_protected:
  - relationships
  - location
  - reputation
  - identity
  - behavioral_data
controls_implemented: []
score_weight: 7.5
threat_model_multipliers:
  targeted_individual: 1.8
  data_broker: 1.6
  intimate_partner: 1.8
  opportunistic: 1
  ai_automated: 1.5
  employer: 1.4
compensating_controls: []
depends_on: []
related_items:
  - id: osint-self-001
    relationship: required_companion
    note: Look yourself up first to see what is already out there, then change the settings for what you find.
  - id: data-ecosystem-audit-001
    relationship: complementary
    note: That step covers what the company collects about you. This one covers what other people can see.
  - id: data-permissions-001
    relationship: complementary
    note: That step controls what apps can reach on your phone. This one controls what your profiles show to other people.
status: active
superseded_by: null
last_verified: '2026-08-26'
verified_by:
  - org:eff.org
sources:
  - url: https://ssd.eff.org/module/protecting-yourself-social-networks
    title: Protecting Yourself on Social Networks — EFF SSD
    type: primary
    accessed: '2026-08-26'
emotional_register: null
tags:
  - free
  - high_impact
  - quick_win
  - anti_doxxing
  - anti_stalking
created_at: '2026-04-01'
created_by: github:@KashishOO7
changelog:
  - version: 1.0.0
    date: '2026-04-01'
    changes: Initial item.
    author: github:@KashishOO7
lookups:
  - lookup-account-settings-001
---

## Why
Anything on a public profile can be seen by anyone, including someone trying to find you or to pretend to be you. Your photos, your friend list and where you say you work or live can each tell a stranger where you are or who to contact.
## What
Change the settings on each social media account so your posts, photos and friend list are seen only by people you approve, and so strangers cannot find you by your phone number or email address. Many apps have a privacy check-up that goes through these settings one by one.
## How
### all
Do this
Set your social accounts so only people you approve can see you.

What to change
Who can see you: your profile, your follower list, your posts and stories. Set each to approved contacts, not public.
Who can find you: turn off being found by phone number or email, and turn off search engine listing.
Who can contact you: limit messages and comments to people you follow.
Where you are: turn off adding your location to posts.
Then turn off the app's access to your contacts in your phone's settings, so it stops uploading your address book.

If you need to be found
If you use an account for work or so people can find you, keep that one public and keep your personal accounts private.

Test it
Open your profile's web address in a private browser window, where you are not signed in. What you can see there is what a stranger sees.
