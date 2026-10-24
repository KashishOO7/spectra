---
id: image-threat-001
schema_version: 1.0.0
version: 1.0.0
title: If someone threatens to share an intimate image of you unless you pay, do not pay
category: data_management
subcategory: extortion
tracks:
  - general
platforms:
  - all
not_applicable_if: []
sensitive: true
difficulty:
  technical: 1
  disruption: 1
  reversibility: 1
maturity_level: 2
adversaries:
  - criminal_org
  - opportunistic
  - targeted_individual
attack_vectors:
  - social_engineering
assets_protected:
  - reputation
  - financial
controls_implemented: []
score_weight: 8
threat_model_multipliers:
  criminal_org: 1.5
  targeted_individual: 1.5
  opportunistic: 1.4
multiplier_reasons:
  criminal_org: 'Threats to share intimate images for money are mostly run by organised groups. Held at 1.5, so it stays below two-factor authentication for account worries.'
  targeted_individual: 'A person who has an image of you can make the same threat, so the same rise.'
  opportunistic: 'Emails claiming to have recorded you are sent in bulk to scare people into paying, so a rise.'
compensating_controls: []
depends_on: []
related_items:
  - id: image-abuse-001
    relationship: complementary
    note: If the image is shared, or to stop it being uploaded before it is, this step says how.
  - id: money-scam-first-hour-001
    relationship: complementary
    note: If you have already paid, this step says what to do in the first hour.
status: active
superseded_by: null
last_verified: '2026-09-29'
verified_by:
  - org:esafety.gov.au
  - org:missingkids.org
sources:
  - url: https://www.esafety.gov.au/key-topics/image-based-abuse/deal-with-sextortion
    title: Dealing with sexual extortion | eSafety Commissioner
    type: primary
    accessed: '2026-09-29'
  - url: https://www.missingkids.org/theissues/sextortion
    title: Sextortion
    type: primary
    accessed: '2026-09-29'
emotional_register: null
tags:
  - free
  - no_tools_required
created_at: '2026-09-29'
created_by: github:KashishOO7
changelog:
  - version: 1.0.0
    date: '2026-09-29'
    changes: Initial item, phase 7 of NEXT §15.4 (§15.6 item 7), from eSafety's page on sexual extortion and NCMEC's on sextortion; read by him before it landed.
    author: github:KashishOO7
---

## Why
Some blackmailers start with a friendly chat on a dating site, social media, a messaging app or a game. They move you to a private app, then get a nude picture from you or record you on a video call, and threaten to send it to your family, friends or colleagues unless you pay or send more. Paying rarely ends it, because whoever is blackmailing you then asks for more. Some make the threat with a fake image or video, or claim they have got into your phone or account.
## What
If someone threatens to share an intimate image of you unless you pay or send more, stop replying, do not pay, keep a record of the threats and tell someone you trust. You are not to blame, the person threatening you is, and blackmailers usually give up once they see you will not pay.
## How
### all
Before you start
You are not to blame for what is happening, and you do not have to deal with this alone. Tell a friend or family member you trust. If you feel overwhelmed or unsafe, contact a helpline or your local emergency number.
If you are under 18, tell a parent or another adult you trust.

Do this
Stop replying, and do not pay or send anything else: no money, gift cards, cryptocurrency, pictures or videos.

Keep a record first
Before you block anyone, take screenshots of:
- every message with a demand or a threat
- their profile and username on each app they used, with the profile's web address where there is one
- the dates and times they contacted you
- any bank account, payment details or phone number they gave you
Do not delete your messages or your account, even if you want to. They are the record of what happened.
Do not send the picture or video itself to anyone, even to report it.

Then report and block
Report the account on each app where they contacted you, then block them, and ask your friends to block them too.
If you need a break, switch your account off for a while instead of deleting it, and sign back in when you are ready. Some apps delete an account left switched off for too long, so check how long yours allows.
If they said they got into one of your accounts, change that account's password and turn on two-factor authentication for it. If they quote an old password of yours as proof that they got in, they most likely got it from a data breach rather than from your device, so change it on every account where you still use it.

If the image is shared
The step linked below explains how to stop an intimate image being uploaded to the platforms that take part without sending it to anyone, and what to do if it is posted. It has a separate route for images taken when you were under 18.

If you already paid
Contact your bank, or the money transfer service you used, straight away. A transfer can sometimes be cancelled if you act quickly. For a gift card, call the company named on the card, and for cryptocurrency, contact the exchange you sent it from.

Where to get help
If you are in danger now, call your local emergency number. You can report the blackmail to the police even if you are not in danger.
