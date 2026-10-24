---
id: auth-2fa-001
schema_version: 1.0.0
version: 2.1.0
title: Turn on two-factor authentication
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
multiplier_reasons:
  opportunistic: 'A password tried in bulk gets nowhere without the second proof.'
  targeted_individual: 'A person who learns your password, by watching or guessing, still does not have your phone or key.'
  criminal_org: 'Groups with stolen passwords in hand are stopped at the second proof unless they also take the phone number, which the SIM PIN step covers.'
  intimate_partner: 'A partner may already know your passwords; a second proof on your own device stops them signing in from theirs, though not if they can unlock your phone.'
  domestic_government: 'Phishing the accounts of people they watch is a common first move, and a second proof, a security key above all, is the main defence. Below a foreign government because your own can ask the provider for the data instead.'
  foreign_government: 'Foreign services phish the accounts of chosen targets, and a second proof defeats a stolen password; they cannot simply ask your provider.'
  ai_automated: 'AI makes fake sign-in pages convincing enough to collect passwords, and the second proof stops a collected password on its own. A page that relays the code at once still gets past it, as the step says, so not higher.'
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
  - version: 2.1.0
    date: '2026-10-21'
    changes: Rewritten so each block opens on the reader's situation, then what to do, then an example.
    author: github:@KashishOO7
  - version: 2.0.0
    date: '2026-03-04'
    changes: Tiered recommendations (TOTP vs Hardware Keys). Added SIM-swapping warning.
    author: github:KashishOO7
---

## Why
If you reuse a password, a stolen one will be tried on all your accounts. Websites are broken into all the time, and the usernames and passwords taken from them are tried on other sites by machine to see which still work. With two-factor authentication on, a stolen password alone does not get someone into your account, because the site also asks for a second proof, such as a code from your phone. For example, say your password leaks from an old forum: without two-factor authentication the thief signs in to your email, and with it the thief reaches a screen asking for a code that only your phone makes. A code sent by text message is the weakest kind, because someone can take over your phone number (a SIM swap) and because it needs signal.
## What
If someone steals your password, they can sign in as you. So turn on two-factor authentication, which asks for a second proof after your password, such as a code from your phone. For example, if your email password leaks, a thief who has it still cannot open your email without the code from your phone. Use an authenticator app rather than SMS: the app generates codes on the device itself, works with no signal, and some can keep an encrypted copy of your codes, so you can move them to a new phone. Turn it on for your email first, because most other accounts let you reset their password through your email. To pick an app, see the guides.
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
A text code can be stolen without touching your phone. Someone tricks your mobile provider into giving them your phone number, and your texts go to them. The codes in an authenticator app are made on your phone, not sent to your number, so whoever takes the number does not get them.
If an account offers only text messages, turn that on anyway. It still stops someone who has only your password.
Neither kind stops someone who runs a fake sign-in page. Say a message sends you to a page that looks like your email's, and it asks for your password and then your code. If you type both, the person behind the page types them into the real site at that moment and gets in. So type a code only into a site or app you opened yourself.

Passkeys
A passkey is a sign-in key your phone or computer creates for one site and keeps on your devices. Your device offers it only to that site, so a fake sign-in page gets nothing it could use to sign in as you. You sign in by unlocking it with your fingerprint, your face or your screen lock PIN, and on some sites it replaces both the password and the code.
Where an account offers a passkey, use it: look for passkeys in the account's security settings. Keep your backup codes as well, for signing in from a device that does not have your passkey.

Sign-in prompts
Some accounts can instead send a sign-in prompt to your phone, asking whether it is you trying to sign in, with Yes and No. It comes through the account's app, not your phone number, so a SIM swap does not move it.
Tap Yes only when you have just tried to sign in yourself, because someone who has your password can set off a prompt too.

Already using an authenticator app?
Keep using the app you already have. You do not need to switch to another one.
Check two things in its settings: that it backs up your codes, and, if it lets you, that the backup has a password only you know. If it cannot back up, your saved backup codes are what get you back in when you lose the phone.

Test it
Once your backup codes are saved, sign out of one of those accounts, then sign back in from a private browser window. You should be asked for a code, or for the other proof you set up.
## Where
### res-guide-mfa-001
lists recommended authenticator apps.
### res-guide-security-keys-001
lists security keys, small devices you plug in or tap to sign in. A fake website cannot trick them, but most people do not need one.
