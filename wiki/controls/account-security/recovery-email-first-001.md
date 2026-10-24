---
id: recovery-email-first-001
schema_version: 1.0.0
version: 1.1.0
title: Protect your main email address
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
multiplier_reasons:
  opportunistic: 'Email resets most other accounts, so it matters for everyone about equally.'
  criminal_org: 'Whoever gets the email gets the resets, whoever they are, so no rise.'
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
  - version: 1.2.0
    date: '2026-10-21'
    changes: Rewritten so each block opens on the reader's situation, then what to do, then an example.
    author: github:@KashishOO7
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
Every time you press "forgot password" on most accounts, the reset link goes to your email, and many accounts send their sign-in codes there too. So anyone who gets into your email can take over most accounts that use that address. For example, someone who gets into your email can press "forgot password" on your shopping and social media accounts, and the reset links arrive in the inbox they are already reading.
## What
If one email resets all your accounts, someone who gets into that email gets into everything. So protect that email first, with a password you use nowhere else and two-factor authentication. For example, if your bank, your shopping account and your social media all send their reset links to the same inbox, whoever gets into that inbox can reset all three.
## How
### all
Do this
Find the email address your other accounts send password resets to, and protect that one first.

What to do
Give it a password you use nowhere else, because a password used on another site can be tried here after a breach there.
Turn on two-factor authentication for it, if you have not.
Save its one-time recovery codes somewhere off the phone, because this is the account you can least afford to be locked out of.

A second way back in
If one email resets all your accounts, someone who gets into that email gets into everything. So make fewer accounts depend on it, starting with the accounts you would most hate to lose. For example, if your bank account offers printed recovery codes, print the list and keep it with your other backup codes: then you can get back in with a code, and the bank no longer relies on your email.
You will not be able to do this everywhere, and that is fine. Doing it for the two or three accounts you would most hate to lose is most of the benefit.

A note on old addresses
Say your shopping account still resets through an old email you never open. If someone breaks into that old email, they can reset the shopping account, and you will never see the reset message. So move the account to an email you read, or start checking the old one.


Test it
Pick an account you would hate to lose, press forgot password on its sign-in page, and see which inbox the reset message arrives in. Do the same for each other account you would hate to lose. If it is the same address every time, that is the address to protect first.
## By situation
### known_person_risk
Before you change anything
A password change and a new second step both change what somebody with existing access can reach. If that somebody is a person you know, think through how they might respond first, and plan for it rather than doing it tonight.
A domestic abuse service handles this every day and will help you decide the order.
If you think someone can already see your email or other accounts, make these password and sign-in changes from a device they have never had access to.
