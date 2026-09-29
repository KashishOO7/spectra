---
id: recovery-email-first-001
schema_version: 1.0.0
version: 1.1.0
title: Give your main email address the strongest protection you have
category: account_security
subcategory: recovery
tracks:
  - general
platforms:
  - all
not_applicable_if: []
sensitive: false
difficulty:
  technical: 2
  disruption: 1
  reversibility: 1
time_estimate:
  setup: 30min
  ongoing: negligible
maturity_level: 1
adversaries:
  - opportunistic
  - criminal_org
attack_vectors: []
assets_protected:
  - account_access
  - credentials
  - cloud_data
controls_implemented: []
score_weight: 7.5
threat_model_multipliers:
  opportunistic: 1
  criminal_org: 1
compensating_controls: []
depends_on: []
related_items:
  - id: auth-password-manager-001
    relationship: required_companion
    note: A unique password for this address is the point, and remembering a unique one is what a password manager is for.
  - id: recovery-routes-001
    relationship: required_companion
    note: That step checks the route into each account. This one is about the single address most of those routes run through.
  - id: stalkerware-check-001
    relationship: related_concept
    note: Written for the reader who thinks somebody else may already be watching the device they are about to change things on. Start there if that is you.
status: active
superseded_by: null
last_verified: '2026-09-07'
verified_by:
  - github:@KashishOO7
sources:
  - url: https://www.privacyguides.org/articles/2025/11/15/email-security/
    title: 'Privacy Guides: Email Security, Where We Are and What the Future Holds'
    type: primary
    accessed: '2026-09-06'
  - url: https://ssd.eff.org/module/how-enable-two-factor-authentication
    title: 'Surveillance Self-Defense: How to Enable Two-factor Authentication'
    type: supporting
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
Most accounts let you reset a forgotten password with a link sent to your email, and many send their sign-in codes there too. So anyone who can read your email can take over every account that uses that address.
## What
Protect the email address your other accounts send password resets to, with a password you use nowhere else and two-factor authentication. Most accounts let you reset a forgotten password through that address, and many send sign-in codes to it, so whoever can read it can get into those accounts.
## How
### all
Do this
Find the email address your other accounts send password resets to, and protect that one first.

What to do
Give it a password you use nowhere else, because a password used on another site can be tried here after a breach there.
Turn on two-factor authentication for it, if you have not.
Save its one-time recovery codes somewhere off the phone, because this is the account you can least afford to be locked out of.

Then reduce what depends on it
Where an account offers one-time recovery codes instead of email, take them. That moves the account off the address and onto something you hold. Keep them with your other backup codes, because they are then your only way back in.
You will not be able to do this everywhere, and that is fine. Doing it for the two or three accounts you would most hate to lose is most of the benefit.

A note on old addresses
An old address that accounts still reset through is only as safe as that old email account, and you will not see a reset someone else asks for. Move those accounts to an address you read, or start reading the old one.


Test it
List the accounts you would hate to lose. For each, ask where a reset message would land. If the answer is the same address every time, you have found the one this step is about.
## By situation
### known_person_risk
Before you change anything
A password change and a new second step both change what somebody with existing access can reach. If that somebody is a person you know, think through how they might respond first, and plan for it rather than doing it tonight.
A domestic abuse service handles this every day and will help you decide the order.
If you think your accounts are being read already, make the changes from a device that person has never had access to.
