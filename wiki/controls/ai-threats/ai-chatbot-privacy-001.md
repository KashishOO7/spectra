---
id: ai-chatbot-privacy-001
schema_version: 1.0.0
version: 1.0.0
title: Keep private details out of what you type into AI chat apps
category: ai_threats
subcategory: ai_data_exposure
tracks:
  - general
platforms:
  - all
not_applicable_if: []
sensitive: false
difficulty:
  technical: 1
  disruption: 1
  reversibility: 1
time_estimate:
  setup: 10min
  ongoing: low
maturity_level: 2
adversaries:
  - data_broker
  - opportunistic
attack_vectors:
  - metadata_analysis
assets_protected:
  - credentials
  - identity
controls_implemented: []
score_weight: 5.5
threat_model_multipliers:
  data_broker: 1.3
  opportunistic: 1.1
compensating_controls: []
depends_on: []
related_items: []
status: active
superseded_by: null
last_verified: '2026-09-29'
verified_by:
  - org:google.com
  - org:openai.com
sources:
  - url: https://support.google.com/gemini/answer/13594961?hl=en
    title: Gemini Apps Privacy Hub - Gemini Apps Help
    type: primary
    accessed: '2026-09-29'
  - url: https://help.openai.com/en/articles/7730893-data-controls-faq
    title: Data controls in ChatGPT | OpenAI Help Center
    type: primary
    accessed: '2026-09-29'
  - url: https://support.google.com/gemini/answer/13278892?hl=en
    title: Manage & delete your activity in Gemini Apps - Gemini Apps Help
    type: supporting
    accessed: '2026-09-29'
  - url: https://support.microsoft.com/en-us/topic/privacy-faq-for-microsoft-copilot-27b3a435-8dc9-4b55-9a4b-58eeb9647a7f
    title: Privacy FAQ for Microsoft Copilot | Microsoft Support
    type: supporting
    accessed: '2026-09-29'
tags:
  - free
  - no_tools_required
created_at: '2026-09-29'
created_by: github:KashishOO7
changelog:
  - version: 1.0.0
    date: '2026-09-29'
    changes: Initial item, phase 7 of NEXT §15.4, from Google's, OpenAI's and Microsoft's own privacy pages.
    author: github:KashishOO7
---

## Why
What you type into an AI chat app is kept by the company that runs the app, and at some companies people who work there, or for them, read some chats to check the answers and look for misuse. Many apps also use your chats to train their AI models unless you turn that off. At least one maker's own help page, listed under this step, asks people not to type anything confidential.
## What
Do not type passwords, card numbers or other private details into an AI chat app. Then turn off the setting that lets the company use your chats to train its models.
## How
### all
Do this
Before you paste something into an AI chat app, take out anything private: passwords and codes, card and bank numbers, ID numbers, health details, and other people's names and messages. Then turn off training on your chats in the app's settings.

Turn off training
Open the app's settings and look for a switch about using your chats to train or improve its models, often under Data controls, Privacy or Activity. Turn the switch off. From then on your new chats are not used for training.
In some apps the same switch also stops your new chats being saved to your history, so you cannot go back to them later.

A chat that is not kept
Some apps offer a temporary chat, which is not saved to your history and not used for training, though the company may still keep a copy for days or weeks to check for misuse.

With these off
Everything you type still goes to the company that runs the app, and at some companies people who work there can still see some chats. Keep private details out of your chats either way.
