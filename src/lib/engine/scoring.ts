// Core scoring engine: Maps the content graph against the user profile.

import type {
  ChecklistItem,
  ContentGraph,
  UserProfile,
  ScoredItem,
  CategoryScore,
  AssessmentResult,
  Category,
  AdversaryType,
  LandscapeEvent
} from '../types.js';

function seWeight(item: ChecklistItem, profile: UserProfile): number {
  if (item.category !== 'human_vulnerability' || !item.emotional_register) return 1.0;
  const quiz = profile.se_quiz;
  if (!quiz?.susceptibilities) return 1.0;
  const score = quiz.susceptibilities[item.emotional_register as string] ?? 50;
  // Range: 0.8 (low susceptibility) → 1.4 (high susceptibility)
  return 0.8 + (score / 100) * 0.6;
}

const CATEGORY_LABELS: Record<Category, string> = {
  device_security:     'Device Security',
  account_security:    'Account Security',
  communications:      'Communications',
  network_security:    'Network Security',
  physical_security:   'Physical Security',
  human_vulnerability: 'Human Vulnerability',
  data_management:     'Data Management',
  osint_footprint:     'OSINT Footprint',
  incident_response:   'Incident Response',
  ai_threats:          'AI Threats'
};

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

// Score drift: items age past last_verified shrinks their score contribution.
// Tiers: <6mo = full | 6–12mo = 0.9× | 12–18mo = 0.75× | 18mo+ = 0.5×
function getStalenessMultiplier(lastVerified: string | undefined): number {
  if (!lastVerified) return 0.75;
  const ageDays = (Date.now() - new Date(lastVerified).getTime()) / 86_400_000;
  if (ageDays < 180) return 1.0;
  if (ageDays < 365) return 0.9;
  if (ageDays < 548) return 0.75;
  return 0.5;
}

export function scoreAssessment(
  graph: ContentGraph,
  profile: UserProfile,
  landscapeEvents: LandscapeEvent[] = []
): AssessmentResult {
  const activeAdversaries = profile.adversaries ?? [];
  const activeTracks      = profile.tracks ?? ['general'];
  const now               = Date.now();

  // graph.items is a Map — must use .values(), not Object.values()
  if (!graph.items || typeof graph.items.values !== 'function') {
    // Graceful degradation if graph not loaded yet
    return emptyResult();
  }
  const allItems = [...graph.items.values()].filter(i => i.status === 'active');

  // Pre-compute active landscape events
  const activeLandscape = landscapeEvents.filter(
    e => new Date(e.expires_at).getTime() > now
  );

  const scoredItems: ScoredItem[] = [];

  for (const item of allItems) {
    // Track filter
    const matchesTrack = item.tracks?.some(t => activeTracks.includes(t)) ?? true;
    if (!matchesTrack) continue;

    // Threat model multiplier: take the MAX across selected adversaries
    let threat_multiplier = 1.0;
    if (activeAdversaries.length > 0 && item.threat_model_multipliers) {
      const mults = activeAdversaries.map(
        adv => item.threat_model_multipliers![adv] ?? 1.0
      );
      threat_multiplier = Math.max(...mults);
    }

    // SE quiz human vulnerability weighting
    const human_multiplier = seWeight(item, profile);
    threat_multiplier *= human_multiplier;

    // Landscape feed: compound active global threat multipliers
    let landscape_multiplier = 1.0;
    for (const ev of activeLandscape) {
      if (ev.related_items.includes(item.id)) {
        landscape_multiplier *= ev.multiplier;
      }
    }

    // Compensating controls: reduce urgency if a stronger control is active
    let compensating_factor = 0;
    if (item.compensating_controls?.length) {
      for (const cc of item.compensating_controls) {
        if (profile.implemented?.[cc.id]) {
          compensating_factor = Math.max(compensating_factor, cc.urgency_reduction ?? 0);
        }
      }
    }

    const base_weight    = item.score_weight ?? 5.0;
    const staleness_multiplier = getStalenessMultiplier(item.last_verified);
    const relevance_score = threat_multiplier;
    const effective_score = base_weight * threat_multiplier * landscape_multiplier * (1 - compensating_factor) * staleness_multiplier;

    const is_implemented = !!(profile.implemented?.[item.id]);
    const is_skipped     = !!(profile.skipped?.[item.id]);

    // Security Pulse: flag items whose YAML was verified after the user marked them done
    let needs_reverification = false;
    if (is_implemented && profile.timeline?.length) {
      const implEvents = profile.timeline
        .filter(e => e.type === 'implemented' && e.item_id === item.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      if (implEvents.length > 0 && item.last_verified) {
        const lastImpl = implEvents[0];
        // YAML was verified AFTER user marked it done → content has changed
        if (
          new Date(item.last_verified).getTime() > new Date(lastImpl.timestamp).getTime() &&
          item.maturity_level <= 2  // anti-alert-fatigue: only foundational controls
        ) {
          needs_reverification = true;
        }
      }
    }

    scoredItems.push({
      ...item,
      effective_score,
      relevance_score,
      is_applicable:     true,
      priority_rank:     0,   // assigned below after full sort
      is_implemented,
      is_skipped,
      needs_reverification,
      category_saturation: 0, // assigned below after category grouping
      compensating_factor
    });
  }

  // Assign priority ranks to unimplemented, unskipped items
  const unimplemented = scoredItems
    .filter(i => !i.is_implemented && !i.is_skipped)
    .sort((a, b) => b.effective_score - a.effective_score);
  unimplemented.forEach((item, idx) => { item.priority_rank = idx + 1; });

  // Category scoring
  const categories = [...new Set(scoredItems.map(i => i.category))];
  const categoryScores: CategoryScore[] = [];

  for (const cat of categories) {
    const catItems   = scoredItems.filter(i => i.category === cat);
    const applicable = catItems.filter(i => !i.is_skipped);
    const implemented = applicable.filter(i => i.is_implemented);

    const maxScore    = applicable.reduce((sum, i) => sum + i.effective_score, 0);
    const earnedScore = implemented.reduce((sum, i) => sum + i.effective_score, 0);

    const saturation = maxScore > 0 ? earnedScore / maxScore : 0;
    // Write saturation back to each item in this category
    catItems.forEach(i => { i.category_saturation = saturation; });

    const scorePct = maxScore > 0
      ? Math.round(saturation * 100)
      : (applicable.length === 0 && catItems.length > 0 ? 100 : 0);

    categoryScores.push({
      category:          cat,
      label:             CATEGORY_LABELS[cat] ?? cat,
      score:             scorePct,
      max_score:         maxScore,
      maturity_level:    getMaturityLevel(scorePct),
      total_applicable:  applicable.length,
      implemented_count: implemented.length
    });
  }

  const overallScore = categoryScores.length > 0
    ? Math.round(categoryScores.reduce((sum, c) => sum + c.score, 0) / categoryScores.length)
    : 0;

  // Output sets
  const criticalGaps = scoredItems
    .filter(i => !i.is_implemented && !i.is_skipped && i.maturity_level <= 2)
    .sort((a, b) => b.effective_score - a.effective_score)
    .slice(0, 8);

  const quickWins = scoredItems
    .filter(i => !i.is_implemented && !i.is_skipped && i.difficulty.technical === 1)
    .sort((a, b) => b.effective_score - a.effective_score)
    .slice(0, 5);

  const reverify_items = scoredItems
    .filter(i => i.needs_reverification)
    .sort((a, b) => b.effective_score - a.effective_score);

  const critical_ids = new Set(criticalGaps.map(i => i.id));
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

  return {
    overall_score:    overallScore,
    overall_maturity: getMaturityLevel(overallScore),
    category_scores:  categoryScores.sort((a, b) => b.score - a.score),
    total_applicable: scoredItems.filter(i => !i.is_skipped).length,
    total_implemented: scoredItems.filter(i => i.is_implemented).length,
    critical_gaps:    criticalGaps,
    quick_wins:       quickWins,
    reverify_items,
    next_items,
    human_vulnerability_score: humanVulnerabilityScore,
    last_calculated:  new Date().toISOString(),
    all_items: scoredItems.sort((a, b) => {
      if (a.is_implemented !== b.is_implemented) return a.is_implemented ? 1 : -1;
      return b.effective_score - a.effective_score;
    })
  };
}

// Empty result guard — graph not loaded yet
function emptyResult(): AssessmentResult {
  return {
    overall_score:    0,
    overall_maturity: 1,
    category_scores:  [],
    total_applicable: 0,
    total_implemented: 0,
    critical_gaps:    [],
    quick_wins:       [],
    reverify_items:   [],
    next_items:       [],
    human_vulnerability_score: null,
    last_calculated:  new Date().toISOString(),
    all_items:        []
  };
}