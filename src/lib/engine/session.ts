
import { writable } from 'svelte/store';
import type { AssessmentResult } from '../types.js';

export const assessment = writable<AssessmentResult | null>(null);

export const profileVersion = writable(0);

export const bumpProfile = () => profileVersion.update(n => n + 1);
