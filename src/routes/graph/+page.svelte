<script lang="ts">
  import { onMount, tick } from 'svelte';
  import type { PageData } from './$types.js';
  import type { ChecklistItem, AdversaryType, Harm, Track } from '$lib/types.js';
  import { loadProfile } from '$lib/engine/store.js';
  import { categoryLabel } from '$lib/audit/helpers.js';
  import { ADVERSARY_HARMS } from '$lib/audit/constants.js';
  import { activeTracksFor, itemsForHarms } from '$lib/engine/scoring.js';

  export let data: PageData;

  $: items = Object.values(data.graph?.items ?? {}) as ChecklistItem[];
  $: itemsByAdversary = (data.graph?.itemsByAdversary ?? {}) as Record<string, string[]>;
  $: itemMap = new Map(items.map((i: ChecklistItem) => [i.id, i]));

  let userAdversaries: AdversaryType[] = [];
  let implemented: Record<string, boolean> = {};
  let skipped: Record<string, string> = {};
  let userHarms: Harm[] = [];
  let userTracks: Track[] = activeTracksFor({ tracks: [] });
  let profileLoaded = false;

  onMount(async () => {
    const profile = await loadProfile();
    userAdversaries = profile?.adversaries ?? [];
    implemented = profile?.implemented ?? {};
    skipped = profile?.skipped ?? {};
    userHarms = profile?.harms ?? [];
    userTracks = activeTracksFor(profile ?? { tracks: [] });
    profileLoaded = true;
  });

  const ORIENTATION =
    'Left to right: who might try, the steps that help, and what those steps protect. ' +
    'Tap anything to see what to do.';

  let fullScreen = false;
  let selectedAdversary: string | null = null;
  let hoveredItem: string | null = null;
  let selectedItem: string | null = null;

  let zoom = 1;
  let panX = 0;
  let panY = 0;
  let isPanning = false;
  let panOrigin = { x: 0, y: 0, px: 0, py: 0 };

  const clampZoom = (z: number) => Math.min(maxZoom, Math.max(0.25, z));

  function handleSvgWheel(e: WheelEvent) {
    e.preventDefault();
    zoom = clampZoom(zoom * (e.deltaY < 0 ? 1.12 : 0.88));
  }

  let pointers = new Map<number, { x: number; y: number }>();
  let pinchStart: { dist: number; zoom: number } | null = null;

  function pointerSpread(): number {
    const p = [...pointers.values()];
    return p.length < 2 ? 0 : Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
  }

  const isNode = (t: EventTarget | null) =>
    ['circle', 'rect', 'text', 'tspan', 'path'].includes((t as Element)?.tagName?.toLowerCase?.() ?? '');

  function handlePointerDown(e: PointerEvent) {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      pinchStart = { dist: pointerSpread(), zoom };
      isPanning = false;
      return;
    }
    if (pointers.size > 1 || isNode(e.target)) return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    isPanning = true;
    panOrigin = { x: e.clientX, y: e.clientY, px: panX, py: panY };
  }

  function handlePointerMove(e: PointerEvent) {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pinchStart && pointers.size >= 2) {
      const spread = pointerSpread();
      if (pinchStart.dist > 0) zoom = clampZoom(pinchStart.zoom * (spread / pinchStart.dist));
      return;
    }
    if (!isPanning) return;
    panX = panOrigin.px + (e.clientX - panOrigin.x);
    panY = panOrigin.py + (e.clientY - panOrigin.y);
  }

  function handlePointerUp(e: PointerEvent) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchStart = null;
    if (pointers.size === 0) isPanning = false;
  }

  function resetView() { zoom = 1; panX = 0; panY = 0; }

  let overlay: HTMLElement;
  let restoreFocus: HTMLElement | null = null;

  const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const focusables = () =>
    overlay ? [...overlay.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(n => n.offsetParent !== null) : [];

  function openFullScreen() {
    restoreFocus = document.activeElement as HTMLElement | null;
    fullScreen = true;
    resetView();
    remeasureAfterLayout();
  }

  function closeFullScreen() {
    fullScreen = false;
    resetView();
    remeasureAfterLayout();
    void tick().then(() => restoreFocus?.focus());
  }

  $: if (fullScreen && overlay) void tick().then(() => focusables()[0]?.focus());

  $: if (typeof document !== 'undefined') {
    document.body.style.overflow = fullScreen ? 'hidden' : '';
  }
  onMount(() => () => { document.body.style.overflow = ''; });

  function trapTab(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;
    const nodes = focusables();
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const active = document.activeElement as HTMLElement | null;
    const inside = !!active && overlay.contains(active);

    if (e.shiftKey && (!inside || active === first)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (!inside || active === last)) { e.preventDefault(); first.focus(); }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (selectedItem) { selectedItem = null; return; }
      if (fullScreen) closeFullScreen();
      return;
    }
    if (fullScreen && !selectedItem) trapTab(e);
  }

  const activate = (e: KeyboardEvent, fn: () => void) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); fn(); }
  };

  $: selectedItemFull = selectedItem ? (itemMap.get(selectedItem) ?? null) : null;

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

  $: noThreatModel = profileLoaded && userAdversaries.length === 0;
  $: activeAdversaries = fullScreen || noThreatModel
    ? Object.keys(ADVERSARY_LABELS)
    : userAdversaries;

  $: myItems = itemsForHarms(items, userHarms, userTracks);

  $: baseItems = myItems;

  $: displayItems = selectedAdversary
    ? myItems.filter((i: ChecklistItem) =>
        (itemsByAdversary[selectedAdversary as string] ?? []).includes(i.id))
    : myItems;

  $: implementedCount = displayItems.filter((i: ChecklistItem) => implemented[i.id]).length;
  $: gapCount = displayItems.filter((i: ChecklistItem) => !implemented[i.id] && !skipped[i.id]).length;


  $: coveragePct = displayItems.length > 0 ? Math.round((implementedCount / displayItems.length) * 100) : 0;

  $: exposedItemIds = new Set(
    displayItems
      .filter((i: ChecklistItem) => !implemented[i.id] && !skipped[i.id])
      .map((i: ChecklistItem) => i.id)
  );

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

  const SVG_W = 960;
  const COL_ADV = 100;
  const COL_ITEM = 480;
  const COL_ASSET = 860;
  const NODE_R = 22;
  const ITEM_W = 260;
  const ITEM_H = 34;
  const ROW_PITCH = 44;
  const CHAR_W = 5.42;          
  const LABEL_LINES = 2;
  const LABEL_CHARS = Math.floor((ITEM_W - 31) / CHAR_W);

  function wrapLabel(text: string, chars: number, maxLines: number): string[] {
    const words = text.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let line = '';
    let overflow = false;

    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (candidate.length <= chars) { line = candidate; continue; }
      if (lines.length + 1 >= maxLines && line) { overflow = true; break; }
      if (line) lines.push(line);
      line = word.length > chars ? `${word.slice(0, chars - 1)}…` : word;
    }
    if (line) lines.push(line);

    if (overflow) {
      const last = lines[lines.length - 1];
      lines[lines.length - 1] = last.length < chars ? `${last}…` : `${last.slice(0, chars - 1)}…`;
    }
    return lines.length > 0 ? lines : [text.slice(0, chars)];
  }

  $: advList = Object.keys(ADVERSARY_LABELS);
  $: assetList = Object.keys(ASSET_LABELS).filter(a => coveredAssets.has(a));

  $: rowCount = Math.max(baseItems.length, advList.length, assetList.length, 2);
  $: SVG_H = Math.max(600, rowCount * ROW_PITCH + 120);

  let canvasW = 0;
  let canvasH = 0;
  let remeasure: (() => void) | null = null;

  function measured(node: HTMLElement) {
    const update = () => { canvasW = node.clientWidth; canvasH = node.clientHeight; };
    remeasure = update;
    update();
    const ro = new ResizeObserver(update);
    ro.observe(node);
    window.addEventListener('resize', update);
    return {
      destroy() {
        ro.disconnect();
        window.removeEventListener('resize', update);
        if (remeasure === update) remeasure = null;
      }
    };
  }

  function remeasureAfterLayout() {
    void tick().then(() => {
      remeasure?.();
      requestAnimationFrame(() => remeasure?.());
    });
  }

  $: viewH = fullScreen && canvasW > 0 && canvasH > 0
    ? Math.min(SVG_H, SVG_W * canvasH / canvasW)
    : SVG_H;

  $: fitScale = canvasW > 0 ? canvasW / SVG_W : 1;
  $: maxZoom = Math.max(3, 2 / fitScale);

  function yPos(index: number, total: number, topPad = 60): number {
    if (total <= 1) return SVG_H / 2;
    const usable = SVG_H - topPad * 2;
    return topPad + (index / (total - 1)) * usable;
  }

  $: advPositions = advList.map((adv, i) => ({
    id: adv,
    x: COL_ADV,
    y: yPos(i, advList.length),
    active: noThreatModel || userAdversaries.includes(adv as AdversaryType),
    selected: selectedAdversary === adv
  }));

  $: itemPositions = baseItems.map((item: ChecklistItem, i: number) => ({
    id: item.id,
    x: COL_ITEM,
    y: yPos(i, Math.max(baseItems.length, 1)),
    impl: !!(implemented[item.id]),
    skipped: !!(skipped[item.id]),
    exposed: exposedItemIds.has(item.id),
    visible: displayItems.some((d: ChecklistItem) => d.id === item.id),
    title: item.title,
    lines: wrapLabel(item.title, LABEL_CHARS, LABEL_LINES),
    category: item.category,
    hovered: hoveredItem === item.id,
    chosen: selectedItem === item.id
  }));

  $: assetPositions = assetList.map((asset, i) => ({
    id: asset,
    x: COL_ASSET,
    y: yPos(i, Math.max(assetList.length, 1)),
    coverage: coveredAssets.get(asset) ?? { total: 0, covered: 0 }
  }));

  interface Edge { x1: number; y1: number; x2: number; y2: number; color: string; opacity: number }

  $: edges = (() => {
    const result: Edge[] = [];
    const focusAdv = selectedAdversary;
    const itemPos = new Map(itemPositions.map((p: typeof itemPositions[0]) => [p.id, p]));
    const assetPos = new Map(assetPositions.map((p: typeof assetPositions[0]) => [p.id, p]));

    for (const ap of advPositions) {
      if (focusAdv && ap.id !== focusAdv) continue;
      if (!ap.active && !focusAdv && !fullScreen) continue;
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

  function openItem(itemId: string) {
    if (itemMap.has(itemId)) selectedItem = itemId;
  }

  function toggleAdversary(id: string) {
    selectedAdversary = selectedAdversary === id ? null : id;
  }

  $: selectedAdversaryHarms = selectedAdversary
    ? (ADVERSARY_HARMS[selectedAdversary as AdversaryType] ?? []).filter(h => userHarms.includes(h))
    : [];
</script>

<svelte:head>
  <title>Your map | Spectra</title>
  <meta name="description" content="A map of who might try to reach parts of your life, the steps that stand in the way, and what those steps protect. Built from what you tapped." />
  <link rel="canonical" href="https://spectra.fpszero.com/graph" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Spectra" />
  <meta property="og:title" content="Your map | Spectra" />
  <meta property="og:description" content="A map of who might try to reach parts of your life, the steps that stand in the way, and what those steps protect. Built from what you tapped." />
  <meta property="og:url" content="https://spectra.fpszero.com/graph" />

  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Your map | Spectra" />
  <meta name="twitter:description" content="A map of who might try to reach parts of your life, the steps that stand in the way, and what those steps protect. Built from what you tapped." />
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">

  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
    <div>
      <h1 class="font-display text-2xl font-bold text-white mb-1">Your map</h1>
      <p class="text-sm text-dim">
        {#if profileLoaded && userHarms.length > 0}
          Showing what you tapped
        {:else if profileLoaded}
          Showing everything
        {:else}
          Loading your setup…
        {/if}
      </p>
    </div>
    <div class="flex items-center gap-3 flex-wrap">
      <button type="button"
        on:click={openFullScreen}
        class="text-sm px-3 py-1.5 rounded border border-border text-dim hover:text-body transition-colors">
        Full screen
      </button>
      {#if selectedAdversary}
        <button type="button"
          on:click={() => selectedAdversary = null}
          class="text-sm text-dim hover:text-body transition-colors">
          Clear filter ×
        </button>
      {/if}
      <div class="flex items-center border border-border rounded overflow-hidden">
        <button type="button"
          on:click={() => { zoom = clampZoom(zoom * 1.3); }}
          class="text-sm font-mono px-2.5 py-1 text-dim hover:text-body hover:bg-surface transition-colors"
          title="Zoom in">+</button>
        <span class="text-xs font-mono text-muted px-1.5 border-x border-border">{Math.round(zoom * 100)}%</span>
        <button type="button"
          on:click={() => { zoom = clampZoom(zoom * 0.7); }}
          class="text-sm font-mono px-2.5 py-1 text-dim hover:text-body hover:bg-surface transition-colors"
          title="Zoom out">−</button>
      </div>
      <button type="button"
        on:click={resetView}
        class="text-sm px-3 py-1.5 rounded border border-border text-dim hover:text-body transition-colors"
        title="Reset pan and zoom">
        Reset view
      </button>
      <a href="/audit" class="btn-primary text-xs py-1.5 px-3">Go to your list →</a>
    </div>
  </div>

  <p class="text-sm text-body max-w-3xl mb-6">{ORIENTATION}</p>

  {#if selectedAdversary && selectedAdversaryHarms.length > 0}
    <div class="panel px-4 py-3 mb-6 max-w-3xl">
      <p class="text-sm text-body">
        <span class="text-bright font-medium">{ADVERSARY_LABELS[selectedAdversary] ?? selectedAdversary}</span>
      </p>
      <p class="text-sm text-dim mt-1">
        Here because you tapped: {selectedAdversaryHarms.join(', ')}.
      </p>
    </div>
  {/if}

  {#if profileLoaded && displayItems.length > 0}
  <div class="grid grid-cols-3 gap-3 mb-6">
    <div class="panel p-3 text-center">
      <p class="font-display text-xl font-bold text-teal-light">{implementedCount}</p>
      <p class="text-sm text-dim">steps done</p>
    </div>
    <div class="panel p-3 text-center">
      <p class="font-display text-xl font-bold text-red-light">{gapCount}</p>
      <p class="text-sm text-dim">still to do</p>
    </div>
    <div class="panel p-3 text-center">
      <p class="font-display text-xl font-bold {coveragePct >= 80 ? 'text-teal-light' : coveragePct >= 50 ? 'text-amber-light' : 'text-red-light'}">{coveragePct}%</p>
      <p class="text-sm text-dim">of your map covered</p>
    </div>
  </div>
  {/if}

  <div class="flex flex-wrap gap-x-4 gap-y-2 mb-2 text-sm">
    <span class="flex items-center gap-1.5"><span data-theme="dark" class="w-3 h-3 rounded-full bg-teal inline-block"></span>Done</span>
    <span class="flex items-center gap-1.5"><span data-theme="dark" class="w-3 h-3 rounded-full bg-red inline-block"></span>Still to do</span>
    <span class="flex items-center gap-1.5"><span data-theme="dark" class="w-3 h-3 rounded-full bg-border inline-block"></span>Skipped, or not in your setup</span>
  </div>
  <div class="flex flex-wrap gap-x-4 mb-4 text-sm text-muted">
    <span>Click a name in the left column to filter</span>
    <span>Scroll to zoom · Drag to pan</span>
  </div>

  {#if !profileLoaded}
    <div class="panel p-16 text-center">
      <p class="text-dim text-sm">Loading profile…</p>
    </div>
  {:else if displayItems.length === 0}
    <div class="panel p-16 text-center">
      <p class="font-display text-bright font-semibold mb-2">No items to show</p>
      <p class="text-sm text-body mb-4">
        Nothing you tapped has steps in your setup yet.
      </p>
      <a href="/audit" class="btn-primary text-sm">Go to your list →</a>
    </div>
  {:else}

  {#if fullScreen}
    <div class="fixed inset-0 z-[90] bg-void/80 backdrop-blur-sm"></div>
  {/if}

  <div
    bind:this={overlay}
    data-theme="dark"
    role={fullScreen ? 'dialog' : undefined}
    aria-modal={fullScreen ? 'true' : undefined}
    aria-label={fullScreen ? 'Your map, full screen' : undefined}
    class={fullScreen
      ? 'fixed inset-2 sm:inset-6 z-[100] flex flex-col rounded-lg border border-border bg-surface overflow-hidden'
      : 'panel overflow-hidden'}
  >
    {#if fullScreen}
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4
                  px-4 py-3 border-b border-border flex-shrink-0">
        <p class="text-sm text-dim sm:max-w-2xl">{ORIENTATION}</p>
        <div class="flex items-center justify-end gap-2 flex-shrink-0 order-first sm:order-last">
          <div class="flex items-center border border-border rounded overflow-hidden">
            <button type="button"
              on:click={() => { zoom = clampZoom(zoom * 1.3); }}
              class="text-sm font-mono px-2.5 py-1 min-h-[44px] sm:min-h-0 text-dim hover:text-body hover:bg-surface transition-colors"
              title="Zoom in">+</button>
            <span class="text-xs font-mono text-muted px-1.5 border-x border-border">{Math.round(zoom * 100)}%</span>
            <button type="button"
              on:click={() => { zoom = clampZoom(zoom * 0.7); }}
              class="text-sm font-mono px-2.5 py-1 min-h-[44px] sm:min-h-0 text-dim hover:text-body hover:bg-surface transition-colors"
              title="Zoom out">−</button>
          </div>
          <button type="button" on:click={resetView}
            class="text-sm px-3 py-1.5 min-h-[44px] sm:min-h-0 rounded border border-border text-dim hover:text-body transition-colors">
            Reset view
          </button>
          <button type="button" on:click={closeFullScreen}
            class="text-sm px-3 py-1.5 min-h-[44px] sm:min-h-0 rounded border border-border text-dim hover:text-body transition-colors">
            Exit full screen
          </button>
        </div>
      </div>
    {/if}

    <div
      use:measured
      class="select-none {fullScreen ? 'flex-1 min-h-0 overflow-hidden' : 'overflow-x-auto'}"
      style="cursor: {isPanning ? 'grabbing' : 'grab'}; touch-action: {fullScreen ? 'none' : 'auto'}"
      on:wheel|preventDefault={handleSvgWheel}
      on:pointerdown={handlePointerDown}
      on:pointermove={handlePointerMove}
      on:pointerup={handlePointerUp}
      on:pointercancel={handlePointerUp}
    >
      <svg
        viewBox="0 0 {SVG_W} {viewH}"
        preserveAspectRatio="xMidYMid meet"
        role="group"
        aria-label="Who might try on the left, steps that help in the centre, what they protect on the right"
        class={fullScreen ? 'w-full h-full' : 'w-full min-w-[600px]'}
        style={fullScreen ? '' : `height: ${Math.max(400, baseItems.length * ROW_PITCH)}px`}
      >
        <g transform="translate({panX},{panY}) scale({zoom})">
        <text x={COL_ADV} y="22" text-anchor="middle" fill="#6381ac" font-size="10" font-family="JetBrains Mono, monospace" letter-spacing="1">WHO MIGHT TRY</text>
        <text x={COL_ITEM} y="22" text-anchor="middle" fill="#6381ac" font-size="10" font-family="JetBrains Mono, monospace" letter-spacing="1">STEPS THAT HELP</text>
        <text x={COL_ASSET} y="22" text-anchor="middle" fill="#6381ac" font-size="10" font-family="JetBrains Mono, monospace" letter-spacing="1">WHAT THEY PROTECT</text>

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
            on:click={() => toggleAdversary(ap.id)}
            role="button"
            tabindex="0"
            aria-pressed={ap.selected}
            aria-label="{ADVERSARY_LABELS[ap.id] ?? ap.id} — {ap.active ? 'in your setup' : 'not in your setup'}"
            on:keydown={(e) => activate(e, () => toggleAdversary(ap.id))}
          >
            <circle
              cx={ap.x} cy={ap.y} r={NODE_R}
              fill={ap.selected ? '#d4862a33' : ap.active ? '#d4862a22' : '#0d1929'}
              stroke={ap.selected ? '#d4862a' : ap.active ? '#d4862a88' : '#1a2540'}
              stroke-width={ap.selected ? 2 : 1.5}
            />
            <text
              x={ap.x + NODE_R + 6} y={ap.y + 4}
              fill={ap.active ? (ap.selected ? '#f0c070' : '#b07040') : '#748097'}
              font-size="9.5"
              font-family="JetBrains Mono, monospace"
            >{ADVERSARY_LABELS[ap.id] ?? ap.id}</text>
          </g>
        {/each}

        {#each itemPositions as ip}
          <g
            class="cursor-pointer"
            on:click={() => ip.visible && openItem(ip.id)}
            on:mouseenter={() => ip.visible && (hoveredItem = ip.id)}
            on:mouseleave={() => hoveredItem = null}
            role="button"
            tabindex="0"
            aria-label="{ip.title} — {ip.impl ? 'implemented' : ip.skipped ? 'skipped' : 'not done'}"
            on:keydown={(e) => activate(e, () => ip.visible && openItem(ip.id))}
            opacity={ip.visible ? 1 : 0.1}
            style="pointer-events: {ip.visible ? 'auto' : 'none'}"
          >
            <rect
              x={ip.x - ITEM_W / 2} y={ip.y - ITEM_H / 2}
              width={ITEM_W} height={ITEM_H}
              rx="4"
              fill={ip.impl ? '#0d2020' : ip.exposed ? '#1a0d0d' : (ip.hovered || ip.chosen) ? '#1a1a2a' : '#0d1420'}
              stroke={ip.chosen ? '#f0c070' : ip.impl ? '#2a8a8a' : ip.hovered ? '#d4862a' : ip.exposed ? '#c0392b66' : (CATEGORY_COLORS[ip.category] ?? '#1a2540') + '44'}
              stroke-width={ip.chosen ? 2 : ip.hovered ? 1.5 : ip.exposed ? 1 : 0.8}
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
              x={ip.x - ITEM_W / 2 + 9}
              y={ip.lines.length > 1 ? ip.y - 2 : ip.y + 3.5}
              fill={ip.impl ? '#5ab0a0' : (ip.hovered || ip.chosen) ? '#f0f8ff' : ip.exposed ? '#c07070' : '#8090b0'}
              font-size="9"
              font-family="JetBrains Mono, monospace"
            >
              {#each ip.lines as line, li}
                <tspan x={ip.x - ITEM_W / 2 + 9} dy={li === 0 ? 0 : 11}>{line}</tspan>
              {/each}
            </text>
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
              fill={pct >= 1 ? '#5ab0a0' : pct > 0 ? '#b07040' : '#748097'}
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
  </div>

  {/if}

  {#if profileLoaded && userAdversaries.length > 0 && !fullScreen}
  <div class="mt-4 flex flex-wrap gap-2">
    <span class="label-mono flex-shrink-0 self-center">Filter:</span>
    {#each userAdversaries as adv}
      <button type="button"
        on:click={() => toggleAdversary(adv)}
        class="text-sm px-2.5 py-1 rounded border transition-colors
               {selectedAdversary === adv ? 'border-amber/60 text-amber-light bg-amber-dim/20' : 'border-border text-dim hover:text-body'}">
        {ADVERSARY_LABELS[adv] ?? adv}
      </button>
    {/each}
  </div>
  {/if}

  <p class="text-sm text-muted mt-6 text-center">
    This map is built from what you tapped. All data is stored locally in your browser.
    <a href="/audit" class="text-dim hover:text-body underline transition-colors">Go to your list →</a>
  </p>
</div>

{#if selectedItemFull}
  <button type="button" class="fixed inset-0 bg-void/60 z-[105]"
    on:click={() => selectedItem = null} aria-label="Close item details" tabindex="-1"></button>

  <div
    role="dialog" aria-modal="true" aria-label={selectedItemFull.title}
    class="fixed top-0 right-0 h-full w-full max-w-sm bg-surface border-l border-border
           z-[110] overflow-y-auto shadow-2xl sidebar-scroll"
  >
    <div class="flex items-start justify-between gap-3 px-5 py-4 border-b border-border">
      <div class="flex items-center gap-2 min-w-0">
        <div class="w-2 h-2 rounded-full flex-shrink-0"
             style="background: {CATEGORY_COLORS[selectedItemFull.category] ?? '#2a3a5c'}"></div>
        <span class="text-[10px] font-mono text-dim uppercase tracking-widest truncate">
          {categoryLabel(selectedItemFull.category)}
        </span>
      </div>
      <button type="button" on:click={() => selectedItem = null}
        class="w-11 h-11 -mr-3 -mt-3 flex items-center justify-center text-dim hover:text-body
               transition-colors text-lg leading-none flex-shrink-0" aria-label="Close item details">✕</button>
    </div>

    <div class="px-5 py-5 space-y-4">
      <h2 class="font-display text-base font-semibold text-white leading-snug">{selectedItemFull.title}</h2>

      {#if selectedItemFull.simple_description}
        <p class="text-sm text-body leading-relaxed">{selectedItemFull.simple_description}</p>
      {/if}

      {#if implemented[selectedItemFull.id]}
        <div class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0"></span>
          <span class="text-sm text-teal-light">Implemented</span>
        </div>
      {:else if skipped[selectedItemFull.id]}
        <div class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-border flex-shrink-0"></span>
          <span class="text-sm text-dim">Skipped</span>
        </div>
      {:else}
        <div class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-amber flex-shrink-0"></span>
          <span class="text-sm text-amber-light">Not yet done</span>
        </div>
      {/if}

      <div class="text-sm font-mono text-muted">
        {#if selectedItemFull.maturity_level === 1}Essential · {/if}{selectedItemFull.time_estimate?.setup ?? '—'} setup
      </div>

      <a href="/audit?highlight={selectedItemFull.id}" class="btn-primary text-sm inline-block">
        Open in audit →
      </a>
    </div>
  </div>
{/if}
