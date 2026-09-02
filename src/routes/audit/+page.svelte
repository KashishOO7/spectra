<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { page } from '$app/stores';
  import type { PageData } from './$types.js';
  import type {
    UserProfile, AssessmentResult, ChecklistItem, ContentGraph,
    ScoredItem, AdversaryType, Track, Platform, EnvironmentFlag
  } from '$lib/types.js';
  import {
    loadProfile, saveProfile, markImplemented, markSkipped, markSnoozed, saveNote,
    createDefaultProfile, exportProfile, addTimelineEvent, saveSEQuizResult,
    backfillImplementedVersions
  } from '$lib/engine/store.js';
  import { scoreAssessment } from '$lib/engine/scoring.js';
  import { buildIndex, route } from '$lib/engine/router.js';
  import { deserializeGraph } from '$lib/content/deserialize.js';
  import { assessment, profileVersion } from '$lib/engine/session.js';
  import { SE_QUIZ_QUESTIONS } from '$lib/audit/quiz.js';
  import type { Harm } from '$lib/types.js';
  import OnboardView from '$lib/components/audit/OnboardView.svelte';
  import QuizView from '$lib/components/audit/QuizView.svelte';
  import IncidentView from '$lib/components/audit/IncidentView.svelte';
  import ResultsView from '$lib/components/audit/ResultsView.svelte';
  import AuditView from '$lib/components/audit/AuditView.svelte';

  export let data: PageData;

  let profile: UserProfile | null = null;
  let result: AssessmentResult | null = null;
  let loading = true;
  let view: 'onboard' | 'checklist' | 'results' | 'incident' | 'quiz' = 'checklist';
  let mode: 'normal' | 'incident' | 'guardian' = 'normal';

  let exportStatus: 'idle' | 'done' | 'error' = 'idle';

  let selectedCategory: string = 'all';
  let searchQuery = '';
  let expandedItems = new Set<string>();
  let detailItems = new Set<string>();   
  function toggleDetails(id: string) {
    if (detailItems.has(id)) detailItems.delete(id); else detailItems.add(id);
    detailItems = detailItems;
  }
  let itemPlatformTab = '';
  let highlightedItem: string | null = null;
  let activePlatform: Platform | 'all' = 'all';
  let noteValues: Record<string, string> = {};

  let onboardStep = 1;
  let onboardAdversaries: AdversaryType[] = [];
  let onboardTracks: Track[] = ['general'];
  let onboardPlatforms: Platform[] = [];
  let onboardEnvironment: EnvironmentFlag[] = [];
  let isReconfiguring = false;

  let incidentScenario: string | null = null;
  let isSimpleMode = true;

  let easyMode = true;

  async function toggleEasyMode() {
    easyMode = !easyMode;
    if (profile) {
      profile.easy_mode = easyMode;
      await saveProfile(profile);
    }
  }

  let quizStep = 0; 
  let quizAnswers: Record<string, number> = {};

  let prefilledHarms: Harm[] = [];

  const showResults = () => { view = 'results'; };
  let unsubscribeProfile: (() => void) | null = null;

  onDestroy(() => {
    unsubscribeProfile?.();
    if (typeof window !== 'undefined') {
      window.removeEventListener('spectra:configure', startReconfigure);
      window.removeEventListener('spectra:results', showResults);
    }
    assessment.set(null);
  });

  let navHistory: Array<{ id: string; title: string; category: string }> = [];


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
  function toggleEnvironment(v: EnvironmentFlag) {
    onboardEnvironment = onboardEnvironment.includes(v)
      ? onboardEnvironment.filter(f => f !== v) : [...onboardEnvironment, v];
  }

  async function finishOnboard() {
    if (!profile) return;
    if (onboardAdversaries.length > 0) profile.adversariesManual = [...onboardAdversaries];
    else delete profile.adversariesManual;
    profile.tracks = ['general', ...onboardTracks.filter(t => t !== 'general')];
    profile.platforms = onboardPlatforms.length > 0 ? onboardPlatforms : ['all' as Platform];
    profile.environment_flags = onboardEnvironment;
    if (onboardPlatforms.length > 0) activePlatform = onboardPlatforms[0];
    await saveProfile(profile);
    recalculate();
    isReconfiguring = false;
    view = 'checklist';
  }

  $: graph = deserializeGraph(data.graph);
  $: categories = [...(graph.itemsByCategory?.keys() ?? [])] as string[];

  $: orderedItems = (() => {
    if (!result) return [] as ScoredItem[];
    if (mode === 'incident') {
      const critIds = new Set(result.critical_gaps.map(i => i.id));
      return [...result.critical_gaps, ...result.all_items.filter(i => !critIds.has(i.id))];
    }
    return [...result.all_items];
  })();

  $: routerIndex = graph ? buildIndex(graph) : null;
  $: routed = searchQuery.trim().length > 1 && routerIndex
    ? route(searchQuery, routerIndex, { maxItems: 5 })
    : null;

  $: searchRefused = !!routed && !routed.covered;

  $: routedOutsideList = routed?.covered
    ? routed.items.filter(hit => !orderedItems.some(o => o.id === hit.id))
    : [];

  $: displayItems = (() => {
    let list = orderedItems.filter((item: ScoredItem) =>
      selectedCategory === 'all' || item.category === selectedCategory);

    if (!routed) return list;
    if (!routed.covered) return [];

    const rank = new Map(routed.items.map((hit, i) => [hit.id, i]));
    return list
      .filter(item => rank.has(item.id))
      .sort((a, b) => rank.get(a.id)! - rank.get(b.id)!);
  })();

  onMount(async () => {
    const urlMode = $page.url.searchParams.get('mode');
    if (urlMode === 'incident') mode = 'incident';
    else if (urlMode === 'guardian') mode = 'guardian';

    const from = $page.url.searchParams.get('from');

    profile = await loadProfile();
    if (!profile) {
      profile = createDefaultProfile();
      await saveProfile(profile);
    }
    easyMode = profile.easy_mode ?? true;

    await backfillImplementedVersions(id => graph.items.get(id)?.version);
    profile = (await loadProfile()) ?? profile;

    if (from === 'harms') prefilledHarms = [...(profile.harms ?? [])];


    const savedPlatforms = (profile.platforms ?? []).filter(p => p !== 'all') as Platform[];
    if (savedPlatforms.length > 0) activePlatform = savedPlatforms[0];

    recalculate();

    if (mode === 'incident') {
      view = 'incident';
    }

    loading = false;

    if ($page.url.searchParams.get('configure') === '1') startReconfigure();
    if ($page.url.searchParams.get('view') === 'results') view = 'results';
    window.addEventListener('spectra:configure', startReconfigure);
    window.addEventListener('spectra:results', showResults);

    let firstTick = true;
    unsubscribeProfile = profileVersion.subscribe(() => {
      if (firstTick) { firstTick = false; return; }
      void syncFromPanel();
    });

    const urlHighlight = $page.url.searchParams.get('highlight');
    if (urlHighlight && graph.items.has(urlHighlight)) {
      await tick();
      await scrollToItem(urlHighlight);
    }
  });

  const GUARDIAN_TRACKS: Track[] = ['kids_teen', 'womens_safety'];

  function recalculate() {
    if (!profile) return;
    const scoringProfile = mode === 'guardian'
      ? { ...profile, tracks: [...new Set([...(profile.tracks ?? ['general']), ...GUARDIAN_TRACKS])] }
      : profile;
    result = scoreAssessment(graph, scoringProfile);
    assessment.set(result);
  }

  async function toggleItem(itemId: string, current: boolean) {
    const item = graph.items.get(itemId);
    if (item && !current) {
      const block = getBlockedReason(item);
      if (block) return;
    }
    const scoreBefore = result?.overall_score;

    await markImplemented(itemId, !current, item?.version);
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
        formula: 2,
        timestamp: new Date().toISOString()
      });
    }
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

  async function toggleSnooze(itemId: string) {
    await markSnoozed(itemId, !profile?.snoozed?.[itemId]);
    profile = await loadProfile();
    recalculate();
  }

  function isSnoozed(id: string): boolean {
    return !!(profile?.snoozed?.[id]);
  }

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
      formula: 2,
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
      const it = graph.items.get(id);
      if (it) setDefaultPlatformTab(it);
    }
    expandedItems = expandedItems;
  }

  async function scrollToItem(id: string, category?: string, fromId?: string) {
    if (fromId) {
      const fromItem = graph.items.get(fromId);
      if (fromItem) {
        navHistory = [...navHistory, { id: fromId, title: fromItem.title, category: fromItem.category }];
      }

      selectedCategory = 'all';
    } else if (category) {
      selectedCategory = category;
    }
    view = 'checklist';
    queueOpen = true;
    await tick();
    if (!expandedItems.has(id)) {
      expandedItems.clear();
      expandedItems.add(id);
      if (!(id in noteValues)) noteValues[id] = profile?.notes?.[id] ?? '';
      const it = graph.items.get(id);
      if (it) setDefaultPlatformTab(it);
    }
    expandedItems = expandedItems;
    await tick();
    const el = document.getElementById(`item-${id}`) ?? document.getElementById('action-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      highlightedItem = id;
      setTimeout(() => { highlightedItem = null; }, 2000);
    }
  }

  function startReconfigure() {
    if (profile) {
      onboardAdversaries = [...(profile.adversariesManual ?? [])];
      onboardTracks = [...(profile.tracks ?? ['general'])];
      onboardPlatforms = (profile.platforms ?? []).filter(p => p !== 'all') as Platform[];
      onboardEnvironment = [...(profile.environment_flags ?? [])];
    }
    isReconfiguring = true;
    onboardStep = 1;
    view = 'onboard';
  }

  async function handleNoteBlur(itemId: string) {
    await saveNote(itemId, noteValues[itemId] ?? '');
    profile = await loadProfile();
  }

  function getRelevantPlatformTabs(item: ChecklistItem): string[] {
    const noteKeys = Object.keys(item.platform_notes ?? {});
    if (noteKeys.length === 0) return [];
    const userPlats = profile?.platforms ?? [];
    const isAll = userPlats.length === 0 || userPlats.includes('all' as Platform);
    if (isAll) return noteKeys;
    const matched = noteKeys.filter(k => userPlats.includes(k as Platform));
    return matched.length > 0 ? matched : noteKeys;
  }

  function setDefaultPlatformTab(item: ChecklistItem) {
    const tabs = getRelevantPlatformTabs(item);
    if (tabs.length === 0) { itemPlatformTab = ''; return; }
    if (activePlatform !== 'all' && tabs.includes(activePlatform)) {
      itemPlatformTab = activePlatform;
    } else {
      itemPlatformTab = tabs[0];
    }
  }

  let queueOpen = false;

  let expandedPlatforms = new Set<string>();
  function togglePlatformExpand(id: string) {
    if (expandedPlatforms.has(id)) expandedPlatforms.delete(id);
    else expandedPlatforms.add(id);
    expandedPlatforms = expandedPlatforms;
  }

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

  async function syncFromPanel() {
    profile = (await loadProfile()) ?? createDefaultProfile();
    easyMode = profile.easy_mode ?? true;
    noteValues = {};
    onboardAdversaries = [...(profile.adversariesManual ?? [])];
    onboardTracks = [...(profile.tracks ?? ['general'])];
    onboardPlatforms = (profile.platforms ?? []).filter(p => p !== 'all') as Platform[];
    onboardEnvironment = [...(profile.environment_flags ?? [])];
    isReconfiguring = false;
    onboardStep = 1;
    if (view !== 'incident') view = 'checklist';
    recalculate();
  }

</script>

<svelte:head>
  <title>{(view === 'results' ? 'Results' :
    view === 'incident' ? 'Something happened' :
    view === 'quiz' ? 'Social Engineering Quiz' :
    mode === 'guardian' ? 'Family setup' : 'Your list')} | Spectra</title>
  <meta name="description" content="Answer a few questions about who might try, then work through a list ordered by what matters most for you." />
  <link rel="canonical" href="https://spectra.fpszero.com/audit" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Spectra" />
  <meta property="og:title" content="Your list | Spectra" />
  <meta property="og:description" content="Answer a few questions about who might try, then work through a list ordered by what matters most for you." />
  <meta property="og:url" content="https://spectra.fpszero.com/audit" />

  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Your list | Spectra" />
  <meta name="twitter:description" content="Answer a few questions about who might try, then work through a list ordered by what matters most for you." />
</svelte:head>

{#if loading}
  <div class="flex items-center justify-center h-64">
    <div class="flex items-center gap-3 text-dim text-sm">
      <span class="w-1.5 h-1.5 rounded-full bg-amber animate-pulse-slow"></span>
      Loading your assessment…
    </div>
  </div>

{:else if view === 'onboard'}
<OnboardView
  bind:onboardStep
  {isReconfiguring}
  {onboardAdversaries}
  {onboardTracks}
  {onboardPlatforms}
  {onboardEnvironment}
  {toggleAdversary}
  {toggleTrack}
  {togglePlatform}
  {toggleEnvironment}
  onFinish={finishOnboard}
  onCancel={() => { view = 'checklist'; isReconfiguring = false; }} />

{:else if view === 'incident'}
<IncidentView
  bind:incidentScenario
  bind:isSimpleMode
  {graph}
  implemented={profile?.implemented ?? {}}
  onScrollToItem={scrollToItem}
  onToChecklist={() => view = 'checklist'} />

{:else if view === 'quiz'}
<QuizView
  bind:quizStep
  bind:quizAnswers
  seQuiz={profile?.se_quiz}
  onSubmit={submitSEQuiz}
  onBack={() => view = 'checklist'}
  onSeeHumanItems={() => { view = 'checklist'; selectedCategory = 'human_vulnerability'; }} />

{:else if view === 'results'}
<ResultsView
  {result}
  {profile}
  {exportStatus}
  onBack={() => view = 'checklist'}
  onExport={handleExport}
  onScrollToItem={scrollToItem}
  onTakeQuiz={() => { quizStep = 0; view = 'quiz'; }} />

{:else}
<AuditView
  {profile} {result} {graph} {mode} {easyMode} {categories} {displayItems}
  {expandedItems} {detailItems} {expandedPlatforms} {highlightedItem} {isSkipped} {isSnoozed}
  {getBlockedReason} {getRelevantPlatformTabs} {reverifyItem} {handleNoteBlur} {scrollToItem}
  {toggleItem} {toggleSkip} {toggleSnooze} {toggleExpand} {toggleDetails} {togglePlatformExpand} {orderedItems}
  {toggleEasyMode} {startReconfigure} {prefilledHarms}
  {searchRefused} {routedOutsideList}
  bind:selectedCategory bind:searchQuery bind:activePlatform bind:itemPlatformTab
  bind:noteValues bind:navHistory bind:queueOpen
  onViewIncident={() => view = 'incident'} />
{/if}

