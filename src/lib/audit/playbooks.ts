
import playbooks from '#spectra-wiki/playbooks';
import { inNote, notesFor, plainLines, text } from '../wiki/page.js';

export interface IncidentPlaybook {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  severity: 'critical' | 'high';
  immediateSteps: string[];
  simpleSteps: string[];
  relatedItemIds: string[];
  doNotText: string;
}

type Decided = Pick<IncidentPlaybook, 'id' | 'icon' | 'severity' | 'relatedItemIds'>;

const DECIDED: Decided[] = [
  {
    id: 'account_hacked',
    icon: '○',
    severity: 'critical',
    relatedItemIds: ['auth-2fa-001', 'auth-password-manager-001', 'auth-backup-codes-001', 'incident-breach-monitor-001']
  },
  {
    id: 'device_stolen',
    icon: '◈',
    severity: 'critical',
    relatedItemIds: ['device-encrypt-001', 'device-screenlock-001', 'auth-2fa-001']
  },
  {
    id: 'stalkerware',
    icon: '◉',
    severity: 'critical',
    relatedItemIds: ['device-screenlock-001', 'device-encrypt-001', 'device-updates-001']
  },
  {
    id: 'phishing_clicked',
    icon: '◆',
    severity: 'high',
    relatedItemIds: ['auth-2fa-001', 'auth-password-manager-001', 'human-urgency-001', 'human-verify-001']
  },
  {
    id: 'data_breach',
    icon: '●',
    severity: 'high',
    relatedItemIds: ['incident-breach-monitor-001', 'auth-2fa-001', 'auth-password-manager-001']
  }
];

const notes = notesFor(playbooks, 'wiki/playbooks', DECIDED.map(d => d.id), ['title', 'subtitle', 'do-not', 'technical', 'plain']);

export const INCIDENT_PLAYBOOKS: IncidentPlaybook[] = DECIDED.map(decided => {
  const note = notes[decided.id];
  return inNote(`wiki/playbooks/${decided.id}.md`, () => ({
    ...decided,
    title: text(note, 'title'),
    subtitle: text(note, 'subtitle'),
    doNotText: text(note, 'do-not'),
    immediateSteps: plainLines(note, 'technical'),
    simpleSteps: plainLines(note, 'plain')
  }));
});
