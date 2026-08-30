export type Category =
  | 'device_security'
  | 'account_security'
  | 'communications'
  | 'network_security'
  | 'physical_security'
  | 'human_vulnerability'
  | 'data_management'
  | 'osint_footprint'
  | 'incident_response'
  | 'ai_threats';

export type AdversaryType =
  | 'opportunistic'
  | 'targeted_individual'
  | 'criminal_org'
  | 'intimate_partner'
  | 'employer'
  | 'isp_network'
  | 'data_broker'
  | 'domestic_government'
  | 'foreign_government'
  | 'ai_automated';

export type AttackVector =
  | 'phishing'
  | 'spear_phishing'
  | 'physical_access'
  | 'network_interception'
  | 'social_engineering'
  | 'malware'
  | 'supply_chain'
  | 'credential_stuffing'
  | 'sim_swap'
  | 'browser_fingerprinting'
  | 'metadata_analysis'
  | 'osint_passive'
  | 'deepfake'
  | 'voice_clone'
  | 'data_broker_aggregation'
  | 'insider_access';

export type Asset =
  | 'credentials'
  | 'local_data'
  | 'cloud_data'
  | 'communications'
  | 'metadata'
  | 'location'
  | 'identity'
  | 'financial'
  | 'relationships'
  | 'reputation'
  | 'devices'
  | 'biometrics'
  | 'behavioral_data';

export type Track =
  | 'general'
  | 'kids_teen'
  | 'womens_safety'
  | 'journalist'
  | 'corporate'
  | 'ai_focused';

export type Platform =
  | 'all'
  | 'android'
  | 'ios'
  | 'windows'
  | 'linux'
  | 'macos'
  | 'web'
  | 'router'
  | 'iot'
  | 'any_mobile'
  | 'any_desktop';

export type ItemStatus =
  | 'active'
  | 'deprecated'
  | 'under_review'
  | 'region_specific'
  | 'contested';

export type ResourceStatus =
  | 'active'
  | 'deprecated'
  | 'compromised'
  | 'acquired'
  | 'discontinued';

export type PrivacyPosture = 'privacy_first' | 'neutral' | 'mixed' | 'avoid';

export type EnvironmentFlag =
  | 'encrypted_comms_restricted'
  | 'govt_monitors_traffic'
  | 'has_data_protection_rights'
  | 'vpn_restricted'
  | 'border_device_inspection';

export type EmotionalRegister =
  | 'urgency'
  | 'authority'
  | 'social_proof'
  | 'reciprocity'
  | 'fear'
  | 'scarcity'
  | 'trust_exploitation'
  | 'grief_isolation'
  | 'anger'
  | 'loneliness'
  | null;

export type Harm =
  | 'Someone gets into your accounts'
  | 'Someone takes your money'
  | 'Someone talks you into it'
  | 'Someone follows where you go'
  | 'Someone reads what you say'
  | 'Someone uses your device against you'
  | 'Someone pretends to be you'
  | 'Someone already has your details';

export interface Source {
  url: string;
  title: string;
  type: 'primary' | 'supporting' | 'academic' | 'case_study';
  accessed: string;
}

export interface CompensatingControl {
  id: string;
  urgency_reduction: number;
  reason?: string;
}

export interface Dependency {
  id: string;
  reason: string;
  hard_dependency: boolean;
}

export interface RelatedItem {
  id: string;
  relationship: string;
  note: string;
}

export interface NotApplicableCondition {
  condition: string;
  reason: string;
}

export interface ResourceReference {
  id: string;
  context: string;
  platform_specific: string[];
}
export interface LookupRow {
  look_for: string;
  also_called?: string;
  why: string;
}

export interface Lookup {
  id: string;
  schema_version: string;
  version: string;
  title: string;
  intro: string;
  rows: LookupRow[];
  notes?: string[];
  verify_yourself?: string;
  status: ItemStatus;
  last_verified?: string;
  verified_by?: string;
  sources?: Source[];
}

export interface LegalNote {
  jurisdiction: string;
  note: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string;
  author: string;
}

export interface SecurityAudit {
  url: string;
  conducted_by: string;
  year: number;
  summary: string;
}

export interface DistributionChannel {
  platform: string;
  store: string;
  url: string;
  preferred: boolean;
  note: string;
}


export interface ChecklistItem {
  id: string;
  schema_version: string;
  version: string;
  title: string;
  simple_description?: string;
  description: string;
  threat_narrative: string;
  category: Category;
  subcategory: string;
  tracks: Track[];
  platforms: Platform[];
  platform_notes?: Record<string, string>;
  platform_notes_verified?: Record<string, string>;
  environment_notes?: Partial<Record<EnvironmentFlag, string>>;
  not_applicable_if?: NotApplicableCondition[];
  sensitive?: boolean;
  difficulty: {
    technical: number;   
    disruption: number;  
    reversibility: number; 
  };
  time_estimate: {
    setup: '5min' | '10min' | '15min' | '30min' | '2hr' | 'half_day' | 'multi_day';
    ongoing: 'negligible' | 'low' | 'medium' | 'high';
  };
  maturity_level: 1 | 2 | 3 | 4 | 5;
  adversaries: AdversaryType[];
  attack_vectors: AttackVector[];
  assets_protected: Asset[];
  controls_implemented: string[];
  score_weight: number;
  threat_model_multipliers?: Partial<Record<AdversaryType, number>>;
  compensating_controls?: CompensatingControl[];
  depends_on?: Dependency[];
  related_items?: RelatedItem[];
  status: ItemStatus;
  superseded_by: string | null;
  last_verified?: string;
  verified_by?: string[];
  sources?: Source[];
  resources?: ResourceReference[];
  lookups?: string[];
  legal_notes?: LegalNote[];
  emotional_register?: EmotionalRegister;
  tags?: string[];
  created_at: string;
  created_by: string;
  changelog?: ChangelogEntry[];
}

export interface Resource {
  id: string;
  schema_version: string;
  version: string;
  type: 'tool' | 'guide' | 'organization' | 'community' | 'dataset' | 'checklist';
  title: string;
  url: string;
  description: string;
  platforms: Platform[];
  adversaries_addressed: AdversaryType[];
  categories_relevant: Category[];
  tracks: Track[];
  cost: 'free' | 'freemium' | 'paid' | 'donation_supported';
  open_source: boolean;
  source_url?: string;
  license?: string;
  privacy_posture: PrivacyPosture;
  caveats: string[];
  security_audits?: SecurityAudit[];
  alternatives?: Array<{ id: string; note: string }>;
  endorsing_orgs?: string[];
  distribution?: DistributionChannel[];
  status: ResourceStatus;
  acquired_by?: string;
  last_verified?: string;
  verified_by?: string[];
  sources?: Source[];
  tags?: string[];
  created_at: string;
  created_by: string;
  changelog?: ChangelogEntry[];
}

export interface ContentGraph {
  items: Map<string, ChecklistItem>;
  resources: Map<string, Resource>;
  lookups: Map<string, Lookup>;
  itemsByCategory: Map<Category, string[]>;
  itemsByAdversary: Map<AdversaryType, string[]>;
  itemsByVector: Map<AttackVector, string[]>;
  itemsByAsset: Map<Asset, string[]>;
  itemsByTrack: Map<Track, string[]>;
  itemsByMaturity: Map<number, string[]>;
}

export interface TimelineEvent {
  id: string;
  type:
    | 'implemented'
    | 'unimplemented'
    | 'skipped'
    | 'unskipped'
    | 'score_milestone'
    | 'quiz_completed'
    | 'se_quiz'
    | 'profile_updated'
    | 'life_event'
    | 'import'
    | 'clear';
  item_id?: string;
  item_title?: string;
  category?: string;
  score_before?: number;
  score_after?: number;
  life_event_label?: string;
  note?: string;
  timestamp: string;
  formula?: 1 | 2;
}

export interface SEQuizResult {
  completed_at: string;
  answers: Record<string, number>;          
  susceptibilities: Record<string, number>;  
  top_register: string;
}

export interface LifeEventDef {
  id: string;
  label: string;
  icon: string;
  adversary_delta: AdversaryType[];
  track_delta: Track[];
  sensitive?: boolean;
}

export interface UserProfile {
  id: string;
  created_at: string;
  last_active: string;
  adversaries: AdversaryType[];
  adversariesManual?: AdversaryType[];
  platforms: Platform[];
  tracks: Track[];
  use_cases: string[];
  implemented: Record<string, boolean>;
  implemented_versions?: Record<string, string>;
  harms?: Harm[];
  skipped: Record<string, string>;
  snoozed?: Record<string, string>;
  notes: Record<string, string>;
  assessment_started: string;
  assessment_version: string;
  timeline?: TimelineEvent[];
  se_quiz?: SEQuizResult | null;
  life_events_applied?: string[];  
  easy_mode?: boolean;             
  environment_flags?: EnvironmentFlag[];
}

export interface ScoredItem extends ChecklistItem {
  effective_score: number;
  relevance_score: number;
  is_applicable: boolean;
  priority_rank: number;
  is_implemented: boolean;
  is_skipped: boolean;
  is_snoozed: boolean;
  compensating_factor: number;
  needs_reverification?: boolean;
}

export interface AssessmentResult {
  overall_score: number;
  overall_maturity: 1 | 2 | 3 | 4 | 5;
  critical_gaps: ScoredItem[];
  quick_wins: ScoredItem[];
  next_items: ScoredItem[];
  reverify_items: ScoredItem[];
  all_items: ScoredItem[];
  human_vulnerability_score: number | null;
  total_implemented: number;
  total_applicable: number;
  total_skipped: number;
  harms_covered: number;
  harms_total: number;
  covered_harms: Harm[];
   picked_harms: Harm[];
  total_snoozed: number;
  skipped_weight_ratio: number;
  band_capped_by_skips: boolean;
  last_calculated: string;
}