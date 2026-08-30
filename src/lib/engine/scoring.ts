
import type {
  ChecklistItem,
  ContentGraph,
  UserProfile,
  ScoredItem,
  AssessmentResult,
  Harm,
  AdversaryType,
  Track
} from '../types.js';
import { HARMS } from '../audit/constants.js';
import { harmsForItem } from '../audit/helpers.js';
import { isHarmCovered } from './coverage.js';

function seWeight(item: ChecklistItem, profile: UserProfile): number {
  if (item.category !== 'human_vulnerability' || !item.emotional_register) return 1.0;
  const quiz = profile.se_quiz;
  if (!quiz?.susceptibilities) return 1.0;
  const score = quiz.susceptibilities[item.emotional_register as string] ?? 50;
  // Range: 0.8 (low susceptibility) → 1.4 (high susceptibility)
  return 0.8 + (score / 100) * 0.6;
}

const MATURITY_THRESHOLDS = [
  { max: 20,  level: 1 },
  { max: 40,  level: 2 },
  { max: 65,  level: 3 },
  { max: 85,  level: 4 },
  { max: 100, level: 5 }
];

function getMaturityLevel(score: number): 1 | 2 | 3 | 4 | 5 {
  for (const t of MATURITY_THRESHOLDS) {
    if (score <= t.max) return t.level as 1 | 2 | 3 | 4 | 5;
  }
  return 5;
}
const SKIP_BAND_CEILING = 0.2;
const SKIP_BAND_CAP: 1 | 2 | 3 | 4 | 5 = 3;
export function activeTracksFor(profile: Pick<UserProfile, 'tracks'>): Track[] {
  const stored = profile.tracks ?? [];
  return stored.includes('general') ? stored : ['general' as Track, ...stored];
}

export function itemMatchesTracks(
  item: Pick<ChecklistItem, 'tracks'>,
  activeTracks: Track[]
): boolean {
  return item.tracks?.some(t => activeTracks.includes(t)) ?? true;
}
export function itemsForHarms(
  items: ChecklistItem[],
  harms: Harm[] | undefined,
  activeTracks: Track[]
): ChecklistItem[] {
  const mine = items.filter(i =>
    i.status === 'active' && itemMatchesTracks(i, activeTracks)
  );
  if (!harms?.length) return mine;
  const picked = new Set<Harm>(harms);
  return mine.filter(i => harmsForItem(i).some(h => picked.has(h)));
}

export function scoreAssessment(
  graph: ContentGraph,
  profile: UserProfile
): AssessmentResult {
  const activeAdversaries = profile.adversaries ?? [];
  const activeTracks      = activeTracksFor(profile);
  const now               = Date.now();
  if (!graph.items || typeof graph.items.values !== 'function') {

    return emptyResult();
  }
  const allItems = [...graph.items.values()].filter(i => i.status === 'active');

  const scoredItems: ScoredItem[] = [];
  const fullWeights = new Map<string, number>();

  for (const item of allItems) {
    // Track filter
    if (!itemMatchesTracks(item, activeTracks)) continue;

    let threat_multiplier = 1.0;
    if (activeAdversaries.length > 0 && item.threat_model_multipliers) {
      const mults = activeAdversaries.map(
        adv => item.threat_model_multipliers![adv] ?? 1.0
      );
      threat_multiplier = Math.max(...mults);
    }
    const human_multiplier = seWeight(item, profile);
    threat_multiplier *= human_multiplier;

    let compensating_factor = 0;
    if (item.compensating_controls?.length) {
      for (const cc of item.compensating_controls) {
        if (profile.implemented?.[cc.id]) {
          compensating_factor = Math.max(compensating_factor, cc.urgency_reduction ?? 0);
        }
      }
    }

    const base_weight    = item.score_weight ?? 5.0;
    const relevance_score = threat_multiplier;
    const full_weight = base_weight * threat_multiplier * (1 - compensating_factor);
    const effective_score = full_weight;
    fullWeights.set(item.id, full_weight);
    const raw_skipped     = !!(profile.skipped?.[item.id]);
    const is_skipped      = raw_skipped;
    const is_implemented  = !raw_skipped && !!(profile.implemented?.[item.id]);
    const is_snoozed     = !!(profile.snoozed?.[item.id]);
    const doneAtVersion = profile.implemented_versions?.[item.id];
    const needs_reverification =
      is_implemented && !!doneAtVersion && doneAtVersion !== item.version;

    scoredItems.push({
      ...item,
      effective_score,
      relevance_score,
      is_applicable:     true,
      priority_rank:     0,  
      is_implemented,
      is_skipped,
      is_snoozed,
      needs_reverification,
      compensating_factor
    });
  }

  const unimplemented = scoredItems
    .filter(i => !i.is_implemented && !i.is_skipped)
    .sort((a, b) =>
      a.is_snoozed !== b.is_snoozed
        ? (a.is_snoozed ? 1 : -1)
        : b.effective_score - a.effective_score
    );
  unimplemented.forEach((item, idx) => { item.priority_rank = idx + 1; });

  const totalAvailable = scoredItems.reduce((sum, i) => sum + (fullWeights.get(i.id) ?? i.effective_score), 0);
  const totalEarned = scoredItems
    .filter(i => i.is_implemented && !i.is_skipped)
    .reduce((sum, i) => sum + i.effective_score, 0);
  const skippedWeight = scoredItems
    .filter(i => i.is_skipped)
    .reduce((sum, i) => sum + (fullWeights.get(i.id) ?? i.effective_score), 0);
  const overallScore = totalAvailable > 0 ? Math.round((totalEarned / totalAvailable) * 100) : 0;
  const skippedWeightRatio = totalAvailable > 0 ? skippedWeight / totalAvailable : 0;

  const uncappedBand = getMaturityLevel(overallScore);
  const bandCappedBySkips = skippedWeightRatio > SKIP_BAND_CEILING && uncappedBand > SKIP_BAND_CAP;
  const overallBand = bandCappedBySkips ? SKIP_BAND_CAP : uncappedBand;

  // Output sets
  const criticalGaps = scoredItems
    .filter(i => !i.is_implemented && !i.is_skipped && i.maturity_level <= 2)
    .sort((a, b) => b.effective_score - a.effective_score)
    .slice(0, 8);
  const QUICK_SETUP = new Set(['5min', '10min']);
  const critical_ids = new Set(criticalGaps.map(i => i.id));

  const quickWins = scoredItems
    .filter(i =>
      !i.is_implemented && !i.is_skipped &&
      !critical_ids.has(i.id) &&
      QUICK_SETUP.has(i.time_estimate?.setup as string)
    )
    .sort((a, b) => b.effective_score - a.effective_score)
    .slice(0, 5);

  const reverify_items = scoredItems
    .filter(i => i.needs_reverification)
    .sort((a, b) => b.effective_score - a.effective_score);

  const quick_ids    = new Set(quickWins.map(i => i.id));

  const next_items = scoredItems
    .filter(i => !i.is_implemented && !i.is_skipped && !critical_ids.has(i.id) && !quick_ids.has(i.id))
    .sort((a, b) => b.effective_score - a.effective_score)
    .slice(0, 5);

  const humanItems      = scoredItems.filter(i => i.category === 'human_vulnerability');
  const humanImplemented = humanItems.filter(i => i.is_implemented).length;
  const humanVulnerabilityScore = humanItems.length > 0
    ? Math.round((humanImplemented / humanItems.length) * 100)
    : null;
  const allHarms = Object.keys(HARMS) as Harm[];
  const pickedHarms = [...new Set((profile.harms ?? []).filter(h => allHarms.includes(h)))];
  const scopeHarms = pickedHarms.length > 0 ? pickedHarms : allHarms;

  const coveredHarms: Harm[] = scopeHarms.filter(harm => isHarmCovered(scoredItems, harm));

  return {
    overall_score:    overallScore,
    overall_maturity: overallBand,
    harms_covered:    coveredHarms.length,
    harms_total:      scopeHarms.length,
    covered_harms:    coveredHarms,
    picked_harms:     pickedHarms,
    total_applicable: scoredItems.length,
    total_implemented: scoredItems.filter(i => i.is_implemented && !i.is_skipped).length,
    total_skipped:    scoredItems.filter(i => i.is_skipped).length,
    total_snoozed:    scoredItems.filter(i => i.is_snoozed && !i.is_implemented && !i.is_skipped).length,
    skipped_weight_ratio: skippedWeightRatio,
    band_capped_by_skips: bandCappedBySkips,
    critical_gaps:    criticalGaps,
    quick_wins:       quickWins,
    reverify_items,
    next_items,
    human_vulnerability_score: humanVulnerabilityScore,
    last_calculated:  new Date().toISOString(),
    all_items: scoredItems.sort((a, b) => {
      if (a.is_implemented !== b.is_implemented) return a.is_implemented ? 1 : -1;
      if (!a.is_implemented && a.is_snoozed !== b.is_snoozed) return a.is_snoozed ? 1 : -1;
      return b.effective_score - a.effective_score;
    })
  };
}

function emptyResult(): AssessmentResult {
  return {
    overall_score:    0,
    overall_maturity: 1,
    harms_covered:    0,
    harms_total:      (Object.keys(HARMS) as Harm[]).length,
    covered_harms:    [],
    picked_harms:     [],
    total_applicable: 0,
    total_implemented: 0,
    total_skipped:    0,
    total_snoozed:    0,
    skipped_weight_ratio: 0,
    band_capped_by_skips: false,
    critical_gaps:    [],
    quick_wins:       [],
    reverify_items:   [],
    next_items:       [],
    human_vulnerability_score: null,
    last_calculated:  new Date().toISOString(),
    all_items:        []
  };
}