<script lang="ts">
  import type {
    UserProfile, AssessmentResult, ContentGraph, ScoredItem,
    Platform, ChecklistItem, Harm, Resource, Lookup
  } from '$lib/types.js';
  import {
    PLATFORM_OPTIONS, EMOTIONAL_REGISTER_LABELS, ADVERSARY_OPTIONS
  } from '$lib/audit/constants.js';
  import {
    truncSentences, diffLabel, difficultyDots, categoryLabel, platformDisplay,
    getActiveEnvNotes, safeHref, platformTabLabel
  } from '$lib/audit/helpers.js';
  import { coverageOf, coverageLine, COVERED_MEANS } from '$lib/engine/coverage.js';

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
  export let activePlatform: Platform | 'all';
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
  $: actionItem = orderedItems.find(
    i => !i.is_implemented && !isSkipped(i.id) && !getBlockedReason(i)
  ) ?? null;

  $: skippedItems = displayItems.filter(i => isSkipped(i.id));
  $: skippedCount = orderedItems.filter(i => isSkipped(i.id)).length;

  $: queueCount = orderedItems.filter(i => (!actionItem || i.id !== actionItem.id) && !isSkipped(i.id)).length;
  $: queueItems = displayItems.filter(i => (!actionItem || i.id !== actionItem.id) && !isSkipped(i.id));

  const resourcesFor = (item: ChecklistItem) =>
    (item.resources ?? [])
      .map(ref => ({ ref, tool: graph.resources.get(ref.id) }))
      .filter((r): r is { ref: typeof r.ref; tool: Resource } => !!r.tool);
  const noteBlocks = (note: string) =>
    note.split(/\n\s*\n/).map(block => {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      const isHeading = lines.length > 1 && lines[0].length < 60 && !/[.:!]$/.test(lines[0]);
      return { heading: isHeading ? lines[0] : null, lines: isHeading ? lines.slice(1) : lines };
    }).filter(b => b.lines.length > 0);

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
      ? 'It is one of the strongest protections on this list.'
      : 'It is one of the basics that helps almost everyone.');
    const picked = (profile?.adversariesManual ?? []).find(
      a => (actionItem.adversaries ?? []).includes(a)
    );
    if (picked) {
      const label = ADVERSARY_OPTIONS.find(o => o.value === picked)?.label ?? picked;
      out.push(`You picked ${label} in your profile.`);
    }
    return out;
  })();
</script>

<div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">

  {#if mode === 'guardian'}
  <div class="mb-6 border border-teal/30 bg-teal-dim/20 rounded-lg p-4 flex items-start gap-3">
    <span class="text-teal-light text-xl flex-shrink-0">○</span>
    <div class="flex-1">
      <p class="font-display font-semibold text-teal-light mb-1">Family setup</p>
      <p class="text-sm text-body">
        Showing children &amp; teens and women's safety items alongside the general baseline.
        This is a view only — your own checklist is unchanged, and leaving this mode restores it.
      </p>
    </div>
  </div>
  {/if}

  {#if mode === 'incident'}
  <div class="mb-6 border border-red/30 bg-red-dim/10 rounded-lg p-4 flex items-start justify-between gap-3">
    <div class="flex items-start gap-3">
      <span class="text-red-light text-xl flex-shrink-0">⚠</span>
      <div>
        <p class="font-display font-semibold text-red-light mb-1">Biggest gaps first</p>
        <p class="text-sm text-body">Items sorted by urgency. Work top to bottom.</p>
      </div>
    </div>
    <button type="button" on:click={onViewIncident}
      class="text-[13px] text-red-light border border-red/30 rounded px-2 py-1
             hover:bg-red-dim/20 transition-colors flex-shrink-0">
      ← Playbooks
    </button>
  </div>
  {/if}

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
          <span class="text-[13px] text-amber-light self-center">+{result.reverify_items.length - 3} more</span>
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
             bg-surface text-[13px] text-body hover:text-bright hover:border-muted
             transition-colors group">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor"
           stroke-width="1.5" stroke-linecap="round"
           class="group-hover:-translate-x-0.5 transition-transform duration-150">
        <path d="M6 1L2 5L6 9"/>
      </svg>
      Back to: <span class="text-amber-light truncate max-w-xs">{navHistory[navHistory.length - 1].title}</span>
    </button>
    {#if navHistory.length > 1}
      <span class="text-[13px] text-muted">{navHistory.length - 1} more in history</span>
    {/if}
    <button type="button" on:click={() => { navHistory = []; }}
      class="text-[13px] text-muted hover:text-body transition-colors">
      Clear ✕
    </button>
  </div>
  {/if}

  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
    <div>
      <h1 class="font-display text-2xl font-bold text-white">
        {mode === 'incident' ? 'Something happened' : mode === 'guardian' ? 'Family setup' : 'Your list'}
      </h1>
      <p class="text-base text-body mt-1.5" data-testid="audit-coverage">
        {coverageLine(coverageOf(result))}
      </p>
      <p class="text-sm text-dim mt-1">{COVERED_MEANS}</p>
      <p class="text-[13px] text-muted mt-1.5">
        {result?.total_implemented ?? 0} of {result?.total_applicable ?? 0} things done{#if result?.total_skipped}&nbsp;· {result.total_skipped} skipped{/if} · all data stored locally
      </p>
    </div>

    {#if mode === 'normal'}
    <nav class="flex flex-wrap items-center gap-2" aria-label="Other views of your list">
      <a href="/graph"
         class="text-[13px] px-3 py-1.5 min-h-[44px] sm:min-h-0 inline-flex items-center rounded border
                border-border text-dim hover:text-body hover:border-muted transition-colors">Your map</a>
      <a href="/timeline"
         class="text-[13px] px-3 py-1.5 min-h-[44px] sm:min-h-0 inline-flex items-center rounded border
                border-border text-dim hover:text-body hover:border-muted transition-colors">Timeline</a>
    </nav>
    {/if}
  </div>

  {#if prefilledHarms.length > 0}
  <div class="panel px-4 py-2.5 mb-4 flex items-center justify-between gap-3 flex-wrap">

    <p class="text-[13px] text-dim">
      {#if prefilledHarms.length <= 2}
        Ordered for: <span class="text-body">{prefilledNames}</span>.
      {:else}
        Ordered for <span class="text-body">everything you picked</span>.
      {/if}
    </p>
    <button type="button" on:click={startReconfigure}
      class="text-[13px] text-amber-light hover:opacity-80 transition-opacity flex-shrink-0">
      Change this
    </button>
  </div>
  {/if}

  {#if actionItem}
  <div id="action-card" class="bg-surface border border-border rounded-[18px] px-[22px] py-[26px] mb-4">
    <div class="flex items-start justify-between gap-4 mb-4">
      <span class="pill-amber">Start here</span>
      {#if actionItem.time_estimate?.setup}
        <span class="text-[13px] font-mono text-muted flex-shrink-0">{actionItem.time_estimate.setup}</span>
      {/if}
    </div>

    <p class="font-sans text-xl font-medium text-white leading-snug mb-4">
      {actionItem.simple_description ?? actionItem.title}
    </p>
    <button type="button" on:click={() => toggleDetails(actionItem.id)}
      class="text-[13px] text-muted hover:text-body transition-colors mb-5 py-1 min-h-[24px]">
      {detailItems.has(actionItem.id) ? 'Hide detail' : 'More detail'}
    </button>
    {#if detailItems.has(actionItem.id)}
      <div class="mb-5 pl-3 border-l border-border">
        <p class="text-sm font-sans font-medium text-bright mb-1">{actionItem.title}</p>
        <p class="text-sm text-body leading-relaxed">{actionItem.description}</p>
      </div>
    {/if}

    <button type="button" on:click={() => toggleItem(actionItem.id, actionItem.is_implemented)}
      class="btn-primary w-full h-[52px] justify-center mb-2.5">
      Mark as done
    </button>
    <button type="button" on:click={() => howOpen = !howOpen}
      class="btn-ghost w-full h-[52px] justify-center">
      {howOpen ? 'Hide the steps' : 'Show me how'}
    </button>

    {#if howOpen}
      <div class="mt-4 pt-4 border-t border-border">
        {#if actionPlatformTabs.length > 0}
          <div class="flex items-center gap-2 mb-2 flex-wrap">
            <p class="label-section">How to do it</p>
            {#if actionPlatformTabs.length === 1}
              <span class="pill-teal">{platformTabLabel(actionPlatformTabs[0])}</span>
            {:else}
              {#each actionPlatformTabs as pt}
                <button type="button" on:click={() => itemPlatformTab = pt}
                  class="px-2 py-0.5 rounded text-[13px] transition-colors
                         {itemPlatformTab === pt ? 'bg-teal/80 text-void font-semibold' : 'border border-border text-dim hover:text-body'}">
                  {platformTabLabel(pt)}
                </button>
              {/each}
            {/if}
          </div>
          
          {#if actionItem.platform_notes?.[itemPlatformTab || actionPlatformTabs[0]]}
            <div class="space-y-3">
              {#each noteBlocks(actionItem.platform_notes[itemPlatformTab || actionPlatformTabs[0]]) as block}
                <div class="bg-void/60 border border-border rounded-lg p-3">
                  {#if block.heading}
                    <p class="label-section mb-1.5">{block.heading}</p>
                  {/if}
                  {#each block.lines as line}
                    <p class="text-sm text-body leading-relaxed">{line}</p>
                  {/each}
                </div>
              {/each}
            </div>
          {/if}
        {:else}
          <p class="text-sm text-body leading-relaxed">{actionItem.description}</p>
        {/if}

        {#each lookupsFor(actionItem) as lookup}
          <div class="mt-4 border border-border rounded-lg p-3.5 bg-void/40">
            <p class="font-sans font-medium text-sm text-bright mb-1.5">{lookup.title}</p>
            <p class="text-sm text-body leading-relaxed mb-3">{lookup.intro}</p>
            <ul class="space-y-2">
              {#each lookup.rows as row}
                <li class="text-sm">
                  <span class="text-bright font-medium">{row.look_for}</span>
                  {#if row.also_called}
                    <span class="text-muted text-[13px]"> · {row.also_called}</span>
                  {/if}
                  <span class="text-dim block leading-snug">{row.why}</span>
                </li>
              {/each}
            </ul>
            {#if lookup.notes?.length}
              <ul class="mt-3 space-y-1">
                {#each lookup.notes as note}
                  <li class="text-[13px] text-dim leading-relaxed">{note}</li>
                {/each}
              </ul>
            {/if}
            {#if lookup.verify_yourself}
              <p class="text-[13px] text-teal-light mt-3 leading-relaxed">{lookup.verify_yourself}</p>
            {/if}
          </div>
        {/each}
        {#if resourcesFor(actionItem).length > 0}
        <div class="mt-4">
          <p class="label-section mb-2">Where to find one</p>
          <div class="space-y-1.5">
            {#each resourcesFor(actionItem) as { ref, tool }}
              <p class="text-sm">
                <a href={tool.url} target="_blank" rel="noopener noreferrer"
                   class="text-amber-light hover:underline">{tool.title} ↗</a>
                <span class="text-dim"> {ref.context}</span>
              </p>
            {/each}
          </div>
        </div>
        {/if}
      </div>
    {/if}

    <div class="flex flex-wrap items-center gap-2 mt-4 text-[13px]">
      <button type="button" on:click={() => whyOpen = !whyOpen}
        class="px-3 py-1.5 min-h-[32px] inline-flex items-center rounded-full border border-border
               text-dim hover:text-body hover:border-muted transition-colors">Why this one?</button>
      <button type="button" on:click={() => toggleSnooze(actionItem.id)}
        class="px-3 py-1.5 min-h-[32px] inline-flex items-center rounded-full border border-border
               text-dim hover:text-body hover:border-muted transition-colors">Not now</button>
      <button type="button" on:click={() => toggleSkip(actionItem.id)}
        class="px-3 py-1.5 min-h-[32px] inline-flex items-center rounded-full border border-border
               text-dim hover:text-body hover:border-muted transition-colors">Doesn't apply to me</button>
    </div>

    {#if whyOpen}
      <div class="mt-4 pt-4 border-t border-border">
        <ul class="text-sm text-body leading-relaxed mb-3 space-y-1">
          {#each whyReasons as reason}
            <li>{reason}</li>
          {/each}
        </ul>
        {#if actionItem.sources?.length}
          <p class="label-section mb-2">Sources</p>
          <ul class="space-y-1.5 mb-3">
            {#each actionItem.sources as source}
              <li class="text-[13px]">
                <a href={safeHref(source.url)} target="_blank" rel="noopener noreferrer"
                   class="text-body hover:text-amber-light transition-colors underline underline-offset-2">{source.title}</a>
                <span class="ml-2 text-xs font-mono text-muted">{source.type}</span>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}
  </div>
  {/if}

  <button type="button" on:click={() => queueOpen = !queueOpen}
    class="w-full panel px-5 py-4 flex items-center justify-between gap-3
           hover:border-muted transition-colors text-left">
    <span class="text-sm text-body">
      <span class="font-mono text-bright">{queueCount}</span> more, ordered for you
    </span>
    <span class="text-dim transition-transform duration-200 {queueOpen ? 'rotate-90' : ''}">›</span>
  </button>

  {#if queueOpen}
  <div class="mt-4">

  <div class="panel p-2.5 mb-4 flex items-center gap-2 flex-wrap">
    <span class="label-mono flex-shrink-0 px-1">Platform:</span>
    <button type="button" on:click={() => activePlatform = 'all'}
      class="px-3 py-1 rounded text-[13px] transition-colors
             {activePlatform === 'all' ? 'bg-amber text-void font-semibold' : 'text-dim hover:text-body'}">
      All
    </button>
    {#each PLATFORM_OPTIONS as opt}
      <button type="button" on:click={() => activePlatform = opt.value}
        class="px-3 py-1 rounded text-[13px] transition-colors
               {activePlatform === opt.value ? 'bg-amber text-void font-semibold' : 'text-dim hover:text-body'}">
        {opt.label}
      </button>
    {/each}
    <span class="text-[13px] text-muted ml-auto hidden sm:block">Sets default tab for implementation steps</span>
  </div>




  <div class="flex flex-col sm:flex-row gap-2.5 mb-3">
    <input bind:value={searchQuery}
      placeholder="Search items…"
      class="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-sm text-body
             placeholder-muted focus:outline-none focus:border-dim transition-colors"/>
    <select bind:value={selectedCategory}
      class="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-body
             focus:outline-none focus:border-dim transition-colors">
      <option value="all">All Categories</option>
      {#each categories as cat}
        <option value={cat}>{categoryLabel(cat)}</option>
      {/each}
    </select>
  </div>

  <div class="flex items-center gap-2 mb-3">
    <button type="button" on:click={toggleEasyMode}
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[13px] transition-colors
             {easyMode ? 'border-teal/40 text-teal-light bg-teal-dim/10' : 'border-amber/40 text-amber-light bg-amber-dim/10'}">
      {easyMode ? '◉ Easy mode' : '◈ Technical mode'}
    </button>
    <span class="text-[13px] text-muted hidden sm:inline">{easyMode ? 'Simplified — switch for full detail' : 'Full technical detail'}</span>
  </div>

  <p class="text-[13px] text-muted mb-3">
    {queueItems.length} item{queueItems.length !== 1 ? 's' : ''}
    {selectedCategory !== 'all' ? ` in ${categoryLabel(selectedCategory)}` : ''}
    {searchQuery ? ` matching "${searchQuery}"` : ''}
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
                <path d="M2 2L8 8M8 2L2 8" class="stroke-muted" stroke-width="1.5" stroke-linecap="round"/>
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
              {#if mode === 'incident' && result?.critical_gaps.some(g => g.id === item.id)}
                <span class="pill-red text-xs">Critical</span>
              {/if}
              {#if skipped}<span class="pill-dim text-xs">Not applicable</span>{/if}
              {#if snoozed && !impl}<span class="pill-dim text-xs">Set aside for now</span>{/if}
              {#if item.sensitive}<span class="pill-red text-xs">Sensitive</span>{/if}
              {#if blockedReason && !impl}<span class="pill-dim text-xs">⊘ Blocked</span>{/if}
              {#if item.compensating_factor > 0 && !impl}
                <span class="pill-teal text-xs" title="A stronger control reduces urgency here">↓ Urgency reduced</span>
              {/if}
            </div>

            {#if blockedReason && !impl}
              <p class="text-[13px] text-dim mb-2 leading-relaxed">⊘ {blockedReason}</p>
            {/if}
            <p class="text-sm text-dim leading-relaxed mb-3">{easyMode ? (item.simple_description ?? truncSentences(item.description, 1)) : item.description}</p>

            <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span class="text-xs font-mono text-muted">⏱ {item.time_estimate?.setup ?? '?'}</span>
              
              {#if item.maturity_level === 1}
                <span class="pill-amber text-xs">Essential</span>
              {/if}
              <div class="flex items-center gap-1 flex-wrap">
                {#each visiblePlatforms as platform}<span class="pill-dim text-xs">{platformDisplay(platform)}</span>{/each}
                {#if hiddenPlatforms.length > 0}
                  {#if platformsExpanded}
                    {#each hiddenPlatforms as platform}<span class="pill-dim text-xs">{platformDisplay(platform)}</span>{/each}
                    <button type="button" on:click|stopPropagation={() => togglePlatformExpand(item.id)}
                      class="text-[13px] text-dim hover:text-body transition-colors">less</button>
                  {:else}
                    <button type="button" on:click|stopPropagation={() => togglePlatformExpand(item.id)}
                      class="text-[13px] text-amber-light hover:opacity-80 transition-opacity">
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
                  <button type="button" on:click|stopPropagation={() => toggleSnooze(item.id)}
                    class="text-[13px] transition-colors
                           {snoozed ? 'text-amber-light hover:text-amber' : 'text-muted hover:text-dim'}">
                    {snoozed ? 'Bring back' : 'Not now'}
                  </button>
                {/if}
                <button type="button" on:click|stopPropagation={() => toggleSkip(item.id)}
                  class="text-[13px] transition-colors
                         {skipped ? 'text-amber-light hover:text-amber' : 'text-muted hover:text-dim'}">
                  {skipped ? 'Undo' : "Doesn't apply"}
                </button>
                <button type="button" on:click={() => toggleExpand(item.id)}
                  class="text-[13px] transition-colors
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
            <p class="text-sm text-body leading-relaxed pl-3 border-l border-amber/30">{item.threat_narrative}</p>
          </div>

          {#if item.category === 'human_vulnerability' && item.emotional_register}
          <div>
            <p class="label-mono mb-2">Psychological trigger</p>
            <div class="flex items-center gap-3 bg-surface/60 border border-amber/20 rounded-lg p-3">
              <span class="text-amber text-base">◉</span>
              <div>
                <p class="text-sm text-amber-light">
                  {EMOTIONAL_REGISTER_LABELS[item.emotional_register] ?? item.emotional_register}
                </p>
                <p class="text-[13px] text-dim mt-0.5">
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
                <span class="pill-teal">{platformTabLabel(platTabs[0])}</span>
              {:else}
                {#each platTabs as pt}
                  <button type="button" on:click={() => itemPlatformTab = pt}
                    class="px-2 py-0.5 rounded text-[13px] transition-colors
                           {itemPlatformTab === pt ? 'bg-teal/80 text-void font-semibold' : 'border border-border text-dim hover:text-body'}">
                    {platformTabLabel(pt)}
                  </button>
                {/each}
              {/if}
            </div>
            {#if item.platform_notes?.[itemPlatformTab || platTabs[0]]}
            <div class="space-y-3">
              {#each noteBlocks(item.platform_notes[itemPlatformTab || platTabs[0]]) as block}
                <div class="bg-void/60 border border-border rounded-lg p-3">
                  {#if block.heading}
                    <p class="label-section mb-1.5">{block.heading}</p>
                  {/if}
                  {#each block.lines as line}
                    <p class="text-sm text-body leading-relaxed">{line}</p>
                  {/each}
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
              <p class="label-mono mb-2">Based on your environment</p>
              <div class="space-y-2">
                {#each activeEnvNotes as [, note]}
                  <div class="bg-void/60 border border-amber/30 rounded-lg p-3">
                    <p class="text-sm text-body leading-relaxed whitespace-pre-line">{note}</p>
                  </div>
                {/each}
              </div>
            </div>
            {/if}
          {/if}

          <button type="button" on:click={() => toggleDetails(item.id)}
            class="text-[13px] text-amber-light hover:opacity-80 transition-opacity">
            {detailItems.has(item.id) ? '− Hide extra details' : '+ Show extra details — effort, what it protects against, related items, sources'}
          </button>

          {#if detailItems.has(item.id)}
          <div class="space-y-5">
          <div class="flex items-center gap-5">
            <div>
              <p class="label-mono mb-1">Technical effort</p>
              <span class="text-sm text-dim">{easyMode ? diffLabel(item.difficulty?.technical ?? 1) : difficultyDots(item.difficulty?.technical ?? 1)}</span>
            </div>
            <div>
              <p class="label-mono mb-1">Workflow change</p>
              <span class="text-sm text-dim">{easyMode ? diffLabel(item.difficulty?.disruption ?? 1) : difficultyDots(item.difficulty?.disruption ?? 1)}</span>
            </div>
            <div>
              <p class="label-mono mb-1">Reversibility</p>
              <span class="text-sm text-dim">{easyMode ? diffLabel(item.difficulty?.reversibility ?? 1) : difficultyDots(item.difficulty?.reversibility ?? 1)}</span>
            </div>
          </div>

          {#if item.adversaries?.length}
          <div>
            <p class="label-mono mb-2">Protects against</p>
            <div class="flex flex-wrap gap-2">
              {#each item.adversaries as adv}
                {@const userHas = profile?.adversaries?.includes(adv)}
                <span class="text-[13px] px-2 py-0.5 rounded border
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
                  <span class="text-[13px] text-muted bg-void border border-border px-1.5 py-0.5 rounded flex-shrink-0">
                    {rel.relationship.replace(/_/g, ' ')}
                  </span>
                  <button type="button" on:click={() => scrollToItem(rel.id, relItem.category, item.id)}
                    class="text-[13px] text-amber-light hover:opacity-80 transition-opacity text-left">
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
            <p class="label-section mb-2">Sources</p>
            <div class="flex flex-wrap gap-3">
              {#each item.sources as source}
                <a href={safeHref(source.url)} target="_blank" rel="noopener noreferrer"
                   class="text-[13px] text-dim hover:text-body transition-colors underline underline-offset-2">
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
              {#if item.sensitive}<span class="text-[13px] text-amber-light">Safety-critical</span>{/if}
            </div>
            {#each item.legal_notes as ln}
              <div class="rounded-lg p-3 text-[13px] leading-relaxed
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
                     placeholder-muted focus:outline-none focus:border-dim transition-colors
                     resize-none leading-relaxed"></textarea>
            {#if noteValues[item.id]?.trim()}
              <p class="text-[13px] text-muted mt-1">Saved automatically.</p>
            {/if}
          </div>
          {#each lookupsFor(item) as lookup}
            <div class="border border-border rounded-lg p-3.5 bg-void/40">
              <p class="font-sans font-medium text-sm text-bright mb-1.5">{lookup.title}</p>
              <p class="text-sm text-body leading-relaxed mb-3">{lookup.intro}</p>
              <ul class="space-y-2">
                {#each lookup.rows as row}
                  <li class="text-sm">
                    <span class="text-bright font-medium">{row.look_for}</span>
                    {#if row.also_called}
                      <span class="text-muted text-[13px]"> · {row.also_called}</span>
                    {/if}
                    <span class="text-dim block leading-snug">{row.why}</span>
                  </li>
                {/each}
              </ul>
              {#if lookup.notes?.length}
                <ul class="mt-3 space-y-1">
                  {#each lookup.notes as note}
                    <li class="text-[13px] text-dim leading-relaxed">{note}</li>
                  {/each}
                </ul>
              {/if}
              {#if lookup.verify_yourself}
                <p class="text-[13px] text-teal-light mt-3 leading-relaxed">{lookup.verify_yourself}</p>
              {/if}
            </div>
          {/each}

          {#if resourcesFor(item).length > 0}
          <div>
            <p class="label-section mb-2">Where to find one</p>
            <div class="space-y-1.5">
              {#each resourcesFor(item) as { ref, tool }}
                <p class="text-sm">
                  <a href={tool.url} target="_blank" rel="noopener noreferrer"
                     class="text-amber-light hover:underline">{tool.title} ↗</a>
                  <span class="text-dim"> {ref.context}</span>
                </p>
              {/each}
            </div>
          </div>
          {/if}

          <div class="flex items-center justify-between pt-1 flex-wrap gap-2">
            <div class="flex flex-col gap-1">
              
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
                 class="text-[13px] text-muted hover:text-amber-light transition-colors">
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

    {#if queueItems.length === 0}
      <div class="panel p-8 text-center">
        {#if (result?.total_applicable ?? 0) === 0}
          <p class="text-body text-sm mb-1">Your profile has no topics selected, so there is nothing to show.</p>
          <button type="button" on:click={startReconfigure}
            class="text-[13px] text-amber-light mt-2 hover:opacity-80">Choose what to cover</button>
        {:else if selectedCategory !== 'all' || searchQuery}
          <p class="text-dim text-sm">No items match your filters.</p>
          <button type="button" on:click={() => { selectedCategory = 'all'; searchQuery = ''; }}
            class="text-[13px] text-amber-light mt-2 hover:opacity-80">Clear filters</button>
        {:else if skippedCount > 0}
          <p class="text-body text-sm">Nothing left in the queue. {skippedCount} item{skippedCount !== 1 ? 's are' : ' is'} set aside below.</p>
        {:else}
          <p class="text-body text-sm">Nothing left in the queue — you have worked through everything here.</p>
        {/if}
      </div>
    {/if}
  </div>

  {#if skippedCount > 0}
  <div class="mt-4">
    <button type="button" on:click={() => skippedOpen = !skippedOpen}
      class="w-full panel px-5 py-3 flex items-center justify-between gap-3
             hover:border-muted transition-colors text-left">
      <span class="text-sm text-dim">
        Not applicable (<span class="font-mono">{skippedCount}</span>) · not counted as done
      </span>
      <span class="text-dim transition-transform duration-200 {skippedOpen ? 'rotate-90' : ''}">›</span>
    </button>

    {#if skippedOpen}
      <div class="mt-2 space-y-1.5">
        {#each skippedItems as item (item.id)}
          <div class="panel border border-border/40 px-4 py-2.5 flex items-center justify-between gap-3">
            <span class="text-sm text-dim min-w-0 truncate">{item.simple_description ?? item.title}</span>
            <button type="button" on:click={() => toggleSkip(item.id)}
              class="text-[13px] text-amber-light hover:opacity-80 transition-opacity flex-shrink-0">
              Put back
            </button>
          </div>
        {/each}
        {#if skippedItems.length === 0}
          <p class="text-[13px] text-muted px-1">All {skippedCount} are hidden by your current filters.</p>
        {/if}
      </div>
    {/if}
  </div>
  {/if}

</div>
  {/if}

</div>
