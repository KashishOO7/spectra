---
id: recovery-locked-out-001
schema_version: 1.0.0
version: 1.1.0
title: If you are locked out of your own account, use the service's own recovery page
category: incident_response
subcategory: recovery
tracks:
  - general
platforms:
  - all
not_applicable_if: []
sensitive: false
difficulty:
  technical: 1
  disruption: 2
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
score_weight: 5.5
threat_model_multipliers:
  opportunistic: 1
compensating_controls: []
depends_on: []
related_items:
  - id: recovery-routes-001
    relationship: required_companion
    note: Check the accounts you can still get into, so you are not locked out of them as well.
  - id: stalkerware-check-001
    relationship: related_concept
    note: If you think someone may be watching the phone or computer you are about to use, start with that step.
status: active
superseded_by: null
last_verified: '2026-09-07'
verified_by:
  - github:@KashishOO7
sources:
  - url: https://support.google.com/accounts/answer/7682439
    title: 'Google Account Help: How to recover your Google Account or Gmail'
    type: primary
    accessed: '2026-09-27'
  - url: https://support.google.com/accounts/answer/7299973
    title: 'Google Account Help: Tips to complete account recovery steps'
    type: supporting
    accessed: '2026-09-27'
  - url: https://support.apple.com/en-us/118574
    title: 'Apple Support: How to use account recovery when you can’t reset your Apple Account password'
    type: supporting
    accessed: '2026-09-27'
  - url: https://support.microsoft.com/en-us/accounts-billing/manage/reset-a-forgotten-microsoft-account-password
    title: 'Microsoft Support: Reset a forgotten Microsoft account password'
    type: supporting
    accessed: '2026-09-27'
  - url: https://www.privacyguides.org/en/basics/account-deletion/
    title: 'Privacy Guides: Account Deletion'
    type: supporting
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
  - incident_response
created_at: '2026-09-06'
created_by: github:@KashishOO7
changelog:
  - version: 1.1.0
    date: '2026-09-07'
    changes: Added the branch for a reader whose account may already be reachable by somebody they know. The research is explicit that ordinary account-change advice can be unsafe for that reader.
    author: github:@KashishOO7
  - version: 1.0.0
    date: '2026-09-06'
    changes: Initial item, and the corpus's first genuinely reactive step. Written for B3b step 5.
    author: github:@KashishOO7
---

## Why
Most lockouts have an ordinary cause: a forgotten password, a lost phone that received the codes, or an old email address or number the account still sends to. Sometimes someone else has changed the password. Either way, only the service can let you back in, and only once you prove the account is yours.
## What
Start from the service's own sign-in page and its forgot password link, and have your backup codes ready if you saved any. The service may ask questions to check it is you, and some services make you wait several days. Support staff cannot skip those checks for you, and nobody outside the service can.
## How
### all
Start here
Type the service's web address yourself, or open its app, and use the forgot password link on its sign-in page.
A search can put adverts and look-alike sites above the real page.

Use a device that is still signed in
If a phone, tablet or computer is still signed in to the account, change the password from there. Some services let a device that is already signed in do this without the full recovery process.
Otherwise, use a device, browser and place you usually sign in from, because some services trust them more.

Answer every question
The service may ask for an old password, a recovery address or a code.
Answer every question as well as you can rather than skipping it, and give the most recent password you remember.

If no message arrives
Look in the spam or junk folder first.
The code goes to the address or number the account holds, so if that is an old address or a number you no longer have, it will not reach you. Try the other addresses and numbers you have used.

Try your backup codes
If you saved backup codes, use one when the service asks for a code. Each works once and then stops, so if the first is refused it may be one you already used. Try the next.
Once you are back in, make a new set.

If none of that works
Use the account recovery form on the same sign-in page, or the service's help page for when you cannot sign in.
Some services make you wait several days, and calling support does not shorten it. Some have no phone support at all.
An account from work or school is recovered through whoever runs it there.
There is no guarantee you get the account back, and a service that cannot confirm the account is yours is right to refuse.

While you wait
Leave the account alone on your other devices, because on some services using it while you wait cancels the recovery.
Any other account whose forgot password link sends to this one is locked with it, and if someone else has this account, they can reset those too. Move each one you can still sign in to over to an address you control.
Do not pay anyone who offers to get the account back, and never give anyone your password or a code.

Afterwards
Whether you get in or not, check the other accounts you can still sign in to now: the recovery address, the number and the backup codes. The step linked below, Check that you could still get into your important accounts, goes through each one.
## By situation
### known_person_risk
If a person you know may be behind it
Somebody who took the account, or who set it up and chose its recovery address and number, may still be able to reach it, and the service's form cannot see that.
If that person could be dangerous, talk to a domestic abuse service before you try to take the account back, because some people react badly when they lose access. They can help you decide what to do first.
Use a device that person has never had, even though the service trusts your usual one more.
