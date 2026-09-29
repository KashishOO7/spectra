---
id: auth-2fa-001
schema_version: 1.0.0
version: 2.1.0
title: Enable two-factor authentication on all critical accounts
category: account_security
subcategory: authentication
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
  - targeted_individual
  - criminal_org
  - intimate_partner
  - ai_automated
attack_vectors:
  - credential_stuffing
  - phishing
  - sim_swap
assets_protected:
  - credentials
  - cloud_data
  - communications
  - financial
  - identity
controls_implemented: []
score_weight: 9.5
threat_model_multipliers:
  opportunistic: 1.2
  targeted_individual: 1.5
  criminal_org: 1.4
  intimate_partner: 1.3
  domestic_government: 1.6
  foreign_government: 1.8
  ai_automated: 1.5
compensating_controls: []
depends_on: []
related_items:
  - id: auth-backup-codes-001
    relationship: required_companion
    note: Save the backup codes an account offers when you turn on two-factor authentication.
status: active
superseded_by: null
last_verified: '2026-03-04'
verified_by:
  - org:privacyguides.org
  - org:eff.org
sources:
  - url: https://privacyguides.org/en/basics/multi-factor-authentication/
    title: Multi-Factor Authentication — Privacy Guides
    type: primary
    accessed: '2026-03-04'
  - url: https://ssd.eff.org/module/how-enable-two-factor-authentication
    title: How to Enable Two-Factor Authentication — EFF Surveillance Self-Defense
    type: supporting
    accessed: '2026-03-05'
  - url: https://owasp.org/www-community/attacks/Credential_stuffing
    title: Credential stuffing | OWASP Foundation
    type: supporting
    accessed: '2026-09-27'
  - url: https://support.google.com/accounts/answer/185839?hl=en
    title: Turn on 2-Step Verification - Google Account Help
    type: supporting
    accessed: '2026-09-27'
emotional_register: null
tags:
  - foundation
  - phishing_defense
created_at: '2026-02-25'
created_by: github:KashishOO7
changelog:
  - version: 2.0.0
    date: '2026-03-04'
    changes: Tiered recommendations (TOTP vs Hardware Keys). Added SIM-swapping warning.
    author: github:KashishOO7
---

## Why
Websites are broken into all the time, and the usernames and passwords taken from them are tried on other sites by machine to see which still work. With two-factor authentication on, a stolen password alone does not get someone into your account. SMS is the weakest second factor: it is vulnerable to SIM swap, and it depends on network coverage.
## What
Two-factor authentication asks for a second proof after your password. A stolen password on its own is then not enough. Use an authenticator app rather than SMS: the app generates codes on the device itself, works with no signal, and some can keep an encrypted copy of your codes, so you can move them to a new phone. Turn it on for your email first, because most other accounts let you reset their password through your email. To pick an app, see the guides.
## How
### all
Do this
Turn on two-factor authentication in each important account's security settings. Some sites call it two-step verification.
Start with these, in this order:
1. Your email
2. The Apple, Google or Microsoft account that backs up your files
3. Social media and messaging apps
4. Anything with money in it, and your password manager
If the account offers backup codes while you set it up, save them straight away, somewhere you can reach without your phone. They are how you get back in if you lose it.

Which kind
Use an authenticator app for the codes, not text messages.
A text code can be stolen without touching your phone. Someone tricks your mobile provider into giving them your phone number, and your texts go to them. The codes in an authenticator app stay on your phone, so they do not go with your number.
If an account offers only text messages, turn that on anyway. It still stops someone who has only your password.
Neither kind stops a fake sign-in page that asks for your code and passes it to the real site. Type a code only into a site or app you opened yourself.

Passkeys
Where an account offers a passkey, use it.
A passkey is a sign-in key your phone or computer creates for that one site and keeps on your devices. You sign in by unlocking it with your fingerprint, your face or your screen lock PIN, and on some sites it replaces both the password and the code.
A passkey is safer than a code because a fake sign-in page cannot get it. Your device offers the passkey only to the site it was made for, so you type nothing into a fake sign-in page, and it gets nothing it could use to sign in as you.
To add one, look for passkeys in the account's security settings. Keep your backup codes as well, for signing in from a device that does not have your passkey.

Sign-in prompts
Some accounts can instead send a sign-in prompt to your phone, asking whether it is you trying to sign in, with Yes and No. It comes through the account's app, not your phone number, so a SIM swap does not move it.
Tap Yes only when you have just tried to sign in yourself, because someone who has your password can set off a prompt too.

Already using an authenticator app?
Keep using the app you already have. You do not need to switch to another one.
Check two things in its settings: that it backs up your codes, and that the backup is locked with a password only you know. If it cannot back up, your saved backup codes are what get you back in when you lose the phone.

Test it
Sign out of one of those accounts, then sign back in from a private browser window. You should be asked for a code.
## Where
### res-guide-mfa-001
lists recommended authenticator apps.
### res-guide-security-keys-001
lists security keys, small devices you plug in or tap to sign in. A fake website cannot trick them, but most people do not need one.
