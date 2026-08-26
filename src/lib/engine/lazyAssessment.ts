import type { AssessmentResult } from '../types.js';

let inFlight: Promise<AssessmentResult | null> | null = null;

export async function assessFromAnywhere(): Promise<AssessmentResult | null> {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const [nav, scoring, store, content] = await Promise.all([
        import('$app/navigation'),
        import('./scoring.js'),
        import('./store.js'),
        import('../content/deserialize.js')
      ]);

      const loaded = await nav.preloadData('/audit');
      if (loaded.type !== 'loaded' || loaded.status !== 200) return null;

      const data = loaded.data as { graph?: unknown };
      if (!data?.graph) return null;
      const profile = (await store.loadProfile()) ?? store.createDefaultProfile();

      return scoring.scoreAssessment(content.deserializeGraph(data.graph), profile);
    } catch {
      return null;
    }
  })();

  return inFlight;
}

export function invalidateAssessment(): void {
  inFlight = null;
}
