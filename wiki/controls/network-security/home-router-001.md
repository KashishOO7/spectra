---
id: home-router-001
schema_version: 1.0.0
version: 1.0.0
title: "Secure your home router and put smart devices on their own network"
category: network_security
subcategory: router_security
tracks:
  - general
platforms:
  - router
not_applicable_if: []
sensitive: false
difficulty:
  technical: 2
  disruption: 1
  reversibility: 1
time_estimate:
  setup: 15min
  ongoing: low
maturity_level: 1
adversaries:
  - opportunistic
  - criminal_org
attack_vectors:
  - network_interception
  - malware
assets_protected:
  - devices
  - communications
controls_implemented: []
score_weight: 6.5
threat_model_multipliers:
  opportunistic: 1.3
  criminal_org: 1.2
multiplier_reasons:
  opportunistic: 'Routers left with a default admin password or old software are found and taken over without anyone choosing that home, so this step counts more against attackers who try every router they can reach.'
  criminal_org: 'Groups take over many home routers at once and use them for attacks on others, so a small rise.'
compensating_controls: []
depends_on: []
related_items:
  - id: device-updates-001
    relationship: complementary
    note: The linked step turns on automatic updates for your phone and computer as well.
status: active
superseded_by: null
last_verified: '2026-10-19'
verified_by:
  - org:ftc.gov
  - org:nicybersecuritycentre.gov.uk
sources:
  - url: https://consumer.ftc.gov/articles/how-secure-your-home-wi-fi-network
    title: "How To Secure Your Home Wi-Fi Network | Consumer Advice"
    type: primary
    accessed: '2026-10-19'
  - url: https://consumer.ftc.gov/articles/securing-your-internet-connected-devices-home
    title: "Securing Your Internet-Connected Devices at Home | Consumer Advice"
    type: supporting
    accessed: '2026-10-19'
  - url: https://www.nicybersecuritycentre.gov.uk/go-smart-safely
    title: "Go Smart Safely | NI Cyber Security Centre"
    type: supporting
    accessed: '2026-10-19'
emotional_register: null
tags:
  - free
  - no_tools_required
  - network
created_at: '2026-10-19'
created_by: github:KashishOO7
changelog:
  - version: 1.1.0
    date: '2026-10-21'
    changes: Rewritten so each block opens on the reader's situation, then what to do, then an example.
    author: github:@KashishOO7
  - version: 1.0.0
    date: '2026-10-19'
    changes: Initial item, row 7 batch E (NEXT §15.6 item 4), in the Smart home chapter.
    author: github:KashishOO7
---

## Why
When your computer, phone or smart TV is on your Wi-Fi, it reaches the internet through your router. The router's settings are protected by an admin password, and some routers still come with one that is the same on every router of that model and listed online. Anyone on your Wi-Fi who knows that password can sign in to the settings, see every device connected, and switch off the router's security features. Say a guest on your Wi-Fi looks up your router's model online and finds that password: they can sign in to the settings, see every device and switch off its security.

## What
Anyone who knows your router's admin password can change any setting on it, and some routers ship with a password that is the same on every router of that model. So change the admin password, keep the router's software up to date, and put your smart devices on a guest network. The admin password is a different password from the one your devices use to join the Wi-Fi, and whoever knows it can change any setting on the router, including the Wi-Fi password.

## How
### all
Do this
Sign in to your router's settings and change the admin password before anything else.

Where to find the settings
Many routers are managed through an app from the router's maker or your internet provider. On others, you type an address into your browser's address bar, and that address is often printed on a label on the router. If you cannot find the settings, search the maker's website for how to change the admin password, or ask your internet provider if the router came from them.

What to change
- Change the admin password to a long one you use nowhere else, with no name, address or router brand in it, and keep it in your password manager or on paper somewhere safe at home. If you lose it, the way back in is a factory reset, which wipes every setting and brings back the passwords printed on the router.
- Change the Wi-Fi password as well if it is still the one printed on the router or many people have had it. Every device then has to join again with the new password.
- In the Wi-Fi security setting, choose WPA3, or the setting that allows both WPA2 and WPA3 if an older device cannot join. WPA2 on its own is fine if that is all the router offers. If it offers only WEP or WPA, update its software and look again, and if those are still the only choices, replace the router or ask your internet provider for a newer one.
- Turn on automatic updates if the router has them, or check for an update now in the settings or on the maker's website. If your internet provider gave you the router, ask the provider whether it updates the router for you.
- Turn off WPS, UPnP and remote management, which lets the settings be reached over the internet, unless you know you need them. If an online game stops connecting, turn UPnP back on. If you manage the router from its app while you are away from home, turn remote management back on.

Smart devices on their own network
Many routers can run a guest network with its own name and password. Put your cameras, speakers and other smart devices on it, so that whoever hacks one of them cannot easily reach your computers and phones from it. Your phone may not be able to control or cast to a device on the guest network, so keep any device you cast to, such as a TV, on your main network.

Test it
Sign out of the router's settings and sign in again with the new admin password. Then look at the list of connected devices. Your own devices sometimes appear under a model number, so if an entry is left that you cannot match to anything in your home, change the Wi-Fi password.
