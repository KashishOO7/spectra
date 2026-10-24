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
  data_broker: 1.4
  employer: 1.4
  domestic_government: 1.2
multiplier_reasons:
  isp_network: 'This step exists to stop your internet provider seeing the sites you look up.'
  data_broker: 'In some countries internet providers may sell browsing data, and private DNS stops them collecting the list of sites you look up, though they still see which sites you connect to. Was 1.6 until 2026-10-19.'
  employer: 'On a work or school network the lookups pass through their systems, so a rise.'
  domestic_government: 'Lookups can be logged by the provider for the state, so a small rise.'
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
  - url: https://support.microsoft.com/en-us/windows/experience/connectivity-networking/essential-network-settings-and-tasks-in-windows
    title: Essential Network Settings and Tasks in Windows | Microsoft Support
    type: supporting
    accessed: '2026-10-18'
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
  - version: 2.1.0
    date: '2026-10-21'
    changes: Rewritten so each block opens on the reader's situation, then what to do, then an example.
    author: github:@KashishOO7
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
Before a website opens, your device looks up the site's name to find its numeric address, which is called a DNS lookup, and that lookup is often sent unencrypted, even when the page itself is encrypted. Say you open a clinic's website at a cafe: your internet provider, or whoever runs the Wi-Fi, can read the lookup and keep a list of the sites you visit. In some countries providers are also ordered to change the answers to block sites. Encrypted DNS scrambles the lookup. It does not hide the addresses you connect to, and a site's name can still show when the connection opens, so it removes one record of your browsing, not all of them.

## What
Before a site opens, your device looks up its name to get a numeric address, which is called a DNS lookup, and that lookup often goes out unencrypted. So your internet provider, or whoever runs the network you are on, can read which sites you visit. Turn on private DNS, also called encrypted DNS, which scrambles the lookup so they can no longer read it. It does not hide the addresses your device then goes to, and the site's name can often still be seen, so it removes one record of your browsing, not all of them. The DNS provider you switch to can still read your lookups, so choose one you trust.
## How
### all
Do this
Switch on private DNS, so the company providing your internet can no longer read the site names your device looks up.

Where to look
- Android: search Settings for Private DNS, choose Private DNS provider hostname, enter the hostname from your provider, and save.
- iPhone and Mac: there is no switch to type a provider into. Install the configuration profile or app your provider offers, then turn it on. On an iPhone, installed profiles are listed in Settings under VPN & Device Management. Install a profile only from the provider's own website, because a profile can change your device's settings. The guide below shows which providers offer a profile.
- Windows 11: in the DNS settings of your network connection, choose Manual, enter the provider's address, turn DNS over HTTPS on, and turn Fallback to plaintext off, so Windows does not send a lookup unencrypted when the encrypted one fails. If Windows does not recognise the provider, choose the manual template and enter the DNS over HTTPS address from the provider's site. Windows 10 has no such setting, so use your browser's setting there.
Your browser may have its own setting, which covers only what you open in that browser. In Chrome it is Use secure DNS, and choosing a provider there stops it falling back to unencrypted lookups.

You will need an address
Android asks for the provider's hostname, and Windows for its numeric address. The provider's own site gives what you need. The guide below lists recommended providers and what each says it keeps.

Test it
Go back to the setting and check it now shows your provider, then open a few sites. If pages stop loading, the hostname or address is wrong, or the provider cannot be reached encrypted. Fix it, or switch the setting off, which sends your lookups unencrypted again. Some providers also have a page on their site that confirms your lookups are reaching them encrypted.
## Where
### res-guide-dns-001
lists recommended DNS providers.
## Where you are
### govt_monitors_traffic
What this setting does not hide
Encrypted DNS encrypts the lookups your device makes. It does not hide that your device is using encrypted DNS, and someone inspecting your traffic closely can still see that much.
Where traffic is inspected in that kind of detail, and few people around you use encrypted DNS, using it can itself stand out.

What helps
If you use a VPN, use the VPN's own DNS, so your lookups travel encrypted with the rest of your traffic and are not visible on their own.
The VPN company can then see your lookups in place of the network you are on. This changes who can see them, not whether anyone can.

