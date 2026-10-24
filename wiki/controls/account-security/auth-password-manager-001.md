---
id: auth-password-manager-001
schema_version: 1.0.0
version: 2.1.0
title: Use a password manager
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
  reversibility: 2
time_estimate:
  setup: 2hr
  ongoing: negligible
maturity_level: 1
adversaries:
  - opportunistic
  - targeted_individual
  - criminal_org
  - ai_automated
attack_vectors:
  - credential_stuffing
  - phishing
assets_protected:
  - credentials
  - financial
  - cloud_data
  - identity
controls_implemented: []
score_weight: 9
threat_model_multipliers:
  opportunistic: 1.3
  targeted_individual: 1.2
  criminal_org: 1.4
  ai_automated: 1.3
multiplier_reasons:
  opportunistic: 'Passwords leaked from one site are tried on others in bulk, and a different password on every site is what stops that working.'
  targeted_individual: 'A person who knows you can guess a password built from your life; a long random one cannot be guessed.'
  criminal_org: 'Fraud groups buy lists of leaked passwords and test them against banks and email at scale, so reuse costs most here.'
  ai_automated: 'A well-written fake sign-in page fools people, but the password manager fills a password only on the site it was saved for.'
compensating_controls: []
depends_on: []
related_items:
  - id: auth-2fa-001
    relationship: required_companion
    note: A stolen password alone does not get into an account that also asks for a second proof.
status: active
superseded_by: null
last_verified: '2026-08-26'
verified_by:
  - org:privacyguides.org
  - org:privacytools.io
sources:
  - url: https://privacyguides.org/en/passwords/
    title: Password Managers — Privacy Guides
    type: primary
    accessed: '2026-08-26'
  - url: https://www.privacytools.io/secure-password-manager
    title: Secure Password Managers — Privacy Tools
    type: supporting
    accessed: '2026-08-26'
  - url: https://owasp.org/www-community/attacks/Credential_stuffing
    title: Credential stuffing | OWASP Foundation
    type: supporting
    accessed: '2026-09-27'
emotional_register: null
tags:
  - open_source_options
  - foundation
created_at: '2026-02-25'
created_by: github:KashishOO7
changelog:
  - version: 2.1.0
    date: '2026-10-21'
    changes: Rewritten so each block opens on the reader's situation, then what to do, then an example.
    author: github:@KashishOO7
  - version: 2.0.0
    date: '2026-03-04'
    changes: Tiered recommendations (Cloud vs Local). Integrated Privacy Tools sourcing.
    author: github:KashishOO7
lookups:
  - lookup-choosing-a-tool-001
---

## Why
If you use the same password for two accounts, a break-in at one opens both. When a website is broken into, the email addresses and passwords taken from it are tried on other websites, by machine, on dozens or hundreds of sites, which is called credential stuffing. For example, say you used one password for a shopping site and for your email: the shopping site is broken into, and someone is now signing in to your email with that password. A different password for every account means a break-in gives away only that one account.
## What
If you use the same password on more than one site, one break-in opens all of them. So use a password manager: it makes a different password for every account, remembers them all and fills them in, so you only have to remember one. For example, if your shopping site is broken into, a password manager means your email still has its own password, so the thief gets one account, not everything. To pick one, see the guides.
## How
### all
Do this
Install the password manager's browser extension on your computer and its app on your phone, and unlock both with your one password.
On the phone, also turn on autofill for it in the phone's settings, or it cannot fill anything in. Then each time you sign in to an account, let it save the login, and change that password to a new one it makes.

Which kind
Two kinds exist, and you do not have to pay for either: some well-reviewed password managers that sync are free.
A syncing one keeps an encrypted copy of your passwords on the company's servers, so they are on every device you sign in on, and a lost phone does not lose them. Most people find this the easier kind.
An offline one has no account with a company. Your passwords are kept in one encrypted file on your device. To use them on your phone too, you keep that file in a cloud drive you already use and open it from there on each device.
Either way, only you should be able to unlock it. If the company could reset your one password and still give you back everything you saved, it could read your passwords too.

The one password you memorise
This is the one password you remember. Make it at least six random words, and let the password manager's generator pick them, because words you choose yourself are easier to guess. Each extra word multiplies the guesses someone needs by thousands, and real words stay easy to remember and type.
In the generator, choose passphrase and set it to six words. If yours only offers the generator once you are signed in, set a password to get in first, then change your one password to the six words it makes.
If you forget it, nobody can reset it for you, because a company that cannot read your passwords cannot recover them either. That is what keeps them private, and it is also the risk: forget it and everything inside is gone.
So write it down once, on paper, and keep it with your important documents. Do not keep it in a file on your computer, or inside the password manager it unlocks.

Test it
On your phone, open an app or website you saved a login for and tap the sign-in box. If the password manager offers your login, it is working on both devices.
## Where
### res-guide-passwords-001
lists recommended password managers, synced and offline.
