---
id: auth-old-accounts-001
schema_version: 1.0.0
version: 1.0.0
title: Delete accounts you no longer use
category: account_security
subcategory: data_deletion
tracks:
  - general
platforms:
  - all
not_applicable_if: []
sensitive: false
difficulty:
  technical: 1
  disruption: 1
  reversibility: 3
time_estimate:
  setup: 2hr
  ongoing: low
maturity_level: 2
adversaries:
  - opportunistic
  - criminal_org
attack_vectors:
  - credential_stuffing
assets_protected:
  - credentials
  - cloud_data
  - identity
controls_implemented: []
score_weight: 5.5
threat_model_multipliers:
  opportunistic: 1.3
  criminal_org: 1.2
multiplier_reasons:
  opportunistic: 'Passwords taken from websites that were broken into are tried on other sites by machine, and an old account often still has a password you used elsewhere.'
  criminal_org: 'Criminal groups sell the details taken in website break-ins, but a forgotten account usually holds less worth taking than one you use, so this step is rated a little lower against these groups than against mass attacks.'
compensating_controls: []
depends_on: []
related_items:
  - id: incident-breach-monitor-001
    relationship: complementary
    note: Breach monitoring alerts you when your email address appears in a known data breach, so you know which old accounts to delete first.
  - id: auth-password-manager-001
    relationship: complementary
    note: An account you cannot delete is safer with a unique password kept in a password manager.
status: active
superseded_by: null
last_verified: '2026-10-19'
verified_by:
  - org:consumerreports.org
sources:
  - url: https://securityplanner.consumerreports.org/tool/delete-old-accounts
    title: Delete Unused Accounts | CR Security Planner
    type: primary
    accessed: '2026-10-19'
tags:
  - free
  - no_tools_required
created_at: '2026-10-19'
created_by: github:KashishOO7
changelog:
  - version: 1.1.0
    date: '2026-10-21'
    changes: Rewritten so each block opens on the reader's situation, then what to do, then an example.
    author: github:@KashishOO7
  - version: 1.0.0
    date: '2026-10-19'
    changes: Initial item, row 7 batch A (NEXT §15.6 item 16), from Consumer Reports' Security Planner.
    author: github:KashishOO7
---

## Why
If you opened an account on a website years ago and never used it again, it still holds your name, your email address and perhaps a password you used somewhere else. For example, say you ordered prints from a website once and never went back: it still holds what you gave it that day. If the website is ever broken into, your details and that password are taken with everyone else's, and you may never hear about it.
## What
An account you no longer use still holds your details, and it can still be broken into. So find the accounts you no longer use and delete them. For example, if you ordered prints from a website once, delete that account: then a break-in at the website finds nothing of yours. Deleting the app from your phone does not close the account: you have to delete the account itself, usually in its settings.
## How
### all
Do this
Make a list of the accounts you no longer use, then sign in to each one and delete it.

Where to find them
The passwords saved in your browser, or in a password manager if you use one, show many of the websites you have signed up to.
Search your email for words such as "welcome to", "new account" or "confirm your email".
If you signed in to other apps with a social media account, you can see a list of them in its settings. Delete the accounts you no longer use on those apps first, then remove them from that list.

Which ones first
Start with accounts on websites that have had a data breach, and then the ones that hold a card or bank details. Breach monitoring, a step linked below, shows which known data breaches included your email address.

Before you delete one
Download anything you want to keep, such as photos or messages, because once a deleted account is gone, you usually cannot get it back.
Remove any card or bank details saved in the account.
Check whether you sign in to other apps with this account, using a button such as "Sign in with Google". If you still use any of those apps, set up another way to sign in to them first, such as an email address and password, or deleting the account will lock you out of them.
Before you delete an email account, go to every account that sends password reset links to that address and change the reset address to one you still use.

If you cannot delete one
Change its password to a new one you use nowhere else, remove whatever details it lets you remove, and keep the new password somewhere safe, such as a password manager.
