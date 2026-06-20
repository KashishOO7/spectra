<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { page } from '$app/stores';
  import type { PageData } from './$types.js';
  import type {
    UserProfile, AssessmentResult, ChecklistItem, ContentGraph,
    ScoredItem, AdversaryType, Track, Platform, LandscapeEvent, EnvironmentFlag
  } from '$lib/types.js';
  import {
    loadProfile, saveProfile, markImplemented, markSkipped, saveNote,
    createDefaultProfile, clearAllData, exportProfile, importProfile,
    addTimelineEvent, saveSEQuizResult, applyLifeEvent
  } from '$lib/engine/store.js';
  import { scoreAssessment } from '$lib/engine/scoring.js';
  import { SE_QUIZ_QUESTIONS } from '$lib/audit/quiz.js';
  import { LIFE_EVENTS } from '$lib/audit/life-events.js';
  import {
    ADVERSARY_OPTIONS, PLATFORM_OPTIONS,
    EMOTIONAL_REGISTER_LABELS, maturityLabels, maturityColors
  } from '$lib/audit/constants.js';
  import {
    truncSentences, diffLabel, difficultyDots, categoryLabel, platformDisplay,
    verificationAge, verifiedAgeClass, catTextClass, catBarClass,
    getActiveEnvNotes, safeHref
  } from '$lib/audit/helpers.js';
  import OnboardView from '$lib/components/audit/OnboardView.svelte';
  import QuizView from '$lib/components/audit/QuizView.svelte';
  import IncidentView from '$lib/components/audit/IncidentView.svelte';
  import ResultsView from '$lib/components/audit/ResultsView.svelte';
  import DataPanel from '$lib/components/audit/DataPanel.svelte';

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

  // Checklist UI
  let selectedCategory: string = 'all';
  let searchQuery = '';
  let expandedItems = new Set<string>();
  let detailItems = new Set<string>();   // per-item "show extra details" toggle (keeps expanded items concise)
  function toggleDetails(id: string) {
    if (detailItems.has(id)) detailItems.delete(id); else detailItems.add(id);
    detailItems = detailItems;
  }
  let itemPlatformTab = '';
  let highlightedItem: string | null = null;
  let activePlatform: Platform | 'all' = 'all';
  let noteValues: Record<string, string> = {};

  // Onboard
  let onboardStep = 1;
  let onboardAdversaries: AdversaryType[] = [];
  let onboardTracks: Track[] = ['general'];
  let onboardPlatforms: Platform[] = [];
  let onboardEnvironment: EnvironmentFlag[] = [];
  let isReconfiguring = false;

  // Incident triage 
  let incidentScenario: string | null = null;
  let isSimpleMode = true;

  // Display mode — easy (default for new users) vs technical
  let easyMode = true;

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

  // Incident playbooks, SE quiz, life events, and onboard options live in $lib/audit/*


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
  function toggleEnvironment(v: EnvironmentFlag) {
    onboardEnvironment = onboardEnvironment.includes(v)
      ? onboardEnvironment.filter(f => f !== v) : [...onboardEnvironment, v];
  }

  async function finishOnboard() {
    if (!profile || onboardAdversaries.length === 0) return;
    profile.adversaries = onboardAdversaries;
    profile.tracks = ['general', ...onboardTracks.filter(t => t !== 'general')];
    profile.platforms = onboardPlatforms.length > 0 ? onboardPlatforms : ['all' as Platform];
    profile.environment_flags = onboardEnvironment;
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
    onboardAdversaries = []; onboardTracks = ['general']; onboardPlatforms = []; onboardEnvironment = [];
    isReconfiguring = false;
    view = 'onboard';
    onboardStep = 1;
  }

  // Presentational helpers live in $lib/audit/helpers.js
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
  onCategory={(c) => { view = 'checklist'; selectedCategory = c; }}
  onTakeQuiz={() => { quizStep = 0; view = 'quiz'; }} />

{:else}
<!-- Checklist view -->
<div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">

  {#if mode === 'guardian'}
  <div class="mb-6 border border-teal/30 bg-teal-dim/20 rounded-lg p-4 flex items-start gap-3">
    <span class="text-teal-light text-xl flex-shrink-0">○</span>
    <div class="flex-1">
      <p class="font-display font-semibold text-teal-light mb-1">Guardian Mode</p>
      <p class="text-sm text-body">
        Children &amp; teens and women's safety items have been added to your checklist,
        alongside the general baseline that protects everyone.
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
      <p class="text-sm text-dim mt-1">
        {#if (result?.total_implemented ?? 0) === 0}
          Nothing done yet — start with a quick win below. Everything stays on your device.
        {:else}
          {result?.total_implemented} of {result?.total_applicable} complete · all data stored locally
        {/if}
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
    <span class="text-xs text-muted font-mono ml-auto hidden sm:block">Sets default tab for implementation steps</span>
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
            <span class="text-xs font-mono {catTextClass(cat)}">{cat.score}%</span>
          </div>
          <div class="h-1 bg-border rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-700 {catBarClass(cat)}"
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
      {@const allPlatforms = item.platforms ?? []}
      {@const visiblePlatforms = allPlatforms.slice(0, 3)}
      {@const hiddenPlatforms = allPlatforms.slice(3)}
      {@const platformsExpanded = expandedPlatforms.has(item.id)}
      {@const age = verificationAge(item.last_verified)}
      {@const blockedReason = getBlockedReason(item)}
      {@const hasLandscapeBoost = activeLandscapeEvents.some(e => e.related_items.includes(item.id))}
      {@const platTabs = getRelevantPlatformTabs(item)}

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

          {#if platTabs.length > 0}
          <div>
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <p class="label-mono">How to implement</p>
              {#if platTabs.length === 1}
                <span class="pill-teal">{platTabs[0].charAt(0).toUpperCase() + platTabs[0].slice(1)}</span>
              {:else}
                {#each platTabs as pt}
                  <button type="button" on:click={() => itemPlatformTab = pt}
                    class="px-2 py-0.5 rounded text-xs font-mono transition-colors
                           {itemPlatformTab === pt ? 'bg-teal/80 text-void font-semibold' : 'border border-border text-dim hover:text-body'}">
                    {pt.charAt(0).toUpperCase() + pt.slice(1)}
                  </button>
                {/each}
              {/if}
            </div>
            {#if item.platform_notes?.[itemPlatformTab || platTabs[0]]}
            <div class="bg-void/60 border border-border rounded-lg p-3">
              <p class="text-sm text-body leading-relaxed font-mono whitespace-pre-line">{item.platform_notes[itemPlatformTab || platTabs[0]]}</p>
            </div>
            {/if}
          </div>
          {/if}

          {#if item.environment_notes && profile?.environment_flags?.length}
            {@const activeEnvNotes = getActiveEnvNotes(item.environment_notes, profile?.environment_flags)}
            {#if activeEnvNotes.length > 0}
            <div>
              <p class="label-mono mb-2">Based on your environment</p>
              <div class="space-y-2">
                {#each activeEnvNotes as [, note]}
                  <div class="bg-void/60 border border-amber/30 rounded-lg p-3">
                    <p class="text-sm text-body leading-relaxed font-mono whitespace-pre-line">{note}</p>
                  </div>
                {/each}
              </div>
            </div>
            {/if}
          {/if}

          <button type="button" on:click={() => toggleDetails(item.id)}
            class="text-xs font-mono text-amber-light hover:opacity-80 transition-opacity">
            {detailItems.has(item.id) ? '− Hide extra details' : '+ Show extra details — effort, what it protects against, related items, sources'}
          </button>

          {#if detailItems.has(item.id)}
          <div class="space-y-5">
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
          </div>
          {/if}

          {#if item.legal_notes?.length}
          <div>
            <div class="flex items-center gap-2 mb-2">
              <p class="label-mono">Legal context</p>
              {#if item.sensitive}<span class="text-xs font-mono text-amber-light">Safety-critical</span>{/if}
            </div>
            {#each item.legal_notes as ln}
              <div class="rounded-lg p-3 text-xs font-mono leading-relaxed
                          {item.sensitive ? 'bg-void/60 border border-amber/30 text-body' : 'bg-void/40 border border-border text-dim'}">
                {#if ln.jurisdiction !== 'global'}<span class="text-muted mr-1">[{ln.jurisdiction}]</span>{/if}
                <span class="whitespace-pre-line">{ln.note}</span>
              </div>
            {/each}
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
<DataPanel
  bind:dataPanelOpen
  bind:clearConfirm
  bind:lifeEventsOpen
  {profile}
  {result}
  {exportStatus}
  {importStatus}
  {importError}
  onReconfigure={startReconfigure}
  onLifeEvent={handleLifeEvent}
  onViewResults={() => view = 'results'}
  onExport={handleExport}
  onImport={handleImport}
  onClear={handleClear} />
{/if}