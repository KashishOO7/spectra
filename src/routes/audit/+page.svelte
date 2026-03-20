<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { page } from '$app/stores';
  import type { PageData } from './$types.js';
  import type {
    UserProfile, AssessmentResult, ChecklistItem, ContentGraph,
    ScoredItem, AdversaryType, Track, Platform, LandscapeEvent
  } from '$lib/types.js';
  import {
    loadProfile, saveProfile, markImplemented, markSkipped, saveNote,
    createDefaultProfile, clearAllData, exportProfile, importProfile,
    addTimelineEvent, saveSEQuizResult, applyLifeEvent
  } from '$lib/engine/store.js';
  import { scoreAssessment } from '$lib/engine/scoring.js';

  export let data: PageData;

  // Core state
  let profile: UserProfile | null = null;
  let result: AssessmentResult | null = null;
  let loading = true;
  let view: 'onboard' | 'checklist' | 'results' | 'incident' | 'quiz' = 'checklist';
  let mode: 'normal' | 'incident' | 'guardian' = 'normal';

  // Data panel
  let dataPanelOpen = false;
  let clearConfirm = false;
  let exportStatus: 'idle' | 'done' | 'error' = 'idle';
  let importStatus: 'idle' | 'done' | 'error' = 'idle';
  let importError = '';
  let importInput: HTMLInputElement;

  // Checklist UI
  let selectedCategory: string = 'all';
  let searchQuery = '';
  let expandedItems = new Set<string>();
  let highlightedItem: string | null = null;
  let activePlatform: Platform | 'all' = 'all';
  let noteValues: Record<string, string> = {};

  // Onboard
  let onboardStep = 1;
  let onboardAdversaries: AdversaryType[] = [];
  let onboardTracks: Track[] = ['general'];
  let onboardPlatforms: Platform[] = [];
  let isReconfiguring = false;

  // Incident triage 
  let incidentScenario: string | null = null;
  let isSimpleMode = true;

  // Display mode — easy (default for new users) vs technical
  let easyMode = true;

  function truncSentences(text: string, n: number): string {
    if (!text) return '';
    const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
    return sentences.slice(0, n).join(' ').trim();
  }

  const diffLabel = (n: number) => ['', 'Easy', 'Moderate', 'Complex'][n] ?? '?';

  async function toggleEasyMode() {
    easyMode = !easyMode;
    if (profile) {
      profile.easy_mode = easyMode;
      await saveProfile(profile);
    }
  }

  // Social engineering quiz 
  let quizStep = 0; // 0 = intro, 1-7 = questions, 8 = results
  let quizAnswers: Record<string, number> = {};

  // Life events 
  let lifeEventsOpen = false;

  // Related item back-navigation 
  let navHistory: Array<{ id: string; title: string; category: string }> = [];

  // Landscape feed
  $: activeLandscapeEvents = ((data.landscapeEvents ?? []) as LandscapeEvent[])
  .filter((e: LandscapeEvent) => new Date(e.expires_at) > new Date());

  interface IncidentPlaybook {
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

  const INCIDENT_PLAYBOOKS: IncidentPlaybook[] = [
    {
      id: 'account_hacked',
      icon: '🔓',
      title: 'Account Hacked',
      subtitle: "You can't log in, or see activity you didn't do",
      severity: 'critical',
      immediateSteps: [
        'From a trusted device (not the compromised one), go to the service\'s account recovery page and reset your password immediately.',
        'Check and revoke all active sessions — look for "Active sessions", "Devices", or "Security" in account settings.',
        'Change the password on every account that uses the same or similar password.',
        'Enable two-factor authentication if it wasn\'t active — this is what will stop a repeat.',
        'Check email forwarding rules and connected third-party apps — attackers often set these up for persistence.',
        'If it\'s your email account: check rules, filters, and recovery contact details for tampering.'
      ],
      simpleSteps: [
        'Use a different device (your phone or a friend\'s computer) — not the one you think was compromised.',
        'Go to the website, find "Forgot password" and reset it to something new you haven\'t used before.',
        'Once back in, look for "Active sessions" or "Devices" in Settings and sign out of everything.',
        'If you used the same password anywhere else, change it on those sites too.',
        'Turn on two-step verification now — this is what stops it happening again even if your password leaks.',
        'If it was your email: check Settings for any forwarding rules or replies you didn\'t set up.'
      ],
      relatedItemIds: ['auth-2fa-001', 'auth-password-manager-001', 'auth-backup-codes-001', 'incident-breach-monitor-001'],
      doNotText: 'Do not use the potentially compromised device to do recovery — use your phone or a different computer.'
    },
    {
      id: 'device_stolen',
      icon: '💻',
      title: 'Device Stolen',
      subtitle: 'Your phone, laptop, or tablet is missing',
      severity: 'critical',
      immediateSteps: [
        'For iPhone: iCloud.com → Find My → mark device as Lost to lock it and display a message. For Android: android.com/find → Lock or Erase.',
        'For Mac: iCloud.com → Find My. For Windows: account.microsoft.com → Find My Device.',
        'Change passwords for your most critical accounts immediately (email, banking, work) from a different device.',
        'Revoke trusted device status: in Google, Apple ID, Microsoft, and any work accounts, remove the stolen device from trusted list.',
        'Call your carrier if it was a phone — ask to suspend the SIM to prevent SIM-based account recovery abuse.',
        'File a police report with the serial number (check original box or account purchase history). This helps with insurance and sometimes recovery.'
      ],
      simpleSteps: [
        'On iPhone: go to icloud.com on another device, sign in, click Find My, find your phone and tap "Lost Mode" to lock it.',
        'On Android: go to android.com/find on another device, sign in, and choose "Lock" or "Erase".',
        'For a laptop: icloud.com/find (Mac) or account.microsoft.com → Devices → Find My Device (Windows).',
        'Change your email and banking passwords right now from a different device.',
        'If it was a phone: call your mobile carrier and ask them to suspend the SIM.',
        'Remove the device from trusted devices in your Google, Apple, or Microsoft account settings.'
      ],
      relatedItemIds: ['device-encrypt-001', 'device-screenlock-001', 'auth-2fa-001'],
      doNotText: 'Do not wait — remote wipe becomes useless once the device is wiped by someone else or the SIM is swapped.'
    },
    {
      id: 'stalkerware',
      icon: '👁',
      title: 'Monitoring Suspected',
      subtitle: 'Someone may have installed software to watch you',
      severity: 'critical',
      immediateSteps: [
        'Do not do this research on the device you suspect is compromised — use a different phone or a library computer.',
        'On Android: Settings → Apps → look for anything unfamiliar with "accessibility" or "device admin" permissions. On iPhone: Settings → Privacy & Security → check VPN/Device Management profiles.',
        'If you find something or are unsure: a factory reset is the most reliable solution. Back up photos/contacts to a fresh account first.',
        'Change passwords for everything — email, social, banking — from a safe device AFTER the reset.',
        'If this involves an intimate partner situation: contact a domestic violence tech safety specialist before taking action. Some monitoring software alerts the abuser if removed.',
        'National DV Hotline (US): 1-800-799-7233. Safety Net at NNEDV provides tech safety support.'
      ],
      simpleSteps: [
        'Do not do any of this on the phone or computer you think is being monitored — use a different device.',
        'On iPhone: go to Settings → General → VPN & Device Management. If you see anything unfamiliar, it may be monitoring software.',
        'On Android: Settings → Apps → look for anything with "Accessibility" permissions you don\'t recognise.',
        'If you find something suspicious, or just aren\'t sure: a factory reset is the safest option. Back up photos and contacts to a fresh account first.',
        'If this involves a partner or family member: contact a safety specialist before doing anything. Some apps alert the person who installed them if removed.',
        'US: National DV Hotline 1-800-799-7233. Ask specifically about tech safety resources.'
      ],
      relatedItemIds: ['device-screenlock-001', 'device-encrypt-001', 'device-updates-001'],
      doNotText: 'Do not confront the person first — removing stalkerware can alert them and escalate a dangerous situation.'
    },
    {
      id: 'phishing_clicked',
      icon: '🎣',
      title: 'Phishing Link Clicked',
      subtitle: 'You clicked a suspicious link or entered credentials on an unfamiliar site',
      severity: 'high',
      immediateSteps: [
        'If you entered a password: change that account\'s password immediately from a different device or browser.',
        'Enable 2FA on the affected account right now — even if the password was captured, 2FA stops the attacker from using it.',
        'Check whether you use the same password anywhere else — change it on every service that shares it.',
        'If the link opened a file or installer: disconnect from the internet and run a malware scan. On Windows: Windows Defender. On Mac: Malwarebytes.',
        'Check your email for any "unusual sign-in" notifications from the affected account — these may have already arrived.',
        'Watch that account\'s activity for 1-2 weeks: new email rules, sent mail you didn\'t send, profile changes.'
      ],
      simpleSteps: [
        'If you typed in a password on that page: change it right now on a different browser or device.',
        'Turn on two-step verification (2FA) on that account straight away — even if they got your password, they still can\'t log in.',
        'Did you use that password on other websites? Change it on those too.',
        'If the link made you download or open a file: disconnect from WiFi and run a virus scan (Windows Defender on Windows, Malwarebytes on Mac).',
        'Check your inbox — you may already have "unusual sign-in" alert emails from that account.',
        'Keep an eye on that account for the next week or two for anything you didn\'t do.'
      ],
      relatedItemIds: ['auth-2fa-001', 'auth-password-manager-001', 'human-urgency-001', 'human-verify-001'],
      doNotText: 'Do not ignore it hoping nothing happens — credential theft from phishing is typically automated and immediate.'
    },
    {
      id: 'data_breach',
      icon: '💾',
      title: 'Data Breach Notification',
      subtitle: 'A service you use has been breached',
      severity: 'high',
      immediateSteps: [
        'Change your password on the breached service immediately, even if the company says passwords weren\'t exposed — err on the side of caution.',
        'Check haveibeenpwned.com with your email address to see what data is associated with this breach and what else may be exposed.',
        'If you use the same password anywhere else: change it everywhere. A breach of one service is a credential-stuffing risk for all others.',
        'Enable 2FA on the affected service if you haven\'t already.',
        'If the breach included payment card data: contact your bank to flag the card for suspicious activity or request a replacement.',
        'If the breach included sensitive personal data (SSN, passport): consider a credit freeze at the three major bureaus (Equifax, Experian, TransUnion in the US).'
      ],
      simpleSteps: [
        'Change your password on that website now — even if they say passwords weren\'t affected, do it anyway.',
        'Go to haveibeenpwned.com and type in your email address to see what else may have been exposed.',
        'Did you use the same password on other sites? Change it everywhere it was used.',
        'Turn on two-step login (2FA) on the affected account if you haven\'t already.',
        'If your payment card was included: call your bank and ask them to flag it or send you a new card.',
        'If your ID or passport details were included: you can freeze your credit for free at Equifax, Experian, and TransUnion (US) to stop someone opening accounts in your name.'
      ],
      relatedItemIds: ['incident-breach-monitor-001', 'auth-2fa-001', 'auth-password-manager-001'],
      doNotText: 'Do not trust breach notification emails blindly — verify through the company\'s official website directly.'
    }
  ];

  // Social engineering quiz data 
  interface SEQuestion {
    id: string;
    register: string;
    scenario: string;
    prompt: string;
  }

  const SE_QUIZ_QUESTIONS: SEQuestion[] = [
    {
      id: 'q_authority',
      register: 'authority',
      scenario: 'Your bank calls saying suspicious activity has been detected. The caller knows your name and your most recent transaction. They ask you to confirm your card number and PIN to "protect your account".',
      prompt: 'How likely would you be to provide the information?'
    },
    {
      id: 'q_urgency',
      register: 'urgency',
      scenario: "An email from 'IT Support' says your work account will be permanently suspended in 2 hours unless you click a link to re-verify your credentials. The email looks convincing.",
      prompt: 'How likely would you be to click the link without verifying with IT directly?'
    },
    {
      id: 'q_trust',
      register: 'trust_exploitation',
      scenario: "A close friend messages you: \"I thought of you when I saw this — you have to check it out!\" with a link. The domain looks slightly unfamiliar but your friend's account seems normal.",
      prompt: 'How likely would you be to click without examining the URL?'
    },
    {
      id: 'q_fear',
      register: 'fear',
      scenario: "You receive an email claiming the sender recorded you through your webcam during a 'compromising moment'. They threaten to send the video to all your contacts unless you pay within 24 hours.",
      prompt: 'How likely would you be to feel genuinely threatened and consider paying?'
    },
    {
      id: 'q_scarcity',
      register: 'scarcity',
      scenario: "\"Congratulations — you've been selected for an exclusive deal. Only 2 remaining at this price. Your offer expires in 9 minutes.\" with a link to claim it.",
      prompt: 'How likely would you be to click before the timer runs out?'
    },
    {
      id: 'q_reciprocity',
      register: 'reciprocity',
      scenario: 'Someone you met briefly at a conference sends you an unexpected $30 gift card by email with a short note, and a link to a site where you can redeem it. They say they just wanted to say thank you.',
      prompt: 'How likely would you be to visit the link and use the gift card?'
    },
    {
      id: 'q_social_proof',
      register: 'social_proof',
      scenario: '"Your colleague Sarah and 847 other people at your company have already completed the mandatory security update. Click here to avoid losing account access by Friday."',
      prompt: 'How likely would you be to click without verifying through official IT channels?'
    }
  ];

  const SE_SCALE_LABELS = ['', 'Definitely not', 'Unlikely', 'Maybe', 'Probably', 'Definitely yes'];

  // Life events data
  const LIFE_EVENTS = [
    { id: 'new_job',        icon: '💼', label: 'Started a new job',                     adversary_delta: ['employer'] as const,                              track_delta: [] as const },
    { id: 'separation',     icon: '🔒', label: 'Going through a difficult separation',  adversary_delta: ['intimate_partner'] as const,                      track_delta: ['womens_safety'] as const, sensitive: true },
    { id: 'travel',         icon: '✈️', label: 'Travelling internationally soon',       adversary_delta: ['domestic_government', 'foreign_government'] as const, track_delta: [] as const },
    { id: 'child_phone',    icon: '📱', label: 'My child just got their first phone',   adversary_delta: [] as const,                                        track_delta: ['kids_teen'] as const },
    { id: 'public_profile', icon: '👁',  label: "I've become more publicly visible",    adversary_delta: ['targeted_individual', 'data_broker'] as const,    track_delta: [] as const },
    { id: 'journalism',     icon: '📰', label: "I'm doing sensitive research or journalism", adversary_delta: ['domestic_government', 'foreign_government'] as const, track_delta: ['journalist'] as const }
  ];

  // Onboard options — human language
  const ADVERSARY_OPTIONS: {
    value: AdversaryType; label: string; description: string; tier: 'common' | 'elevated' | 'high';
  }[] = [
    { value: 'opportunistic',       label: 'Automated bots & scammers',    description: 'Mass phishing, credential stuffing, random malware. Not targeting you — just whoever bites.', tier: 'common' },
    { value: 'data_broker',         label: 'Data brokers',                  description: 'Companies that collect and sell your personal data — often without you knowing.', tier: 'common' },
    { value: 'criminal_org',        label: 'Organised criminals',           description: 'Ransomware groups, fraud rings, financially-motivated attacks with real resources.', tier: 'elevated' },
    { value: 'ai_automated',        label: 'AI-powered attacks',            description: 'Personalised phishing, voice cloning, deepfake fraud — automated and increasingly convincing.', tier: 'elevated' },
    { value: 'targeted_individual', label: 'Someone targeting me',          description: 'A specific person who has decided to come after you — could be skilled or just persistent.', tier: 'elevated' },
    { value: 'intimate_partner',    label: 'A current or former partner',   description: 'Someone with physical access, relationship trust, and possibly your passwords already.', tier: 'high' },
    { value: 'employer',            label: 'My employer or school',         description: 'Workplace monitoring, MDM on work devices, institutional surveillance.', tier: 'elevated' },
    { value: 'isp_network',         label: 'My internet provider',          description: 'Your ISP or anyone positioned to see your network traffic.', tier: 'elevated' },
    { value: 'domestic_government', label: 'My own government',             description: 'Law enforcement or intelligence agencies in your country.', tier: 'high' },
    { value: 'foreign_government',  label: 'A foreign government',          description: 'Nation-state actors and foreign intelligence. High capability, specific targets.', tier: 'high' }
  ];

  const TRACK_OPTIONS: { value: Track; label: string; description: string }[] = [
    { value: 'kids_teen',     label: 'I have kids or teens at home',        description: 'Helps you protect the young people in your life online.' },
    { value: 'womens_safety', label: "Women's safety concerns",             description: 'Stalking, intimate partner surveillance, image-based abuse, online harassment.' },
    { value: 'journalist',    label: 'Journalist, activist, or researcher', description: 'Work that attracts government or organised crime interest.' },
    { value: 'corporate',     label: 'Work devices and corporate accounts', description: 'Protecting business data, work laptops, and company accounts.' },
    { value: 'ai_focused',    label: 'I want deep coverage of AI threats',  description: 'AI-generated attacks, voice cloning, deepfakes, and AI-powered OSINT.' }
  ];

  const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
    { value: 'windows', label: 'Windows' },
    { value: 'macos',   label: 'macOS' },
    { value: 'linux',   label: 'Linux' },
    { value: 'android', label: 'Android' },
    { value: 'ios',     label: 'iOS' },
    { value: 'web',     label: 'Web' }
  ];

  const EMOTIONAL_REGISTER_LABELS: Record<string, string> = {
    urgency: 'Urgency manipulation', authority: 'Authority impersonation',
    social_proof: 'Social pressure', reciprocity: 'Reciprocity obligation',
    fear: 'Fear-based manipulation', scarcity: 'Manufactured scarcity',
    trust_exploitation: 'Trust exploitation', grief_isolation: 'Grief / isolation targeting',
    anger: 'Anger / outrage hijacking', loneliness: 'Loneliness exploitation'
  };

  const tierDot: Record<string, string>   = { common: 'bg-teal', elevated: 'bg-amber', high: 'bg-red' };
  const tierLabel: Record<string, string> = { common: 'text-teal-light', elevated: 'text-amber-light', high: 'text-red-light' };

  const maturityLabels       = ['', 'Essential', 'Baseline', 'Hardened', 'Advanced', 'Expert'];
  const maturityColors       = ['', 'text-teal-light', 'text-teal-light', 'text-amber-light', 'text-amber-light', 'text-red-light'];
  const maturityDescriptions = ['',
    'Your foundation needs work. The good news: the highest-impact steps here are quick, free, and take under an hour.',
    'Decent start — the basics are in place. A few more essentials and you\'ll be protected against everyday threats.',
    'Solid baseline. You\'re meaningfully protected against common attacks. Now it\'s about the specifics of your situation.',
    'Strong posture. You\'ve put in real work and it shows. You\'re well-protected against most realistic threat models.',
    'Exceptional. You\'re operating at a level most security professionals would respect.'
  ];

  // Onboard toggles
  function toggleAdversary(v: AdversaryType) {
    onboardAdversaries = onboardAdversaries.includes(v)
      ? onboardAdversaries.filter(a => a !== v) : [...onboardAdversaries, v];
  }
  function toggleTrack(v: Track) {
    if (v === 'general') return;
    onboardTracks = onboardTracks.includes(v)
      ? onboardTracks.filter(t => t !== v) : [...onboardTracks, v];
  }
  function togglePlatform(v: Platform) {
    onboardPlatforms = onboardPlatforms.includes(v)
      ? onboardPlatforms.filter(p => p !== v) : [...onboardPlatforms, v];
  }

  async function finishOnboard() {
    if (!profile || onboardAdversaries.length === 0) return;
    profile.adversaries = onboardAdversaries;
    profile.tracks = ['general', ...onboardTracks.filter(t => t !== 'general')];
    profile.platforms = onboardPlatforms.length > 0 ? onboardPlatforms : ['all' as Platform];
    if (onboardPlatforms.length > 0) activePlatform = onboardPlatforms[0];
    await saveProfile(profile);
    recalculate();
    isReconfiguring = false;
    view = 'checklist';
  }

  // Graph 
  $: graph = {
    items:            new Map(Object.entries(data.graph.items)),
    resources:        new Map(Object.entries(data.graph.resources)),
    itemsByCategory:  new Map(Object.entries(data.graph.itemsByCategory)),
    itemsByAdversary: new Map(Object.entries(data.graph.itemsByAdversary)),
    itemsByVector:    new Map(Object.entries(data.graph.itemsByVector)),
    itemsByAsset:     new Map(Object.entries(data.graph.itemsByAsset)),
    itemsByTrack:     new Map(Object.entries(data.graph.itemsByTrack)),
    itemsByMaturity:  new Map(Object.entries(data.graph.itemsByMaturity).map(([k, v]) => [parseInt(k, 10), v] as [number, string[]]))
  } as ContentGraph;
  $: categories = [...(graph.itemsByCategory?.keys() ?? [])] as string[];

  // Score sparkline data
  // Builds from timeline events that have score_after recorded.
  // Items are stored newest-first in profile.timeline so we reverse.
  $: scoreSparklinePoints = (() => {
    const timeline = profile?.timeline ?? [];
    const pts: Array<{ score: number; label: string }> = [];

    // Walk events oldest -> newest
    const chronological = [...timeline].reverse();
    for (const ev of chronological) {
      if (ev.type === 'implemented' && ev.score_after != null) {
        pts.push({ score: ev.score_after, label: ev.item_title ?? 'Item completed' });
      }
    }

    if (pts.length === 0 && !result) return null;

    // Ensure we start from 0 and end at current score
    if (pts.length === 0 || pts[0].score > 5) {
      pts.unshift({ score: 0, label: 'Start' });
    }
    const currentScore = result?.overall_score ?? 0;
    if (pts.length === 0 || pts[pts.length - 1].score !== currentScore) {
      pts.push({ score: currentScore, label: 'Now' });
    }

    if (pts.length < 2) return null;
    return pts;
  })();

  // Generate SVG path strings from sparkline points
  $: sparklineSvg = (() => {
    const pts = scoreSparklinePoints;
    if (!pts || pts.length < 2) return null;
    const W = 280, H = 40, pad = 4;
    const coords = pts.map((p, i) => ({
      x: pad + (i / (pts.length - 1)) * (W - pad * 2),
      y: H - pad - (p.score / 100) * (H - pad * 2),
      score: p.score,
      label: p.label
    }));
    const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
    const last = coords[coords.length - 1];
    const first = coords[0];
    const fillPath = `${linePath} L${last.x.toFixed(1)},${H} L${first.x.toFixed(1)},${H} Z`;
    return { linePath, fillPath, coords, W, H };
  })();

  $: displayItems = (() => {
    if (!result) return [];
    let ordered: ScoredItem[];
    if (mode === 'incident') {
      const critIds = new Set(result.critical_gaps.map(i => i.id));
      ordered = [...result.critical_gaps, ...result.all_items.filter(i => !critIds.has(i.id))];
    } else {
      ordered = [...result.all_items];
    }
    return ordered.filter((item: ScoredItem) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!item.title.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  })();

  // Lifecycle 
  onMount(async () => {
    const urlMode = $page.url.searchParams.get('mode');
    if (urlMode === 'incident') mode = 'incident';
    else if (urlMode === 'guardian') mode = 'guardian';

    profile = await loadProfile();
    if (!profile) {
      profile = createDefaultProfile();
      await saveProfile(profile);
    }
    easyMode = profile.easy_mode ?? true;

    if (mode === 'guardian' && profile) {
      if (!profile.tracks.includes('kids_teen')) {
        profile.tracks = [...profile.tracks, 'kids_teen', 'womens_safety'];
        await saveProfile(profile);
      }
    }

    const hasSetup = profile.adversaries && profile.adversaries.length > 0;

    if (!hasSetup && mode !== 'incident') {
      onboardAdversaries = [...(profile.adversaries ?? [])];
      onboardTracks = [...(profile.tracks ?? ['general'])];
      onboardPlatforms = (profile.platforms ?? []).filter(p => p !== 'all') as Platform[];
      isReconfiguring = false;
      view = 'onboard';
      loading = false;
      return;
    }

    const savedPlatforms = (profile.platforms ?? []).filter(p => p !== 'all') as Platform[];
    if (savedPlatforms.length > 0) activePlatform = savedPlatforms[0];

    recalculate();

    if (mode === 'incident') {
      view = 'incident';
    }

    loading = false;

    // Handle highlight param from graph navigation
    const urlHighlight = $page.url.searchParams.get('highlight');
    if (urlHighlight && graph.items.has(urlHighlight)) {
      await tick();
      await scrollToItem(urlHighlight);
    }
  });

  function recalculate() {
    if (!profile) return;
    result = scoreAssessment(graph, profile, activeLandscapeEvents);
  }

  async function toggleItem(itemId: string, current: boolean) {
    const item = graph.items.get(itemId);
    if (item && !current) {
      const block = getBlockedReason(item);
      if (block) return;
    }
    // Snapshot score before the state update — delta on the timeline event must reflect the change caused by this item
    const scoreBefore = result?.overall_score;

    await markImplemented(itemId, !current);
    profile = await loadProfile();
    recalculate();

    if (!current && item) {
      await addTimelineEvent({
        type: 'implemented',
        item_id: itemId,
        item_title: item.title,
        category: item.category,
        score_before: scoreBefore,
        score_after: result?.overall_score,
        timestamp: new Date().toISOString()
      });
    }
  }

  async function handleLifeEvent(ev: typeof LIFE_EVENTS[number]) {
    await applyLifeEvent(ev.id, ev.label, [...ev.adversary_delta] as AdversaryType[], [...ev.track_delta] as Track[]);
    profile = await loadProfile();
    recalculate();
    lifeEventsOpen = false;
  }

  async function submitSEQuiz() {
    const susceptibilities: Record<string, number> = {};
    for (const q of SE_QUIZ_QUESTIONS) {
      susceptibilities[q.register] = ((quizAnswers[q.id] ?? 1) - 1) * 25;
    }
    const sorted = Object.entries(susceptibilities).sort((a, b) => b[1] - a[1]);
    const topRegister = sorted[0]?.[0] ?? 'urgency';
    const result_quiz = { completed_at: new Date().toISOString(), answers: quizAnswers, susceptibilities, top_register: topRegister };
    await saveSEQuizResult(result_quiz);
    await addTimelineEvent({ type: 'quiz_completed', timestamp: new Date().toISOString() });
    profile = await loadProfile();
    recalculate();
    quizStep = SE_QUIZ_QUESTIONS.length + 1;
  }

  async function toggleSkip(itemId: string) {
    if (profile?.skipped?.[itemId]) {
      await markSkipped(itemId, '');
    } else {
      await markSkipped(itemId, 'not_applicable');
    }
    profile = await loadProfile();
    recalculate();
  }

  // Pulse Reverify Logic
  async function reverifyItem(itemId: string) {
    const item = graph.items.get(itemId);
    if (!item) return;
    await addTimelineEvent({
      type: 'implemented',
      item_id: itemId,
      item_title: item.title,
      category: item.category,
      score_before: result?.overall_score,
      score_after: result?.overall_score,
      timestamp: new Date().toISOString()
    });
    profile = await loadProfile();
    recalculate();
  }

  function isSkipped(id: string): boolean {
    return !!(profile?.skipped?.[id]);
  }

  function isImplemented(id: string): boolean {
    return !!(profile?.implemented?.[id]);
  }

  function getBlockedReason(item: ChecklistItem): string | null {
    if (!item.depends_on?.length) return null;
    for (const dep of item.depends_on) {
      if (dep.hard_dependency && !isImplemented(dep.id)) {
        const depItem = graph.items.get(dep.id);
        return `Complete "${depItem?.title ?? dep.id}" first. ${dep.reason}`;
      }
    }
    return null;
  }

  function toggleExpand(id: string) {
    if (expandedItems.has(id)) {
      expandedItems.delete(id);
    } else {
      expandedItems.clear();
      expandedItems.add(id);
      if (!(id in noteValues)) noteValues[id] = profile?.notes?.[id] ?? '';
    }
    expandedItems = expandedItems;
  }

  async function scrollToItem(id: string, category?: string, fromId?: string) {
    if (fromId) {
      const fromItem = graph.items.get(fromId);
      if (fromItem) {
        navHistory = [...navHistory, { id: fromId, title: fromItem.title, category: fromItem.category }];
      }
      // Related-item jump: always show full list so the destination item is visible
      // regardless of which category it lives in. The highlight makes it findable.
      selectedCategory = 'all';
    } else if (category) {
      selectedCategory = category;
    }
    view = 'checklist';
    await tick();
    if (!expandedItems.has(id)) {
      expandedItems.clear();
      expandedItems.add(id);
      if (!(id in noteValues)) noteValues[id] = profile?.notes?.[id] ?? '';
    }
    expandedItems = expandedItems;
    await tick();
    const el = document.getElementById(`item-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      highlightedItem = id;
      setTimeout(() => { highlightedItem = null; }, 2000);
    }
  }

  function startReconfigure() {
    if (profile) {
      onboardAdversaries = [...(profile.adversaries ?? [])];
      onboardTracks = [...(profile.tracks ?? ['general'])];
      onboardPlatforms = (profile.platforms ?? []).filter(p => p !== 'all') as Platform[];
    }
    isReconfiguring = true;
    onboardStep = 1;
    view = 'onboard';
  }

  async function handleNoteBlur(itemId: string) {
    await saveNote(itemId, noteValues[itemId] ?? '');
    profile = await loadProfile();
  }

  function getPlatformNote(item: ChecklistItem): string | null {
    if (!item.platform_notes) return null;
    if (activePlatform !== 'all' && item.platform_notes[activePlatform]) return item.platform_notes[activePlatform];
    const keys = Object.keys(item.platform_notes);
    if (keys.length > 0) return item.platform_notes[keys[0]];
    return null;
  }

  function getPlatformNoteLabel(item: ChecklistItem): string {
    if (activePlatform !== 'all' && item.platform_notes?.[activePlatform]) {
      return activePlatform.charAt(0).toUpperCase() + activePlatform.slice(1);
    }
    const keys = Object.keys(item.platform_notes ?? {});
    if (keys.length > 0) return keys[0].charAt(0).toUpperCase() + keys[0].slice(1);
    return 'General';
  }

  let expandedPlatforms = new Set<string>();
  function togglePlatformExpand(id: string) {
    if (expandedPlatforms.has(id)) expandedPlatforms.delete(id);
    else expandedPlatforms.add(id);
    expandedPlatforms = expandedPlatforms;
  }

  // Data panel 
  async function handleExport() {
    try {
      const json = await exportProfile();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spectra-profile-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      exportStatus = 'done';
      setTimeout(() => { exportStatus = 'idle'; }, 3000);
    } catch { exportStatus = 'error'; setTimeout(() => { exportStatus = 'idle'; }, 3000); }
  }

  async function handleImport(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        Array.isArray(parsed) ||
        !Array.isArray((parsed as Record<string, unknown>).adversaries) ||
        !Array.isArray((parsed as Record<string, unknown>).tracks) ||
        !Array.isArray((parsed as Record<string, unknown>).platforms)
      ) {
        throw new Error('Not a valid Spectra profile');
      }
      await importProfile(text);
      profile = await loadProfile();
      recalculate();
      importStatus = 'done';
      dataPanelOpen = false;
      setTimeout(() => { importStatus = 'idle'; }, 3000);
    } catch (err: any) {
      importError = err?.message ?? 'Invalid file';
      importStatus = 'error';
      setTimeout(() => { importStatus = 'idle'; importError = ''; }, 4000);
    }
    input.value = '';
  }

  async function handleClear() {
    if (!clearConfirm) { clearConfirm = true; return; }
    await clearAllData();
    profile = createDefaultProfile();
    await saveProfile(profile);
    noteValues = {};
    clearConfirm = false;
    dataPanelOpen = false;
    recalculate();
    onboardAdversaries = []; onboardTracks = ['general']; onboardPlatforms = [];
    isReconfiguring = false;
    view = 'onboard';
    onboardStep = 1;
  }

  // Helpers 
  const difficultyDots = (n: number) => Array.from({ length: 3 }, (_, i) => i < n ? '●' : '○').join('');

  const CATEGORY_LABELS: Record<string, string> = {
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

  const categoryLabel = (cat: string) =>
    CATEGORY_LABELS[cat] ?? cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  function platformDisplay(p: Platform): string {
    const map: Partial<Record<Platform, string>> = {
      android: 'Android', ios: 'iOS', windows: 'Windows', macos: 'macOS',
      linux: 'Linux', web: 'Web', all: 'All', any_mobile: 'Mobile',
      any_desktop: 'Desktop', router: 'Router', iot: 'IoT'
    };
    return map[p] ?? p;
  }

  function verificationAge(dateStr: string | undefined | null): 'fresh' | 'aging' | 'stale' | 'outdated' {
    if (!dateStr) return 'outdated';
    const months = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    if (months < 6) return 'fresh';
    if (months < 12) return 'aging';
    if (months < 18) return 'stale';
    return 'outdated';
  }

  const verifiedAgeClass: Record<string, string> = {
    fresh: 'text-muted', aging: 'text-dim', stale: 'text-amber-light', outdated: 'text-red-light'
  };

  function safeHref(url: string | null | undefined): string {
    if (!url) return '#';
    try {
      const { protocol } = new URL(url);
      return protocol === 'https:' || protocol === 'http:' ? url : '#';
    } catch {
      return '#';
    }
  }
</script>

<svelte:head>
  <title>
    {view === 'results' ? 'Results' :
     view === 'incident' ? 'Incident Triage' :
     view === 'quiz' ? 'Social Engineering Quiz' :
     mode === 'guardian' ? 'Guardian Mode' : 'Audit'} | Spectra
  </title>
</svelte:head>

{#if loading}
  <div class="flex items-center justify-center h-64">
    <div class="flex items-center gap-3 text-dim font-mono text-sm">
      <span class="w-1.5 h-1.5 rounded-full bg-amber animate-pulse-slow"></span>
      Loading your assessment…
    </div>
  </div>

{:else if view === 'onboard'}
<div class="max-w-2xl mx-auto px-4 sm:px-6 py-12">

  <div class="flex items-center gap-3 mb-10">
    {#if isReconfiguring}
      <button type="button"
        on:click={() => { view = 'checklist'; isReconfiguring = false; }}
        class="text-xs font-mono text-dim hover:text-body transition-colors flex-shrink-0">
        ← Cancel
      </button>
    {/if}
    <div class="flex gap-1.5 items-center">
      {#each [1,2,3] as step}
        <div class="h-1.5 rounded-full transition-all duration-500 {step === onboardStep ? 'w-8 bg-amber' : step < onboardStep ? 'w-4 bg-amber/50' : 'w-4 bg-border'}"></div>
      {/each}
    </div>
    <span class="label-mono opacity-60">{onboardStep} of 3</span>
  </div>

  {#if onboardStep === 1}
  <div class="animate-fade-up">
    <h1 class="font-display text-2xl font-bold text-white mb-2">
      Who are you protecting yourself from?
    </h1>
    <p class="text-body text-sm mb-6 leading-relaxed">
      Be honest — there are no wrong answers. Spectra uses this to weight your checklist
      toward the threats that actually apply to your life.
    </p>

    <div class="flex items-center gap-4 mb-4">
      <span class="label-mono">Exposure level:</span>
      {#each [['common','bg-teal','text-teal-light','Common'],['elevated','bg-amber','text-amber-light','Elevated'],['high','bg-red','text-red-light','High risk']] as [k,dot,text,label]}
        <span class="flex items-center gap-1.5 text-xs font-mono {text}">
          <span class="w-2 h-2 rounded-full {dot} inline-block"></span>{label}
        </span>
      {/each}
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8">
      {#each ADVERSARY_OPTIONS as opt}
        {@const selected = onboardAdversaries.includes(opt.value)}
        <button type="button" on:click={() => toggleAdversary(opt.value)}
          class="text-left p-4 rounded-lg border transition-all duration-150 group
                 {selected
                   ? 'border-amber/50 bg-amber-dim/15 shadow-sm shadow-amber/5'
                   : 'border-border bg-surface hover:border-muted hover:bg-surface/80'}">
          <div class="flex items-start justify-between gap-2 mb-1.5">
            <div class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full {tierDot[opt.tier]} flex-shrink-0 mt-0.5 opacity-80"></span>
              <span class="font-sans font-medium text-sm {selected ? 'text-white' : 'text-bright'}">{opt.label}</span>
            </div>
            <div class="flex-shrink-0 mt-0.5">
              {#if selected}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" fill="#d4862a" fill-opacity="0.2" stroke="#d4862a" stroke-width="1.5"/>
                  <path d="M4 7L6 9L10 5" stroke="#d4862a" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              {:else}
                <span class="w-3.5 h-3.5 rounded-full border border-muted block group-hover:border-dim transition-colors"></span>
              {/if}
            </div>
          </div>
          <p class="text-xs text-dim leading-relaxed pl-3.5">{opt.description}</p>
        </button>
      {/each}
    </div>

    <div class="flex items-center justify-between">
      <p class="text-xs text-muted font-mono">
        {onboardAdversaries.length === 0
          ? 'Select at least one to continue'
          : `${onboardAdversaries.length} selected — your checklist will be weighted accordingly`}
      </p>
      <button type="button"
        on:click={() => { if (onboardAdversaries.length > 0) onboardStep = 2; }}
        class="btn-primary {onboardAdversaries.length === 0 ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}">
        Next →
      </button>
    </div>
  </div>

  {:else if onboardStep === 2}
  <div class="animate-fade-up">
    <h1 class="font-display text-2xl font-bold text-white mb-2">Which devices do you use?</h1>
    <p class="text-body text-sm mb-8 leading-relaxed">
      We'll show you implementation steps for your specific operating system. Skip this if you're unsure — you can filter later.
    </p>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-8">
      {#each PLATFORM_OPTIONS as opt}
        {@const selected = onboardPlatforms.includes(opt.value)}
        <button type="button" on:click={() => togglePlatform(opt.value)}
          class="p-4 rounded-lg border transition-all duration-150 flex items-center gap-3 group
                 {selected ? 'border-teal/50 bg-teal-dim/15' : 'border-border bg-surface hover:border-muted'}">
          {#if selected}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" fill="#2a8a8a" fill-opacity="0.2" stroke="#2a8a8a" stroke-width="1.5"/>
              <path d="M4 7L6 9L10 5" stroke="#2a8a8a" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          {:else}
            <span class="w-3.5 h-3.5 rounded-full border border-muted flex-shrink-0 group-hover:border-dim transition-colors"></span>
          {/if}
          <span class="font-sans font-medium text-sm {selected ? 'text-white' : 'text-bright'}">{opt.label}</span>
        </button>
      {/each}
    </div>
    <div class="flex items-center justify-between">
      <button type="button" on:click={() => onboardStep = 1} class="btn-ghost">← Back</button>
      <button type="button" on:click={() => onboardStep = 3} class="btn-primary">Next →</button>
    </div>
  </div>

  {:else if onboardStep === 3}
  <div class="animate-fade-up">
    <h1 class="font-display text-2xl font-bold text-white mb-2">Anything else that applies?</h1>
    <p class="text-body text-sm mb-6 leading-relaxed">
      These unlock additional checklist items specific to your situation.
      All optional — the general baseline always applies to everyone.
    </p>

    <div class="panel border border-teal/20 p-3.5 mb-3 flex items-center gap-3">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" fill="#2a8a8a" fill-opacity="0.2" stroke="#2a8a8a" stroke-width="1.5"/>
        <path d="M4 7L6 9L10 5" stroke="#2a8a8a" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <div>
        <p class="font-sans font-medium text-sm text-bright">General baseline</p>
        <p class="text-xs text-dim mt-0.5">Core security controls — always included for everyone.</p>
      </div>
    </div>

    <div class="space-y-2 mb-6">
      {#each TRACK_OPTIONS as opt}
        {@const selected = onboardTracks.includes(opt.value)}
        <button type="button" on:click={() => toggleTrack(opt.value)}
          class="w-full text-left p-3.5 rounded-lg border transition-all duration-150 flex items-start gap-3 group
                 {selected ? 'border-amber/50 bg-amber-dim/15' : 'border-border bg-surface hover:border-muted'}">
          {#if selected}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="flex-shrink-0 mt-0.5">
              <circle cx="7" cy="7" r="6" fill="#d4862a" fill-opacity="0.2" stroke="#d4862a" stroke-width="1.5"/>
              <path d="M4 7L6 9L10 5" stroke="#d4862a" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          {:else}
            <span class="w-3.5 h-3.5 rounded-full border border-muted flex-shrink-0 mt-0.5 group-hover:border-dim transition-colors"></span>
          {/if}
          <div>
            <p class="font-sans font-medium text-sm {selected ? 'text-white' : 'text-bright'}">{opt.label}</p>
            <p class="text-xs text-dim mt-0.5">{opt.description}</p>
          </div>
        </button>
      {/each}
    </div>

    {#if onboardAdversaries.length > 0}
    <div class="border border-border/60 rounded-lg p-4 mb-6 bg-surface/40">
      <p class="label-mono mb-2.5">Your setup</p>
      <div class="flex flex-wrap gap-1.5">
        {#each onboardAdversaries as adv}
          <span class="pill-amber">{ADVERSARY_OPTIONS.find(o => o.value === adv)?.label ?? adv}</span>
        {/each}
        {#each onboardPlatforms as p}
          <span class="pill-teal">{platformDisplay(p)}</span>
        {/each}
        {#each onboardTracks.filter(t => t !== 'general') as t}
          <span class="pill-dim">{TRACK_OPTIONS.find(o => o.value === t)?.label ?? t}</span>
        {/each}
      </div>
    </div>
    {/if}

    <div class="flex items-center justify-between">
      <button type="button" on:click={() => onboardStep = 2} class="btn-ghost">← Back</button>
      <button type="button" on:click={finishOnboard}
        class="btn-primary {onboardAdversaries.length === 0 ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}">
        Build my checklist →
      </button>
    </div>
  </div>
  {/if}

</div>

{:else if view === 'incident'}
<div class="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-up">

  {#if !incidentScenario}
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-2">
        <span class="text-red-light text-xl">⚠</span>
        <h1 class="font-display text-2xl font-bold text-white">Incident Triage</h1>
      </div>
      <p class="text-body text-sm font-mono">
        What happened? Select the closest match — you'll get immediate steps for right now.
      </p>
    </div>

    <div class="grid gap-2.5 mb-8">
      {#each INCIDENT_PLAYBOOKS as pb}
        <button type="button"
          on:click={() => incidentScenario = pb.id}
          class="panel text-left p-5 hover:border-red/40 transition-all duration-150 group
                 {pb.severity === 'critical' ? 'border-red/20' : 'border-border'}">
          <div class="flex items-start gap-4">
            <span class="text-2xl flex-shrink-0">{pb.icon}</span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h2 class="font-display font-semibold text-bright group-hover:text-white transition-colors">
                  {pb.title}
                </h2>
                <span class="pill-{pb.severity === 'critical' ? 'red' : 'amber'} text-xs">
                  {pb.severity === 'critical' ? 'Critical' : 'High'}
                </span>
              </div>
              <p class="text-sm text-dim font-mono">{pb.subtitle}</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                 stroke-width="1.5" class="flex-shrink-0 text-dim group-hover:text-body mt-1 transition-colors">
              <path d="M4 8h8M9 5l3 3-3 3"/>
            </svg>
          </div>
        </button>
      {/each}
    </div>

    <button type="button" on:click={() => { view = 'checklist'; }} class="btn-ghost text-sm">
      Skip triage — go to full audit
    </button>

  {:else}
    {@const pb = INCIDENT_PLAYBOOKS.find(p => p.id === incidentScenario)}
    {#if pb}

    <button type="button"
      on:click={() => incidentScenario = null}
      class="flex items-center gap-2 text-xs font-mono text-dim hover:text-body transition-colors mb-8">
      ← Back to scenarios
    </button>

    <div class="flex items-start gap-4 mb-6">
      <span class="text-3xl flex-shrink-0">{pb.icon}</span>
      <div>
        <div class="flex items-center gap-2 mb-1">
          <h1 class="font-display text-2xl font-bold text-white">{pb.title}</h1>
          <span class="pill-{pb.severity === 'critical' ? 'red' : 'amber'}">
            {pb.severity === 'critical' ? 'Critical' : 'High'}
          </span>
        </div>
        <p class="text-sm text-dim font-mono">{pb.subtitle}</p>
      </div>
    </div>

    <div class="border border-red/30 bg-red-dim/10 rounded-lg p-4 mb-6 flex items-start gap-3">
      <span class="text-red-light flex-shrink-0 font-mono text-sm">✕</span>
      <p class="text-sm text-red-light font-mono leading-relaxed">{pb.doNotText}</p>
    </div>

    <div class="panel p-5 mb-6">
      <div class="flex items-center justify-between mb-4">
        <p class="label-mono text-amber">Do these right now</p>
        <div class="flex items-center gap-1 rounded-lg border border-border bg-surface p-0.5">
          <button type="button"
            on:click={() => isSimpleMode = true}
            class="px-3 py-1 text-xs font-mono rounded-md transition-colors duration-150
                   {isSimpleMode ? 'bg-amber/20 text-amber-light' : 'text-dim hover:text-body'}">
            Plain English
          </button>
          <button type="button"
            on:click={() => isSimpleMode = false}
            class="px-3 py-1 text-xs font-mono rounded-md transition-colors duration-150
                   {!isSimpleMode ? 'bg-amber/20 text-amber-light' : 'text-dim hover:text-body'}">
            Technical
          </button>
        </div>
      </div>
      <ol class="space-y-4">
        {#each (isSimpleMode ? pb.simpleSteps : pb.immediateSteps) as step, i}
          <li class="flex items-start gap-4">
            <span class="flex-shrink-0 w-6 h-6 rounded-full border border-amber/40 bg-amber-dim/20
                         flex items-center justify-center text-xs font-mono text-amber-light font-semibold">
              {i + 1}
            </span>
            <p class="text-sm text-body leading-relaxed pt-0.5">{step}</p>
          </li>
        {/each}
      </ol>
    </div>

    {#if pb.relatedItemIds.length > 0}
    <div class="panel p-5 mb-6">
      <p class="label-mono mb-3">Once you're stable — do these too</p>
      <div class="space-y-2">
        {#each pb.relatedItemIds as id}
          {@const item = graph.items.get(id)}
          {#if item}
            <button type="button"
              on:click={() => scrollToItem(id, item.category)}
              class="w-full text-left flex items-center gap-3 p-3 rounded-lg border border-border
                     hover:border-amber/30 hover:bg-amber-dim/5 transition-colors group">
              <div class="w-4 h-4 rounded border flex-shrink-0
                           {isImplemented(id)
                             ? 'bg-teal border-teal flex items-center justify-center'
                             : 'border-muted'}">
                {#if isImplemented(id)}
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M1 3L2.8 5L7 1" stroke="white" stroke-width="1.3" stroke-linecap="round"/>
                  </svg>
                {/if}
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-sm text-body group-hover:text-white transition-colors font-sans">
                  {item.title}
                </span>
                <span class="text-[11px] text-muted font-mono ml-2">
                  {item.category.replace(/_/g, ' ')}
                </span>
              </div>
              {#if isImplemented(id)}
                <span class="text-xs font-mono text-teal-light flex-shrink-0">Done ✓</span>
              {:else}
                <span class="text-xs font-mono text-dim group-hover:text-amber-light flex-shrink-0 transition-colors">
                  Open →
                </span>
              {/if}
            </button>
          {/if}
        {/each}
      </div>
    </div>
    {/if}

    <div class="flex flex-wrap gap-3">
      <button type="button"
        on:click={() => { incidentScenario = null; view = 'checklist'; }}
        class="btn-primary text-sm">
        Continue to full audit →
      </button>
      <button type="button"
        on:click={() => incidentScenario = null}
        class="btn-ghost text-sm">
        Back to scenarios
      </button>
    </div>

    {/if}
  {/if}

</div>

{:else if view === 'quiz'}
<div class="max-w-2xl mx-auto px-4 sm:px-6 py-10 animate-fade-up">
  <button type="button" on:click={() => view = 'checklist'}
    class="flex items-center gap-2 text-xs font-mono text-dim hover:text-body transition-colors mb-8">
    ← Back to audit
  </button>

  {#if quizStep === 0}
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-3">
        <span class="text-2xl">🧠</span>
        <h1 class="font-display text-2xl font-bold text-white">Social Engineering Self-Assessment</h1>
      </div>
      <p class="text-body leading-relaxed mb-4">
        7 short scenarios. Rate how you'd genuinely react — there are no right or wrong answers.
        Your results adjust the weighting of human vulnerability items in your checklist.
      </p>
      <div class="panel p-4 border-amber/20 mb-6">
        <p class="text-xs font-mono text-amber-light mb-2">Why this matters</p>
        <p class="text-sm text-body leading-relaxed">
          Everyone is susceptible to different manipulation techniques. Knowing your specific
          vulnerabilities is the first step to defending against them. This assessment stays
          entirely in your browser — it's never transmitted anywhere.
        </p>
      </div>
      {#if profile?.se_quiz}
        <p class="text-xs font-mono text-dim mb-4">
          You completed this on {new Date(profile.se_quiz.completed_at).toLocaleDateString()}.
          Retaking will update your results.
        </p>
      {/if}
      <button type="button" on:click={() => { quizStep = 1; quizAnswers = {}; }}
        class="btn-primary">
        Start assessment →
      </button>
    </div>

  {:else if quizStep <= SE_QUIZ_QUESTIONS.length}
    {@const q = SE_QUIZ_QUESTIONS[quizStep - 1]}
    <div class="flex items-center gap-3 mb-8">
      <div class="flex gap-1">
        {#each SE_QUIZ_QUESTIONS as _, i}
          <div class="h-1.5 w-6 rounded-full transition-all duration-300
                       {i < quizStep - 1 ? 'bg-amber/50' : i === quizStep - 1 ? 'bg-amber' : 'bg-border'}"></div>
        {/each}
      </div>
      <span class="label-mono opacity-60">{quizStep} of {SE_QUIZ_QUESTIONS.length}</span>
    </div>

    <div class="panel p-6 mb-6 border-amber/20">
      <p class="text-body leading-relaxed text-sm mb-2">{q.scenario}</p>
    </div>
    <p class="text-sm font-mono text-bright mb-5">{q.prompt}</p>

    <div class="grid grid-cols-1 gap-2.5 mb-8">
      {#each [1,2,3,4,5] as n}
        {@const selected = quizAnswers[q.id] === n}
        <button type="button"
          on:click={() => { quizAnswers[q.id] = n; }}
          class="text-left p-4 rounded-lg border transition-all duration-150
                 {selected ? 'border-amber/60 bg-amber-dim/20 text-white' : 'border-border bg-surface hover:border-muted text-body'}">
          <div class="flex items-center gap-3">
            <span class="w-6 h-6 rounded-full border flex-shrink-0 flex items-center justify-center text-xs font-mono
                         {selected ? 'border-amber bg-amber text-void' : 'border-muted'}">
              {n}
            </span>
            <span class="text-sm font-sans">{SE_SCALE_LABELS[n]}</span>
          </div>
        </button>
      {/each}
    </div>

    <div class="flex items-center justify-between">
      <button type="button"
        on:click={() => quizStep = Math.max(0, quizStep - 1)}
        class="btn-ghost text-sm">← Back</button>
      {#if quizStep < SE_QUIZ_QUESTIONS.length}
        <button type="button"
          on:click={() => { if (quizAnswers[q.id]) quizStep++; }}
          class="btn-primary text-sm {!quizAnswers[q.id] ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}">
          Next →
        </button>
      {:else}
        <button type="button"
          on:click={submitSEQuiz}
          class="btn-primary text-sm {!quizAnswers[q.id] ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}">
          See my results →
        </button>
      {/if}
    </div>

  {:else}
    {@const quiz = profile?.se_quiz}
    {#if quiz}
    <div class="mb-6">
      <h2 class="font-display text-2xl font-bold text-white mb-2">Your susceptibility profile</h2>
      <p class="text-sm text-body">
        Your checklist now weights human vulnerability items based on these results.
        Highest-scoring registers are the attack patterns most likely to work on you.
      </p>
    </div>

    <div class="panel p-5 mb-5">
      <p class="label-mono mb-4">Susceptibility by manipulation type</p>
      <div class="space-y-3">
        {#each Object.entries(quiz.susceptibilities).sort((a, b) => b[1] - a[1]) as [register, score]}
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-mono text-body">{EMOTIONAL_REGISTER_LABELS[register] ?? register}</span>
              <span class="text-xs font-mono {score >= 75 ? 'text-red-light' : score >= 50 ? 'text-amber-light' : 'text-teal-light'}">{score}%</span>
            </div>
            <div class="h-1.5 bg-border rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-700
                           {score >= 75 ? 'bg-red' : score >= 50 ? 'bg-amber' : 'bg-teal'}"
                   style="width: {score}%"></div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    {#if quiz.top_register}
    <div class="panel p-4 border-amber/20 mb-6">
      <p class="label-mono text-amber mb-2">Your highest risk: {EMOTIONAL_REGISTER_LABELS[quiz.top_register] ?? quiz.top_register}</p>
      <p class="text-sm text-body">
        Items targeting this manipulation type have been prioritised in your checklist.
        Focus on them first in the Human Vulnerability category.
      </p>
    </div>
    {/if}

    <div class="flex flex-wrap gap-3">
      <button type="button" on:click={() => { view = 'checklist'; selectedCategory = 'human_vulnerability'; }}
        class="btn-primary text-sm">See my human vulnerability items →</button>
      <button type="button" on:click={() => view = 'checklist'} class="btn-ghost text-sm">
        Back to audit
      </button>
    </div>
    {/if}
  {/if}
</div>

{:else if view === 'results'}
<div class="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-up">

  <button type="button" on:click={() => view = 'checklist'}
    class="flex items-center gap-2 text-xs font-mono text-dim hover:text-body transition-colors mb-8">
    ← Back to audit
  </button>

  {#if result}
  <div class="flex flex-col sm:flex-row items-center gap-8 mb-10 panel p-6 border-border/60">
    <div class="flex-shrink-0">
      <svg width="140" height="140" viewBox="0 0 92 92">
        <circle cx="46" cy="46" r="42" fill="none" stroke="#1a2540" stroke-width="6"/>
        <circle cx="46" cy="46" r="42" fill="none"
          stroke={result.overall_score > 65 ? '#2a8a8a' : result.overall_score > 35 ? '#d4862a' : '#c0392b'}
          stroke-width="6" class="score-ring"
          style="stroke-dashoffset: {264 - (264 * result.overall_score / 100)}"
        />
        <text x="46" y="44" text-anchor="middle" fill="#f0f8ff" font-size="22" font-weight="700" font-family="Syne, sans-serif">{result.overall_score}</text>
        <text x="46" y="58" text-anchor="middle" fill="#4a6080" font-size="8" font-family="JetBrains Mono, monospace">/ 100</text>
      </svg>
    </div>
    <div class="text-center sm:text-left">
      <p class="label-mono mb-1">Security Assessment</p>
      <h1 class="font-display text-3xl font-bold {maturityColors[result.overall_maturity]} mb-2">
        {maturityLabels[result.overall_maturity]}
      </h1>
      <p class="text-sm text-body leading-relaxed max-w-sm">
        {maturityDescriptions[result.overall_maturity]}
      </p>
      <div class="flex items-center gap-4 mt-3 flex-wrap justify-center sm:justify-start">
        <span class="text-xs font-mono text-dim">{result.total_implemented} of {result.total_applicable} items complete</span>
        {#if result.human_vulnerability_score !== null}
          <span class="text-xs font-mono text-dim">Social eng. awareness: {result.human_vulnerability_score}%</span>
        {/if}
      </div>
    </div>
  </div>

  <div class="panel p-5 mb-5">
    <p class="label-mono mb-4">By category</p>
    <div class="space-y-3">
      {#each [...result.category_scores].sort((a, b) => b.score - a.score) as cat}
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <button type="button"
              on:click={() => { view = 'checklist'; selectedCategory = cat.category; }}
              class="text-xs font-mono text-body hover:text-white transition-colors">
              {cat.label}
            </button>
            <div class="flex items-center gap-3">
              <span class="text-xs font-mono text-muted">{cat.implemented_count}/{cat.total_applicable}</span>
              <span class="text-xs font-mono font-semibold w-10 text-right
                           {cat.score > 65 ? 'text-teal-light' : cat.score > 35 ? 'text-amber-light' : 'text-red-light'}">
                {cat.score}%
              </span>
            </div>
          </div>
          <div class="h-1.5 bg-border rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-700
                        {cat.score > 65 ? 'bg-teal' : cat.score > 35 ? 'bg-amber' : 'bg-red'}"
                 style="width: {cat.score}%"></div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <div class="grid sm:grid-cols-2 gap-4 mb-6">
    {#if result.critical_gaps.length > 0}
    <div class="panel p-4 border-red/20">
      <p class="label-mono text-red-light mb-3">⚠ Fix these first</p>
      <div class="space-y-2">
        {#each result.critical_gaps.slice(0, 5) as item}
          <button type="button" on:click={() => scrollToItem(item.id, item.category)}
            class="w-full text-left flex items-start gap-2 group">
            <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-red flex-shrink-0"></span>
            <span class="text-xs font-mono text-body group-hover:text-white transition-colors leading-relaxed">{item.title}</span>
          </button>
        {/each}
      </div>
    </div>
    {/if}
    {#if result.quick_wins.length > 0}
    <div class="panel p-4 border-amber/20">
      <p class="label-mono text-amber mb-3">⚡ Easy wins right now</p>
      <div class="space-y-2">
        {#each result.quick_wins.slice(0, 5) as item}
          <button type="button" on:click={() => scrollToItem(item.id, item.category)}
            class="w-full text-left flex items-start gap-2 group">
            <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber flex-shrink-0"></span>
            <div>
              <span class="text-xs font-mono text-body group-hover:text-white transition-colors">{item.title}</span>
              <span class="ml-2 text-xs font-mono text-muted">⏱ {item.time_estimate?.setup}</span>
            </div>
          </button>
        {/each}
      </div>
    </div>
    {/if}
  </div>

  <div class="flex flex-wrap gap-3">
    <button type="button" on:click={handleExport} class="btn-ghost text-xs py-2 px-4">
      {exportStatus === 'done' ? '✓ Downloaded' : '↓ Export results'}
    </button>
    <button type="button" on:click={() => view = 'checklist'} class="btn-primary text-xs py-2 px-4">
      Continue audit →
    </button>
  </div>

  <!-- SE Quiz CTA -->
  <div class="panel p-5 mt-5 border-amber/20">
    <div class="flex items-start justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="text-base">🧠</span>
          <p class="font-display font-semibold text-bright">Social Engineering Self-Assessment</p>
          {#if profile?.se_quiz}
            <span class="pill-teal text-xs">Done</span>
          {:else}
            <span class="pill-amber text-xs">5 min</span>
          {/if}
        </div>
        <p class="text-sm text-body leading-relaxed">
          {profile?.se_quiz
            ? `Top vulnerability: ${EMOTIONAL_REGISTER_LABELS[profile.se_quiz.top_register] ?? profile.se_quiz.top_register}. Human vulnerability items weighted accordingly.`
            : 'Discover which manipulation techniques you\'re most susceptible to. Adjusts your checklist weighting.'}
        </p>
      </div>
      <button type="button"
        on:click={() => { quizStep = 0; view = 'quiz'; }}
        class="btn-ghost text-xs flex-shrink-0 py-1.5 px-3">
        {profile?.se_quiz ? 'Retake →' : 'Take quiz →'}
      </button>
    </div>
  </div>

  <!-- ── Security Timeline ── -->
  {#if (profile?.timeline?.length ?? 0) > 0 || sparklineSvg}
  <div class="panel p-5 mt-5">
    <div class="flex items-center justify-between mb-4">
      <p class="label-mono">Your security journey</p>
      <span class="text-xs font-mono text-dim">
        {result.total_implemented} item{result.total_implemented !== 1 ? 's' : ''} completed
      </span>
    </div>

    <!-- Score sparkline — only shown when there's real progression data -->
    {#if sparklineSvg}
    <div class="mb-5">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-mono text-dim">Score progression</span>
        <span class="text-xs font-mono {result.overall_score > 65 ? 'text-teal-light' : result.overall_score > 35 ? 'text-amber-light' : 'text-red-light'}">
          {sparklineSvg.coords[0].score} → {result.overall_score}
        </span>
      </div>
      <svg viewBox="0 0 {sparklineSvg.W} {sparklineSvg.H}" class="w-full h-10" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2a8a8a" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#2a8a8a" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path d={sparklineSvg.fillPath} fill="url(#sparkGrad)"/>
        <path d={sparklineSvg.linePath} fill="none" stroke="#2a8a8a" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Only mark the current endpoint -->
        {#each sparklineSvg.coords as pt, i}
          {#if i === sparklineSvg.coords.length - 1}
            <circle cx={pt.x} cy={pt.y} r="3" fill="#2a8a8a"/>
            <circle cx={pt.x} cy={pt.y} r="5" fill="#2a8a8a" fill-opacity="0.2"/>
          {/if}
        {/each}
      </svg>
    </div>
    {/if}

    <!-- Timeline event log -->
    <div class="space-y-3 max-h-72 overflow-y-auto pr-1">
      {#each (profile?.timeline ?? []).slice(0, 40) as ev}
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 w-2 h-2 rounded-full mt-1.5
                       {ev.type === 'implemented' ? 'bg-teal' :
                        ev.type === 'quiz_completed' ? 'bg-amber' :
                        ev.type === 'life_event' ? 'bg-teal-light' : 'bg-dim'}"></div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="text-xs text-body font-mono leading-snug">
                {#if ev.type === 'implemented'}✓ {ev.item_title ?? 'Item completed'}
                {:else if ev.type === 'quiz_completed'}🧠 Completed social engineering assessment
                {:else if ev.type === 'life_event'}◆ {ev.life_event_label}
                {:else}{ev.note ?? ev.type}
                {/if}
              </p>
              <!-- Show score delta if available -->
              {#if ev.type === 'implemented' && ev.score_before != null && ev.score_after != null && ev.score_after !== ev.score_before}
                <span class="text-xs font-mono text-teal-light flex-shrink-0">
                  +{ev.score_after - ev.score_before}pts
                </span>
              {/if}
            </div>
            <p class="text-xs text-muted font-mono mt-0.5">
              {new Date(ev.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      {/each}
    </div>

    {#if (profile?.timeline?.length ?? 0) > 40}
      <p class="text-xs text-muted font-mono mt-2">Showing 40 of {profile?.timeline?.length} events</p>
    {/if}
  </div>
  {/if}

  {/if}

</div>

{:else}
<!-- Checklist view -->
<div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">

  {#if mode === 'guardian'}
  <div class="mb-6 border border-teal/30 bg-teal-dim/20 rounded-lg p-4 flex items-start gap-3">
    <span class="text-teal-light text-xl flex-shrink-0">○</span>
    <div class="flex-1">
      <p class="font-display font-semibold text-teal-light mb-1">Guardian Mode</p>
      <p class="text-sm text-body">
        Children &amp; teens and women's safety tracks added to your profile.
        Track-specific items are in development — the general baseline is the right foundation.
      </p>
    </div>
  </div>
  {/if}

  {#if mode === 'incident'}
  <div class="mb-6 border border-red/30 bg-red-dim/10 rounded-lg p-4 flex items-start justify-between gap-3">
    <div class="flex items-start gap-3">
      <span class="text-red-light text-xl flex-shrink-0">⚠</span>
      <div>
        <p class="font-display font-semibold text-red-light mb-1">Incident Mode — Critical gaps first</p>
        <p class="text-sm text-body">Items sorted by urgency. Work top to bottom.</p>
      </div>
    </div>
    <button type="button" on:click={() => view = 'incident'}
      class="text-xs font-mono text-red-light border border-red/30 rounded px-2 py-1
             hover:bg-red-dim/20 transition-colors flex-shrink-0">
      ← Playbooks
    </button>
  </div>
  {/if}

  <!-- Landscape feed ticker -->
  {#if activeLandscapeEvents.length > 0 && mode !== 'incident'}
  <div class="mb-5 flex items-stretch border border-red/20 bg-red-dim/8 rounded-lg overflow-hidden animate-fade-up" style="height:38px">
    <div class="flex items-center gap-2 px-3 border-r border-red/20 bg-red-dim/15 flex-shrink-0">
      <span class="text-sm leading-none">🌐</span>
      <span class="font-mono text-xs text-red-light tracking-widest uppercase hidden sm:inline">Live</span>
    </div>
    <div class="threat-ticker-wrap flex-1 flex items-center" title="">
      <div class="threat-ticker-track">
        {#each [...activeLandscapeEvents, ...activeLandscapeEvents] as ev}
          <span class="inline-flex items-center gap-2 px-5 text-xs font-mono">
            <span class="{ev.severity === 'critical' ? 'text-red-light' : 'text-amber-light'} leading-none">
              {ev.severity === 'critical' ? '●' : '○'}
            </span>
            <span class="text-body">{ev.title}</span>
            {#if ev.source_url}
              <a href={safeHref(ev.source_url)} target="_blank" rel="noopener noreferrer"
                 class="text-muted hover:text-amber-light transition-colors ml-1">↗</a>
            {/if}
            <span class="text-border mx-3">·</span>
          </span>
        {/each}
      </div>
    </div>
  </div>
  {/if}

  <!-- Security Pulse banner -->
  {#if result?.reverify_items?.length && mode !== 'incident'}
  <div class="mb-6 border border-amber/40 bg-amber-dim/10 rounded-lg p-4 flex items-start gap-3 animate-fade-up">
    <span class="text-amber-light text-xl flex-shrink-0">↻</span>
    <div class="flex-1 min-w-0">
      <p class="font-display font-semibold text-amber-light mb-1">Security Pulse</p>
      <p class="text-sm text-body mb-3">
        {result.reverify_items.length} of your completed items have been updated with new standards since you checked them off.
      </p>
      <div class="flex flex-wrap gap-2">
        {#each result.reverify_items.slice(0, 3) as item}
          <button type="button" class="pill-amber hover:opacity-80 transition-opacity text-xs"
            on:click={() => scrollToItem(item.id, item.category)}>
            Review {item.title} →
          </button>
        {/each}
        {#if result.reverify_items.length > 3}
          <span class="text-xs font-mono text-amber-light self-center">+{result.reverify_items.length - 3} more</span>
        {/if}
      </div>
    </div>
  </div>
  {/if}

  {#if navHistory.length > 0}
  <div class="mb-4 flex items-center gap-2">
    <button type="button"
      on:click={async () => {
        const target = navHistory[navHistory.length - 1];
        navHistory = navHistory.slice(0, -1);
        await scrollToItem(target.id, target.category);
      }}
      class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border
             bg-surface text-xs font-mono text-body hover:text-bright hover:border-muted
             transition-colors group">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor"
           stroke-width="1.5" stroke-linecap="round"
           class="group-hover:-translate-x-0.5 transition-transform duration-150">
        <path d="M6 1L2 5L6 9"/>
      </svg>
      Back to: <span class="text-amber-light truncate max-w-xs">{navHistory[navHistory.length - 1].title}</span>
    </button>
    {#if navHistory.length > 1}
      <span class="text-xs font-mono text-muted">{navHistory.length - 1} more in history</span>
    {/if}
    <button type="button" on:click={() => { navHistory = []; }}
      class="text-xs font-mono text-muted hover:text-body transition-colors">
      Clear ✕
    </button>
  </div>
  {/if}

  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
    <div>
      <h1 class="font-display text-2xl font-bold text-white">
        {mode === 'incident' ? 'Incident Triage' : mode === 'guardian' ? 'Guardian Mode' : 'Security Audit'}
      </h1>
      <p class="text-sm text-dim font-mono mt-1">
        {result?.total_implemented ?? 0} of {result?.total_applicable ?? 0} complete
        · All data stored locally
      </p>
    </div>

    <div class="flex items-center gap-3">
      <button type="button" on:click={() => { dataPanelOpen = true; clearConfirm = false; }}
        class="w-8 h-8 flex items-center justify-center rounded border border-border
               text-dim hover:text-body hover:border-muted transition-colors" title="Data and settings">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
          <line x1="1" y1="3.5" x2="13" y2="3.5"/>
          <line x1="1" y1="7" x2="13" y2="7"/>
          <line x1="1" y1="10.5" x2="13" y2="10.5"/>
          <circle cx="4" cy="3.5" r="1.5" fill="#0d1421" stroke="currentColor"/>
          <circle cx="9" cy="7" r="1.5" fill="#0d1421" stroke="currentColor"/>
          <circle cx="5.5" cy="10.5" r="1.5" fill="#0d1421" stroke="currentColor"/>
        </svg>
      </button>

      {#if result}
      <button type="button" on:click={() => view = 'results'}
        class="flex items-center gap-3 panel px-4 py-2.5 hover:border-amber/40 transition-colors group"
        title="View full results">
        <svg width="52" height="52" viewBox="0 0 92 92">
          <circle cx="46" cy="46" r="42" fill="none" stroke="#1a2540" stroke-width="7"/>
          <circle cx="46" cy="46" r="42" fill="none"
            stroke={result.overall_score > 65 ? '#2a8a8a' : result.overall_score > 35 ? '#d4862a' : '#c0392b'}
            stroke-width="7" class="score-ring"
            style="stroke-dashoffset: {264 - (264 * result.overall_score / 100)}"
          />
          <text x="46" y="50" text-anchor="middle" fill="#f0f8ff" font-size="18" font-weight="700" font-family="Syne, sans-serif">
            {result.overall_score}
          </text>
        </svg>
        <div>
          <div class="label-mono mb-0.5">Security Score</div>
          <div class="text-sm font-display font-semibold {maturityColors[result.overall_maturity]}">{maturityLabels[result.overall_maturity]}</div>
          <div class="text-xs font-mono text-muted group-hover:text-dim transition-colors">View results →</div>
        </div>
      </button>
      {/if}
    </div>
  </div>

  <div class="panel p-2.5 mb-4 flex items-center gap-2 flex-wrap">
    <span class="label-mono flex-shrink-0 px-1">Platform:</span>
    <button type="button" on:click={() => activePlatform = 'all'}
      class="px-3 py-1 rounded text-xs font-mono transition-colors
             {activePlatform === 'all' ? 'bg-amber text-void font-semibold' : 'text-dim hover:text-body'}">
      All
    </button>
    {#each PLATFORM_OPTIONS as opt}
      <button type="button" on:click={() => activePlatform = opt.value}
        class="px-3 py-1 rounded text-xs font-mono transition-colors
               {activePlatform === opt.value ? 'bg-amber text-void font-semibold' : 'text-dim hover:text-body'}">
        {opt.label}
      </button>
    {/each}
    <span class="text-xs text-muted font-mono ml-auto hidden sm:block">Filters how-to steps per item</span>
  </div>

  {#if result?.category_scores?.length}
  <div class="panel p-3.5 mb-5">
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
      {#each result.category_scores as cat}
        <button type="button"
          on:click={() => selectedCategory = selectedCategory === cat.category ? 'all' : cat.category}
          class="text-left p-2.5 rounded border transition-colors
                 {selectedCategory === cat.category ? 'border-amber/50 bg-amber-dim/10' : 'border-transparent hover:border-border'}">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs text-dim font-mono truncate max-w-[120px] sm:max-w-none">{cat.label}</span>
            <span class="text-xs font-mono {cat.score > 65 ? 'text-teal-light' : cat.score > 35 ? 'text-amber-light' : 'text-red-light'}">{cat.score}%</span>
          </div>
          <div class="h-1 bg-border rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-700 {cat.score > 65 ? 'bg-teal' : cat.score > 35 ? 'bg-amber' : 'bg-red'}"
                 style="width: {cat.score}%"></div>
          </div>
          <div class="text-xs text-muted mt-1">{cat.implemented_count}/{cat.total_applicable}</div>
        </button>
      {/each}
    </div>
  </div>
  {/if}

  {#if result?.quick_wins?.length && mode !== 'incident'}
  <div class="border border-amber/20 bg-amber-dim/8 rounded-lg p-3.5 mb-5">
    <p class="label-mono text-amber mb-2">⚡ Quick wins</p>
    <div class="flex flex-wrap gap-2">
      {#each result.quick_wins.slice(0, 3) as item}
        <button type="button" class="pill-amber hover:opacity-80 transition-opacity text-xs"
          on:click={() => scrollToItem(item.id, item.category)}>
          {item.title}
        </button>
      {/each}
    </div>
  </div>
  {/if}

  {#if !profile?.se_quiz && mode !== 'incident'}
  <div class="border border-border rounded-lg p-3.5 mb-5 flex items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <span class="text-lg">🧠</span>
      <div>
        <p class="text-sm font-sans font-medium text-bright">Discover your social engineering vulnerabilities</p>
        <p class="text-xs text-dim font-mono">7 questions · personalises your checklist weighting · stays in your browser</p>
      </div>
    </div>
    <button type="button" on:click={() => { quizStep = 0; view = 'quiz'; }}
      class="btn-ghost text-xs flex-shrink-0 py-1.5 px-3">
      Take quiz →
    </button>
  </div>
  {/if}

  <div class="flex flex-col sm:flex-row gap-2.5 mb-3">
    <input bind:value={searchQuery}
      placeholder="Search items…"
      class="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-sm text-body
             placeholder-muted font-mono focus:outline-none focus:border-dim transition-colors"/>
    <select bind:value={selectedCategory}
      class="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-body font-mono
             focus:outline-none focus:border-dim transition-colors">
      <option value="all">All Categories</option>
      {#each categories as cat}
        <option value={cat}>{categoryLabel(cat)}</option>
      {/each}
    </select>
  </div>

  <div class="flex items-center gap-2 mb-3">
    <button type="button" on:click={toggleEasyMode}
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors
             {easyMode ? 'border-teal/40 text-teal-light bg-teal-dim/10' : 'border-amber/40 text-amber-light bg-amber-dim/10'}">
      {easyMode ? '◉ Easy mode' : '◈ Technical mode'}
    </button>
    <span class="text-xs text-muted font-mono hidden sm:inline">{easyMode ? 'Simplified — switch for full detail' : 'Full technical detail'}</span>
  </div>

  <p class="text-xs text-muted font-mono mb-3">
    {displayItems.length} item{displayItems.length !== 1 ? 's' : ''}
    {selectedCategory !== 'all' ? ` in ${categoryLabel(selectedCategory)}` : ''}
    {searchQuery ? ` matching "${searchQuery}"` : ''}
  </p>

  <div class="space-y-2">
    {#each displayItems as item (item.id)}
      {@const impl = item.is_implemented}
      {@const skipped = isSkipped(item.id)}
      {@const expanded = expandedItems.has(item.id)}
      {@const highlighted = highlightedItem === item.id}
      {@const needsReverify = item.needs_reverification}
      {@const platformNote = getPlatformNote(item)}
      {@const noteLabel = getPlatformNoteLabel(item)}
      {@const allPlatforms = item.platforms ?? []}
      {@const visiblePlatforms = allPlatforms.slice(0, 3)}
      {@const hiddenPlatforms = allPlatforms.slice(3)}
      {@const platformsExpanded = expandedPlatforms.has(item.id)}
      {@const age = verificationAge(item.last_verified)}
      {@const blockedReason = getBlockedReason(item)}
      {@const hasLandscapeBoost = activeLandscapeEvents.some(e => e.related_items.includes(item.id))}

      <div id="item-{item.id}"
        class="panel border transition-all duration-300
               {needsReverify ? 'border-amber/50 bg-amber-dim/5'
                : impl ? 'border-teal/20 bg-teal-dim/8'
                : skipped ? 'border-border/30 opacity-50'
                : blockedReason ? 'border-border/40 opacity-60'
                : highlighted ? 'border-amber/60 bg-amber-dim/10'
                : 'border-border hover:border-muted'}">

        <div class="flex items-start gap-4 p-4">
          <button type="button"
            on:click={() => toggleItem(item.id, impl)}
            class="mt-0.5 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center
                   transition-all duration-150
                   {impl ? 'bg-teal border-teal text-void'
                    : blockedReason ? 'border-border/40 bg-transparent cursor-not-allowed'
                    : 'border-muted hover:border-body bg-transparent'}"
            title={blockedReason ?? (impl ? 'Mark incomplete' : 'Mark complete')}
            aria-label="{impl ? 'Mark incomplete' : 'Mark complete'}">
            {#if impl}
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            {:else if blockedReason}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 2L8 8M8 2L2 8" stroke="#2a3a5c" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            {/if}
          </button>

          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1.5">
              <h3 class="font-sans font-medium text-sm
                         {impl ? 'text-dim line-through' : skipped ? 'text-muted line-through' : blockedReason ? 'text-dim' : 'text-bright'}">
                {item.title}
              </h3>
              {#if needsReverify}
                <span class="pill-amber text-xs animate-pulse-slow">↻ Needs Review</span>
              {/if}
              {#if hasLandscapeBoost && !impl}
                <span class="pill-red text-xs" title="Priority elevated by current threat landscape">🌐 Elevated</span>
              {/if}
              {#if mode === 'incident' && result?.critical_gaps.some(g => g.id === item.id)}
                <span class="pill-red text-xs">Critical</span>
              {/if}
              {#if skipped}<span class="pill-dim text-xs">Skipped</span>{/if}
              {#if item.sensitive}<span class="pill-red text-xs">Sensitive</span>{/if}
              {#if blockedReason && !impl}<span class="pill-dim text-xs">🔒 Blocked</span>{/if}
              {#if item.compensating_factor > 0 && !impl}
                <span class="pill-teal text-xs" title="A stronger control reduces urgency here">↓ Urgency reduced</span>
              {/if}
            </div>

            {#if blockedReason && !impl}
              <p class="text-xs text-dim font-mono mb-2 leading-relaxed">🔒 {blockedReason}</p>
            {/if}

            <p class="text-sm text-dim leading-relaxed mb-3">{easyMode ? truncSentences(item.description, 1) : item.description}</p>

            <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span class="text-xs font-mono text-muted">⏱ {item.time_estimate?.setup ?? '?'}</span>
              <span class="maturity-{item.maturity_level} text-xs">
                {easyMode ? maturityLabels[item.maturity_level] : `L${item.maturity_level} · ${maturityLabels[item.maturity_level]}`}
              </span>
              <div class="flex items-center gap-1 flex-wrap">
                {#each visiblePlatforms as platform}<span class="pill-dim text-xs">{platformDisplay(platform)}</span>{/each}
                {#if hiddenPlatforms.length > 0}
                  {#if platformsExpanded}
                    {#each hiddenPlatforms as platform}<span class="pill-dim text-xs">{platformDisplay(platform)}</span>{/each}
                    <button type="button" on:click|stopPropagation={() => togglePlatformExpand(item.id)}
                      class="text-xs text-dim font-mono hover:text-body transition-colors">less</button>
                  {:else}
                    <button type="button" on:click|stopPropagation={() => togglePlatformExpand(item.id)}
                      class="text-xs text-amber-light font-mono hover:opacity-80 transition-opacity">
                      +{hiddenPlatforms.length} more
                    </button>
                  {/if}
                {/if}
              </div>

              <div class="flex items-center gap-3 w-full sm:w-auto sm:ml-auto mt-2 sm:mt-0">
                {#if needsReverify}
                  <button type="button" on:click|stopPropagation={() => reverifyItem(item.id)}
                    class="btn-primary text-xs py-1 px-3">
                    Confirm updated steps
                  </button>
                {/if}
                {#if !impl}
                  <button type="button" on:click|stopPropagation={() => toggleSkip(item.id)}
                    class="text-xs font-mono transition-colors
                           {skipped ? 'text-amber-light hover:text-amber' : 'text-muted hover:text-dim'}">
                    {skipped ? 'Undo skip' : 'Skip'}
                  </button>
                {/if}
                <button type="button" on:click={() => toggleExpand(item.id)}
                  class="text-xs font-mono transition-colors
                         {expanded ? 'text-amber-light' : 'text-dim hover:text-body'}">
                  {expanded ? '↑ Less' : '↓ How to do this'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {#if expanded}
        <div class="border-t border-border px-4 pt-4 pb-5 space-y-5">

          <div>
            <p class="label-mono mb-2">Why this matters</p>
            <p class="text-sm text-body leading-relaxed pl-3 border-l border-amber/30">{easyMode ? truncSentences(item.threat_narrative, 2) : item.threat_narrative}</p>
          </div>

          {#if item.category === 'human_vulnerability' && item.emotional_register}
          <div>
            <p class="label-mono mb-2">Psychological trigger</p>
            <div class="flex items-center gap-3 bg-surface/60 border border-amber/20 rounded-lg p-3">
              <span class="text-amber text-base">🧠</span>
              <div>
                <p class="text-sm font-mono text-amber-light">
                  {EMOTIONAL_REGISTER_LABELS[item.emotional_register] ?? item.emotional_register}
                </p>
                <p class="text-xs text-dim font-mono mt-0.5">
                  Attackers exploit this state to bypass rational decision-making.
                </p>
              </div>
            </div>
          </div>
          {/if}

          {#if platformNote}
          <div>
            <div class="flex items-center gap-2 mb-2">
              <p class="label-mono">How to implement</p>
              <span class="pill-teal">{noteLabel}</span>
              {#if activePlatform === 'all'}
                <span class="text-xs text-muted font-mono">— select a platform above for specific steps</span>
              {/if}
            </div>
            <div class="bg-void/60 border border-border rounded-lg p-3">
              <p class="text-sm text-body leading-relaxed font-mono whitespace-pre-line">{platformNote}</p>
            </div>
            {#if Object.keys(item.platform_notes ?? {}).length > 1 && activePlatform !== 'all'}
              <p class="text-xs text-muted font-mono mt-1">
                Steps also available for: {Object.keys(item.platform_notes ?? {}).filter(p => p !== activePlatform).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}
              </p>
            {/if}
          </div>
          {/if}

          <div class="flex items-center gap-5">
            <div>
              <p class="label-mono mb-1">Technical effort</p>
              <span class="text-sm font-mono text-dim">{easyMode ? diffLabel(item.difficulty?.technical ?? 1) : difficultyDots(item.difficulty?.technical ?? 1)}</span>
            </div>
            <div>
              <p class="label-mono mb-1">Workflow change</p>
              <span class="text-sm font-mono text-dim">{easyMode ? diffLabel(item.difficulty?.disruption ?? 1) : difficultyDots(item.difficulty?.disruption ?? 1)}</span>
            </div>
            <div>
              <p class="label-mono mb-1">Reversibility</p>
              <span class="text-sm font-mono text-dim">{easyMode ? diffLabel(item.difficulty?.reversibility ?? 1) : difficultyDots(item.difficulty?.reversibility ?? 1)}</span>
            </div>
          </div>

          {#if item.adversaries?.length}
          <div>
            <p class="label-mono mb-2">Protects against</p>
            <div class="flex flex-wrap gap-2">
              {#each item.adversaries as adv}
                {@const userHas = profile?.adversaries?.includes(adv)}
                <span class="text-xs font-mono px-2 py-0.5 rounded border
                             {userHas ? 'border-amber/50 text-amber-light bg-amber-dim/20' : 'border-border text-dim'}">
                  {ADVERSARY_OPTIONS.find(o => o.value === adv)?.label ?? adv}
                  {#if userHas}<span class="text-amber ml-1">✓</span>{/if}
                </span>
              {/each}
            </div>
          </div>
          {/if}

          {#if item.related_items?.length}
          <div>
            <p class="label-mono mb-2">Related items</p>
            <div class="space-y-1.5">
              {#each item.related_items as rel}
                {@const relItem = graph.items.get(rel.id)}
                {#if relItem}
                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono text-muted bg-void border border-border px-1.5 py-0.5 rounded flex-shrink-0">
                    {rel.relationship.replace(/_/g, ' ')}
                  </span>
                  <button type="button" on:click={() => scrollToItem(rel.id, relItem.category, item.id)}
                    class="text-xs text-amber-light font-mono hover:opacity-80 transition-opacity text-left">
                    {relItem.title}
                  </button>
                </div>
                {/if}
              {/each}
            </div>
          </div>
          {/if}

          {#if item.sources?.length}
          <div>
            <p class="label-mono mb-2">Sources</p>
            <div class="flex flex-wrap gap-3">
              {#each item.sources as source}
                <a href={safeHref(source.url)} target="_blank" rel="noopener noreferrer"
                   class="text-xs font-mono text-dim hover:text-body transition-colors underline underline-offset-2">
                  {source.title} ↗
                </a>
              {/each}
            </div>
          </div>
          {/if}

          <div>
            <p class="label-mono mb-2">Your notes</p>
            <textarea bind:value={noteValues[item.id]} on:blur={() => handleNoteBlur(item.id)}
              placeholder="Personal notes, reminders, or context…"
              rows="3"
              class="w-full px-3 py-2 bg-void/60 border border-border rounded-lg text-sm text-body
                     font-mono placeholder-muted focus:outline-none focus:border-dim transition-colors
                     resize-none leading-relaxed"></textarea>
            {#if noteValues[item.id]?.trim()}
              <p class="text-xs text-muted font-mono mt-1">Saved automatically.</p>
            {/if}
          </div>

          {#if (item.resources ?? []).length > 0}
            {@const avoidRefs = (item.resources ?? []).filter(ref => graph.resources.get(ref.id)?.privacy_posture === 'avoid')}
            {#if avoidRefs.length > 0}
            <div class="border border-amber/20 rounded-lg px-3 py-2 bg-amber-dim/10">
              <p class="text-xs font-mono text-amber-light">
                ⚠ If you're using {avoidRefs.map(r => graph.resources.get(r.id)?.title ?? r.id).join(' or ')},
                consider switching —
                <a href="/resources" class="underline hover:text-amber transition-colors">see alternatives</a>
              </p>
            </div>
            {/if}
          {/if}

          <div class="flex items-center justify-between pt-1 flex-wrap gap-2">
            <div class="flex flex-col gap-1">
              <p class="text-xs font-mono {verifiedAgeClass[age]}">
                Verified: {item.last_verified ?? 'unknown'}
                {#if item.verified_by?.length}&nbsp;· {item.verified_by.map((v) => v.replace(/^org:/, '')).join(', ')}{/if}
                {#if age === 'stale'}<span class="ml-1">⚠ May be outdated</span>
                {:else if age === 'outdated'}<span class="ml-1">⚠ Verify before implementing</span>{/if}
              </p>
              {#if item.changelog?.length}
                <p class="text-xs font-mono text-muted">
                  v{item.changelog[0].version} · {item.changelog[0].date}
                  {#if item.changelog[0].author}&nbsp;· {item.changelog[0].author.replace(/^github:/, '')}{/if}
                </p>
              {/if}
            </div>
            <div class="flex items-center gap-3">
              <a href="https://github.com/KashishOO7/spectra/issues/new?title=Item+{encodeURIComponent(item.id + ' v' + item.version + ' needs review')}&body=Item+ID:+{item.id}%0AVersion:+{item.version}%0A%0ADescribe+the+issue:"
                 target="_blank" rel="noopener noreferrer"
                 class="text-xs font-mono text-muted hover:text-amber-light transition-colors">
                Flag issue ↗
              </a>
              <button type="button" on:click={() => toggleItem(item.id, impl)}
                disabled={!!blockedReason && !impl}
                class="{impl ? 'btn-ghost' : 'btn-primary'} text-xs py-1.5 px-3
                       {blockedReason && !impl ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}">
                {impl ? 'Mark incomplete' : 'Mark as done'}
              </button>
            </div>
          </div>

        </div>
        {/if}

      </div>
    {/each}

    {#if displayItems.length === 0}
      <div class="panel p-8 text-center">
        <p class="text-dim font-mono text-sm">No items match your filters.</p>
        {#if selectedCategory !== 'all'}
          <button type="button" on:click={() => selectedCategory = 'all'}
            class="text-xs text-amber-light font-mono mt-2 hover:opacity-80">Clear filter</button>
        {/if}
      </div>
    {/if}
  </div>

</div>
{/if}

{#if dataPanelOpen}
  <button type="button" class="fixed inset-0 bg-void/70 backdrop-blur-sm z-40"
    on:click={() => { dataPanelOpen = false; clearConfirm = false; }} aria-label="Close panel"></button>

  <div class="fixed top-0 right-0 h-full w-full max-w-sm bg-surface border-l border-border
              z-50 overflow-y-auto shadow-2xl flex flex-col sidebar-scroll">

    <div class="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
      <h2 class="font-display font-semibold text-white">Data &amp; Settings</h2>
      <button type="button" on:click={() => { dataPanelOpen = false; clearConfirm = false; }}
        class="text-dim hover:text-body transition-colors font-mono text-lg leading-none">✕</button>
    </div>

    <div class="flex-1 px-5 py-5 space-y-6">

      <section>
        <p class="label-mono mb-3">Your Threat Model</p>
        <div class="space-y-3">
          <div>
            <p class="text-xs text-dim font-mono mb-1.5">Adversaries ({profile?.adversaries?.length ?? 0})</p>
            <div class="flex flex-wrap gap-1.5">
              {#each (profile?.adversaries ?? []) as adv}
                <span class="pill-amber">{ADVERSARY_OPTIONS.find(o => o.value === adv)?.label ?? adv}</span>
              {:else}
                <span class="text-xs text-muted font-mono">None — <button type="button" class="text-amber-light underline" on:click={() => { dataPanelOpen = false; startReconfigure(); }}>set up now</button></span>
              {/each}
            </div>
          </div>
          <div>
            <p class="text-xs text-dim font-mono mb-1.5">Platforms</p>
            <div class="flex flex-wrap gap-1.5">
              {#each (profile?.platforms ?? []).filter(p => p !== 'all') as plat}
                <span class="pill-teal">{platformDisplay(plat)}</span>
              {:else}
                <span class="text-xs text-muted font-mono">All platforms</span>
              {/each}
            </div>
          </div>
          <div>
            <p class="text-xs text-dim font-mono mb-1.5">Tracks</p>
            <div class="flex flex-wrap gap-1.5">
              {#each (profile?.tracks ?? ['general']) as track}
                <span class="pill-dim">{TRACK_OPTIONS.find(o => o.value === track)?.label ?? track === 'general' ? 'General baseline' : track}</span>
              {/each}
            </div>
          </div>
        </div>
        <button type="button" on:click={() => { dataPanelOpen = false; startReconfigure(); }}
          class="btn-ghost text-xs py-1.5 px-3 mt-3">
          Reconfigure
        </button>
      </section>

      <section>
        <div class="flex items-center justify-between mb-3">
          <p class="label-mono">Has anything changed?</p>
          <button type="button"
            on:click={() => lifeEventsOpen = !lifeEventsOpen}
            class="text-xs font-mono text-dim hover:text-body transition-colors">
            {lifeEventsOpen ? 'Hide ↑' : 'Update ↓'}
          </button>
        </div>
        {#if lifeEventsOpen}
        <div class="space-y-2">
          {#each LIFE_EVENTS as ev}
            {@const applied = profile?.life_events_applied?.includes(ev.id)}
            <button type="button"
              on:click={() => !applied && handleLifeEvent(ev)}
              class="w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-colors
                     {applied ? 'border-teal/20 bg-teal-dim/10 cursor-default' : 'border-border hover:border-muted'}">
              <span class="text-base flex-shrink-0">{ev.icon}</span>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-sans {applied ? 'text-teal-light' : 'text-body'}">{ev.label}</p>
                {#if !applied && ((ev.adversary_delta?.length ?? 0) > 0 || (ev.track_delta?.length ?? 0) > 0)}
                  <p class="text-xs font-mono text-muted mt-0.5">
                    {[...(ev.adversary_delta || []), ...(ev.track_delta || [])].slice(0,2).join(', ')} added
                  </p>
                {/if}
              </div>
              {#if applied}
                <span class="text-xs font-mono text-teal-light flex-shrink-0">Applied ✓</span>
              {/if}
            </button>
          {/each}
        </div>
        <p class="text-xs text-muted font-mono mt-2">Adds relevant threat vectors to your profile without resetting anything.</p>
        {/if}
      </section>

      <section>
        <p class="label-mono mb-3">Progress</p>
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-void border border-border rounded-lg p-3 text-center">
            <p class="font-display text-2xl font-bold text-white">{result?.total_implemented ?? 0}</p>
            <p class="text-xs text-dim font-mono">items done</p>
          </div>
          <div class="bg-void border border-border rounded-lg p-3 text-center">
            <p class="font-display text-2xl font-bold
                       {(result?.overall_score ?? 0) > 65 ? 'text-teal-light' : (result?.overall_score ?? 0) > 35 ? 'text-amber-light' : 'text-red-light'}">
              {result?.overall_score ?? 0}
            </p>
            <p class="text-xs text-dim font-mono">security score</p>
          </div>
        </div>
        <button type="button" on:click={() => { dataPanelOpen = false; view = 'results'; }}
          class="btn-ghost text-xs py-1.5 px-3 mt-3 w-full text-center">View full results →</button>
        {#if profile?.last_active}
          <p class="text-xs text-muted font-mono mt-2">Last active: {new Date(profile.last_active).toLocaleDateString()}</p>
        {/if}
      </section>

      <section>
        <p class="label-mono mb-1">Export Your Data</p>
        <p class="text-xs text-dim font-mono mb-3">Downloads as JSON. Nothing is sent anywhere.</p>
        <button type="button" on:click={handleExport} class="btn-ghost text-xs py-1.5 px-3 w-full text-center">
          {exportStatus === 'done' ? '✓ Downloaded' : exportStatus === 'error' ? 'Export failed' : '↓ Export profile.json'}
        </button>
      </section>

      <section>
        <p class="label-mono mb-1">Import Profile</p>
        <p class="text-xs text-dim font-mono mb-3">Restore a previously exported Spectra profile.</p>
        <label class="btn-ghost text-xs py-1.5 px-3 w-full text-center block cursor-pointer">
          {importStatus === 'done' ? '✓ Imported' : importStatus === 'error' ? `Error: ${importError}` : '↑ Choose file to import'}
          <input type="file" accept=".json" class="hidden" on:change={handleImport} bind:this={importInput}/>
        </label>
      </section>

      <section class="border-t border-border pt-5">
        <p class="label-mono text-red-light mb-1">Clear All Data</p>
        <p class="text-xs text-dim font-mono mb-3">Permanently deletes everything from this browser.</p>
        {#if clearConfirm}
          <div class="border border-red/40 rounded-lg p-3 mb-3 bg-red-dim/10">
            <p class="text-xs text-red-light font-mono mb-3">Delete everything — score, checkmarks, threat model. Sure?</p>
            <div class="flex gap-2">
              <button type="button" on:click={handleClear}
                class="flex-1 py-1.5 px-3 rounded border border-red/60 bg-red-dim/20
                       text-red-light text-xs font-mono hover:bg-red-dim/40 transition-colors">
                Yes, delete everything
              </button>
              <button type="button" on:click={() => clearConfirm = false}
                class="flex-1 py-1.5 px-3 rounded border border-border text-dim text-xs font-mono hover:text-body transition-colors">
                Cancel
              </button>
            </div>
          </div>
        {:else}
          <button type="button" on:click={handleClear}
            class="text-xs font-mono text-red-light border border-red/30 rounded px-3 py-1.5
                   hover:bg-red-dim/20 transition-colors w-full text-center">
            Clear all data
          </button>
        {/if}
      </section>

      <section class="border-t border-border pt-4">
        <p class="text-xs text-muted font-mono leading-relaxed">
          All data lives in your browser's IndexedDB. No server, no account, no analytics. Nothing you enter is ever transmitted.
        </p>
      </section>

    </div>
  </div>
{/if}