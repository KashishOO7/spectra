---
id: device-screenlock-001
schema_version: 1.0.0
version: 2.1.0
title: Set a strong screen lock, not just your face or thumb
category: device_security
subcategory: physical_security
tracks:
  - general
  - public_work
platforms:
  - all
not_applicable_if: []
sensitive: false
difficulty:
  technical: 1
  disruption: 2
  reversibility: 1
time_estimate:
  setup: 5min
  ongoing: negligible
maturity_level: 1
adversaries:
  - opportunistic
  - intimate_partner
  - targeted_individual
  - domestic_government
attack_vectors:
  - physical_access
assets_protected:
  - local_data
  - credentials
  - communications
controls_implemented: []
score_weight: 8.5
threat_model_multipliers:
  opportunistic: 1
  intimate_partner: 2
  targeted_individual: 1.5
  domestic_government: 1.8
compensating_controls: []
depends_on: []
related_items:
  - id: device-encrypt-001
    relationship: required_companion
    note: On a laptop, a login password alone does not stop someone taking the drive out and reading it. That step turns on the encryption that does.
status: active
superseded_by: null
last_verified: '2026-03-04'
verified_by:
  - org:eff.org
sources:
  - url: https://ssd.eff.org/module/how-to-get-to-know-android-privacy-and-security-settings
    title: Android Privacy and Security Settings — EFF Surveillance Self-Defense
    type: primary
    accessed: '2026-03-06'
  - url: https://www.eff.org/wp/digital-privacy-us-border-2017
    title: Digital Privacy at the US Border — EFF
    type: supporting
    accessed: '2026-09-26'
  - url: https://www.legislation.gov.uk/ukpga/2000/23/section/53
    title: Regulation of Investigatory Powers Act 2000, section 53 — legislation.gov.uk
    type: supporting
    accessed: '2026-09-26'
  - url: https://www.cbsa-asfc.gc.ca/travel-voyage/edd-ean-eng.html
    title: Examining personal digital devices at the Canadian border — CBSA
    type: supporting
    accessed: '2026-09-25'
  - url: https://support.apple.com/en-us/118430
    title: Use a computer to reset your iPhone and your passcode - Apple Support
    type: supporting
    accessed: '2026-09-27'
emotional_register: null
tags:
  - physical_security
  - legal_defense
created_at: '2026-02-25'
created_by: github:@KashishOO7
changelog:
  - version: 2.0.0
    date: '2026-03-04'
    changes: Explicitly addressed the legal/compulsion risk of biometrics vs PINs.
    author: github:@KashishOO7
---

## Why
Anyone who gets hold of your phone, whether a thief, a partner or someone at a repair shop, can read it if the code is easy to guess, or open it with your finger while you are asleep. In some countries the law also lets officers make you unlock with your face or finger more easily than make you tell them a code. In others you can be ordered to give the code as well.
## What
Set a PIN of at least six digits, or a longer password, and use your face or fingerprint only as a shortcut on top of it. The code is what protects the phone's encrypted storage, and a longer code takes far more guesses to find than a shorter one. A four-digit PIN has only 10,000 possible codes. If someone with the equipment to try code after code against your phone might get hold of it, such as the police or border officers in some countries, use a password of 8 to 12 random letters and numbers, as EFF recommends.
## How
### all
Do this
Set a six digit PIN or a passphrase, not just your face or your thumb.

Why not only a fingerprint
Face and fingerprint unlock are quicker than a code, but they can be used on you without your help: someone can press your finger to the phone while you are asleep, or hold the phone up to your face.
And in some countries you can be made to unlock with a finger more easily than you can be made to give a code.

What to look for
- iPhone: search Settings for Passcode.
- Android: search Settings for Screen lock.
Choose six digits or more, or a passphrase.
If you forget it, you may have to erase the phone to get back in, and only a backup brings your photos and messages back. Choose one you will remember.

The shortcut worth learning
iPhone and Android can both switch face and fingerprint unlock off at once, so the next unlock needs your code. Learn how on your phone now, before you need it.
- iPhone: press and hold the side button and either volume button until the sliders appear, then let go and tap Cancel.
- Android: open the power menu and tap Lockdown. On many phones the power menu opens when you hold the power button and a volume button together, or from the power icon in the quick settings panel. If Lockdown is not in the menu, search Settings for lockdown and switch on the option that shows it.
If you cannot find it, restarting the phone does the same: after a restart, iPhone and Android ask for the code before face or fingerprint will work.
Practise it once while looking at the screen. On an iPhone, let go as soon as the sliders appear: holding on starts an Emergency SOS countdown that calls emergency services.

Test it
Use the shortcut, then try to unlock with your face or your finger. If the phone asks for your code instead, the shortcut worked.
## Where you are
### border_device_inspection
Why the code matters more here
A face or a finger can be used on you while someone else holds the phone. A code has to be given by you.
Some countries protect a code more than a face or finger, but at some borders you can be required to give your code too, and refusing can mean the phone is kept.

What to do
Switch face and fingerprint off before you reach the checkpoint, using the lockdown shortcut in the steps above. Powering the phone fully off does the same thing.
Face and fingerprint work again once you have unlocked the phone with your code.
## Law
### global
Whether you can be made to unlock a phone, and how, depends on the country and the situation. In some countries a code you remember has more legal protection than your face or finger. In others you can be ordered to give the code as well.
