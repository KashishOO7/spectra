---
id: money-scam-first-hour-001
schema_version: 1.0.0
version: 1.0.0
title: If you have just paid a scammer, tell the bank or company you paid through
category: incident_response
subcategory: fraud_recovery
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
  - criminal_org
attack_vectors:
  - social_engineering
assets_protected:
  - financial
controls_implemented: []
score_weight: 6
threat_model_multipliers:
  opportunistic: 1
  criminal_org: 1
compensating_controls: []
depends_on: []
related_items:
  - id: recovery-email-first-001
    relationship: required_companion
    note: The last step here is changing your email password, because most other accounts reset their password through your email.
  - id: human-urgency-001
    relationship: related_concept
    note: Scammers push you to pay before you have time to think. That step is about spotting the pressure next time.
status: active
superseded_by: null
last_verified: '2026-09-07'
verified_by:
  - github:@KashishOO7
sources:
  - url: https://consumer.ftc.gov/articles/what-do-if-you-were-scammed
    title: 'FTC Consumer Advice: What To Do if You Were Scammed'
    type: primary
    accessed: '2026-09-07'
  - url: https://consumer.ftc.gov/articles/refund-and-recovery-scams
    title: 'FTC Consumer Advice: Refund and Recovery Scams'
    type: supporting
    accessed: '2026-09-07'
emotional_register: null
tags:
  - free
  - incident_response
  - money
created_at: '2026-09-07'
created_by: github:@KashishOO7
changelog:
  - version: 1.0.0
    date: '2026-09-07'
    changes: Initial item. The research ranks payment fraud and scams first by measured prevalence, and the corpus had nothing on what to do once the money has gone.
    author: github:@KashishOO7
---

## Why
Whether you get money back from a scam depends on how you paid and how quickly you tell the company that moved it. Cards usually carry more protection than other ways of paying, and cryptocurrency carries less, so it can be hard to get back.
## What
Tell the bank, card company, payment app or other service you paid through that it was a scam, and ask them to reverse the payment, as soon as you can. Even if the money seems gone, it is still worth asking.
## How
### all
Do this first
Work out how the money left you, then tell that company today.

Who to tell, by how you paid
A card: the bank or company that issued it, using the number on the back of the card or its app.
A bank transfer: your own bank. Say plainly that you were tricked into sending it.
A payment app: the app itself, from inside the app.
A money transfer service: the service you sent it through. Tell them a scammer tricked you.
A gift card: the company whose name is on the card, using the number on the back. Keep the card and the receipt.
Cryptocurrency: the exchange or the cash machine operator you used. Tell them it was a fraudulent transaction.
Cash sent by post or courier: the delivery company, as soon as possible.
In every one of those cases the words are the same. Tell them it was a scam, and ask them to reverse the payment and refund you.

What you can expect
What a bank or payment company must refund differs by country and by how you approved the payment.
Asking your card issuer for a refund is a normal request.
Cryptocurrency does not have the protections cards have, so it can be hard to get back.

Then report it
Report it to the official fraud reporting service where you live. If you search for it, use only a result on a government or police website, because search results can show adverts and look-alike sites first.
A report rarely brings your money back, but the authorities use reports to act against scammers.

Nobody can recover it for a fee
If someone contacts you offering to get your money back for a payment, that is a second scam. A bank, a payment company, the police and government agencies never charge you to help get a refund, and if you pay, you lose more.

Afterwards
Change the password on anything you used during the scam, and on your email first.
If you let them control your phone or computer, change your passwords from a different device and turn on two-factor authentication. On Windows or Android, also run the built-in security scan.
