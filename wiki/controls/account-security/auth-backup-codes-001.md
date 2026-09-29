---
id: auth-backup-codes-001
schema_version: 1.0.0
version: 1.1.0
title: Save your backup codes somewhere you can reach them
category: account_security
subcategory: recovery
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
attack_vectors: []
assets_protected:
  - account_access
  - credentials
  - cloud_data
controls_implemented: []
score_weight: 5
threat_model_multipliers:
  opportunistic: 1
compensating_controls: []
depends_on:
  - id: auth-2fa-001
    reason: An account offers backup codes when you turn on two-factor authentication, so do that first.
    hard_dependency: true
related_items: []
status: active
superseded_by: null
last_verified: '2026-08-26'
verified_by:
  - org:privacyguides.org
sources:
  - url: https://privacyguides.org/en/basics/multi-factor-authentication/
    title: Multi-Factor Authentication — Privacy Guides
    type: primary
    accessed: '2026-08-26'
  - url: https://ssd.eff.org/module/how-enable-two-factor-authentication
    title: How to Enable Two-Factor Authentication | Surveillance Self-Defense
    type: supporting
    accessed: '2026-09-27'
  - url: https://support.google.com/accounts/answer/1187538?hl=en
    title: Sign in with backup codes - Google Account Help
    type: supporting
    accessed: '2026-09-27'
emotional_register: null
tags:
  - free
  - quick
  - recovery
created_at: '2025-01-01'
created_by: github:@KashishOO7
changelog:
  - version: 1.0.0
    date: '2025-01-01'
    changes: Initial item.
    author: github:@KashishOO7
---

## Why
If the phone that makes your codes is lost or broken, two-factor authentication can lock you out of your own accounts, and some accounts have no other way back in. Backup codes are the way in that does not need that phone.
## What
Save your backup codes where you can reach them without your phone. They are one-time codes an account gives you when you turn on two-factor authentication, and each one lets you sign in once in place of the code from your phone. If that phone is lost or broken, they are how you sign in again.
## How
### all
Do this
Save the backup codes for your important accounts where you can reach them without your phone.

Where to find them
In the security settings of any account with two-factor authentication, look for backup codes or recovery codes. Not every account offers them.

How they work
You get a list of them, and each code works once. Cross one off as you use it.
When you are down to the last one or two, go back to that same screen and generate a fresh list. That cancels the old list, so replace whatever you had saved.
No one who calls or messages you ever needs a backup code. Type one only on the account's own sign-in page.

Where to put them
Keep the codes for your email and your password manager on paper, with your important documents, because you need those two to get into everything else.
Codes for your other accounts can go in your password manager's notes.
Do not keep them in your email, or in a note on the phone that makes your codes: losing that phone or that inbox is when you need them.

Test it
Imagine your phone is gone right now. Could you still get into your email? If not, print your email's backup codes now.
