---
id: auth-password-manager-001
schema_version: 1.0.0
version: 2.1.0
title: Use a password manager with unique passwords everywhere
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
  - version: 2.0.0
    date: '2026-03-04'
    changes: Tiered recommendations (Cloud vs Local). Integrated Privacy Tools sourcing.
    author: github:KashishOO7
lookups:
  - lookup-choosing-a-tool-001
---

## Why
If you use the same password on more than one site, a data breach at any one of them exposes every account that shares it. Programs then try the stolen usernames and passwords on dozens or hundreds of other sites, which is called credential stuffing. A different password for every account means a breach at one site gives away only that one account.
## What
A password manager creates a different password for every account, stores them, and fills them in, so you only have to remember one. That ends the habit of using the same password on more than one site, which is how a breach at one site leads to stolen accounts on others. To pick one, see the guides.
## How
### all
Do this
Install the password manager's browser extension on your computer and its app on your phone, and unlock both with your one password.
On the phone, also turn on autofill for it in the phone's settings, or it cannot fill anything in. Then each time you sign in to an account, let it save the login, and change that password to a new one it makes.

Which kind
One that syncs is easier for most people than an offline one. It keeps an encrypted copy of your passwords on the company's servers, so they are on every device you sign in on, and a lost phone does not lose them.
An offline one has no account with a company. Your passwords are kept in one encrypted file on your device. To use them on your phone too, you keep that file in a cloud drive you already use, and open it from there on each device.
Whichever kind you choose, only you should be able to unlock it. If the company can reset your one password and still give you back everything you saved, then it can read your passwords too.

The one password you memorise
Make it at least six random words, and let the password manager's generator pick them, because words you choose yourself are easier to guess. Each extra word multiplies the guesses someone needs by thousands, and real words stay easy to remember and type.
In the generator, choose passphrase and set it to six words. If yours only offers the generator once you are signed in, set a password to get in first, then change your one password to the six words it makes.
If you forget it, nobody can reset it for you, because a company that cannot read your passwords cannot recover them either. That is what keeps them private, and it is also the risk: forget it and everything inside is gone.
So write it down once, on paper, and keep it with your important documents. Do not keep it in a file on your computer, or inside the password manager it unlocks.

Test it
On your phone, open an app or website you saved a login for and tap the sign-in box. If the password manager offers your login, it is working on both devices.
## Where
### res-guide-passwords-001
lists recommended password managers, synced and offline.
