<script lang="ts">
  import type {
    UserProfile, AssessmentResult, ContentGraph, ScoredItem,
    ChecklistItem, Harm, Resource, Lookup
  } from '$lib/types.js';
  import {
    EMOTIONAL_REGISTER_LABELS, ADVERSARY_OPTIONS
  } from '$lib/audit/constants.js';
  import {
    leadSentence, diffLabel, difficultyDots, categoryLabel, platformDisplay,
    getActiveEnvNotes, getActiveTrackNotes, safeHref, platformTabLabel, noteBlocks
  } from '$lib/audit/helpers.js';
  import { tick } from 'svelte';
  import { coverageOf, coverageLine, COVERED_MEANS } from '$lib/engine/coverage.js';
  import Glossed from '$lib/components/Glossed.svelte';
  import NoteLines from '$lib/components/NoteLines.svelte';
  import GlossScope from '$lib/components/GlossScope.svelte';
  import ChapterIcon from '$lib/components/ChapterIcon.svelte';
  import { upNext } from '$lib/engine/next.js';
  import { feelingsFor } from '$lib/engine/feelings.js';
  import { CHAPTERS, chapterProgress } from '$lib/audit/chapters.js';
  import listNote from '#spectra-wiki/page/list-view';
  import { text, fill, pieces, link, placed } from '$lib/wiki/page.js';

  const viewMap = link(listNote, 'view-map');
  const viewTimeline = link(listNote, 'view-timeline');
  const viewPrint = link(listNote, 'view-print');
  const viewGuides = link(listNote, 'view-guides');
  const changeOrder = link(listNote, 'change-this');

  export let profile: UserProfile | null;
  export let result: AssessmentResult | null;
  export let graph: ContentGraph;
  export let mode: 'normal' | 'incident' | 'guardian';
  export let easyMode: boolean;
  export let categories: string[];
  export let displayItems: ScoredItem[];
  export let orderedItems: ScoredItem[];

  export let selectedCategory: string;
  export let searchQuery: string;
  export let searchRefused = false;
  export let routedOutsideList: Array<{ id: string; title: string; blurb: string }> = [];
  export let itemPlatformTab: string;
  export let noteValues: Record<string, string>;
  export let navHistory: Array<{ id: string; title: string; category: string }>;
  export let expandedItems: Set<string>;
  export let detailItems: Set<string>;
  export let expandedPlatforms: Set<string>;
  export let highlightedItem: string | null;

  export let isSkipped: (id: string) => boolean;
  export let isSnoozed: (id: string) => boolean;
  export let getBlockedReason: (item: ChecklistItem) => string | null;
  export let getRelevantPlatformTabs: (item: ChecklistItem) => string[];
  export let reverifyItem: (itemId: string) => Promise<void>;
  export let handleNoteBlur: (itemId: string) => Promise<void>;
  export let scrollToItem: (id: string, category?: string, fromId?: string) => Promise<void>;
  export let toggleItem: (itemId: string, current: boolean) => Promise<void>;
  export let toggleSkip: (itemId: string) => Promise<void>;
  export let toggleSnooze: (itemId: string) => Promise<void>;
  export let toggleExpand: (id: string) => void;
  export let toggleDetails: (id: string) => void;
  export let togglePlatformExpand: (id: string) => void;
  export let toggleEasyMode: () => Promise<void>;
  export let startReconfigure: () => void;
  export let prefilledHarms: Harm[] = [];

  $: prefilledNames = prefilledHarms
    .map(h => h.charAt(0).toLowerCase() + h.slice(1))
    .join(', ');
  export let onViewIncident: () => void;


  $: actionItem = upNext(orderedItems);

  $: chapterTiles = result ? CHAPTERS.map(c => chapterProgress(c, result!)).filter(c => c.total > 0) : [];

  $: skippedItems = displayItems.filter(i => isSkipped(i.id));
  $: skippedCount = orderedItems.filter(i => isSkipped(i.id)).length;

  $: queueCount = orderedItems.filter(i => (!actionItem || i.id !== actionItem.id) && !isSkipped(i.id)).length;
  $: asking = searchQuery.trim().length > 1;
  let askPanel: HTMLElement;
  let wasAsking = false;
  $: if (asking !== wasAsking) {
    wasAsking = asking;
    if (asking && askPanel) tick().then(() => askPanel?.scrollIntoView({
      block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    }));
  }
  $: queueItems = displayItems.filter(i => (asking || !actionItem || i.id !== actionItem.id) && !isSkipped(i.id));

  const resourcesFor = (item: ChecklistItem) =>
    (item.resources ?? [])
      .map(ref => ({ ref, tool: graph.resources.get(ref.id) }))
      .filter((r): r is { ref: typeof r.ref; tool: Resource } => !!r.tool);

  const lookupsFor = (item: ChecklistItem): Lookup[] =>
    (item.lookups ?? [])
      .map(id => graph.lookups?.get(id))
      .filter((l): l is Lookup => !!l);

  export let queueOpen = false;
  let whyOpen = false;
  let skippedOpen = false;

  let howOpen = false;
  $: actionPlatformTabs = actionItem ? getRelevantPlatformTabs(actionItem) : [];
  let lastActionId: string | null = null;
  $: if (actionItem?.id !== lastActionId) {
    lastActionId = actionItem?.id ?? null;
    howOpen = false;
    whyOpen = false;
  }

  $: whyReasons = (() => {
    if (!actionItem) return [] as string[];
    const out: string[] = [];

    out.push(actionItem.score_weight >= 8
      ? text(listNote, 'why-strong')
      : text(listNote, 'why-basic'));


    const picked = (profile?.adversariesManual ?? []).find(
      a => (actionItem.adversaries ?? []).includes(a)
    );
    if (picked) {
      const label = ADVERSARY_OPTIONS.find(o => o.value === picked)?.label ?? picked;
      out.push(fill(listNote, 'why-picked', { label }));
    }


    return out;
  })();
</script>

<div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">

  {#if mode === 'guardian'}
  <div class="mb-6 border border-teal/30 bg-teal-dim/20 rounded-xl p-4 flex items-start gap-3">
    <div class="flex-1">
      <p class="font-semibold text-teal-light mb-1">{text(listNote, 'family-heading')}</p>
      <p class="text-sm text-body">
        {text(listNote, 'family-lead')}
      </p>
    </div>
  </div>
  {/if}

  {#if mode === 'incident'}
  <div class="mb-6 border border-muted/30 bg-surface-2/10 rounded-xl p-4 flex items-start justify-between gap-3">
    <div class="flex items-start gap-3">
      <span class="text-bright text-lg flex-shrink-0">⚠</span>
      <div>
        <p class="font-semibold text-bright mb-1">{text(listNote, 'incident-heading')}</p>
        <p class="text-sm text-body">{text(listNote, 'incident-lead')}</p>
      </div>
    </div>
    <button type="button" on:click={onViewIncident}
      class="text-sm text-bright border border-muted/30 rounded px-2 py-1
             hover:bg-surface-2/20 transition-colors flex-shrink-0">
      {text(listNote, 'playbooks')}
    </button>
  </div>
  {/if}


  {#if result?.reverify_items?.length && mode !== 'incident'}
  <div class="mb-6 border border-teal/40 bg-teal-dim/10 rounded-xl p-4 flex items-start gap-3 animate-fade-up">
    <span class="text-teal-light text-lg flex-shrink-0">↻</span>
    <div class="flex-1 min-w-0">
      <p class="font-semibold text-teal-light mb-1">{text(listNote, 'pulse-heading')}</p>
      <p class="text-sm text-body mb-3">
        {#each pieces(listNote, 'pulse-lead', { count: result.reverify_items.length }) as piece}{piece}{/each}
      </p>
      <div class="flex flex-wrap gap-2">
        {#each result.reverify_items.slice(0, 3) as item}
          <button type="button" class="pill-teal hover:opacity-80 transition-opacity text-xs"
            on:click={() => scrollToItem(item.id, item.category)}>
            {#each pieces(listNote, 'pulse-review', { title: item.title }) as piece}{piece}{/each}
          </button>
        {/each}
        {#if result.reverify_items.length > 3}
          <span class="text-sm text-teal-light self-center">{#each pieces(listNote, 'pulse-more', { count: result.reverify_items.length - 3 }) as piece}{piece}{/each}</span>
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
             bg-surface text-sm text-body hover:text-bright hover:border-muted
             transition-colors group">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor"
           stroke-width="1.5" stroke-linecap="round"
           class="group-hover:-translate-x-0.5 transition-transform duration-150">
        <path d="M6 1L2 5L6 9"/>
      </svg>
      {`${text(listNote, 'back-to')} `}<span class="text-teal-light truncate max-w-xs">{navHistory[navHistory.length - 1].title}</span>
    </button>
    {#if navHistory.length > 1}
      <span class="text-sm text-muted">{#each pieces(listNote, 'history-more', { count: navHistory.length - 1 }) as piece}{piece}{/each}</span>
    {/if}
    <button type="button" on:click={() => { navHistory = []; }}
      class="text-sm text-muted hover:text-body transition-colors">
      {text(listNote, 'clear-history')}
    </button>
  </div>
  {/if}

  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
    <div>
      <h1 class="text-3xl font-bold text-white">
        {mode === 'incident' ? text(listNote, 'heading-incident') : mode === 'guardian' ? text(listNote, 'heading-guardian') : text(listNote, 'heading')}
      </h1>
      <p class="text-base text-body mt-1.5" data-testid="audit-coverage">
        {coverageLine(coverageOf(result))}
      </p>
      <p class="text-sm text-dim mt-1">{COVERED_MEANS}</p>
      <p class="text-sm text-muted mt-1.5">
        {#each pieces(listNote, 'progress', { done: result?.total_implemented ?? 0, total: result?.total_applicable ?? 0 }) as piece}{piece}{/each}{#if result?.total_skipped}{#each pieces(listNote, 'progress-skipped', { count: result.total_skipped }) as piece, i}{i === 0 ? `\u00a0${piece}` : piece}{/each}{/if}{` ${text(listNote, 'progress-stored')}`}
      </p>
    </div>

    {#if mode === 'normal'}
    <nav class="flex flex-wrap items-center gap-2" aria-label={text(listNote, 'other-views')}>
      <a href={viewMap.href}
         class="text-sm px-3 py-1.5 min-h-[44px] sm:min-h-0 inline-flex items-center rounded border
                border-border text-dim hover:text-body hover:border-muted transition-colors">{viewMap.text}</a>
      <a href={viewTimeline.href}
         class="text-sm px-3 py-1.5 min-h-[44px] sm:min-h-0 inline-flex items-center rounded border
                border-border text-dim hover:text-body hover:border-muted transition-colors">{viewTimeline.text}</a>
      <a href={viewPrint.href}
         class="text-sm px-3 py-1.5 min-h-[44px] sm:min-h-0 inline-flex items-center rounded border
                border-border text-dim hover:text-body hover:border-muted transition-colors">{viewPrint.text}</a>
      <a href={viewGuides.href}
         class="text-sm px-3 py-1.5 min-h-[44px] sm:min-h-0 inline-flex items-center rounded border
                border-border text-dim hover:text-body hover:border-muted transition-colors">{viewGuides.text}</a>
    </nav>
    {/if}
  </div>


  {#if prefilledHarms.length > 0}
  <div class="panel px-4 py-2.5 mb-4 flex items-center justify-between gap-3 flex-wrap">
    <p class="text-sm text-dim">
      {#if prefilledHarms.length <= 2}
        {#each placed(listNote, 'ordered-for-few', ['names']) as part}{#if part.kind === 'slot'}<span class="text-body">{prefilledNames}</span>{:else}{part.value}{/if}{/each}
      {:else}
        {#each placed(listNote, 'ordered-for-many', ['everything']) as part}{#if part.kind === 'slot'}<span class="text-body">{text(listNote, 'everything-picked')}</span>{:else}{part.value}{/if}{/each}
      {/if}
    </p>
    <a href={changeOrder.href}
      class="text-sm text-teal-light hover:opacity-80 transition-opacity flex-shrink-0">
      {changeOrder.text}
    </a>
  </div>
  {/if}

  {#if actionItem}
  <div id="action-card" data-up-next={actionItem.id} class="bg-surface border border-border rounded-[18px] px-[22px] py-[26px] mb-4">
    <div class="flex items-start justify-between gap-4 mb-4">
      <span class="pill-teal">{text(listNote, 'start-here')}</span>
    </div>

    <h2 class="font-sans text-lg font-semibold text-white leading-snug mb-4" data-sentence>
      {leadSentence(actionItem)}
    </h2>

    <button type="button" on:click={() => toggleDetails(actionItem.id)}
      class="text-sm text-muted hover:text-body transition-colors mb-5 py-1 min-h-[24px]">
      {detailItems.has(actionItem.id) ? text(listNote, 'hide-detail') : text(listNote, 'more-detail')}
    </button>
    <GlossScope step={actionItem.id}>
    {#if detailItems.has(actionItem.id)}
      <div class="mb-5 pl-3 border-l border-border">
        <p class="text-sm text-body leading-relaxed"><Glossed text={actionItem.description} /></p>
      </div>
    {/if}

    <button type="button" on:click={() => howOpen = !howOpen}
      class="btn-primary w-full h-[52px] justify-center mb-2.5">
      {howOpen ? text(listNote, 'hide-steps') : text(listNote, 'show-how')}
    </button>
    <button type="button" on:click={() => toggleItem(actionItem.id, actionItem.is_implemented)}
      class="btn-ghost w-full h-[52px] justify-center">
      {text(listNote, 'mark-done')}
    </button>

    {#if howOpen}
      <div class="mt-4 pt-4 border-t border-border">
        {#if actionPlatformTabs.length > 0}
          <div class="flex items-center gap-2 mb-2 flex-wrap">
            <p class="label-section">{text(listNote, 'how-to-do-it')}</p>
            {#if actionPlatformTabs.length === 1}
              <span class="pill-teal">{platformTabLabel(actionPlatformTabs[0])}</span>
            {:else}
              {#each actionPlatformTabs as pt}
                <button type="button" on:click={() => itemPlatformTab = pt}
                  class="px-2 py-0.5 rounded text-sm transition-colors
                         {itemPlatformTab === pt ? 'bg-teal/80 text-void font-semibold' : 'border border-border text-dim hover:text-body'}">
                  {platformTabLabel(pt)}
                </button>
              {/each}
            {/if}
          </div>
          {#if actionItem.platform_notes?.[itemPlatformTab || actionPlatformTabs[0]]}
            <div class="space-y-3">
              {#each noteBlocks(actionItem.platform_notes[itemPlatformTab || actionPlatformTabs[0]]) as block}
                <div class="bg-void/60 border border-border rounded-xl p-3">
                  {#if block.heading}
                    <p class="label-section mb-1.5">{block.heading}</p>
                  {/if}
                  <NoteLines lines={block.lines} />
                </div>
              {/each}
            </div>
          {/if}
        {:else}
          <p class="text-sm text-body leading-relaxed"><Glossed text={actionItem.description} /></p>
        {/if}

        {#each lookupsFor(actionItem) as lookup}
          <div class="mt-4 border border-border rounded-xl p-3.5 bg-void/40">
            <p class="font-sans font-medium text-sm text-bright mb-1.5">{lookup.title}</p>
            <p class="text-sm text-body leading-relaxed mb-3"><Glossed text={lookup.intro} /></p>
            <ul class="space-y-2">
              {#each lookup.rows as row}
                <li class="text-sm">
                  <span class="text-bright font-medium">{row.look_for}</span>
                  {#if row.also_called}
                    <span class="text-muted text-sm"> · {row.also_called}</span>
                  {/if}
                  <span class="text-dim block leading-snug"><Glossed text={row.why} /></span>
                </li>
              {/each}
            </ul>
            {#if lookup.notes?.length}
              <ul class="mt-3 space-y-1">
                {#each lookup.notes as note}
                  <li class="text-sm text-dim leading-relaxed"><Glossed text={note} /></li>
                {/each}
              </ul>
            {/if}
            {#if lookup.verify_yourself}
              <p class="text-sm text-teal-light mt-3 leading-relaxed"><Glossed text={lookup.verify_yourself} /></p>
            {/if}
          </div>
        {/each}

        {#if resourcesFor(actionItem).length > 0}
        <div class="mt-4">
          <p class="label-section mb-2">{text(listNote, 'where-to-find')}</p>
          <div class="space-y-1.5">
            {#each resourcesFor(actionItem) as { ref, tool }}
              <p class="text-sm">
                <a href={tool.url} target="_blank" rel="noopener noreferrer"
                   class="text-teal-light link-inline">{tool.title} ↗</a>
                <span class="text-dim"> {ref.context}</span>
              </p>
            {/each}
          </div>
        </div>
        {/if}
      </div>
    {/if}
    </GlossScope>

    <div class="flex flex-wrap items-center gap-2 mt-4 text-sm">
      <button type="button" on:click={() => whyOpen = !whyOpen}
        class="px-3 py-1.5 min-h-[32px] inline-flex items-center rounded-full border border-border
               text-dim hover:text-body hover:border-muted transition-colors">{text(listNote, 'why-this-one')}</button>
      <button type="button" on:click={() => toggleSnooze(actionItem.id)}
        class="px-3 py-1.5 min-h-[32px] inline-flex items-center rounded-full border border-border
               text-dim hover:text-body hover:border-muted transition-colors">{text(listNote, 'not-now')}</button>
      <button type="button" on:click={() => toggleSkip(actionItem.id)}
        class="px-3 py-1.5 min-h-[32px] inline-flex items-center rounded-full border border-border
               text-dim hover:text-body hover:border-muted transition-colors">{text(listNote, 'not-for-me')}</button>
    </div>

    {#if whyOpen}
      <div class="mt-4 pt-4 border-t border-border">
        <ul class="text-sm text-body leading-relaxed mb-3 space-y-1">
          {#each whyReasons as reason}
            <li>{reason}</li>
          {/each}
        </ul>
        {#if actionItem.sources?.length}
          <p class="label-section mb-2">{text(listNote, 'sources')}</p>
          <ul class="space-y-1.5 mb-3">
            {#each actionItem.sources as source}
              <li class="text-sm">
                <a href={safeHref(source.url)} target="_blank" rel="noopener noreferrer"
                   class="text-body hover:text-teal-light link-inline">{source.title}</a>
                <span class="ml-2 text-xs text-muted">{source.type}</span>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}
  </div>
  {/if}

  <div class="panel p-4 mb-3 scroll-mt-20" bind:this={askPanel}>
    <label for="ask-spectra" class="block text-sm text-body mb-2">
      {text(listNote, 'ask-label')}
    </label>
    <input id="ask-spectra"
      bind:value={searchQuery}
      on:input={() => { if (searchQuery.trim()) queueOpen = true; }}
      placeholder={text(listNote, 'ask-placeholder')}
      class="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm text-body
             placeholder-muted focus:outline-none focus:border-dim transition-colors"/>
    <p class="text-sm text-muted mt-2 leading-relaxed">
      {text(listNote, 'ask-lead')}
    </p>
  </div>

  {#if mode !== 'incident' && chapterTiles.length && !asking}
  <section class="mb-4" aria-labelledby="chapters-heading">
    <h2 id="chapters-heading" class="text-lg font-semibold text-bright mb-3">{text(listNote, 'chapters-heading')}</h2>
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {#each chapterTiles as c (c.chapter.id)}
        <a href="/chapter/{c.chapter.id}" data-chapter-tile={c.chapter.id}
           class="panel p-4 block hover:border-teal transition-colors">
          <span class="w-9 h-9 rounded-xl bg-teal-dim text-teal-light grid place-items-center mb-3"><ChapterIcon id={c.chapter.id} /></span>
          <span class="block text-base font-semibold text-bright leading-snug">{c.chapter.name}</span>
          <span class="block text-sm text-dim mt-0.5">{fill(listNote, 'chapter-count', { done: c.done, total: c.total })}</span>
          <span class="mt-2.5 grid gap-1" style="grid-template-columns: repeat({c.total}, 1fr)" aria-hidden="true">
            {#each c.steps as step}<i class="block h-1.5 rounded-full {step.is_implemented && !step.is_skipped ? 'bg-teal' : 'bg-viz-off'}"></i>{/each}
          </span>
        </a>
      {/each}
    </div>
  </section>
  {/if}

  {#if !asking}
  <button type="button" on:click={() => queueOpen = !queueOpen}
    class="w-full panel px-5 py-4 flex items-center justify-between gap-3
           hover:border-muted transition-colors text-left">
    <span class="text-sm text-body">
      {#each placed(listNote, 'queue-count', ['count']) as part}{#if part.kind === 'slot'}<span class="text-bright">{queueCount}</span>{:else}{part.value}{/if}{/each}
    </span>
    <span class="text-dim transition-transform duration-200 {queueOpen ? 'rotate-90' : ''}">›</span>
  </button>
  {/if}

  {#if queueOpen || asking}
  <div class="{asking ? '' : 'mt-4'}" data-queue>

  {#if !asking}
  <div class="flex flex-col sm:flex-row gap-2.5 mb-3">
    <select bind:value={selectedCategory}
      class="px-3 py-2 bg-surface border border-border rounded-xl text-sm text-body
             focus:outline-none focus:border-dim transition-colors">
      <option value="all">{text(listNote, 'all-categories')}</option>
      {#each categories as cat}
        <option value={cat}>{categoryLabel(cat)}</option>
      {/each}
    </select>
  </div>

  <div class="flex items-center gap-1 rounded-full border border-border bg-surface-2 p-1 mb-3 w-fit" data-description-mode>
    {#each [[true, 'easy-mode'], [false, 'technical-mode']] as [short, key]}
      <button type="button" aria-pressed={easyMode === short}
        on:click={() => { if (easyMode !== short) toggleEasyMode(); }}
        class="px-4 min-h-[36px] text-sm font-semibold rounded-full transition-colors duration-150
               {easyMode === short ? 'bg-surface text-bright shadow-sm' : 'text-body hover:text-bright'}">
        {text(listNote, String(key))}
      </button>
    {/each}
  </div>
  {/if}

  <p class="text-sm text-muted mb-3">
    {#each pieces(listNote, queueItems.length !== 1 ? 'count-many' : 'count-one', { count: queueItems.length }) as piece}{piece}{/each}
    {selectedCategory !== 'all' && !asking ? ` ${fill(listNote, 'in-category', { category: categoryLabel(selectedCategory) })}` : ''}
    {searchQuery ? ` ${fill(listNote, 'matching', { query: searchQuery })}` : ''}
  </p>

  <div class="space-y-2">
    {#each queueItems as item (item.id)}
      {@const impl = item.is_implemented}
      {@const skipped = isSkipped(item.id)}
      {@const snoozed = isSnoozed(item.id)}
      {@const expanded = expandedItems.has(item.id)}
      {@const highlighted = highlightedItem === item.id}
      {@const needsReverify = item.needs_reverification}
      {@const allPlatforms = item.platforms ?? []}
      {@const visiblePlatforms = allPlatforms.slice(0, 3)}
      {@const hiddenPlatforms = allPlatforms.slice(3)}
      {@const platformsExpanded = expandedPlatforms.has(item.id)}
      {@const blockedReason = getBlockedReason(item)}
      {@const platTabs = getRelevantPlatformTabs(item)}

      <GlossScope step={item.id}>
      <div id="item-{item.id}"
        class="panel border transition-all duration-300
               {needsReverify ? 'border-teal/50 bg-teal-dim/5'
                : impl ? 'border-teal/20 bg-teal-dim/8'
                : skipped ? 'border-border/30 opacity-50'
                : blockedReason ? 'border-border/40 opacity-60'
                : highlighted ? 'border-teal/60 bg-teal-dim/10'
                : 'border-border hover:border-muted'}">

        <div class="flex items-start gap-4 p-4">
          <button type="button"
            on:click={() => toggleItem(item.id, impl)}
            class="mt-0.5 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center
                   transition-all duration-150
                   {impl ? 'bg-teal border-teal text-void'
                    : blockedReason ? 'border-border/40 bg-transparent cursor-not-allowed'
                    : 'border-muted hover:border-body bg-transparent'}"
            title={blockedReason ?? (impl ? text(listNote, 'mark-incomplete') : text(listNote, 'mark-complete'))}
            aria-label="{impl ? text(listNote, 'mark-incomplete') : text(listNote, 'mark-complete')}">
            {#if impl}
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            {:else if blockedReason}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 2L8 8M8 2L2 8" class="stroke-muted" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            {/if}
          </button>

          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1.5">
              <h3 data-sentence class="font-sans font-medium text-sm
                         {impl ? 'text-dim line-through' : skipped ? 'text-muted line-through' : blockedReason ? 'text-dim' : 'text-bright'}">
                {item.title}
              </h3>
              {#if needsReverify}
                <span class="pill-teal text-xs animate-pulse-slow">{text(listNote, 'needs-review')}</span>
              {/if}
              {#if mode === 'incident' && result?.critical_gaps.some(g => g.id === item.id)}
                <span class="pill-ink text-xs">{text(listNote, 'critical')}</span>
              {/if}
              {#if skipped}<span class="pill-dim text-xs">{text(listNote, 'not-applicable')}</span>{/if}
              {#if snoozed && !impl}<span class="pill-dim text-xs">{text(listNote, 'set-aside')}</span>{/if}
              {#if item.sensitive}<span class="pill-ink text-xs">{text(listNote, 'sensitive')}</span>{/if}
              {#if blockedReason && !impl}<span class="pill-dim text-xs">{text(listNote, 'blocked')}</span>{/if}
              {#if item.compensating_factor > 0 && !impl}
                <span class="pill-teal text-xs" title={text(listNote, 'urgency-reduced-title')}>{text(listNote, 'urgency-reduced')}</span>
              {/if}
            </div>

            {#if blockedReason && !impl}
              <p class="text-sm text-dim mb-2 leading-relaxed">{#each pieces(listNote, 'blocked-reason', { reason: blockedReason }) as piece}{piece}{/each}</p>
            {/if}

            <p class="text-sm text-dim leading-relaxed mb-3"><Glossed text={easyMode ? leadSentence(item) : item.description} /></p>

            <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
              {#if item.maturity_level === 1}
                <span class="pill-teal text-xs">{text(listNote, 'essential')}</span>
              {/if}
              <div class="flex items-center gap-1 flex-wrap">
                {#each visiblePlatforms as platform}<span class="pill-dim text-xs">{platformDisplay(platform)}</span>{/each}
                {#if hiddenPlatforms.length > 0}
                  {#if platformsExpanded}
                    {#each hiddenPlatforms as platform}<span class="pill-dim text-xs">{platformDisplay(platform)}</span>{/each}
                    <button type="button" on:click|stopPropagation={() => togglePlatformExpand(item.id)}
                      class="text-sm text-dim hover:text-body transition-colors">{text(listNote, 'platforms-less')}</button>
                  {:else}
                    <button type="button" on:click|stopPropagation={() => togglePlatformExpand(item.id)}
                      class="text-sm text-teal-light hover:opacity-80 transition-opacity">
                      {#each pieces(listNote, 'platforms-more', { count: hiddenPlatforms.length }) as piece}{piece}{/each}
                    </button>
                  {/if}
                {/if}
              </div>

              <div class="flex items-center gap-3 w-full sm:w-auto sm:ml-auto mt-2 sm:mt-0">
                {#if needsReverify}
                  <button type="button" on:click|stopPropagation={() => reverifyItem(item.id)}
                    class="btn-primary btn-sm">
                    {text(listNote, 'confirm-updated')}
                  </button>
                {/if}
                {#if !impl}
                  <button type="button" on:click|stopPropagation={() => toggleSnooze(item.id)}
                    class="text-sm transition-colors
                           {snoozed ? 'text-teal-light hover:text-teal' : 'text-muted hover:text-dim'}">
                    {snoozed ? text(listNote, 'bring-back') : text(listNote, 'not-now')}
                  </button>
                {/if}
                <button type="button" on:click|stopPropagation={() => toggleSkip(item.id)}
                  class="text-sm transition-colors
                         {skipped ? 'text-teal-light hover:text-teal' : 'text-muted hover:text-dim'}">
                  {skipped ? text(listNote, 'undo') : text(listNote, 'doesnt-apply')}
                </button>
                <button type="button" on:click={() => toggleExpand(item.id)}
                  class="text-sm transition-colors
                         {expanded ? 'text-teal-light' : 'text-dim hover:text-body'}">
                  {expanded ? text(listNote, 'less') : text(listNote, 'how-to-do-this')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {#if expanded}
        <div class="border-t border-border px-4 pt-4 pb-5 space-y-5">

          <div>
            <p class="label-mono mb-2">{text(listNote, 'why-matters')}</p>
            <p class="text-sm text-body leading-relaxed pl-3 border-l border-teal/30"><Glossed text={item.threat_narrative} /></p>
          </div>

          {#if feelingsFor(item.id).length > 0}
          <div>
            <p class="label-mono mb-2">{text(listNote, 'trigger')}</p>
            <div class="flex items-center gap-3 bg-surface/60 border border-teal/20 rounded-xl p-3">
              <div>
                <p class="text-sm text-teal-light">
                  {feelingsFor(item.id).map(f => EMOTIONAL_REGISTER_LABELS[f] ?? f).join(', ')}
                </p>
                <p class="text-sm text-dim mt-0.5">
                  {text(listNote, 'trigger-lead')}
                </p>
              </div>
            </div>
          </div>
          {/if}

          {#if platTabs.length > 0}
          <div>
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <p class="label-mono">{text(listNote, 'how-to-implement')}</p>
              {#if platTabs.length === 1}
                <span class="pill-teal">{platformTabLabel(platTabs[0])}</span>
              {:else}
                {#each platTabs as pt}
                  <button type="button" on:click={() => itemPlatformTab = pt}
                    class="px-2 py-0.5 rounded text-sm transition-colors
                           {itemPlatformTab === pt ? 'bg-teal/80 text-void font-semibold' : 'border border-border text-dim hover:text-body'}">
                    {platformTabLabel(pt)}
                  </button>
                {/each}
              {/if}
            </div>
            {#if item.platform_notes?.[itemPlatformTab || platTabs[0]]}
            <div class="space-y-3">
              {#each noteBlocks(item.platform_notes[itemPlatformTab || platTabs[0]]) as block}
                <div class="bg-void/60 border border-border rounded-xl p-3">
                  {#if block.heading}
                    <p class="label-section mb-1.5">{block.heading}</p>
                  {/if}
                  <NoteLines lines={block.lines} />
                </div>
              {/each}
            </div>
            {/if}
          </div>
          {/if}

          {#if item.environment_notes && profile?.environment_flags?.length}
            {@const activeEnvNotes = getActiveEnvNotes(item.environment_notes, profile?.environment_flags)}
            {#if activeEnvNotes.length > 0}
            <div>
              <p class="label-mono mb-2">{text(listNote, 'environment')}</p>
              <div class="space-y-2">
                {#each activeEnvNotes as [, note]}
                  {#each noteBlocks(note) as block}
                    <div class="bg-void/60 border border-teal/30 rounded-xl p-3">
                      {#if block.heading}
                        <p class="label-section mb-1.5">{block.heading}</p>
                      {/if}
                      <NoteLines lines={block.lines} />
                    </div>
                  {/each}
                {/each}
              </div>
            </div>
            {/if}
          {/if}

          {#if item.track_notes && profile?.tracks?.length}
            {@const activeTrackNotes = getActiveTrackNotes(item.track_notes, profile?.tracks)}
            {#if activeTrackNotes.length > 0}
            <div>
              <p class="label-mono mb-2">{text(listNote, 'situation')}</p>
              <div class="space-y-2">
                {#each activeTrackNotes as [, note]}
                  {#each noteBlocks(note) as block}
                    <div class="bg-void/60 border border-teal/30 rounded-xl p-3">
                      {#if block.heading}
                        <p class="label-section mb-1.5">{block.heading}</p>
                      {/if}
                      <NoteLines lines={block.lines} />
                    </div>
                  {/each}
                {/each}
              </div>
            </div>
            {/if}
          {/if}

          <button type="button" on:click={() => toggleDetails(item.id)}
            class="text-sm text-teal-light hover:opacity-80 transition-opacity">
            {detailItems.has(item.id) ? text(listNote, 'hide-extra') : text(listNote, 'show-extra')}
          </button>

          {#if detailItems.has(item.id)}
          <div class="space-y-5">
          <div class="flex items-center gap-5">
            <div>
              <p class="label-mono mb-1">{text(listNote, 'technical-effort')}</p>
              <span class="text-sm text-dim">{easyMode ? diffLabel(item.difficulty?.technical ?? 1) : difficultyDots(item.difficulty?.technical ?? 1)}</span>
            </div>
            <div>
              <p class="label-mono mb-1">{text(listNote, 'workflow-change')}</p>
              <span class="text-sm text-dim">{easyMode ? diffLabel(item.difficulty?.disruption ?? 1) : difficultyDots(item.difficulty?.disruption ?? 1)}</span>
            </div>
            <div>
              <p class="label-mono mb-1">{text(listNote, 'reversibility')}</p>
              <span class="text-sm text-dim">{easyMode ? diffLabel(item.difficulty?.reversibility ?? 1) : difficultyDots(item.difficulty?.reversibility ?? 1)}</span>
            </div>
          </div>

          {#if item.adversaries?.length}
          <div>
            <p class="label-mono mb-2">{text(listNote, 'protects-against')}</p>
            <div class="flex flex-wrap gap-2">
              {#each item.adversaries as adv}
                {@const userHas = profile?.adversaries?.includes(adv)}
                <span class="text-sm px-2 py-0.5 rounded border
                             {userHas ? 'border-teal/50 text-teal-light bg-teal-dim/20' : 'border-border text-dim'}">
                  {ADVERSARY_OPTIONS.find(o => o.value === adv)?.label ?? adv}
                  {#if userHas}<span class="text-teal ml-1">✓</span>{/if}
                </span>
              {/each}
            </div>
          </div>
          {/if}

          {#if item.related_items?.length}
          <div>
            <p class="label-mono mb-2">{text(listNote, 'related')}</p>
            <div class="space-y-1.5">
              {#each item.related_items as rel}
                {@const relItem = graph.items.get(rel.id)}
                {#if relItem}
                <div class="flex items-center gap-2">
                  <span class="text-sm text-muted bg-void border border-border px-1.5 py-0.5 rounded flex-shrink-0">
                    {rel.relationship.replace(/_/g, ' ')}
                  </span>
                  <button type="button" on:click={() => scrollToItem(rel.id, relItem.category, item.id)}
                    class="text-sm text-teal-light hover:opacity-80 transition-opacity text-left">
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
            <p class="label-section mb-2">{text(listNote, 'sources')}</p>
            <div class="flex flex-wrap gap-3">
              {#each item.sources as source}
                <a href={safeHref(source.url)} target="_blank" rel="noopener noreferrer"
                   class="text-sm text-dim hover:text-body link-inline">
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
              <p class="label-mono">{text(listNote, 'legal')}</p>
              {#if item.sensitive}<span class="text-sm text-teal-light">{text(listNote, 'safety-critical')}</span>{/if}
            </div>
            {#each item.legal_notes as ln}
              <div class="rounded-xl p-3 text-sm leading-relaxed
                          {item.sensitive ? 'bg-void/60 border border-teal/30 text-body' : 'bg-void/40 border border-border text-dim'}">
                {#if ln.jurisdiction !== 'global'}<span class="text-muted mr-1">[{ln.jurisdiction}]</span>{/if}
                <span class="whitespace-pre-line"><Glossed text={ln.note} /></span>
              </div>
            {/each}
          </div>
          {/if}

          <div>
            <p class="label-mono mb-2">{text(listNote, 'your-notes')}</p>
            <textarea bind:value={noteValues[item.id]} on:blur={() => handleNoteBlur(item.id)}
              placeholder={text(listNote, 'notes-placeholder')}
              rows="3"
              class="w-full px-3 py-2 bg-void/60 border border-border rounded-xl text-sm text-body
                     placeholder-muted focus:outline-none focus:border-dim transition-colors
                     resize-none leading-relaxed"></textarea>
            {#if noteValues[item.id]?.trim()}
              <p class="text-sm text-muted mt-1">{text(listNote, 'saved')}</p>
            {/if}
          </div>

          {#each lookupsFor(item) as lookup}
            <div class="border border-border rounded-xl p-3.5 bg-void/40">
              <p class="font-sans font-medium text-sm text-bright mb-1.5">{lookup.title}</p>
              <p class="text-sm text-body leading-relaxed mb-3"><Glossed text={lookup.intro} /></p>
              <ul class="space-y-2">
                {#each lookup.rows as row}
                  <li class="text-sm">
                    <span class="text-bright font-medium">{row.look_for}</span>
                    {#if row.also_called}
                      <span class="text-muted text-sm"> · {row.also_called}</span>
                    {/if}
                    <span class="text-dim block leading-snug"><Glossed text={row.why} /></span>
                  </li>
                {/each}
              </ul>
              {#if lookup.notes?.length}
                <ul class="mt-3 space-y-1">
                  {#each lookup.notes as note}
                    <li class="text-sm text-dim leading-relaxed"><Glossed text={note} /></li>
                  {/each}
                </ul>
              {/if}
              {#if lookup.verify_yourself}
                <p class="text-sm text-teal-light mt-3 leading-relaxed"><Glossed text={lookup.verify_yourself} /></p>
              {/if}
            </div>
          {/each}

          {#if resourcesFor(item).length > 0}
          <div>
            <p class="label-section mb-2">{text(listNote, 'where-to-find')}</p>
            <div class="space-y-1.5">
              {#each resourcesFor(item) as { ref, tool }}
                <p class="text-sm">
                  <a href={tool.url} target="_blank" rel="noopener noreferrer"
                     class="text-teal-light link-inline">{tool.title} ↗</a>
                  <span class="text-dim"> {ref.context}</span>
                </p>
              {/each}
            </div>
          </div>
          {/if}

          <div class="flex items-center justify-between pt-1 flex-wrap gap-2">
            <div class="flex flex-col gap-1">
              {#if item.changelog?.length}
                <p class="text-xs text-muted">
                  v{item.changelog[0].version} · {item.changelog[0].date}
                  {#if item.changelog[0].author}&nbsp;· {item.changelog[0].author.replace(/^github:/, '')}{/if}
                </p>
              {/if}
            </div>
            <div class="flex items-center gap-3">
              <button type="button" on:click={() => toggleItem(item.id, impl)}
                disabled={!!blockedReason && !impl}
                class="{impl ? 'btn-ghost' : 'btn-primary'} btn-sm
                       {blockedReason && !impl ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}">
                {impl ? text(listNote, 'mark-incomplete') : text(listNote, 'mark-done')}
              </button>
            </div>
          </div>

        </div>
        {/if}

      </div>
      </GlossScope>
    {/each}

    {#if queueItems.length === 0}
      <div class="panel p-8 text-center">
        {#if (result?.total_applicable ?? 0) === 0}
          <p class="text-body text-sm mb-1">{text(listNote, 'no-topics')}</p>
          <button type="button" on:click={startReconfigure}
            class="text-sm text-teal-light mt-2 hover:opacity-80">{text(listNote, 'choose-topics')}</button>
        {:else if searchRefused}
          <p class="text-body text-sm mb-1">{text(listNote, 'refused')}</p>
          <p class="text-dim text-sm max-w-md mx-auto leading-relaxed">
            {text(listNote, 'refused-lead')}
          </p>
          <button type="button" on:click={() => { selectedCategory = 'all'; searchQuery = ''; }}
            class="text-sm text-teal-light mt-3 hover:opacity-80">{text(listNote, 'clear-filters')}</button>
        {:else if routedOutsideList.length}
          <p class="text-body text-sm mb-1">
            {text(listNote, 'outside-list')}
          </p>
          <ul class="mt-3 space-y-2 text-left max-w-md mx-auto">
            {#each routedOutsideList as found (found.id)}
              <li>
                <a href="/checklist/{found.id}"
                   class="text-sm text-teal-light hover:opacity-80 underline underline-offset-2">
                  {found.blurb || found.title}
                </a>
              </li>
            {/each}
          </ul>
        {:else if selectedCategory !== 'all' || searchQuery}
          <p class="text-dim text-sm">{text(listNote, 'no-match')}</p>
          <button type="button" on:click={() => { selectedCategory = 'all'; searchQuery = ''; }}
            class="text-sm text-teal-light mt-2 hover:opacity-80">{text(listNote, 'clear-filters')}</button>
        {:else if skippedCount > 0}
          <p class="text-body text-sm">{#each pieces(listNote, skippedCount !== 1 ? 'set-aside-many' : 'set-aside-one', { count: skippedCount }) as piece}{piece}{/each}</p>
        {:else}
          <p class="text-body text-sm">{text(listNote, 'all-done')}</p>
        {/if}
      </div>
    {/if}

    {#if queueItems.length > 0 && routedOutsideList.length}
      <div class="panel p-5 mt-3" data-outside-also>
        <p class="text-body text-sm">{text(listNote, routedOutsideList.length === 1 ? 'outside-list-also-one' : 'outside-list-also-many')}</p>
        <ul class="mt-2 space-y-2">
          {#each routedOutsideList as found (found.id)}
            <li>
              <a href="/checklist/{found.id}"
                 class="text-sm text-teal-light hover:opacity-80 underline underline-offset-2">
                {found.blurb || found.title}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>


</div>
  {/if}

  {#if skippedCount > 0}
  <div class="mt-4">
    <button type="button" on:click={() => skippedOpen = !skippedOpen}
      class="w-full panel px-5 py-3 flex items-center justify-between gap-3
             hover:border-muted transition-colors text-left">
      <span class="text-sm text-dim">
        {#each placed(listNote, 'skipped-count', ['count']) as part}{#if part.kind === 'slot'}<span class="tabular-nums">{skippedCount}</span>{:else}{part.value}{/if}{/each}
      </span>
      <span class="text-dim transition-transform duration-200 {skippedOpen ? 'rotate-90' : ''}">›</span>
    </button>

    {#if skippedOpen}
      <div class="mt-2 space-y-1.5">
        {#each skippedItems as item (item.id)}
          <div class="panel border border-border/40 px-4 py-2.5 flex items-center justify-between gap-3">
            <span class="text-sm text-dim min-w-0 truncate">{leadSentence(item)}</span>
            <button type="button" on:click={() => toggleSkip(item.id)}
              class="text-sm text-teal-light hover:opacity-80 transition-opacity flex-shrink-0">
              {text(listNote, 'put-back')}
            </button>
          </div>
        {/each}
        {#if skippedItems.length === 0}
          <p class="text-sm text-muted px-1">{#each pieces(listNote, 'skipped-hidden', { count: skippedCount }) as piece}{piece}{/each}</p>
        {/if}
      </div>
    {/if}
  </div>
  {/if}

</div>
