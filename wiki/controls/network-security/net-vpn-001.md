---
id: net-vpn-001
schema_version: 1.0.0
version: 1.1.0
title: Use a VPN you have checked on networks you do not trust
category: network_security
subcategory: vpn
tracks:
  - general
  - public_work
platforms:
  - all
not_applicable_if: []
sensitive: false
difficulty:
  technical: 1
  disruption: 1
  reversibility: 1
time_estimate:
  setup: 30min
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
  - communications
  - behavioral_data
controls_implemented: []
score_weight: 7.5
threat_model_multipliers:
  isp_network: 1.8
  data_broker: 1.5
  employer: 1.6
  domestic_government: 1.2
  foreign_government: 1
compensating_controls: []
depends_on: []
related_items:
  - id: net-dns-001
    relationship: stronger_alternative
    note: A VPN with its own DNS handling makes separate encrypted DNS less necessary.
status: active
superseded_by: null
last_verified: '2026-03-31'
verified_by:
  - org:privacyguides.org
sources:
  - url: https://privacyguides.org/en/vpn/
    title: VPN Services — Privacy Guides
    type: primary
    accessed: '2025-02-01'
  - url: https://ssd.eff.org/module/choosing-vpn-thats-right-you
    title: "Surveillance Self-Defense: Choosing the VPN That's Right for You"
    type: supporting
    accessed: '2026-09-27'
  - url: https://protonvpn.com/support/what-is-kill-switch
    title: How to use kill switch | Proton VPN
    type: supporting
    accessed: '2026-09-27'
  - url: https://support.apple.com/en-us/102554
    title: Use captive Wi-Fi networks on your iPhone or iPad - Apple Support
    type: supporting
    accessed: '2026-09-27'
emotional_register: null
tags:
  - paid_options
  - privacy
  - network
  - public_wifi
created_at: '2025-01-01'
created_by: github:@KashishOO7
changelog:
  - version: 1.0.0
    date: '2025-01-01'
    changes: Initial item.
    author: github:@KashishOO7
lookups:
  - lookup-choosing-a-tool-001
---

## Why
Most websites now encrypt what you send, so someone else on the same wifi cannot read it. The people running the network can still see which sites you connect to. A VPN hides that from the network you are on and from your internet provider, but the VPN company can then see it instead.
## What
Use a VPN you have checked when you are on wifi you do not own, like in a cafe, hotel or airport. It stops that network seeing which sites you visit, and moves that view to the VPN company, so it is only as trustworthy as that company. At home it moves the same view from your internet provider to the VPN company.
## How
### all
Do this
Turn on a VPN when you are using wifi you do not control, like a cafe, hotel or airport.

What it does, and what it does not
A VPN stops the network you are on from seeing which sites you visit.
A VPN does not make you anonymous, and the VPN company can see which sites you visit instead.

Picking one
Because the view moves rather than disappears, the choice is the whole decision. Use the checks on this page, under how to judge a tool before you trust it, and weigh one of them heaviest: whether someone independent has published an audit of what the company keeps. A company saying it keeps no records is not the same as anyone having checked.
Be careful with free ones. Running a VPN costs money, and some free ones pay for it by selling what they learn about your browsing.

While you are in there
Turn on the kill switch, also called always-on, so nothing is sent outside the VPN if it drops. With it on, you have no internet while the VPN is not connected. Hotel and airport Wi-Fi can ask you to sign in on a web page first, so switch the kill switch off to sign in there, then back on.

Test it
Turn it on, then search the web for what is my IP and open any result. If the country it shows is the one you picked rather than the one you are sitting in, it is working.
## Where
### res-guide-vpn-001
lists recommended VPN providers, and what a VPN does not do.
## Where you are
### vpn_restricted
Check the law before you subscribe
In some countries only government-approved VPNs are allowed, and using another one can be against the law or draw attention to you.
Find out what applies where you are before you sign up. This is one of the few steps on your list that can carry a legal risk.

If VPNs are blocked where you are
Tools that get around a block can make your traffic stand out more, not less, and where VPNs are controlled, standing out is itself the risk.
Weigh whether you need this step at all. The other steps on your list do not depend on it.
### govt_monitors_traffic
Who can see your traffic
A VPN moves the view of your traffic from your internet provider to the VPN company. It does not make you anonymous.
Where traffic is watched closely, what matters most is what the VPN company keeps about you, and whether anyone outside the company has checked.

What to look for
Look for an audit by an outside firm, with its report published. A company saying it keeps no records is not the same as someone outside confirming it.
If it matters where you are, look for a way to pay that is not tied to your name.
The guide below lists recommended providers and which ones accept that kind of payment.
## Law
### global
Whether you may use a VPN, and what a VPN company must record, depends on the country you are in and the country the company is based in. A VPN does not make you anonymous. It moves the view of your traffic from your internet provider to the VPN company. This is general information, not legal advice.
