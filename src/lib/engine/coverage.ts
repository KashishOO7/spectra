import type { AssessmentResult, Harm, ScoredItem } from '../types.js';
import { HARMS } from '../audit/constants.js';
import { harmsForItem } from '../audit/helpers.js';

export function isHarmCovered(items: ScoredItem[], harm: Harm): boolean {
  const mapped = items.filter(i => harmsForItem(i).includes(harm));
  if (mapped.length === 0) return false;
  const essentials = mapped.filter(i => i.maturity_level === 1);
  const gate = essentials.length > 0 ? essentials : mapped;
  return gate.every(i => i.is_implemented && !i.is_skipped);
}

export interface Coverage {
  covered: number;
  total: number;
  done: number;
  applicable: number;
  skipped: number;
}

export function coverageOf(result: AssessmentResult | null | undefined): Coverage | null {
  if (!result) return null;
  return {
    covered: result.harms_covered,
    total: result.harms_total,
    done: result.total_implemented,
    applicable: result.total_applicable,
    skipped: result.total_skipped
  };
}

export const PENDING_LABEL = 'One moment…';

export function coverageLine(coverage: Coverage | null): string {
  if (!coverage) return PENDING_LABEL;
  return `${coverage.covered} of ${coverage.total} covered`;
}

export const COVERED_MEANS = "Covered means you've done the essentials for that one.";

export interface HarmProgress {
  harm: Harm;
  done: number;
  total: number;
  covered: boolean;
}

export function harmBreakdown(result: AssessmentResult | null | undefined): HarmProgress[] {
  const harms = Object.keys(HARMS) as Harm[];
  if (!result) return harms.map(harm => ({ harm, done: 0, total: 0, covered: false }));

  return harms.map(harm => {
    const mapped = result.all_items.filter(i => harmsForItem(i).includes(harm));
    return {
      harm,
      done: mapped.filter(i => i.is_implemented && !i.is_skipped).length,
      total: mapped.length,
      covered: isHarmCovered(result.all_items, harm)
    };
  });
}
