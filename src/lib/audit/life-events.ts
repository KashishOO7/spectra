// Life events that adjust the user's threat model from the Data & Settings panel.

export const LIFE_EVENTS = [
  { id: 'new_job',        icon: '💼', label: 'Started a new job',                     adversary_delta: ['employer'] as const,                              track_delta: [] as const },
  { id: 'separation',     icon: '🔒', label: 'Going through a difficult separation',  adversary_delta: ['intimate_partner'] as const,                      track_delta: ['womens_safety'] as const, sensitive: true },
  { id: 'travel',         icon: '✈️', label: 'Travelling internationally soon',       adversary_delta: ['domestic_government', 'foreign_government'] as const, track_delta: [] as const },
  { id: 'child_phone',    icon: '📱', label: 'My child just got their first phone',   adversary_delta: [] as const,                                        track_delta: ['kids_teen'] as const },
  { id: 'public_profile', icon: '👁',  label: "I've become more publicly visible",    adversary_delta: ['targeted_individual', 'data_broker'] as const,    track_delta: [] as const },
  { id: 'journalism',     icon: '📰', label: "I'm doing sensitive research or journalism", adversary_delta: ['domestic_government', 'foreign_government'] as const, track_delta: ['journalist'] as const }
];
