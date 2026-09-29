---
id: data-broker-optout-001
schema_version: 1.0.0
version: 2.2.0
title: Remove yourself from data broker databases
category: data_management
subcategory: data_deletion
tracks:
  - general
  - known_person_risk
  - public_work
platforms:
  - web
not_applicable_if: []
sensitive: false
difficulty:
  technical: 1
  disruption: 1
  reversibility: 1
time_estimate:
  setup: 2hr
  ongoing: low
maturity_level: 2
adversaries:
  - targeted_individual
  - data_broker
  - intimate_partner
  - opportunistic
attack_vectors:
  - data_broker_aggregation
  - osint_passive
assets_protected:
  - location
  - identity
  - relationships
controls_implemented: []
score_weight: 8
threat_model_multipliers:
  targeted_individual: 2
  data_broker: 2
  intimate_partner: 2
  opportunistic: 1.2
compensating_controls: []
depends_on: []
related_items:
  - id: osint-self-001
    relationship: required_companion
    note: That step's searches of your name, phone number and email address show which people-search sites list you.
status: active
superseded_by: null
last_verified: '2026-03-04'
verified_by:
  - org:eff.org
  - org:privacyguides.org
sources:
  - url: https://privacyguides.org/en/data-broker-removals/
    title: Data Removal Services — Privacy Guides
    type: primary
    accessed: '2026-03-04'
  - url: https://www.eff.org/deeplinks/2025/09/opt-out-october-daily-tips-protect-your-privacy-and-security
    title: 'Opt Out October: Daily Tips to Protect Your Privacy — EFF'
    type: supporting
    accessed: '2026-03-05'
  - url: https://onlineharassmentfieldmanual.pen.org/protecting-information-from-doxing/
    title: Managing Your Online Footprint and Protecting from Doxing — PEN America
    type: supporting
    accessed: '2026-09-25'
  - url: https://www.consumerreports.org/electronics/personal-information/services-that-delete-data-from-people-search-sites-review-a2705843415/
    title: Services That Delete Your Data From People-Search Sites Don't Work Very Well, Study Finds — Consumer Reports
    type: supporting
    accessed: '2026-09-25'
  - url: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/individual-rights/right-to-erasure/
    title: Right to erasure — ICO
    type: supporting
    accessed: '2026-09-25'
  - url: https://oag.ca.gov/privacy/ccpa
    title: California Consumer Privacy Act (CCPA) — State of California Department of Justice
    type: supporting
    accessed: '2026-09-25'
  - url: https://privacy.ca.gov/drop/how-drop-works/
    title: How DROP works — privacy.ca.gov
    type: supporting
    accessed: '2026-09-25'
  - url: https://www.government.nl/faq/how-do-i-prevent-a-copy-of-my-id-being-used-for-fraudulent-activities
    title: How do I prevent a copy of my ID being used for fraudulent activities? — Government.nl
    type: supporting
    accessed: '2026-09-28'
  - url: https://en.wikipedia.org/wiki/Machine-readable_passport
    title: Machine-readable passport — Wikipedia
    type: supporting
    accessed: '2026-09-28'
  - url: https://en.wikipedia.org/wiki/PDF417
    title: PDF417 — Wikipedia
    type: supporting
    accessed: '2026-09-28'
  - url: https://support.apple.com/guide/preview/annotate-a-pdf-prvw11580/mac
    title: Annotate a PDF in Preview on Mac — Apple Support
    type: supporting
    accessed: '2026-09-28'
emotional_register: null
tags:
  - privacy
  - anti_doxxing
created_at: '2026-02-25'
created_by: github:@KashishOO7
changelog:
  - version: 2.1.0
    date: '2026-04-01'
    changes: Added environment_notes for has_data_protection_rights flag.
    author: github:@KashishOO7
  - version: 2.0.0
    date: '2026-03-04'
    changes: Added tiering for Manual vs Automated services. Added Privacy Guides sourcing.
    author: github:@KashishOO7
---

## Why
A search for your name and town can bring up a people-search site showing your home address, your phone number and the names of your relatives, often for free. Stalkers, scammers and identity thieves can start from that one page.

## What
Ask people-search sites to remove the page that shows your address, phone number and relatives' names. These sites collect details about people from public records, other websites and other companies, and show them to anyone who searches a name. Which of these sites list you depends on the country you live in, so search your own name to find them. Removing your page is free, and it usually has to be done again later, because the sites keep collecting new records and a removed page can reappear.
## How
### all
Do this
Search your full name in quotes, followed by your town. Note each people-search site that shows your address or phone number.
One company often runs several sites, so one opt-out can remove you from all of them.
On each site that lists you, look for a link with words like opt out, remove or privacy, often at the bottom of the page.
If you cannot find one, search the site's name with the words opt out, and use only a result on that site's own web address. Search results can show adverts and look-alike sites first.
Open the page about you and copy its web address. Then fill in the site's opt-out form. Many forms ask for the web address of your page, and an email address or phone number to confirm the request.

Before you send a request
The site's own opt-out is free, and you do not need to make an account or buy anything to use it.
Send a request only to a site that already lists you, so you do not give your details to a site that did not have them.
Some sites will not remove you without a copy of your ID. The copy tells the site more about you than it may already have, so you can decide to leave that site out, though your page there then stays up.
If you send one, cover the ID number, your photo and your signature with strips of paper before you take the photo. Many IDs repeat the number in two or three lines of letters, numbers and < signs along the bottom, or in a barcode on the back, so cover those too.
A black box drawn over a PDF with a markup tool can often be moved off again after the file is saved, so paper over the card itself is safer.
Write across the copy the site's name, the date, and that it is only for removing your page, so the copy is harder to use for anything else.
A paid removal service sends these requests for you and repeats them, which saves you the work, but it can only reach the sites it covers.
In a 2024 Consumer Reports test that tried to remove 32 volunteers' details from 13 people-search sites, requests sent by hand had removed more after four months than any of the seven paid services tested.

Test it
Search your name and town again a few weeks after you send the requests. If a page about you is still there, or a new site lists you, send an opt-out to that site. After that, search again about twice a year, or more often if someone is trying to find you, because removed pages can come back.
## By situation
### known_person_risk
If someone is trying to find you now
Removing your page does not hide your address from anyone who has already seen it. If you are in danger, contact the police or a service that supports people being stalked or abused before you work through the sites yourself.
Sending every request by hand can be too much at a time like this. If a paid removal service covers the sites that list you, it can send the first round for you, and you can go on by hand later.
## Where you are
### has_data_protection_rights
You have a legal right to ask for deletion
Where you live, the law gives you the right to ask a company to delete what it holds about you. Say in your request that you are using that right, so it is clear what you are asking for. The law usually also sets a deadline for the answer.
In some places, one official website sends your deletion request to every registered data broker at once, and they must keep deleting new records about you.

If there is no answer
Keep a copy of each request and the date you sent it. If the company does not answer in the time your law allows, you can complain to the data protection regulator where you live.
## Law
### global
Whether a site has to remove you depends on the law where you live. Many data protection laws give a legal right to have your details deleted. Where no such law applies, many sites still remove you when you ask.
