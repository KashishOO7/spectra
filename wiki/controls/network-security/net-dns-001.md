---
id: net-dns-001
schema_version: 1.0.0
version: 2.1.0
title: Stop your internet provider collecting a list of the sites you look up
category: network_security
subcategory: dns
tracks:
  - general
platforms:
  - all
not_applicable_if:
  - condition: item_implemented:net-vpn-001
    reason: A VPN already sends your device's lookups of site names through its own encrypted connection, so most people using one do not need this step as well.
sensitive: false
difficulty:
  technical: 1
  disruption: 1
  reversibility: 1
time_estimate:
  setup: 10min
  ongoing: negligible
maturity_level: 2
adversaries:
  - isp_network
  - data_broker
  - employer
attack_vectors:
  - network_interception
  - metadata_analysis
assets_protected:
  - metadata
  - behavioral_data
controls_implemented: []
score_weight: 7
threat_model_multipliers:
  isp_network: 2
  data_broker: 1.6
  employer: 1.4
  domestic_government: 1.2
compensating_controls:
  - id: net-vpn-001
    urgency_reduction: 0.6
    reason: A VPN already sends your device's lookups of site names through its own encrypted connection, so most people using one do not need this step as well.
depends_on: []
related_items:
  - id: net-vpn-001
    relationship: complementary
    note: A VPN hides all your traffic from the network you are on. This step covers only your device's lookups of site names, and the network can still see which sites you connect to.
status: active
superseded_by: null
last_verified: '2026-03-01'
verified_by:
  - org:privacyguides.org
sources:
  - url: https://privacyguides.org/en/dns/
    title: Encrypted DNS Resolvers — Privacy Guides
    type: primary
    accessed: '2026-03-01'
emotional_register: null
tags:
  - free_options
  - privacy
  - network
  - quick
  - no_account_needed
created_at: '2025-01-01'
created_by: github:@KashishOO7
changelog:
  - version: 2.0.0
    date: '2026-03-01'
    changes: |
      Major rewrite. Removed Google (8.8.8.8) — privacy-hostile, logs queries, incompatible
      with framework values. Removed Cloudflare (1.1.1.1) as primary recommendation — mixed
      posture, logs retained. New tiered recommendation: Quad9 (everyone, default),
      NextDNS (power users wanting custom filtering), AdGuard DNS (ad/tracker-blocking focus),
      Mullvad DNS (Mullvad VPN users). Expanded platform notes with specific setup steps.
    author: github:@KashishOO7
  - version: 1.0.0
    date: '2025-01-01'
    changes: Initial item.
    author: github:@KashishOO7
lookups:
  - lookup-choosing-a-tool-001
---

## Why
Every website you open starts with a DNS lookup of its name, and by default that lookup is sent unencrypted, even when the page itself is encrypted. Your internet provider, or whoever runs the Wi-Fi you are on, can read those lookups and keep a list of the sites you visit, and in some countries providers are ordered to change the answers to block sites. Encrypted DNS scrambles the lookup. It does not hide the addresses you connect to, and a site's name can still show when the connection opens, so it removes one record of your browsing, not all of them.

## What
Turn on private DNS, also called encrypted DNS, so the network you are on cannot read which sites your device looks up. Every site you open starts with a DNS lookup that turns its name into a numeric address, and by default that lookup goes out unencrypted. Private DNS scrambles it, so your internet provider, or whoever runs the network you are on, can no longer read it. It does not hide the addresses your device then goes to, and the site's name can often still be seen, so it removes one record of your browsing, not all of them.
## How
### all
Do this
Switch on private DNS, so the company providing your internet can no longer read the site names your device looks up.

Where to look
- Android: search Settings for Private DNS, choose Private DNS provider hostname, enter the hostname from your provider, and save.
- iPhone and Mac: there is no switch to type a provider into. Install the configuration profile or app your provider offers, then turn it on in Settings, where it appears under DNS. The guide below shows which providers offer a profile.
- Windows: in the DNS settings of your network connection, choose Manual, enter the provider's address, and set the encryption to Encrypted only. If the encryption choice stays greyed out, Windows does not know that provider, so pick one it does, or use your browser's setting.
Your browser may have its own setting, which covers only what you open in that browser. In Chrome it is Use secure DNS, and choosing a provider there stops it falling back to unencrypted lookups.

You will need an address
Android asks for the provider's hostname, and Windows for its numeric address. Each provider's own site gives both. The guide below lists recommended providers and what each says it keeps.

Test it
Go back to the setting and check it now shows your provider, then open a few sites. If pages stop loading, the hostname or address is wrong, or the provider cannot be reached encrypted. Fix it, or switch the setting off.
## Where
### res-guide-dns-001
lists recommended DNS providers.
## Where you are
### govt_monitors_traffic
What this setting does not hide
Encrypted DNS encrypts the lookups your device makes. It does not hide that your device is using encrypted DNS, and someone inspecting your traffic closely can still see that much.
Where traffic is inspected in that kind of detail, being one of the few people doing this can itself stand out.

What helps
If you use a VPN, use the VPN's own DNS, so your lookups travel encrypted with the rest of your traffic and are not visible on their own.
The VPN company can then see your lookups in place of the network you are on. This changes who can see them, not whether anyone can.

