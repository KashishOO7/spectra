---
id: data-backup-001
schema_version: 1.0.0
version: 2.1.0
title: Back up somewhere the provider cannot read your files
category: data_management
subcategory: backup_security
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
maturity_level: 2
adversaries:
  - opportunistic
  - criminal_org
  - domestic_government
  - foreign_government
  - data_broker
attack_vectors:
  - physical_access
  - supply_chain
  - insider_access
assets_protected:
  - local_data
  - cloud_data
controls_implemented: []
score_weight: 7
threat_model_multipliers:
  opportunistic: 0.8
  targeted_individual: 1.2
  criminal_org: 1
  domestic_government: 1.6
  foreign_government: 1.8
  data_broker: 1.1
  ai_automated: 0.7
compensating_controls: []
depends_on:
  - id: device-encrypt-001
    reason: Encrypt the device first, so the copy on your own machine is protected too.
    hard_dependency: false
related_items:
  - id: device-encrypt-001
    relationship: complementary
    note: Encryption protects the files on your device. This step protects the copy you keep online.
status: active
superseded_by: null
last_verified: '2026-03-01'
verified_by:
  - org:privacyguides.org
sources:
  - url: https://privacyguides.org/en/cloud/
    title: Cloud Storage — Privacy Guides
    type: primary
    accessed: '2026-03-01'
emotional_register: null
tags:
  - free_option
  - open_source_options
  - privacy_preserving
  - one_time_setup
  - zero_knowledge
created_at: '2026-02-25'
created_by: github:KashishOO7
changelog:
  - version: 2.0.0
    date: '2026-03-01'
    changes: |
      Major rewrite. Previous version led with Cryptomator, creating a friction gap
      that most users won't clear. New approach: Tier 1 = switch to a zero-knowledge
      provider by default (Proton Drive, Filen.io, Internxt — all free tiers, E2EE
      by design, zero additional steps). Tier 2 = Cryptomator for users locked into
      existing providers. Tier 3 = self-hosted/CLI. Updated difficulty from 2hr to
      30min (Tier 1 setup is just app install + sign in). Added iCloud Advanced Data
      Protection as iOS priority action.
    author: github:KashishOO7
  - version: 1.0.0
    date: '2026-02-25'
    changes: Initial item.
    author: github:KashishOO7
lookups:
  - lookup-choosing-a-tool-001
---

## Why
With many cloud storage services you have to trust the company not to look at your files, because it holds the key that unlocks them. Anyone who gets the company's copy, through a break-in or a legal demand, can then read it too. A service that encrypts your files on your own device before they upload never has that key.
## What
Back up your files somewhere the service itself cannot read them. A backup is only as private as whoever holds the key, and with many services that is the company, not you. Some services encrypt your files on your own device before they upload, so the company stores copies it cannot read. If yours does not, you can encrypt a folder yourself before it syncs.
## How
### all
Do this
Back up your files somewhere the provider cannot read them.

What to look for
Wording like end-to-end encrypted, or zero-knowledge. Both mean the provider holds no key to your files.
A backup only you can open is lost with its password. Keep that password, and any recovery key the service gives you, where you can reach them without this device.
If you want to keep the storage you already pay for, encrypt the files yourself before they go up.
A tool that does this gives you a folder that looks ordinary on your own machine and is unreadable to everyone else. You save into that folder, and the scrambled copy is what gets uploaded. The guide below lists current ones.

Also
Keep one copy somewhere not connected to the internet. A drive in a drawer survives things a cloud account does not.

Test it
Look up what the provider does if you forget your password. Search its help pages for forgotten password or password reset.
If it can restore your files for you, it could read them all along. If it says the files are lost for good, nobody there holds a key to them.
## Where
### res-guide-cloud-001
lists storage that cannot read your files, and tools that encrypt before upload.
## Law
### global
Encrypting your own files is legal in most countries, though some countries restrict strong
encryption. This step is about your personal files. This is general information, not legal advice.

