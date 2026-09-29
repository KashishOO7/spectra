
import type {
  AdversaryType, Track, Platform, EnvironmentFlag,
  Asset, AttackVector, Harm
} from '../types.js';
import names from '#spectra-wiki/page/names';
import { rows } from '../wiki/page.js';

const LEVELS = ['1', '2', '3', '4', '5'] as const;
const byLevel = (key: string): string[] => {
  const words = rows(names, key, LEVELS, 1);
  return ['', ...LEVELS.map(n => words[n][0])];
};

const ADVERSARY_TIERS = [
  ['opportunistic', 'common'],
  ['data_broker', 'common'],
  ['criminal_org', 'elevated'],
  ['ai_automated', 'elevated'],
  ['targeted_individual', 'elevated'],
  ['intimate_partner', 'high'],
  ['employer', 'elevated'],
  ['isp_network', 'elevated'],
  ['domestic_government', 'high'],
  ['foreign_government', 'high']
] as const satisfies ReadonlyArray<readonly [AdversaryType, 'common' | 'elevated' | 'high']>;
const whoWords = rows(names, 'who', ADVERSARY_TIERS.map(([v]) => v), 2);
export const ADVERSARY_OPTIONS: {
  value: AdversaryType; label: string; description: string; tier: 'common' | 'elevated' | 'high';
}[] = ADVERSARY_TIERS.map(([value, tier]) => ({ value, label: whoWords[value][0], description: whoWords[value][1], tier }));

const TRACK_VALUES = ['caring_for_someone', 'known_person_risk', 'public_work', 'work_accounts', 'ai_focused'] as const satisfies readonly Track[];
const situationWords = rows(names, 'situations', TRACK_VALUES, 2);
export const TRACK_OPTIONS: { value: Track; label: string; description: string }[] =
  TRACK_VALUES.map(value => ({ value, label: situationWords[value][0], description: situationWords[value][1] }));
export const OFFERED_TRACKS = TRACK_OPTIONS.filter(o => o.value === 'caring_for_someone' || o.value === 'known_person_risk');

const PLATFORM_VALUES = ['windows', 'macos', 'linux', 'android', 'ios', 'web'] as const satisfies readonly Platform[];
const PLATFORM_ALL = [...PLATFORM_VALUES, 'all', 'any_mobile', 'any_desktop', 'router', 'iot'] as const satisfies readonly Platform[];
const platformWords = rows(names, 'platforms', PLATFORM_ALL, 1);
export const PLATFORM_NAMES: Record<Platform, string> =
  Object.fromEntries(PLATFORM_ALL.map(value => [value, platformWords[value][0]])) as Record<Platform, string>;
export const PLATFORM_OPTIONS: { value: Platform; label: string }[] =
  PLATFORM_VALUES.map(value => ({ value, label: platformWords[value][0] }));

const ENVIRONMENT_VALUES = [
  'encrypted_comms_restricted', 'govt_monitors_traffic', 'has_data_protection_rights', 'vpn_restricted', 'border_device_inspection'
] as const satisfies readonly EnvironmentFlag[];
const placeWords = rows(names, 'places', ENVIRONMENT_VALUES, 2);
export const ENVIRONMENT_OPTIONS: { value: EnvironmentFlag; label: string; detail: string }[] =
  ENVIRONMENT_VALUES.map(value => ({ value, label: placeWords[value][0], detail: placeWords[value][1] }));

const REGISTER_VALUES = [
  'urgency', 'authority', 'social_proof', 'reciprocity', 'fear', 'scarcity',
  'trust_exploitation', 'grief_isolation', 'anger', 'loneliness'
] as const;
const triggerWords = rows(names, 'triggers', REGISTER_VALUES, 1);
export const EMOTIONAL_REGISTER_LABELS: Record<string, string> =
  Object.fromEntries(REGISTER_VALUES.map(value => [value, triggerWords[value][0]]));

export const tierDot: Record<string, string>   = { common: 'bg-teal', elevated: 'bg-teal', high: 'bg-dim' };

export const maturityLabels       = byLevel('step-levels');
export const maturityColors       = ['', 'text-teal-light', 'text-teal-light', 'text-teal-light', 'text-teal-light', 'text-bright'];
export const maturityBandLabels   = byLevel('progress-bands');
export const maturityDescriptions = byLevel('progress-band-lines');

const CATEGORY_VALUES = [
  'device_security', 'account_security', 'communications', 'network_security', 'physical_security',
  'human_vulnerability', 'data_management', 'osint_footprint', 'incident_response', 'ai_threats'
] as const;
const categoryWords = rows(names, 'categories', CATEGORY_VALUES, 1);
export const CATEGORY_LABELS: Record<string, string> =
  Object.fromEntries(CATEGORY_VALUES.map(value => [value, categoryWords[value][0]]));

const DIFFICULTY_LEVELS = ['1', '2', '3'] as const;
const difficultyWords = rows(names, 'difficulty', DIFFICULTY_LEVELS, 1);
export const DIFFICULTY_LABELS = ['', ...DIFFICULTY_LEVELS.map(n => difficultyWords[n][0])];


export const HARMS: Record<Harm, { assets: Asset[]; vectors: AttackVector[] }> = {
  'Someone gets into your accounts':      { assets: ['credentials', 'cloud_data'],           vectors: ['credential_stuffing', 'sim_swap'] },
  'Someone takes your money':             { assets: ['financial'],                           vectors: [] },
  'Someone talks you into it':            { assets: [],                                      vectors: ['social_engineering', 'phishing', 'spear_phishing'] },
  'Someone follows where you go':         { assets: ['location', 'relationships'],           vectors: [] },
  'Someone reads what you say':           { assets: ['communications', 'metadata'],          vectors: ['network_interception', 'metadata_analysis'] },
  'Someone uses your device against you': { assets: ['devices', 'local_data', 'biometrics'], vectors: ['malware', 'supply_chain', 'physical_access', 'insider_access'] },
  'Someone pretends to be you':           { assets: [],                                      vectors: ['deepfake', 'voice_clone', 'identity_fraud'] },
  'Someone already has your details':     { assets: ['reputation', 'behavioral_data'],       vectors: ['osint_passive', 'data_broker_aggregation', 'browser_fingerprinting'] },
  'Someone will not leave you alone':     { assets: ['reputation'],                          vectors: [] },
  'You are locked out of your own account': { assets: ['account_access'],                 vectors: [] }
};

export const HARM_ADVERSARIES: Record<Harm, AdversaryType[]> = {
  'Someone gets into your accounts':      ['opportunistic', 'criminal_org'],
  'Someone takes your money':             ['opportunistic', 'criminal_org'],
  'Someone talks you into it':            ['ai_automated', 'criminal_org', 'targeted_individual'],
  'Someone follows where you go':         ['intimate_partner', 'targeted_individual'],
  'Someone reads what you say':           ['isp_network', 'intimate_partner'],
  'Someone uses your device against you': ['opportunistic', 'intimate_partner'],
  'Someone pretends to be you':           ['ai_automated', 'targeted_individual'],
  'Someone already has your details':     ['data_broker', 'opportunistic'],
  'Someone will not leave you alone':     ['targeted_individual', 'intimate_partner'],
  'You are locked out of your own account': []
};

export const ADVERSARY_HARMS: Partial<Record<AdversaryType, Harm[]>> = (() => {
  const out: Partial<Record<AdversaryType, Harm[]>> = {};
  for (const [harm, advs] of Object.entries(HARM_ADVERSARIES) as [Harm, AdversaryType[]][]) {
    for (const adv of advs) (out[adv] ??= []).push(harm);
  }
  return out;
})();
