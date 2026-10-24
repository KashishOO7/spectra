---
id: home-tv-001
schema_version: 1.0.0
version: 1.0.0
title: "Turn off the setting that lets your smart TV track what you watch"
category: data_management
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
  - data_broker
attack_vectors:
  - data_broker_aggregation
assets_protected:
  - behavioral_data
controls_implemented: []
score_weight: 5.5
threat_model_multipliers:
  data_broker: 1.6
multiplier_reasons:
  data_broker: 'A record of what a household watches is used to target ads and can be combined with data bought from other companies, so this step counts more where data is collected and sold.'
compensating_controls: []
depends_on: []
related_items:
  - id: data-browser-hygiene-001
    relationship: related_concept
    note: The linked step cuts down the tracking that follows you from website to website.
status: active
superseded_by: null
last_verified: '2026-10-19'
verified_by:
  - org:ftc.gov
  - org:consumerreports.org
sources:
  - url: https://consumer.ftc.gov/articles/securing-your-internet-connected-devices-home
    title: "Securing Your Internet-Connected Devices at Home | Consumer Advice"
    type: primary
    accessed: '2026-10-19'
  - url: https://www.consumerreports.org/electronics/privacy/how-to-turn-off-smart-tv-snooping-features-a4840102036/
    title: "How to Turn Off Smart TV Snooping Features - Consumer Reports"
    type: supporting
    accessed: '2026-10-19'
emotional_register: null
tags:
  - free
  - no_tools_required
  - privacy
created_at: '2026-10-19'
created_by: github:KashishOO7
changelog:
  - version: 1.1.0
    date: '2026-10-21'
    changes: Rewritten so each block opens on the reader's situation, then what to do, then an example.
    author: github:@KashishOO7
  - version: 1.0.0
    date: '2026-10-19'
    changes: Initial item, row 7 batch E (NEXT §15.6 item 19), in the Smart home chapter.
    author: github:KashishOO7
---

## Why
Many smart TVs use automatic content recognition, which identifies what is on the screen, whether it comes from cable, an aerial, a streaming app or a disc, and keeps a record of what you watch. Say you watch a film from a streaming app on your smart TV: the TV identifies it and adds it to the record. The TV's maker or its partners can use that record to recommend shows and to target ads at you and your family, and it is not always easy to see or delete later.

## What
A smart TV can identify everything on its screen and keep a record of what you watch. So turn off automatic content recognition in your TV's settings. You cannot stop a smart TV collecting every kind of data while it is online, but this is the feature that tries to identify everything you watch.

## How
### all
Do this
Open your TV's settings and look under privacy, or in the list of terms and agreements you accepted when you set up the TV.

Its name on your TV
Each make of TV names automatic content recognition differently, for example Viewing Information, Viewing Data or Use info from TV inputs. Turn it off, or withdraw your agreement to it in the list of terms.

While you are there
- Turn off personalised or interest-based ads, and reset the advertising ID. You still see ads, but they are less tied to what you watch.
- Turn off the voice features if you do not use them, because what you say into the remote or the TV's microphone can be recorded.
- Remove the apps you do not use, where the TV lets you, because apps on it can collect data even if you never sign in to them.

If you watch through a box or stick
If you watch everything through a streaming box, stick or games console plugged into the TV, you can remove your Wi-Fi network in the TV's network settings and leave its network cable unplugged. It then sends nothing while it stays offline, but it also stops getting software updates, and its own apps stop working. The device you plug in has its own privacy settings to check.

After an update or a reset
A software update or a factory reset can turn automatic content recognition back on, so check the setting again after either.
