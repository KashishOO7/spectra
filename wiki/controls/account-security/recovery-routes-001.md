---
id: recovery-routes-001
schema_version: 1.0.0
version: 1.1.0
title: Check that you could still get into your important accounts
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
  setup: 30min
  ongoing: negligible
maturity_level: 1
adversaries:
  - opportunistic
attack_vectors: []
assets_protected:
  - account_access
  - credentials
controls_implemented: []
score_weight: 6.5
threat_model_multipliers:
  opportunistic: 1
compensating_controls: []
depends_on: []
related_items:
  - id: auth-backup-codes-001
    relationship: required_companion
    note: That one is about saving the codes in the first place. This one is about the whole route in, and about checking it still works months later.
  - id: recovery-email-first-001
    relationship: required_companion
    note: The address your other accounts reset through is the one that matters most, so it gets its own step.
  - id: stalkerware-check-001
    relationship: related_concept
    note: Written for the reader who thinks somebody else may already be watching the device they are about to change things on. Start there if that is you.
status: active
superseded_by: null
last_verified: '2026-09-07'
verified_by:
  - github:@KashishOO7
sources:
  - url: https://ssd.eff.org/module/how-enable-two-factor-authentication
    title: 'Surveillance Self-Defense: How to Enable Two-factor Authentication'
    type: primary
    accessed: '2026-09-06'
  - url: https://pages.nist.gov/800-63-4/sp800-63b.html
    title: NIST SP 800-63B-4, Digital Identity Guidelines, Authentication and Authenticator Management
    type: primary
    accessed: '2026-09-06'
  - url: https://www.techsafety.org/resources-survivors/technology-safety-plan
    title: 'Safety Net Project: Technology Safety Plan'
    type: supporting
    accessed: '2026-09-07'
emotional_register: null
tags:
  - free
  - recovery
  - account_security
created_at: '2026-09-06'
created_by: github:@KashishOO7
changelog:
  - version: 1.1.0
    date: '2026-09-07'
    changes: Added the branch for a reader whose account may already be reachable by somebody they know. The research is explicit that ordinary account-change advice can be unsafe for that reader.
    author: github:@KashishOO7
  - version: 1.0.0
    date: '2026-09-06'
    changes: Initial item. Written for B3b step 5, which added the harm about being locked out.
    author: github:@KashishOO7
---

## Why
Two-factor authentication makes an account harder for other people to get into, and easier for you to lose. Losing your phone, changing your number, or travelling somewhere your number does not work can each lock you out, and none of them involves anyone attacking you. Backup codes exist for exactly that, and they help only if you saved them where you can still reach them.
## What
Check that your accounts can still reach you on the address and number they hold. If you have changed your phone number or email address, an account may still hold the old one. Every account keeps a second way in for the day the normal one fails. It sends a link to an address, texts a number, or asks for a code you saved. An old address or number gives no warning when it stops working, and you find out only on the day you need it.
## How
### all
Do this
For each account you would hate to lose, open its security settings and check the way in is still true.

What to look at
The recovery address. If it is an old work address or one you closed, change it to one you read every week.
The recovery number. If you have changed number, the account is still holding the old one.
The one-time codes. Each of these works once and then stops working, so if you have used a few, generate a fresh set.

Where to keep the codes
Somewhere you can reach without the phone, because the phone is what you have lost in the situation they are for. On paper in a drawer counts. In a note on the same phone does not.

Start with one
The address your other accounts send a reset link to when you press forgot password. That one first, because the rest are reached through it.


Test it
Press forgot password on one account and see where the message arrives. If it goes somewhere you no longer read, you have found the problem before it found you.
## By situation
### known_person_risk
Before you change anything
If the person you are worried about has had your passwords, shares a plan with you, or has used your unlocked phone, then changing these settings changes what they can reach.
Think through how they might respond first, and plan for it. A domestic abuse service does this every day and will help you decide the order.
If you think someone is reading your accounts already, make the changes from a device that person has never had access to.
