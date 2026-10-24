---
id: auth-email-alias-001
schema_version: 1.0.0
version: 1.0.0
title: Use an email alias when you sign up
category: account_security
subcategory: data_minimization
tracks:
  - general
platforms:
  - all
not_applicable_if: []
sensitive: false
difficulty:
  technical: 2
  disruption: 1
  reversibility: 2
time_estimate:
  setup: 15min
  ongoing: low
maturity_level: 2
adversaries:
  - data_broker
  - opportunistic
attack_vectors:
  - credential_stuffing
  - data_broker_aggregation
assets_protected:
  - identity
  - behavioral_data
controls_implemented: []
score_weight: 4.5
threat_model_multipliers:
  data_broker: 1.5
  opportunistic: 1.2
multiplier_reasons:
  data_broker: 'Companies that collect personal details link what you do on different websites through your email address, and with a different alias on each website, your email address alone no longer connects those websites.'
  opportunistic: 'Scammers send their emails in bulk to addresses taken in data breaches, and an alias keeps your main address off the lists taken from websites that only had the alias.'
compensating_controls: []
depends_on: []
related_items:
  - id: incident-breach-monitor-001
    relationship: complementary
    note: Breach monitoring tells you when one of your email addresses, or an alias, appears in a known data breach.
status: active
superseded_by: null
last_verified: '2026-10-19'
verified_by:
  - org:privacyguides.org
  - org:apple.com
sources:
  - url: https://www.privacyguides.org/en/email-aliasing/
    title: Email Aliasing - Privacy Guides
    type: primary
    accessed: '2026-10-19'
  - url: https://support.apple.com/en-us/105078
    title: How to use Hide My Email with Sign in with Apple - Apple Support
    type: primary
    accessed: '2026-10-19'
tags:
  - privacy
  - free_options
created_at: '2026-10-19'
created_by: github:KashishOO7
changelog:
  - version: 1.1.0
    date: '2026-10-21'
    changes: Rewritten so each block opens on the reader's situation, then what to do, then an example.
    author: github:@KashishOO7
  - version: 1.0.0
    date: '2026-10-19'
    changes: Initial item, row 7 batch B (NEXT §15.6 item 17), from Privacy Guides on email aliasing and Apple's Hide My Email help.
    author: github:KashishOO7
---

## Why
If you give your main email address to a website, it can lose the address in a data breach or share it with advertisers, and your address is what you sign in with on most websites. For example, say you enter a competition with your main address and that website is later broken into: your address is on a list, scam emails start arriving, and any password stolen with it is tried on other websites by machine.
## What
If a website you sign up to leaks your email address, scam emails follow it. So give each new website an email alias, an extra address whose mail arrives in your main inbox, so the website never learns your main address. For example, if you enter a competition with an alias and scam emails start arriving, you know that competition site leaked it, and you can turn off just that alias.
## How
### all
Do this
The next time you sign up to a website, such as a shopping website or a competition, use an alias. Keep your main address for your bank, your government accounts and the people you write to, because you cannot afford to lose those emails if an alias ever stops working.

Where to get aliases
On an iPhone, iPad or Mac, when an app or website offers Sign in with Apple, you can choose Hide My Email, and it makes an alias for that app or website only.
Some email providers can make aliases, and there are alias services that do nothing else. Whichever you use should let you turn each alias off on its own and reply from the alias, so the person you write to does not see your main address either.

Two things that are not aliases
A plus sign and a word added to your address, such as yourname+news, is not an alias. Some email providers accept it, but a website can remove that part and get your main address.
A disposable email address, from a website that gives out temporary addresses, is not one either. It can often be read by anyone who knows it, and once it expires you can no longer get a password reset link sent to it. Never use one for an account you want to keep.

Keep track
If you use a password manager, save each alias in it next to the password for the website it belongs to, so you know which address to sign in with on each website.
Protect the account that makes your aliases, such as your Apple account or your alias service account, with a strong password and two-factor authentication, and keep its backup codes somewhere safe so you can still get in if you lose your phone. Whoever gets into that account can redirect every alias.

Before you turn an alias off
Check that no account you still use signs in with that alias, because that account's password reset links go to the alias. An alias you turn off can usually be turned on again to receive a reset link, but one you delete may not come back.
