---
id: device-encrypt-001
schema_version: 1.0.0
version: 2.1.0
title: Turn on encryption so a lost or stolen device cannot be read
category: device_security
subcategory: encryption
tracks:
  - general
  - work_accounts
  - public_work
platforms:
  - windows
  - macos
  - linux
  - android
  - ios
not_applicable_if: []
sensitive: false
difficulty:
  technical: 1
  disruption: 1
  reversibility: 2
time_estimate:
  setup: 10min
  ongoing: negligible
maturity_level: 1
adversaries:
  - opportunistic
  - targeted_individual
  - intimate_partner
  - domestic_government
  - foreign_government
  - criminal_org
attack_vectors:
  - physical_access
assets_protected:
  - local_data
  - credentials
  - identity
  - financial
controls_implemented: []
score_weight: 9.5
threat_model_multipliers:
  opportunistic: 1
  targeted_individual: 1.6
  intimate_partner: 2
  domestic_government: 1.8
  foreign_government: 2
  criminal_org: 1.2
compensating_controls: []
depends_on: []
related_items:
  - id: device-screenlock-001
    relationship: required_companion
    note: A phone's encryption is unlocked by its PIN or passcode, so it is only as strong as that code.
status: active
superseded_by: null
last_verified: '2026-03-04'
verified_by:
  - org:privacyguides.org
  - org:anonymousplanet.org
sources:
  - url: https://privacyguides.org/en/encryption/
    title: Encryption — Privacy Guides
    type: primary
    accessed: '2026-03-04'
  - url: https://ssd.eff.org/module/how-encrypt-your-windows-device
    title: How to Encrypt Your Windows, Mac, or Linux Computer — EFF Surveillance Self-Defense
    type: supporting
    accessed: '2026-03-06'
emotional_register: null
tags:
  - foundation
  - physical_security
created_at: '2026-02-25'
created_by: github:@KashishOO7
changelog:
  - version: 2.0.0
    date: '2026-03-04'
    changes: Refined platform notes for explicit local key storage advice. Added Anonymous Planet sourcing.
    author: github:@KashishOO7
---

## Why
An unencrypted laptop left in a car or seized at a border exposes everything stored on it. Nobody needs your password to read it: they can bypass the operating system by booting the laptop from a USB drive, or take its drive out and connect it to another computer, and copy your files. Full-disk encryption blocks physical access as an attack vector, because without your password the drive holds only scrambled data. The protection holds while the laptop is switched off. Once it is on and you have logged in, anyone at the keyboard can read your files.
## What
Full-disk encryption scrambles everything on the drive, so no one can read what is on a lost or stolen device without your password. Most phones do this already once a screen lock is set. On a computer it may be on already, it may be a setting you switch on, or it may not be offered at all, so check. Save the recovery key somewhere you can reach without that computer, because without it the encryption locks you out too.
## How
### all
Do this
Turn encryption on, so a lost or stolen device cannot be read.

What to look for
- Phones: Android phones and iPhones encrypt by themselves once a screen lock is set. What you control is the lock, so set a PIN or passcode.
- Windows: search Settings for Device encryption and turn it on. On the Pro, Education and Enterprise editions of Windows it can be called BitLocker instead. You need to be signed in with an administrator account. If neither appears, Windows cannot encrypt this computer by itself, and the guide below lists what you can do instead.
- Mac: search System Settings for FileVault and turn it on.
- Linux: encryption is chosen when Linux is installed. If it was not chosen, turning it on means backing up your files, wiping the drive and installing Linux again.

The recovery key
Save the recovery key somewhere you can reach without that computer: in your password manager, or on paper kept away from the computer.
- Windows: if you signed in with a Microsoft account, the key was saved to that account, and you can see it from another device at aka.ms/myrecoverykey. If someone else set up the computer, the key may be in their account instead.
- Mac: FileVault asks whether your iCloud account or a recovery key should unlock the disk if you forget your password. If you choose the key, save it as above.

Test it
Go back to the same setting and read what it says.
- Windows: Device encryption should say On, or BitLocker on the editions that have it.
- Mac: FileVault should say On.
- Phones: restart the phone. If it asks for your PIN or passcode before your face or fingerprint will work, the lock that protects the encrypted storage is set.
Do not judge a computer by its start-up screen. With encryption on, most computers start up looking exactly as they did before.
## Where
### res-guide-eff-ssd-001
has a guide to encrypting Windows, Mac and Linux computers, including what to do when Windows offers no encryption.
## Where you are
### border_device_inspection
What encryption covers here, and what it does not
Encryption protects what is on a device that is taken from you. It protects nothing on a device you have been made to unlock.
In many countries officers at a crossing can require you to unlock, and what happens if you refuse differs by country and by whether you are a citizen of it.

What actually helps
Travel with less on the device. That is the only protection here that does not depend on what you are asked to do.
Power the device fully off before you arrive, so the first unlock has to be your code rather than your face or your finger.
