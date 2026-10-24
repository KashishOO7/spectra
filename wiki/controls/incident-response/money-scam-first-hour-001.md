---
id: money-scam-first-hour-001
schema_version: 1.0.0
version: 1.0.1
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
multiplier_reasons:
  opportunistic: 'After a payment to a scammer, who they were does not change what you do, so no rise.'
  criminal_org: 'The same steps apply whoever took the money, so no rise.'
compensating_controls: []
depends_on: []
related_items:
  - id: recovery-email-first-001
    relationship: required_companion
    note: Your email password comes before your other passwords after a scam, because the password reset links for your other accounts go to your email.
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
  - url: https://support.microsoft.com/en-us/windows/virus-and-threat-protection-in-the-windows-security-app-1362f4cd-d71a-b52a-0b66-c2820032b65e
    title: 'Microsoft Support: Virus and Threat Protection in the Windows Security App'
    type: supporting
    accessed: '2026-10-16'
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
  - version: 1.0.1
    date: '2026-10-16'
    changes: How rewritten with the casebook. "Work out how the money left you" and "tell that company" out; stop replying, cancelling a card, keeping the messages and securing a device added from reasoning; Windows Security's Quick scan named, with its source.
    author: github:@KashishOO7
---

## Why
Whether you get money back from a scam depends on how you paid and how quickly you tell the company that moved it. Cards usually carry more protection than other ways of paying, and cryptocurrency carries less, so it can be hard to get back.
## What
Tell the bank, card company, payment app or other service you paid through that it was a scam, and ask them to reverse the payment, as soon as you can. Even if the money seems gone, it is still worth asking.
## How
### all
Do this first
Stop replying to the scammer and send no more money, whatever they promise next.
Then, as soon as you can, tell the bank, payment app or company you paid through that you were scammed, and ask them to reverse the payment. Ask even if the money seems gone, because the sooner they know, the better your chance of getting it back.

Who to contact
For a bank transfer, call your bank, using the number on its official website or on your bank card, never a number the scammer gave you.
For a debit or credit card, call the bank or company that issued it, on the number on the back of the card.
For a payment app or a money transfer service, report the payment in the app, or contact the service using the details on its official website.
For a gift card, call the company named on the card, and keep the card and the receipt.
For cryptocurrency, contact the exchange you sent it from, or the company that runs the cryptocurrency ATM you used.
Cash sent by post or courier can sometimes be stopped before it arrives, so call the postal service or courier you used straight away. If a courier came to your door and took the cash, the scammer most likely sent them, so tell the police.

If you gave away card or banking details
If you gave the scammer your card number, ask the bank or company that issued the card to cancel it and send you a new one, then give the new number to anyone who charges you regularly, such as for subscriptions.
If you gave the scammer your online banking login, ask your bank to block online banking and help you set a new password.

Keep a record
Do not delete your messages with the scammer. Take screenshots of them and keep any transaction number, because the company you paid through and the police may ask for them.

Report the scam
Report the scam to the police, or to your country's official fraud reporting service if it has one. If you search for the service, use only a result on a government or police website, because search results can show adverts and copies of official sites first.

Do not pay anyone who offers to get your money back
If someone contacts you offering to recover your money for a fee, that is almost always a second scam, and if you pay, you lose more.

Secure your device and accounts
If the scammer had you install a remote access app, which lets them see or control your screen, disconnect the device from the internet, remove the app, and only then connect it again. On Windows, also run a Quick scan in the Windows Security app.
If the scammer may know your email password, change it before any other password, from another phone or computer, and turn on two-factor authentication for your email and save its backup codes, because most password reset links for your other accounts go to your email.
If you gave the scammer any other password, change it on every account where you used it, and turn on two-factor authentication on those accounts.
