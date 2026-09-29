---
id: device-updates-001
schema_version: 1.0.0
version: 1.1.0
title: Turn on automatic updates for your phone and computer
category: device_security
subcategory: updates_patching
tracks:
  - general
platforms:
  - all
not_applicable_if: []
sensitive: false
difficulty:
  technical: 1
  disruption: 1
  reversibility: 1
time_estimate:
  setup: 5min
  ongoing: negligible
maturity_level: 1
adversaries:
  - opportunistic
  - criminal_org
  - targeted_individual
  - ai_automated
attack_vectors:
  - malware
  - phishing
assets_protected:
  - local_data
  - credentials
  - devices
controls_implemented: []
score_weight: 8.5
threat_model_multipliers:
  opportunistic: 1.3
  criminal_org: 1.4
  targeted_individual: 1.2
  ai_automated: 1.2
compensating_controls: []
depends_on: []
related_items: []
status: active
superseded_by: null
last_verified: '2026-03-31'
verified_by:
  - org:cisa.gov
sources:
  - url: https://www.cisa.gov/known-exploited-vulnerabilities-catalog
    title: CISA Known Exploited Vulnerabilities Catalog
    type: primary
    accessed: '2025-01-01'
  - url: https://support.apple.com/en-us/100100
    title: Apple security releases - Apple Support
    type: supporting
    accessed: '2026-09-27'
emotional_register: null
tags:
  - free
  - set_and_forget
  - high_impact
  - quick
created_at: '2025-01-01'
created_by: github:@KashishOO7
changelog:
  - version: 1.0.0
    date: '2025-01-01'
    changes: Initial item.
    author: github:@KashishOO7
---

## Why
Some security updates fix flaws that attackers are already using, and the maker says so when it releases the update. A device that has not installed the update still has the flaw, and flaws like these are one of the ways ransomware gets onto computers.
## What
Turn on automatic updates for your phone and your computer. When an update fixes a security flaw, the maker publishes what it fixed, so from that day attackers know the flaw exists. With automatic updates on, the device installs the fix without you having to remember to.
## How
### all
Do this
Turn on automatic updates everywhere: phone, computer, browser and apps.

Where to look
- iPhone: search Settings for Software Update, tap Automatic Updates and turn on Automatically Install. The phone then installs updates overnight while it is charging and on Wi-Fi.
- Android: search Settings for Software update. Most updates install on their own. If there is a switch to download them automatically, such as Auto download over Wi-Fi, turn it on, and restart the phone when an update asks.
- Windows: updates install on their own. Open Windows Update in Settings, check that updates are not paused, and restart when it asks, because an update finishes only after the restart.
- Mac: search for Software Update, click the info button next to Automatic Updates, and turn on every option there.
- Apps: on iPhone, App Updates in the App Store settings is on unless you turned it off. On Android, set Auto-update apps in the Play Store's settings. On a Mac, turn on Automatic Updates in the App Store's settings.
- Browser: most browsers update themselves when you close them and open them again, so close yours fully now and then. If it shows an update or relaunch button, click it.
If your mobile data is limited, choose Update over Wi-Fi only in the Play Store's Auto-update apps. An iPhone installs its automatic updates over Wi-Fi.

Test it
Open the update screen and check for updates. It should say the device is up to date. If it offers an update instead, install it, then check that the automatic setting is still on.
On Android, About phone in Settings also shows the date of the last security update. If that date is old and the phone offers no update, ask its maker or your mobile network whether it still gets security updates.
