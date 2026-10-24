---
id: guardian-trusted-contact-001
schema_version: 1.0.0
version: 1.0.0
title: Help an older relative name someone they trust at their bank and on their phone
category: account_security
subcategory: account_recovery
tracks:
  - caring_for_someone
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
  ongoing: low
maturity_level: 1
adversaries:
  - criminal_org
attack_vectors: []
assets_protected:
  - financial
  - account_access
controls_implemented: []
score_weight: 6.5
threat_model_multipliers:
  criminal_org: 1.3
multiplier_reasons:
  criminal_org: 'Organised scam groups often press their victims to keep a payment secret, and a trusted contact gives the bank someone outside that pressure to call, so this step counts more against them.'
compensating_controls: []
depends_on: []
related_items:
  - id: ai-voice-clone-001
    relationship: complementary
    note: Agree a safe word with your family, so a caller who looks or sounds like a relative can prove it is really them.
status: active
superseded_by: null
last_verified: '2026-10-19'
verified_by:
  - org:finra.org
  - org:apple.com
sources:
  - url: https://www.finra.org/investors/insights/trusted-contact
    title: 'Investor Bulletin: Why You Should Consider Adding a Trusted Contact to Your Account | FINRA.org'
    type: primary
    accessed: '2026-10-19'
  - url: https://support.apple.com/en-us/102641
    title: Set up a recovery contact for your Apple Account - Apple Support
    type: primary
    accessed: '2026-10-19'
tags:
  - family_safety
  - guardian_action
  - free
created_at: '2026-10-19'
created_by: github:KashishOO7
changelog:
  - version: 1.0.0
    date: '2026-10-19'
    changes: Initial item, row 7 batch C (NEXT §15.6 item 22), from the FINRA, SEC and NASAA trusted contact bulletin and Apple's recovery contact help.
    author: github:KashishOO7
---

## Why
A bank or investment firm that has the name of someone its customer trusts is in a better position to protect the account when it thinks the customer is being scammed or cannot reach them. And when an older relative is locked out of the account on their phone, someone they trust can help them get back in.
## What
Help your relative name you, or another person they trust, as a trusted contact at their bank or investment firm if it offers this, and as a recovery contact for their phone's account. Neither is meant to let that person move money or get into the account.
## How
### all
Do this
Sit down with your relative, ask their bank or investment firm about adding a trusted contact, then, on an Apple device, add a recovery contact.

At their bank or investment firm
In some countries, investment firms, and some banks, ask customers to name a trusted contact, whom they may call if they cannot reach the customer or think the account is being misused. Where they do, the contact is usually not allowed to see the balance, move money or make decisions, and your relative can change or remove the name at any time. Ask about it on the number on your relative's card or statement, not through a link in an email.

On an iPhone, iPad or Mac
A recovery contact can give your relative a code to reset their Apple Account password, and gets no access to the account. Your relative adds up to five in Settings, or System Settings on a Mac, under their name, then Sign-In & Security. Each person they choose needs an Apple device too.

On other phones and email accounts
Check that the recovery phone number and email address are ones your relative still uses. A recovery number is not the same as a recovery contact: whoever holds it can reset the password, so add your own only if your relative asks you to.

Agree a plan together
Agree what your relative does when someone they did not expect asks for money by phone, message or video call: stop, and call you or the trusted person they chose before paying anything.

What a trusted contact is not
A trusted contact is not a power of attorney, the legal arrangement that in many countries lets someone manage another person's money.
