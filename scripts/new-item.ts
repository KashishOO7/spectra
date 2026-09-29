#!/usr/bin/env tsx

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { isDeepStrictEqual } from 'node:util';
import yaml from 'js-yaml';
import { readControls } from '../src/lib/content/controls.ts';
import { serializeControl, parseControl } from '../src/lib/content/control-md.ts';

const NOTES_DIR = join(process.cwd(), 'wiki', 'controls');

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

const folder = category.replace(/_/g, '-');
const rel = `wiki/controls/${folder}/${id}.md`;
const target = join(NOTES_DIR, folder, `${id}.md`);
if (existsSync(target)) fail(`${rel} already exists. Pick a different id.`);
const taken = readControls(process.cwd()).find(c => c.item.id === id);
if (taken) fail(`${taken.file} already uses the id ${id}. Pick a different id.`);

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

const item = yaml.load(template) as Record<string, unknown>;
const note = serializeControl(item);
if (!isDeepStrictEqual(parseControl(note, rel), item)) {
  fail(`the note for ${id} does not read back as the template it was written from. Nothing was written.`);
}

mkdirSync(join(NOTES_DIR, folder), { recursive: true });
writeFileSync(target, note, 'utf-8');
console.log(`\x1b[32m✓ Created ${rel}\x1b[0m`);
console.log('  Fill in the TODO fields, then run: npm run validate');
console.log(`
  difficulty            technical, disruption, reversibility: 1 easy, 2 moderate, 3 complex
  time_estimate.setup   5min | 30min | 2hr | half_day | multi_day
  maturity_level        1 essential .. 5 expert
  score_weight          0 to 10
  attack_vectors, assets_protected   real values from the taxonomy
  sources               at least one primary source is required for an active step${isHuman ? `
  emotional_register    required here: urgency | authority | social_proof | reciprocity | fear |
                        scarcity | trust_exploitation | grief_isolation | anger | loneliness` : ''}`);

const Y = '\x1b[33m', D = '\x1b[2m', X = '\x1b[0m', B = '\x1b[1m';
console.log(`
${B}Before you write a word.${X}
${D}No grade, vocabulary or length rule decides a sentence. These are the rules that apply.${X}

  ${Y}One description, not two.${X}  Plain English with the technical part folded in. Do not write a
                            simple version and a technical version; that is double the work and
                            double the surface to keep true.
  ${Y}Say it straight.${X}          Name who does what. No riddles, no metaphor standing in for the
                            thing, no consequence bolted onto a definition.
  ${Y}Keep the hard word.${X}       Define it in wiki/glossary/ instead of deleting it. Deleting
                            it costs the fact the sentence existed to carry.
  ${Y}Say the whole thing.${X}      "A stolen password is enough" — enough for what? A comparison
                            with nothing to compare to is a sentence the reader has to finish.
  ${Y}Nothing that rots.${X}        No tool names to go and get, no menu paths, no version numbers,
                            no years, no law sections, no "currently", no pricing. Companies change
                            these without telling us and the sentence goes quietly wrong.
  ${Y}What to look for, not who to pick.${X} That is what stays true. A maintained directory carries
                            the rest.
  ${Y}Works in any country.${X}      Never state a country's law or use a country as an example.
                            Say "in some countries", and cite the real source under the step.
  ${Y}Walk it on each device.${X}    Android, iPhone and a computer, each from the maker's own
                            help page, before the instruction goes in.
  ${Y}Every claim carries its source${X}, and the source has to support the sentence it is attached
                            to. A link that returns 200 is not a checked citation.

${D}Then run:  npm run validate${X}
`);
