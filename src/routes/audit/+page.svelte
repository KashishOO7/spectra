<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { page } from '$app/stores';
  import { goto, afterNavigate } from '$app/navigation';
  import type { Snapshot } from '@sveltejs/kit';
  import { settle } from '$lib/nav/trail.js';
  import type { PageData } from './$types.js';
  import type {
    UserProfile, AssessmentResult, ChecklistItem, ContentGraph,
    ScoredItem, Track, Platform
  } from '$lib/types.js';
  import {
    loadProfile, saveProfile, markImplemented, markSkipped, markSnoozed, saveNote,
    createDefaultProfile, addTimelineEvent,
    backfillImplementedVersions
  } from '$lib/engine/store.js';
  import { scoreAssessment } from '$lib/engine/scoring.js';
  import { buildIndex, route } from '$lib/engine/router.js';
  import { deserializeGraph } from '$lib/content/deserialize.js';
  import { assessment, profileVersion } from '$lib/engine/session.js';
  import type { Harm } from '$lib/types.js';
  import OnboardView from '$lib/components/audit/OnboardView.svelte';
  import IncidentView from '$lib/components/audit/IncidentView.svelte';
  import AuditView from '$lib/components/audit/AuditView.svelte';
  import note from '#spectra-wiki/page/your-list';
  import { text, fill } from '$lib/wiki/page.js';

  const description = text(note, 'description');

  export let data: PageData;

  let profile: UserProfile | null = null;
  let result: AssessmentResult | null = null;
  let loading = true;
  let view: 'onboard' | 'checklist' | 'incident' = 'checklist';
  let mode: 'normal' | 'incident' | 'guardian' = 'normal';

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

  let onboardTracks: Track[] = ['general'];
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

  let prefilledHarms: Harm[] = [];

  let unsubscribeProfile: (() => void) | null = null;

  onDestroy(() => {
    unsubscribeProfile?.();
    if (typeof window !== 'undefined') {
      window.removeEventListener('spectra:configure', startReconfigure);
    }
    assessment.set(null);
  });

  let navHistory: Array<{ id: string; title: string; category: string }> = [];


  function toggleTrack(v: Track) {
    if (v === 'general') return;
    onboardTracks = onboardTracks.includes(v)
      ? onboardTracks.filter(t => t !== v) : [...onboardTracks, v];
  }

  async function finishOnboard() {
    if (!profile) return;
    profile.tracks = ['general', ...onboardTracks.filter(t => t !== 'general')];
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
    return orderedItems
      .filter(item => rank.has(item.id))
      .sort((a, b) => rank.get(a.id)! - rank.get(b.id)!);
  })();

  onMount(async () => {
    if ($page.url.searchParams.get('view') === 'quiz') { await goto('/quiz', { replaceState: true }); return; }
    if ($page.url.searchParams.get('view') === 'results') { await goto('/you', { replaceState: true }); return; }

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
    await tick();
    settle();

    if ($page.url.searchParams.get('configure') === '1') startReconfigure();
    window.addEventListener('spectra:configure', startReconfigure);

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

  afterNavigate(nav => {
    if (nav.type === 'enter' || loading) return;
    const m = $page.url.searchParams.get('mode');
    const next = m === 'incident' ? 'incident' : m === 'guardian' ? 'guardian' : 'normal';
    if (next === mode) return;
    mode = next;
    view = mode === 'incident' ? 'incident' : 'checklist';
    recalculate();
  });

  export const snapshot: Snapshot<{ queueOpen: boolean; expanded: string[]; category: string; search: string }> = {
    capture: () => ({ queueOpen, expanded: [...expandedItems], category: selectedCategory, search: searchQuery }),
    restore: v => {
      queueOpen = v.queueOpen;
      expandedItems = new Set(v.expanded);
      selectedCategory = v.category;
      searchQuery = v.search;
    }
  };

  const GUARDIAN_TRACKS: Track[] = ['caring_for_someone', 'known_person_risk'];

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
        return fill(note, 'blocked', { title: depItem?.title ?? dep.id, reason: `${dep.reason}` });
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
    if (profile) onboardTracks = [...(profile.tracks ?? ['general'])];
    isReconfiguring = true;
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

  async function syncFromPanel() {
    profile = (await loadProfile()) ?? createDefaultProfile();
    easyMode = profile.easy_mode ?? true;
    noteValues = {};
    onboardTracks = [...(profile.tracks ?? ['general'])];
    isReconfiguring = false;
    if (view !== 'incident') view = 'checklist';
    recalculate();
  }

</script>

<svelte:head>
  <title>{view === 'incident' ? text(note, 'title-incident') :
    mode === 'guardian' ? text(note, 'title-guardian') : text(note, 'title')}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href="https://spectra.fpszero.com/audit" />
</svelte:head>

{#if loading}
  <div class="flex items-center justify-center h-64">
    <div class="flex items-center gap-3 text-dim text-sm">
      <span class="w-1.5 h-1.5 rounded-full bg-teal animate-pulse-slow"></span>
      {text(note, 'loading')}
    </div>
  </div>

{:else if view === 'onboard'}
<OnboardView
  {isReconfiguring}
  {onboardTracks}
  {toggleTrack}
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

{:else}
<AuditView
  {profile} {result} {graph} {mode} {easyMode} {categories} {displayItems}
  {expandedItems} {detailItems} {expandedPlatforms} {highlightedItem} {isSkipped} {isSnoozed}
  {getBlockedReason} {getRelevantPlatformTabs} {reverifyItem} {handleNoteBlur} {scrollToItem}
  {toggleItem} {toggleSkip} {toggleSnooze} {toggleExpand} {toggleDetails} {togglePlatformExpand} {orderedItems}
  {toggleEasyMode} {startReconfigure} {prefilledHarms}
  {searchRefused} {routedOutsideList}
  bind:selectedCategory bind:searchQuery bind:itemPlatformTab
  bind:noteValues bind:navHistory bind:queueOpen
  onViewIncident={() => view = 'incident'} />
{/if}

