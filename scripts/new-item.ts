#!/usr/bin/env tsx

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const ITEMS_DIR = join(process.cwd(), 'content', 'items');

const VALID_CATEGORIES = [
  'device_security', 'account_security', 'communications', 'network_security',
  'physical_security', 'human_vulnerability', 'data_management', 'osint_footprint',
  'incident_response', 'ai_threats',
];

function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true';
      out[key] = val;
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const id = args.id;
const category = args.category;
const title = args.title;
const today = new Date().toISOString().slice(0, 10);

function fail(msg: string): never {
  console.error(`\x1b[31m✗ ${msg}\x1b[0m`);
  console.error('\nUsage: npm run new:item -- --id <id> --category <category> --title "<title>"');
  console.error(`Categories: ${VALID_CATEGORIES.join(', ')}`);
  process.exit(1);
}

if (!id || !category || !title) fail('Missing required argument(s): --id, --category, --title');
if (!/^[a-z0-9-]+$/.test(id)) fail(`--id must be kebab-case (got '${id}'). Convention: <area>-<thing>-001`);
if (!VALID_CATEGORIES.includes(category)) fail(`Invalid --category '${category}'.`);

const target = join(ITEMS_DIR, `${id}.yaml`);
if (existsSync(target)) fail(`content/items/${id}.yaml already exists — pick a different id.`);

const isHuman = category === 'human_vulnerability';

const template = `id: "${id}"
schema_version: "1.0.0"
version: "1.0.0"
title: "${title}"
description: |
  TODO: 2-4 sentences. WHAT the control is and HOW to think about it.
threat_narrative: |
  TODO: 2-3 sentences. WHAT specifically happens to the user without this control.
category: "${category}"
subcategory: "TODO"
tracks:
  - "general"
platforms:
  - "all"
platform_notes:
  general: |
    TODO: how to actually do this. Keep steps concrete.
platform_notes_verified:
  general: "${today}"
not_applicable_if: []
sensitive: false
difficulty:
  technical: 1     # 1 easy, 2 moderate, 3 complex
  disruption: 1
  reversibility: 1
time_estimate:
  setup: "30min"   # 5min | 30min | 2hr | half_day | multi_day
  ongoing: "negligible"
maturity_level: 1  # 1 essential .. 5 expert
adversaries:
  - "opportunistic"
attack_vectors:
  - "phishing"     # TODO: real vectors from the taxonomy
assets_protected:
  - "credentials"  # TODO
controls_implemented: []
score_weight: 5.0  # 0-10
threat_model_multipliers:
  opportunistic: 1.0
compensating_controls: []
depends_on: []
related_items: []
status: "active"
superseded_by: null
last_verified: "${today}"
verified_by:
  - "org:TODO"
sources:
  - url: "https://TODO"
    title: "TODO — primary source"
    type: "primary"      # at least one primary source is REQUIRED for active items
    accessed: "${today}"
resources: []
legal_notes: []
emotional_register: ${isHuman ? '"urgency"  # REQUIRED for human_vulnerability: urgency|authority|social_proof|reciprocity|fear|scarcity|trust_exploitation|grief_isolation|anger|loneliness' : 'null'}
tags: []
created_at: "${today}"
created_by: "github:KashishOO7"
changelog:
  - version: "1.0.0"
    date: "${today}"
    changes: "Initial item creation."
    author: "github:KashishOO7"
`;

if (!existsSync(ITEMS_DIR)) mkdirSync(ITEMS_DIR, { recursive: true });
writeFileSync(target, template, 'utf-8');
console.log(`\x1b[32m✓ Created content/items/${id}.yaml\x1b[0m`);
console.log('  Fill in the TODO fields, then run: npm run validate');
