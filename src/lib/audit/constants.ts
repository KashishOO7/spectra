
import type {
  AdversaryType, Track, Platform, EnvironmentFlag,
  Asset, AttackVector, Harm
} from '../types.js';

export const ADVERSARY_OPTIONS: {
  value: AdversaryType; label: string; description: string; tier: 'common' | 'elevated' | 'high';
}[] = [
  { value: 'opportunistic',       label: 'Automated bots & scammers',    description: 'Scam messages sent to millions, stolen passwords tried in bulk, harmful software left lying around. Not aimed at you, aimed at whoever answers.', tier: 'common' },
  { value: 'data_broker',         label: 'Data brokers',                  description: 'Companies that collect and sell personal details, usually ones you have never heard of.', tier: 'common' },
  { value: 'criminal_org',        label: 'Organised criminals',           description: 'Groups that lock up your files and demand money, and fraud rings with real resources behind them.', tier: 'elevated' },
  { value: 'ai_automated',        label: 'AI-powered attacks',            description: 'Scam messages written for you personally, copied voices, faked video. Automated, and increasingly convincing.', tier: 'elevated' },
  { value: 'targeted_individual', label: 'Someone targeting me',          description: 'One particular person who has decided to come after you, whether skilled or simply persistent.', tier: 'elevated' },
  { value: 'intimate_partner',    label: 'A current or former partner',   description: 'Someone with physical access, relationship trust, and possibly your passwords already.', tier: 'high' },
  { value: 'employer',            label: 'My employer or school',         description: 'Monitoring of work accounts, and management software on any device your employer or school controls.', tier: 'elevated' },
  { value: 'isp_network',         label: 'My internet provider',          description: 'The company providing your internet, or anyone else able to watch that connection.', tier: 'elevated' },
  { value: 'domestic_government', label: 'My own government',             description: 'Law enforcement or intelligence agencies in your country.', tier: 'high' },
  { value: 'foreign_government',  label: 'A foreign government',          description: 'Foreign intelligence services. Very capable, and they choose their targets.', tier: 'high' }
];

export const TRACK_OPTIONS: { value: Track; label: string; description: string }[] = [
  { value: 'kids_teen',     label: 'I have kids or teens at home',        description: 'Helps you protect the young people in your life online.' },
  { value: 'womens_safety', label: "Women's safety concerns",             description: 'Stalking, intimate partner surveillance, image-based abuse, online harassment.' },
  { value: 'journalist',    label: 'Journalist, activist, or researcher', description: 'Work that attracts government or organised crime interest.' },
  { value: 'corporate',     label: 'Work devices and corporate accounts', description: 'Protecting business data, work laptops, and company accounts.' },
  { value: 'ai_focused',    label: 'I want deep coverage of AI threats',  description: 'AI-written scams, copied voices, faked video, and AI used to gather what is already public about you.' }
];

export const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: 'windows', label: 'Windows' },
  { value: 'macos',   label: 'macOS' },
  { value: 'linux',   label: 'Linux' },
  { value: 'android', label: 'Android' },
  { value: 'ios',     label: 'iOS' },
  { value: 'web',     label: 'Web' }
];

export const ENVIRONMENT_OPTIONS: { value: EnvironmentFlag; label: string; detail: string }[] = [
  { value: 'encrypted_comms_restricted',  label: 'Encrypted messaging may be restricted where I live',        detail: 'Places where apps that encrypt your messages are banned or watched' },
  { value: 'govt_monitors_traffic',       label: 'My government actively monitors internet traffic',           detail: 'Places where internet providers must keep records of what you do' },
  { value: 'has_data_protection_rights',  label: 'I have legal data protection rights I can exercise',        detail: 'The right to see what is held about you and have it deleted. The GDPR in Europe, the CCPA in California' },
  { value: 'vpn_restricted',              label: 'VPN usage is restricted or monitored where I live',          detail: 'Places where only government-approved VPNs are allowed' },
  { value: 'border_device_inspection',    label: 'My devices may be inspected when crossing borders',          detail: 'Travel to or from places where devices are searched at the border' },
];

export const EMOTIONAL_REGISTER_LABELS: Record<string, string> = {
  urgency: 'Urgency manipulation', authority: 'Authority impersonation',
  social_proof: 'Social pressure', reciprocity: 'Reciprocity obligation',
  fear: 'Fear-based manipulation', scarcity: 'Manufactured scarcity',
  trust_exploitation: 'Trust exploitation', grief_isolation: 'Grief / isolation targeting',
  anger: 'Anger / outrage hijacking', loneliness: 'Loneliness exploitation'
};

export const tierDot: Record<string, string>   = { common: 'bg-teal', elevated: 'bg-amber', high: 'bg-red' };

export const maturityLabels       = ['', 'Essential', 'Baseline', 'Hardened', 'Advanced', 'Expert'];
export const maturityColors       = ['', 'text-teal-light', 'text-teal-light', 'text-amber-light', 'text-amber-light', 'text-red-light'];
export const maturityBandLabels   = ['', 'Getting started', 'Covered', 'Well covered', 'Nearly complete', 'Complete for now'];
export const maturityDescriptions = ['',
  'The essentials are still open.',
  'The common attacks are handled.',
  'Most of what Spectra covers is done.',
  'A few items left.',
  'You have finished everything Spectra currently covers. More items are being written.'
];

export const CATEGORY_LABELS: Record<string, string> = {
  device_security:     'Device Security',
  account_security:    'Account Security',
  communications:      'Communications',
  network_security:    'Network Security',
  physical_security:   'Physical Security',
  human_vulnerability: 'Spotting scams',
  data_management:     'Your data',
  osint_footprint:     'What people can find',
  incident_response:   'If something happens',
  ai_threats:          'AI Threats'
};

export const SE_SCALE_LABELS = ['', 'Definitely not', 'Unlikely', 'Maybe', 'Probably', 'Definitely yes'];


export const HARMS: Record<Harm, { assets: Asset[]; vectors: AttackVector[] }> = {
  'Someone gets into your accounts':      { assets: ['credentials', 'cloud_data'],           vectors: ['credential_stuffing', 'sim_swap'] },
  'Someone takes your money':             { assets: ['financial'],                           vectors: [] },
  'Someone talks you into it':            { assets: [],                                      vectors: ['social_engineering', 'phishing', 'spear_phishing'] },
  'Someone follows where you go':         { assets: ['location', 'relationships'],           vectors: [] },
  'Someone reads what you say':           { assets: ['communications', 'metadata'],          vectors: ['network_interception', 'metadata_analysis'] },
  'Someone uses your device against you': { assets: ['devices', 'local_data', 'biometrics'], vectors: ['malware', 'supply_chain', 'physical_access', 'insider_access'] },
  'Someone pretends to be you':           { assets: [],                                      vectors: ['deepfake', 'voice_clone'] },
  'Someone already has your details':     { assets: ['reputation', 'behavioral_data'],       vectors: ['osint_passive', 'data_broker_aggregation', 'browser_fingerprinting'] }
};

export const HARM_ADVERSARIES: Record<Harm, AdversaryType[]> = {
  'Someone gets into your accounts':      ['opportunistic', 'criminal_org'],
  'Someone takes your money':             ['opportunistic', 'criminal_org'],
  'Someone talks you into it':            ['ai_automated', 'criminal_org', 'targeted_individual'],
  'Someone follows where you go':         ['intimate_partner', 'targeted_individual'],
  'Someone reads what you say':           ['isp_network', 'intimate_partner'],
  'Someone uses your device against you': ['opportunistic', 'intimate_partner'],
  'Someone pretends to be you':           ['ai_automated', 'targeted_individual'],
  'Someone already has your details':     ['data_broker', 'opportunistic']
};

export const ADVERSARY_HARMS: Partial<Record<AdversaryType, Harm[]>> = (() => {
  const out: Partial<Record<AdversaryType, Harm[]>> = {};
  for (const [harm, advs] of Object.entries(HARM_ADVERSARIES) as [Harm, AdversaryType[]][]) {
    for (const adv of advs) (out[adv] ??= []).push(harm);
  }
  return out;
})();
