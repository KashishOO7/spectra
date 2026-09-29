---
id: data-browser-hygiene-001
schema_version: 1.0.0
version: 2.1.0
title: Stop your browser being followed from site to site
category: data_management
subcategory: data_minimization
tracks:
  - general
platforms:
  - web
not_applicable_if: []
sensitive: false
difficulty:
  technical: 1
  disruption: 2
  reversibility: 1
time_estimate:
  setup: 15min
  ongoing: negligible
maturity_level: 2
adversaries:
  - opportunistic
  - data_broker
  - criminal_org
  - ai_automated
attack_vectors:
  - metadata_analysis
  - malware
assets_protected:
  - metadata
  - behavioral_data
  - identity
controls_implemented: []
score_weight: 8.5
threat_model_multipliers:
  opportunistic: 1.2
  data_broker: 2
  criminal_org: 1.3
  targeted_individual: 1.5
  ai_automated: 1.4
compensating_controls: []
depends_on: []
related_items:
  - id: net-vpn-001
    relationship: complementary
    note: A VPN hides your traffic from the network you are on. This step stops the websites themselves following you from site to site.
status: active
superseded_by: null
last_verified: '2026-03-04'
verified_by:
  - org:privacyguides.org
  - org:eff.org
sources:
  - url: https://privacyguides.org/en/desktop-browsers/
    title: Desktop Browsers — Privacy Guides
    type: primary
    accessed: '2026-03-04'
  - url: https://ssd.eff.org/module/how-to-manage-your-digital-footprint
    title: How to Manage Your Digital Footprint — EFF Surveillance Self-Defense
    type: supporting
    accessed: '2026-03-06'
  - url: https://coveryourtracks.eff.org/learn
    title: 'EFF Cover Your Tracks: Learn'
    type: supporting
    accessed: '2026-09-27'
  - url: https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop
    title: 'Firefox Help: Enhanced Tracking Protection in Firefox for desktop'
    type: supporting
    accessed: '2026-09-27'
emotional_register: null
tags:
  - privacy_preserving
  - anti_tracking
created_at: '2026-02-25'
created_by: github:KashishOO7
changelog:
  - version: 2.0.0
    date: '2026-03-04'
    changes: Tiered browser recommendations. Prioritized Firefox+uBlock and Mullvad Browser.
    author: github:KashishOO7
lookups:
  - lookup-choosing-a-tool-001
---

## Why
When you open a website, its advertising code and hidden trackers can make your browser contact dozens of other companies, and each one learns something about you, such as your settings and your time zone. Those companies link your visits into a profile, using cookies or browser fingerprinting, which recognises your browser by its settings even without cookies.
## What
Your browser can block the trackers that tell other companies which sites you visit. How much a browser blocks by default differs from one to another, and most let you turn that protection up. A content blocker added to the browser blocks many trackers on top of that. To choose a browser or a blocker, see the guides.
## How
### all
Do this
Turn your browser's tracking protection up to its strictest setting, then add a content blocker.

Where to look
Open the browser's settings and look under Privacy. Browsers call it tracking protection, tracking prevention, prevent cross-site tracking, or blocking third-party cookies. Choose the strictest setting offered.

Adding a content blocker
A content blocker is a small add-on you install into the browser itself, from the browser's own add-ons or extensions page. On a computer, open the browser's menu and look for Extensions or Add-ons. On a phone, only some browsers allow add-ons at all.
The guide below lists recommended ones. Install one, not several, since they do the same job.

If a site breaks
Turn protection down for that one site rather than switching it off everywhere.

Test it
Run Cover Your Tracks at coveryourtracks.eff.org.
Cover Your Tracks is free, needs no account, and is run by the Electronic Frontier Foundation.
The test tells you whether trackers are being blocked and how easy your browser is to recognise.
## Where
### res-guide-browser-extensions-001
lists recommended content blockers.
