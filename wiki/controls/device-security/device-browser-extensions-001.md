---
id: device-browser-extensions-001
schema_version: 1.0.0
version: 1.0.0
title: Remove the browser extensions you do not need
category: device_security
subcategory: malware_protection
tracks:
  - general
platforms:
  - all
not_applicable_if: []
sensitive: false
difficulty:
  technical: 1
  disruption: 1
  reversibility: 2
time_estimate:
  setup: 15min
  ongoing: low
maturity_level: 2
adversaries:
  - opportunistic
  - data_broker
attack_vectors:
  - malware
assets_protected:
  - behavioral_data
  - devices
controls_implemented: []
score_weight: 5.5
threat_model_multipliers:
  opportunistic: 1.2
  data_broker: 1.3
multiplier_reasons:
  opportunistic: 'Harmful extensions are offered to everyone in the same stores as honest ones, so anyone can install one by mistake.'
  data_broker: 'Companies that build profiles of people want to know which websites you visit, and an extension that can read every page sees exactly that, so this step counts a little more against those companies.'
compensating_controls: []
depends_on: []
related_items:
  - id: data-browser-hygiene-001
    relationship: complementary
    note: Your browser's tracking protection and a content blocker block many of the trackers on websites, and the content blocker is one extension worth keeping.
status: active
superseded_by: null
last_verified: '2026-10-19'
verified_by:
  - org:mozilla.org
  - org:google.com
  - org:apple.com
sources:
  - url: https://support.mozilla.org/en-US/kb/tips-assessing-safety-extension
    title: Tips for assessing the safety of an extension | Mozilla Support
    type: primary
    accessed: '2026-10-19'
  - url: https://support.google.com/chrome_webstore/answer/186213?hl=en
    title: Permissions requested by apps and extensions - Chrome Web Store Help
    type: primary
    accessed: '2026-10-19'
  - url: https://support.google.com/chrome_webstore/answer/2664769?hl=en
    title: Install and manage extensions - Chrome Web Store Help
    type: primary
    accessed: '2026-10-19'
  - url: https://support.apple.com/guide/iphone/get-extensions-iphab0432bf6/ios
    title: Get extensions to customize Safari on iPhone - Apple Support
    type: supporting
    accessed: '2026-10-19'
  - url: https://support.apple.com/guide/safari/get-extensions-sfri32508/mac
    title: Get extensions to customize Safari on Mac - Apple Support
    type: supporting
    accessed: '2026-10-19'
tags:
  - privacy
  - free
  - no_tools_required
created_at: '2026-10-19'
created_by: github:KashishOO7
changelog:
  - version: 1.1.0
    date: '2026-10-21'
    changes: Rewritten so each block opens on the reader's situation, then what to do, then an example.
    author: github:@KashishOO7
  - version: 1.0.0
    date: '2026-10-19'
    changes: Initial item, row 7 batch B (NEXT §15.6 item 14), from Mozilla's and Google's extension help and Apple's Safari guides; written against data-browser-hygiene-001.
    author: github:KashishOO7
---

## Why
A browser extension is a small add-on that gives your browser a new feature, such as blocking ads or checking your spelling. Many ask for permission to read and change everything on the websites you visit, which includes your bank and your email when you open them. Say a free extension for saving coupons asks to read every website you open: it can then read your bank's page too. Most extensions are made by honest developers, but a few are made to collect what you do in the browser, and the browser's extension store does not catch every one. So keep only the extensions you use and trust.
## What
A browser extension can read the pages you open, and a few collect what you do. So keep only the extensions you use and trust, and only the permissions they need: the fewer extensions that can read your pages, the fewer companies can see them. To add a content blocker against tracking, see the step linked below.
## How
### all
Do this
Open your browser's list of extensions, remove the ones you do not use, and check what each of the others is allowed to see.

Where to look
On a computer, open the browser's menu and look for Extensions or Add-ons. The list lets you turn each extension off or remove it. In Safari on a Mac, the list is in Safari's settings, under Extensions.
On an iPhone or iPad, Safari extensions come as apps. You can turn each one off in the Settings app, in Safari's settings, under Extensions, and you remove one by deleting its app.
On an Android phone, some browsers allow extensions and many do not. If yours does, they are in its menu, as on a computer.

Which ones to keep
Keep an extension only if you use it and trust whoever made it.
Check that what it asks for fits what it does. If an extension asks for your location, for example, its description should say which of its features uses your location.
Some extensions need to read every page to work, such as a password manager or a content blocker. Keep the ones you chose on purpose, and remove any other extension with this access unless its feature clearly needs it.
Some browsers also let you allow an extension only on the websites you pick, or only when you click or tap it.

When you add one
Install a new extension only from your browser's own extension store, and read what it asks to see before you agree. Check how many people use it and what they say about it.
If an extension asks for new permissions when it updates and you cannot see why it needs them, remove it.

What stops working
Removing an extension removes its feature and the settings saved in it. If you are not sure you need one, turn it off first instead: you can turn it back on from the browser's list of extensions.
