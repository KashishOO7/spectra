---
id: comm-messaging-001
schema_version: 1.0.0
version: 2.1.0
title: Use an end-to-end encrypted app for your everyday messages
category: communications
subcategory: messaging
tracks:
  - general
  - public_work
  - known_person_risk
platforms:
  - all
not_applicable_if: []
sensitive: false
difficulty:
  technical: 1
  disruption: 2
  reversibility: 1
time_estimate:
  setup: 10min
  ongoing: negligible
maturity_level: 2
adversaries:
  - isp_network
  - domestic_government
  - foreign_government
  - criminal_org
  - targeted_individual
attack_vectors:
  - network_interception
  - metadata_analysis
assets_protected:
  - communications
  - metadata
  - relationships
controls_implemented: []
score_weight: 8
threat_model_multipliers:
  isp_network: 1.8
  domestic_government: 2
  foreign_government: 2
  criminal_org: 1.4
  targeted_individual: 1.5
  intimate_partner: 1.2
compensating_controls: []
depends_on: []
related_items: []
status: active
superseded_by: null
last_verified: '2026-03-04'
verified_by:
  - org:privacyguides.org
  - org:eff.org
sources:
  - url: https://privacyguides.org/en/real-time-communication/
    title: Real-Time Communication — Privacy Guides
    type: primary
    accessed: '2026-03-04'
  - url: https://ssd.eff.org/module/communicating-others
    title: Communicating with Others — EFF Surveillance Self-Defense
    type: supporting
    accessed: '2026-03-04'
  - url: https://support.apple.com/guide/iphone/see-your-purchases-and-subscriptions-iph4e3e7324f/ios
    title: See your purchases and subscriptions in the App Store on iPhone - Apple Support
    type: supporting
    accessed: '2026-09-27'
  - url: https://support.google.com/googleplay/answer/113410?hl=en
    title: Reinstall & re-enable apps - Google Play Help
    type: supporting
    accessed: '2026-09-27'
  - url: https://support.signal.org/hc/en-us/articles/360007062452-What-do-I-do-if-my-phone-is-lost-or-stolen
    title: What do I do if my phone is lost or stolen? - Signal Support
    type: supporting
    accessed: '2026-09-27'
emotional_register: null
tags:
  - e2ee
  - open_source
created_at: '2026-02-25'
created_by: github:@KashishOO7
changelog:
  - version: 2.0.0
    date: '2026-03-04'
    changes: Added Tiered structure (Signal vs SimpleX/Session) for threat models requiring strict anonymity. Updated EFF/Privacy Guides sourcing.
    author: github:@KashishOO7
lookups:
  - lookup-choosing-a-tool-001
---

## Why
A text message sent as SMS is not encrypted at all. Your mobile network can read it and hand it over when the police or a court ask, and anyone with access to SS7 can intercept it. An app that encrypts your messages end to end stops all of that, but it can still keep a record of who you talk to, when and how often. That record is called metadata, and some apps keep much less of it than others.
## What
Use an app that encrypts your messages end to end, because SMS text messages can be read on their way to the other person. Each message is scrambled on your device and unscrambled only on the devices of the people you are writing to, so the company running the app, your internet provider and anyone else on the network cannot read it on the way. SMS has no encryption at all, and some messaging apps encrypt only when you switch it on, or only when everyone in the chat uses the same kind of phone. To choose an app, see the guides.
## How
### all
Do this
Move your everyday messages to an app that encrypts them end to end, and ask the people you write to most to use it too. It protects only the chats where everyone uses it.

What to look for
Encryption on by default, for every chat, not something you switch on each time.
Published code, so that people outside the company can check what the app really does. Its website will say so, usually with the words open source.
What it keeps besides your messages: who you talked to, when, and how often. This record is called metadata, and encrypting the messages does not hide it. The app's privacy policy says what it keeps.
If giving a phone number is a problem for you, some apps do not ask for one.

Worth knowing
Encryption protects a message on its way. Anyone holding an unlocked phone at either end can still read it. Some of these apps can also delete messages after a time you choose, called disappearing messages. That leaves less on either phone for someone who picks it up later, though the person you write to can still photograph the screen first.
Look for it in the chat's settings. Disappearing messages are gone for you too, so do not use them in a chat you may need as a record.
If your chats are backed up to a cloud account, that copy is not always end-to-end encrypted, so the company that keeps it may be able to read it.
Look in the backup settings for an option that encrypts the backup end to end, or turn the chat backup off. With the backup off, a lost or broken phone takes your chats with it, so use the encrypted backup where the app offers one.

Test it
Open a chat, tap the other person's name at the top or open the chat's details, and look for the safety number, security code or Verify encryption. Most apps that encrypt end to end have one.
Read out what it shows and have the other person read out theirs, in person or on a call.
If the two match, your app is using that person's real encryption key, and no one has swapped in their own. Matching is the test, not simply finding the screen. If they do not match, stop using that chat for anything private until you know why.
## Where
### res-guide-messaging-001
lists recommended end-to-end encrypted messaging apps.
## Where you are
### encrypted_comms_restricted
What this changes for you
Your internet provider can usually tell which app you are using, even when it cannot read anything you send.
So where these apps are restricted or watched, using one can be noticed in itself.

Before you switch
Think about whether being seen to use one could put you at more risk than it protects you from. That depends on where you are, and you are the only person who can judge it.
If it could, there is still a safer first step: turn off the cloud backup of your chats in the app you already use, and delete old conversations you no longer need. Before you delete, save anything you may need later, such as proof of threats, somewhere else.
### govt_monitors_traffic
What is still visible
Your internet provider can see which apps you connect to and when, but not what you send or who you send it to. The app's company may keep a record of who you talk to and when, and a government can ask it for that record.
Your app store account also keeps a list of the apps you have downloaded, free ones included.

What a VPN changes, and what it does not
A VPN hides which app you are using from the network you are on, but the VPN company can then see it instead.
Neither the VPN nor the encryption hides your messages from the person you are writing to, or from anyone holding an unlocked phone at either end.
