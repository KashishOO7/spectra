
import type { AdversaryType, Track } from '../types.js';
import names from '#spectra-wiki/page/names';
import { rows } from '../wiki/page.js';

export interface LifeEvent {
  id: string;
  label: string;
  adversary_delta: readonly AdversaryType[];
  track_delta: readonly Track[];
  sensitive?: boolean;
}

const DECIDED: ReadonlyArray<Omit<LifeEvent, 'label'>> = [
  { id: 'new_job',        adversary_delta: ['employer'] as const,                              track_delta: [] as const },
  { id: 'separation',     adversary_delta: ['intimate_partner'] as const,                      track_delta: ['known_person_risk'] as const, sensitive: true },
  { id: 'travel',         adversary_delta: ['domestic_government', 'foreign_government'] as const, track_delta: [] as const },
  { id: 'child_phone',    adversary_delta: [] as const,                                        track_delta: ['caring_for_someone'] as const },
  { id: 'public_profile', adversary_delta: ['targeted_individual', 'data_broker'] as const,    track_delta: [] as const },
  { id: 'journalism',     adversary_delta: ['domestic_government', 'foreign_government'] as const, track_delta: ['public_work'] as const }
];

const labels = rows(names, 'life-events', DECIDED.map(e => e.id), 1);

export const LIFE_EVENTS: readonly LifeEvent[] = DECIDED.map(e => ({ ...e, label: labels[e.id][0] }));
