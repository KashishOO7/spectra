<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types.js';
  import type { ChecklistItem, AdversaryType, Asset } from '$lib/types.js';
  import { loadProfile } from '$lib/engine/store.js';

  export let data: PageData;

  // Deserialise server data — guard against null if content load fails at build time
  $: items = Object.values(data.graph?.items ?? {}) as ChecklistItem[];
  $: itemsByAdversary = (data.graph?.itemsByAdversary ?? {}) as Record<string, string[]>;
  $: itemsByAsset = (data.graph?.itemsByAsset ?? {}) as Record<string, string[]>;
  $: itemMap = new Map(items.map((i: ChecklistItem) => [i.id, i]));

  // User profile
  let userAdversaries: AdversaryType[] = [];
  let implemented: Record<string, boolean> = {};
  let skipped: Record<string, string> = {};
  let profileLoaded = false;

  onMount(async () => {
    const profile = await loadProfile();
    userAdversaries = profile?.adversaries ?? [];
    implemented = profile?.implemented ?? {};
    skipped = profile?.skipped ?? {};
    profileLoaded = true;
  });

  // View state
  let showAllAdversaries = false;
  let selectedAdversary: string | null = null;
  let hoveredItem: string | null = null;

  // Pan + zoom state
  let zoom = 1;
  let panX = 0;
  let panY = 0;
  let isPanning = false;
  let panOrigin = { x: 0, y: 0, px: 0, py: 0 };

  // Tooltip position — clamped to viewport so it never overflows
  let tooltipX = 0;
  let tooltipY = 0;

  function handleSvgWheel(e: WheelEvent) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.88;
    zoom = Math.min(3, Math.max(0.25, zoom * factor));
  }

  function handlePanStart(e: MouseEvent) {
    // Only pan on the SVG background
    const tag = (e.target as SVGElement)?.tagName?.toLowerCase();
    if (tag === 'circle' || tag === 'rect' || tag === 'text' || tag === 'path') return;
    isPanning = true;
    panOrigin = { x: e.clientX, y: e.clientY, px: panX, py: panY };
  }

  function handlePanMove(e: MouseEvent) {
    // Update tooltip position regardless of pan state
    const vpW = window?.innerWidth ?? 9999;
    const vpH = window?.innerHeight ?? 9999;
    tooltipX = Math.min(e.clientX + 18, vpW - 280);
    tooltipY = Math.min(e.clientY - 12, vpH - 200);
    if (!isPanning) return;
    panX = panOrigin.px + (e.clientX - panOrigin.x);
    panY = panOrigin.py + (e.clientY - panOrigin.y);
  }

  function handlePanEnd() { isPanning = false; }

  function resetView() { zoom = 1; panX = 0; panY = 0; }

  $: hoveredItemFull = hoveredItem ? (itemMap.get(hoveredItem) ?? null) : null;

  // Adversary data
  const ADVERSARY_LABELS: Record<string, string> = {
    opportunistic: 'Bots & scammers',
    targeted_individual: 'Targeted attacker',
    criminal_org: 'Organised crime',
    intimate_partner: 'Intimate partner',
    employer: 'Employer',
    isp_network: 'ISP / Network',
    data_broker: 'Data broker',
    domestic_government: 'Your government',
    foreign_government: 'Foreign gov.',
    ai_automated: 'AI-powered attacks'
  };

  const ASSET_LABELS: Record<string, string> = {
    credentials: 'Credentials',
    local_data: 'Local data',
    cloud_data: 'Cloud data',
    communications: 'Communications',
    metadata: 'Metadata',
    location: 'Location',
    identity: 'Identity',
    financial: 'Financial',
    relationships: 'Relationships',
    reputation: 'Reputation',
    devices: 'Devices',
    biometrics: 'Biometrics',
    behavioral_data: 'Behaviour data'
  };

  const CATEGORY_COLORS: Record<string, string> = {
    device_security: '#2a8a8a',
    account_security: '#d4862a',
    communications: '#7a5af8',
    network_security: '#2a6fd4',
    physical_security: '#c0392b',
    human_vulnerability: '#e67e22',
    data_management: '#27ae60',
    osint_footprint: '#8e44ad',
    incident_response: '#e74c3c',
    ai_threats: '#1abc9c'
  };

  // Derived: items relevant to selected adversary or all user adversaries
  $: activeAdversaries = showAllAdversaries
    ? Object.keys(ADVERSARY_LABELS)
    : userAdversaries;

  $: relevantItemIds = (() => {
    const focus = selectedAdversary ?? null;
    const advList = focus ? [focus] : activeAdversaries;
    const ids = new Set<string>();
    for (const adv of advList) {
      for (const id of (itemsByAdversary[adv] ?? [])) ids.add(id);
    }
    return ids;
  })();

  $: displayItems = items.filter((i: ChecklistItem) =>
    i.status === 'active' && relevantItemIds.has(i.id)
  );

  // Base item list for POSITION layout — always uses the full adversary set,
  // never filtered by selectedAdversary. This prevents positions from
  // recalculating when the user clicks an adversary to filter, which caused
  // the graph to visually "zoom out" as the SVG shrank.
  $: baseItemIds = (() => {
    const ids = new Set<string>();
    for (const adv of activeAdversaries) {
      for (const id of (itemsByAdversary[adv] ?? [])) ids.add(id);
    }
    return ids;
  })();
  $: baseItems = items.filter((i: ChecklistItem) => i.status === 'active' && baseItemIds.has(i.id));

  $: implementedCount = displayItems.filter((i: ChecklistItem) => implemented[i.id]).length;
  $: gapCount = displayItems.filter((i: ChecklistItem) => !implemented[i.id] && !skipped[i.id]).length;

  $: coveragePct = displayItems.length > 0 ? Math.round((implementedCount / displayItems.length) * 100) : 0;

  // Items that are in active adversary paths and not yet implemented — these are live exposures
  $: exposedItemIds = new Set(
    displayItems
      .filter((i: ChecklistItem) => !implemented[i.id] && !skipped[i.id])
      .map((i: ChecklistItem) => i.id)
  );

  // Asset coverage
  $: coveredAssets = (() => {
    const assets = new Map<string, { total: number; covered: number }>();
    for (const item of displayItems) {
      for (const asset of (item.assets_protected ?? [])) {
        if (!assets.has(asset)) assets.set(asset, { total: 0, covered: 0 });
        const a = assets.get(asset)!;
        a.total++;
        if (implemented[item.id]) a.covered++;
      }
    }
    return assets;
  })();

  // SVG layout
  const SVG_W = 960;
  const SVG_H = 600;
  const COL_ADV = 100;
  const COL_ITEM = 480;
  const COL_ASSET = 860;
  const NODE_R = 22;
  const ITEM_W = 160;
  const ITEM_H = 30;

  $: advList = Object.keys(ADVERSARY_LABELS);
  $: assetList = Object.keys(ASSET_LABELS).filter(a => coveredAssets.has(a));

  function yPos(index: number, total: number, topPad = 60): number {
    if (total <= 1) return SVG_H / 2;
    const usable = SVG_H - topPad * 2;
    return topPad + (index / (total - 1)) * usable;
  }

  $: advPositions = advList.map((adv, i) => ({
    id: adv,
    x: COL_ADV,
    y: yPos(i, advList.length),
    active: userAdversaries.includes(adv as AdversaryType),
    selected: selectedAdversary === adv
  }));

  $: itemPositions = baseItems.map((item: ChecklistItem, i: number) => ({
    id: item.id,
    x: COL_ITEM,
    y: yPos(i, Math.max(baseItems.length, 1)),
    impl: !!(implemented[item.id]),
    skipped: !!(skipped[item.id]),
    exposed: exposedItemIds.has(item.id),
    // visible = this item passes the current adversary filter
    visible: displayItems.some((d: ChecklistItem) => d.id === item.id),
    title: item.title.length > 24 ? item.title.slice(0, 22) + '…' : item.title,
    category: item.category,
    hovered: hoveredItem === item.id
  }));

  $: assetPositions = assetList.map((asset, i) => ({
    id: asset,
    x: COL_ASSET,
    y: yPos(i, Math.max(assetList.length, 1)),
    coverage: coveredAssets.get(asset) ?? { total: 0, covered: 0 }
  }));

  // Edge generation
  interface Edge { x1: number; y1: number; x2: number; y2: number; color: string; opacity: number }

  $: edges = (() => {
    const result: Edge[] = [];
    const focusAdv = selectedAdversary;
    const itemPos = new Map(itemPositions.map((p: typeof itemPositions[0]) => [p.id, p]));
    const assetPos = new Map(assetPositions.map((p: typeof assetPositions[0]) => [p.id, p]));

    // Adversary → item edges
    for (const ap of advPositions) {
      if (focusAdv && ap.id !== focusAdv) continue;
      if (!ap.active && !focusAdv && !showAllAdversaries) continue;
      const itemIds = itemsByAdversary[ap.id] ?? [];
      for (const iid of itemIds) {
        const ip = itemPos.get(iid);
        if (!ip) continue;
        const impl = ip.impl;
        const exposed = !impl && ap.active;
        result.push({
          x1: ap.x + NODE_R, y1: ap.y,
          x2: ip.x - ITEM_W / 2, y2: ip.y,
          color: impl ? '#2a8a8a' : exposed ? '#c0392b' : '#2a3a5c',
          opacity: ap.active ? (impl ? 0.5 : 0.45) : 0.1
        });
      }
    }

    // Item → asset edges — only for visible items
    for (const item of baseItems) {
      const ip = itemPos.get(item.id);
      if (!ip || !ip.visible) continue;
      for (const asset of (item.assets_protected ?? [])) {
        const asp = assetPos.get(asset);
        if (!asp) continue;
        result.push({
          x1: ip.x + ITEM_W / 2, y1: ip.y,
          x2: asp.x - NODE_R, y2: asp.y,
          color: ip.impl ? '#2a8a8a' : '#2a3a5c',
          opacity: ip.impl ? 0.4 : 0.12
        });
      }
    }
    return result;
  })();

  function navigateToItem(itemId: string) {
    if (itemMap.has(itemId)) {
      goto(`/audit?highlight=${itemId}`);
    }
  }
</script>

<svelte:head>
  <title>Threat Graph — Spectra</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">

  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
    <div>
      <h1 class="font-display text-2xl font-bold text-white mb-1">Threat Graph</h1>
      <p class="text-sm text-dim font-mono">
        {#if profileLoaded && userAdversaries.length > 0}
          Showing your threat model · {implementedCount} of {displayItems.length} items covered
        {:else if profileLoaded}
          Complete the threat model questionnaire to personalise this graph
        {:else}
          Loading your threat model…
        {/if}
      </p>
    </div>
    <div class="flex items-center gap-3 flex-wrap">
      {#if profileLoaded && userAdversaries.length > 0}
        <button type="button"
          on:click={() => { showAllAdversaries = !showAllAdversaries; selectedAdversary = null; }}
          class="text-xs font-mono px-3 py-1.5 rounded border transition-colors
                 {showAllAdversaries ? 'border-amber/50 text-amber-light bg-amber-dim/20' : 'border-border text-dim hover:text-body'}">
          {showAllAdversaries ? 'My threat model' : 'Show full graph'}
        </button>
      {/if}
      {#if selectedAdversary}
        <button type="button"
          on:click={() => selectedAdversary = null}
          class="text-xs font-mono text-dim hover:text-body transition-colors">
          Clear filter ×
        </button>
      {/if}
      <div class="flex items-center border border-border rounded overflow-hidden">
        <button type="button"
          on:click={() => { zoom = Math.min(3, zoom * 1.3); }}
          class="text-sm font-mono px-2.5 py-1 text-dim hover:text-body hover:bg-surface transition-colors"
          title="Zoom in">+</button>
        <span class="text-xs font-mono text-muted px-1.5 border-x border-border">{Math.round(zoom * 100)}%</span>
        <button type="button"
          on:click={() => { zoom = Math.max(0.25, zoom * 0.7); }}
          class="text-sm font-mono px-2.5 py-1 text-dim hover:text-body hover:bg-surface transition-colors"
          title="Zoom out">−</button>
      </div>
      <button type="button"
        on:click={resetView}
        class="text-xs font-mono px-3 py-1.5 rounded border border-border text-dim hover:text-body transition-colors"
        title="Reset pan and zoom">
        Reset view
      </button>
      <a href="/audit" class="btn-ghost text-xs py-1.5 px-3">Go to audit →</a>
    </div>
  </div>

  {#if profileLoaded && displayItems.length > 0}
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
    <div class="panel p-3 text-center">
      <p class="font-display text-xl font-bold text-teal-light">{implementedCount}</p>
      <p class="text-xs font-mono text-dim">items covered</p>
    </div>
    <div class="panel p-3 text-center">
      <p class="font-display text-xl font-bold text-red-light">{gapCount}</p>
      <p class="text-xs font-mono text-dim">open exposures</p>
    </div>
    <div class="panel p-3 text-center">
      <p class="font-display text-xl font-bold text-amber-light">
        {selectedAdversary ? 1 : (showAllAdversaries ? advList.length : userAdversaries.length)}
      </p>
      <p class="text-xs font-mono text-dim">adversaries shown</p>
    </div>
    <div class="panel p-3 text-center">
      <p class="font-display text-xl font-bold {coveragePct >= 80 ? 'text-teal-light' : coveragePct >= 50 ? 'text-amber-light' : 'text-red-light'}">{coveragePct}%</p>
      <p class="text-xs font-mono text-dim">attack paths covered</p>
    </div>
  </div>
  {/if}

  <div class="flex flex-wrap gap-4 mb-4 text-xs font-mono">
    <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-teal inline-block"></span>Implemented</span>
    <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-red inline-block"></span>Open exposure</span>
    <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-border inline-block"></span>Skipped / not in model</span>
    <span class="text-dim">· Click any item to open in audit</span>
    <span class="text-dim">· Click an adversary to filter</span>
    <span class="text-dim">· Scroll to zoom · Drag to pan</span>
  </div>

  {#if !profileLoaded}
    <div class="panel p-16 text-center">
      <p class="text-dim font-mono text-sm">Loading profile…</p>
    </div>
  {:else if displayItems.length === 0}
    <div class="panel p-16 text-center">
      <p class="font-display text-bright font-semibold mb-2">No items to show</p>
      <p class="text-sm text-body mb-4">
        {#if userAdversaries.length === 0}
          Set up your threat model to see your personalised graph.
        {:else}
          No items match your current threat model selection.
        {/if}
      </p>
      <a href="/audit" class="btn-primary text-sm">Go to audit →</a>
    </div>
  {:else}
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div class="panel overflow-x-auto select-none" 
       style="cursor: {isPanning ? 'grabbing' : 'grab'}"
       on:wheel|preventDefault={handleSvgWheel}
       on:mousedown={handlePanStart}
       on:mousemove={handlePanMove}
       on:mouseup={handlePanEnd}
       on:mouseleave={handlePanEnd}
       role="application"
       aria-label="Security threat graph — adversaries on the left, controls in the centre, protected assets on the right">
    <svg
      viewBox="0 0 {SVG_W} {SVG_H}"
      preserveAspectRatio="xMidYMid meet"
      class="w-full min-w-[600px]"
      style="height: {Math.max(400, baseItems.length * 38)}px"
    >
      <g transform="translate({panX},{panY}) scale({zoom})">
      <text x={COL_ADV} y="22" text-anchor="middle" fill="#4a6080" font-size="10" font-family="JetBrains Mono, monospace" letter-spacing="1">ADVERSARIES</text>
      <text x={COL_ITEM} y="22" text-anchor="middle" fill="#4a6080" font-size="10" font-family="JetBrains Mono, monospace" letter-spacing="1">CONTROLS</text>
      <text x={COL_ASSET} y="22" text-anchor="middle" fill="#4a6080" font-size="10" font-family="JetBrains Mono, monospace" letter-spacing="1">ASSETS</text>

      {#each edges as edge}
        <path
          d="M {edge.x1} {edge.y1} C {edge.x1 + 120} {edge.y1}, {edge.x2 - 120} {edge.y2}, {edge.x2} {edge.y2}"
          fill="none"
          stroke={edge.color}
          stroke-width="1"
          opacity={edge.opacity}
        />
      {/each}

      {#each advPositions as ap}
        <g
          class="cursor-pointer"
          on:click={() => selectedAdversary = selectedAdversary === ap.id ? null : ap.id}
          role="button"
          tabindex="0"
          aria-label="{ADVERSARY_LABELS[ap.id] ?? ap.id} — {ap.active ? 'in your threat model' : 'not in your threat model'}"
          on:keydown={(e) => e.key === 'Enter' && (selectedAdversary = selectedAdversary === ap.id ? null : ap.id)}
        >
          <circle
            cx={ap.x} cy={ap.y} r={NODE_R}
            fill={ap.selected ? '#d4862a33' : ap.active ? '#d4862a22' : '#0d1929'}
            stroke={ap.selected ? '#d4862a' : ap.active ? '#d4862a88' : '#1a2540'}
            stroke-width={ap.selected ? 2 : 1.5}
          />
          <text
            x={ap.x + NODE_R + 6} y={ap.y + 4}
            fill={ap.active ? (ap.selected ? '#f0c070' : '#b07040') : '#2a3a5c'}
            font-size="9.5"
            font-family="JetBrains Mono, monospace"
          >{ADVERSARY_LABELS[ap.id] ?? ap.id}</text>
        </g>
      {/each}

      {#each itemPositions as ip}
        <g
          class="cursor-pointer"
          on:click={() => ip.visible && navigateToItem(ip.id)}
          on:mouseenter={() => ip.visible && (hoveredItem = ip.id)}
          on:mouseleave={() => hoveredItem = null}
          role="button"
          tabindex="0"
          aria-label="{ip.title} — {ip.impl ? 'implemented' : ip.skipped ? 'skipped' : 'not done'}"
          on:keydown={(e) => e.key === 'Enter' && ip.visible && navigateToItem(ip.id)}
          opacity={ip.visible ? 1 : 0.1}
          style="pointer-events: {ip.visible ? 'auto' : 'none'}"
        >
          <rect
            x={ip.x - ITEM_W / 2} y={ip.y - ITEM_H / 2}
            width={ITEM_W} height={ITEM_H}
            rx="4"
            fill={ip.impl ? '#0d2020' : ip.exposed ? '#1a0d0d' : ip.hovered ? '#1a1a2a' : '#0d1420'}
            stroke={ip.impl ? '#2a8a8a' : ip.hovered ? '#d4862a' : ip.exposed ? '#c0392b66' : (CATEGORY_COLORS[ip.category] ?? '#1a2540') + '44'}
            stroke-width={ip.hovered ? 1.5 : ip.exposed ? 1 : 0.8}
            opacity={ip.skipped ? 0.35 : 1}
          />
          <rect
            x={ip.x - ITEM_W / 2} y={ip.y - ITEM_H / 2}
            width="3" height={ITEM_H}
            rx="4"
            fill={CATEGORY_COLORS[ip.category] ?? '#2a3a5c'}
            opacity="0.7"
          />
          {#if ip.impl}
            <circle cx={ip.x + ITEM_W / 2 - 12} cy={ip.y} r="7" fill="#2a8a8a22" stroke="#2a8a8a" stroke-width="1"/>
            <path d="M {ip.x + ITEM_W/2 - 15} {ip.y} l 3 3 l 5 -5" stroke="#2a8a8a" stroke-width="1.3" fill="none" stroke-linecap="round"/>
          {/if}
          <text
            x={ip.x - ITEM_W / 2 + 9} y={ip.y + 4}
            fill={ip.impl ? '#5ab0a0' : ip.hovered ? '#f0f8ff' : ip.exposed ? '#c07070' : '#8090b0'}
            font-size="9"
            font-family="JetBrains Mono, monospace"
          >{ip.title}</text>
        </g>
      {/each}

      {#each assetPositions as asp}
        {@const pct = asp.coverage.total > 0 ? asp.coverage.covered / asp.coverage.total : 0}
        <g>
          <circle
            cx={asp.x} cy={asp.y} r={NODE_R}
            fill={pct >= 1 ? '#0d2020' : pct > 0 ? '#1a1a0d' : '#0d1420'}
            stroke={pct >= 1 ? '#2a8a8a' : pct > 0 ? '#d4862a55' : '#1a2540'}
            stroke-width="1.5"
          />
          {#if pct > 0 && pct < 1}
            <circle
              cx={asp.x} cy={asp.y} r={NODE_R - 3}
              fill="none"
              stroke="#d4862a"
              stroke-width="3"
              stroke-dasharray="{2 * Math.PI * (NODE_R - 3) * pct} {2 * Math.PI * (NODE_R - 3) * (1 - pct)}"
              stroke-dashoffset="{2 * Math.PI * (NODE_R - 3) * 0.25}"
              opacity="0.6"
            />
          {/if}
          <text
            x={asp.x - NODE_R - 6} y={asp.y + 4}
            text-anchor="end"
            fill={pct >= 1 ? '#5ab0a0' : pct > 0 ? '#b07040' : '#2a3a5c'}
            font-size="9.5"
            font-family="JetBrains Mono, monospace"
          >{ASSET_LABELS[asp.id] ?? asp.id}</text>
          {#if pct > 0}
            <text
              x={asp.x} y={asp.y + 4}
              text-anchor="middle"
              fill={pct >= 1 ? '#2a8a8a' : '#d4862a'}
              font-size="8"
              font-family="JetBrains Mono, monospace"
              font-weight="600"
            >{asp.coverage.covered}/{asp.coverage.total}</text>
          {/if}
        </g>
      {/each}
      </g>
    </svg>
  </div>
  {/if}

  {#if profileLoaded && userAdversaries.length > 0}
  <div class="mt-4 flex flex-wrap gap-2">
    <span class="label-mono flex-shrink-0 self-center">Filter:</span>
    {#each userAdversaries as adv}
      <button type="button"
        on:click={() => selectedAdversary = selectedAdversary === adv ? null : adv}
        class="text-xs font-mono px-2.5 py-1 rounded border transition-colors
               {selectedAdversary === adv ? 'border-amber/60 text-amber-light bg-amber-dim/20' : 'border-border text-dim hover:text-body'}">
        {ADVERSARY_LABELS[adv] ?? adv}
      </button>
    {/each}
  </div>
  {/if}

  <p class="text-xs text-muted font-mono mt-6 text-center">
    This graph visualises your personalised threat model. All data is stored locally in your browser.
    Click any control node to open its checklist item.
    <a href="/audit" class="text-dim hover:text-body underline transition-colors">Go to full audit →</a>
  </p>
</div>

{#if hoveredItemFull}
  {@const pct = (() => {
    let covered = 0; let total = 0;
    for (const asset of (hoveredItemFull.assets_protected ?? [])) {
      const c = coveredAssets.get(asset);
      if (c) { total += c.total; covered += c.covered; }
    }
    return total > 0 ? covered / total : 0;
  })()}
  <div
    class="fixed z-[200] pointer-events-none w-64 px-3.5 py-3
           bg-surface border border-border rounded-lg
           shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
    style="left: {tooltipX}px; top: {tooltipY}px;"
  >
    <div class="flex items-center gap-2 mb-2">
      <div class="w-2 h-2 rounded-full flex-shrink-0"
           style="background: {CATEGORY_COLORS[hoveredItemFull.category] ?? '#2a3a5c'}">
      </div>
      <span class="text-[10px] font-mono text-dim uppercase tracking-widest">
        {(hoveredItemFull.category ?? '').replace(/_/g, ' ')}
      </span>
    </div>

    <p class="text-xs font-sans text-bright leading-snug mb-2">
      {hoveredItemFull.title}
    </p>

    {#if implemented[hoveredItemFull.id]}
      <div class="flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0"></span>
        <span class="text-[10px] font-mono text-teal-light">Implemented</span>
      </div>
    {:else if skipped[hoveredItemFull.id]}
      <div class="flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-border flex-shrink-0"></span>
        <span class="text-[10px] font-mono text-dim">Skipped</span>
      </div>
    {:else}
      <div class="flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-amber flex-shrink-0"></span>
        <span class="text-[10px] font-mono text-amber-light">Not yet done</span>
      </div>
    {/if}

    {#if hoveredItemFull.maturity_level}
      <div class="mt-1.5 text-[10px] font-mono text-muted">
        Level {hoveredItemFull.maturity_level} ·
        {hoveredItemFull.time_estimate?.setup ?? '—'} setup
      </div>
    {/if}

    <div class="mt-2 pt-2 border-t border-border/40 text-[10px] font-mono text-muted">
      Click to open in audit →
    </div>
  </div>
{/if}