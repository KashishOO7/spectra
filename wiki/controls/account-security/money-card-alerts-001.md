---
id: money-card-alerts-001
schema_version: 1.0.0
version: 1.0.0
title: Turn on payment alerts for your cards
category: account_security
subcategory: card_fraud
tracks:
  - general
platforms:
  - all
not_applicable_if: []
sensitive: false
difficulty:
  technical: 1
  disruption: 1
  reversibility: 1
time_estimate:
  setup: 10min
  ongoing: negligible
maturity_level: 1
adversaries:
  - opportunistic
  - criminal_org
attack_vectors:
  - identity_fraud
assets_protected:
  - financial
controls_implemented: []
score_weight: 7
threat_model_multipliers:
  opportunistic: 1.3
  criminal_org: 1.3
multiplier_reasons:
  opportunistic: 'Card details taken in website break-ins are tested on many websites at once, often with a small payment first, and an alert shows you that payment as soon as it happens.'
  criminal_org: 'Criminal groups buy stolen card details and spend as much as they can before the card is stopped, so the sooner you notice, the less they can take.'
compensating_controls: []
depends_on: []
related_items:
  - id: money-scam-first-hour-001
    relationship: complementary
    note: If you were tricked into paying a scammer yourself, the linked step says who to contact.
  - id: human-verify-001
    relationship: complementary
    note: A call from someone claiming to be your bank's fraud team can be a scam. Check it by calling the bank yourself, on the number from your card or the bank's official website.
status: active
superseded_by: null
last_verified: '2026-10-19'
verified_by:
  - org:ftc.gov
  - org:consumerfinance.gov
  - org:ncsc.gov.uk
sources:
  - url: https://www.consumerfinance.gov/consumer-tools/bank-accounts/watch-accounts-closely-when-card-data-is-hacked/
    title: Watch accounts closely when card data is hacked | Consumer Financial Protection Bureau
    type: primary
    accessed: '2026-10-19'
  - url: https://consumer.ftc.gov/articles/lost-or-stolen-credit-atm-and-debit-cards
    title: Lost or Stolen Credit, ATM, and Debit Cards | Consumer Advice
    type: primary
    accessed: '2026-10-19'
  - url: https://www.ncsc.gov.uk/guidance/shopping-online-securely
    title: Shopping and paying safely online | National Cyber Security Centre
    type: supporting
    accessed: '2026-10-19'
tags:
  - high_impact
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
    changes: Initial item, row 7 batch A (NEXT §15.6 item 15), from CFPB, FTC and NCSC card advice.
    author: github:KashishOO7
---

## Why
If a website you once paid is broken into, your card details can be stolen while the card is still in your wallet. Whoever has them often makes a small payment first to see if the card works, then takes more, and this can happen months after the details were taken. For example, say a thief makes a small payment with your card number: without an alert you may not see it until your statement, and by then they have tried bigger ones.
## What
If someone uses your card details, you want to hear about the first payment, not the tenth. So turn on payment alerts for your cards, so you see a payment you did not make as soon as it happens. For example, if a thief tries a small payment on your debit card, the alert shows it at once and you can tell your bank before they take more. The sooner your bank knows, the less you are likely to lose, and that matters most with a debit card, because the money leaves your account at once.
## How
### all
Do this
Open the notification settings in your bank's app, or your card provider's app, and switch on payment alerts for each card you use, for every payment if your bank offers that. If your bank has no app, ask it for payment alerts by text or email.

If you see a payment you did not make
Report it to your bank or card provider straight away, in its app or on the number on the back of your card, even if the amount is small.
Ask for the card to be cancelled and a new one sent. When it arrives, give the new number to anyone who takes regular payments from the card, such as subscriptions.

If your card goes missing
Freeze or lock the card in your bank's app as soon as you notice it is missing, if the app offers that. If you then find the card, unfreeze it in the app and use it as before.
If you do not find the card or think it was stolen, report it lost or stolen so the bank cancels it and sends a new one. Do the same if your app cannot freeze cards.

Save your bank's number
Save your bank's phone number in your contacts now, from the back of your card or the bank's official website, so you do not have to search for it when the card is gone.

Calls and messages about your card
If someone calls, texts or emails saying they are from your bank's fraud team and asks for your PIN, a code sent to your phone or your full card number, give them nothing. Stop the call or the conversation, and call the number on your card yourself.
