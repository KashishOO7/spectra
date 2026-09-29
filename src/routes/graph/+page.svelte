<script lang="ts">
  import { onMount, tick } from 'svelte';
  import type { PageData } from './$types.js';
  import type { ChecklistItem, AdversaryType, Harm, Track } from '$lib/types.js';
  import { loadProfile } from '$lib/engine/store.js';
  import { categoryLabel, leadSentence } from '$lib/audit/helpers.js';
  import { ADVERSARY_HARMS, ADVERSARY_OPTIONS } from '$lib/audit/constants.js';
  import { activeTracksFor, itemsForHarms } from '$lib/engine/scoring.js';
  import note from '#spectra-wiki/page/your-map';
  import { text, pieces, link, fill, named } from '$lib/wiki/page.js';

  const title = text(note, 'title');
  const description = text(note, 'description');
  const goToList = link(note, 'go-to-list');

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
    try {
      await document.fonts.load(LABEL_FONT);
      const ctx = document.createElement('canvas').getContext('2d');
      if (ctx) { ctx.font = LABEL_FONT; measure = (s: string) => ctx.measureText(s).width; }
    } catch {  }
  });

  const ORIENTATION = text(note, 'orientation');

  let fullScreen = false;
  let selectedAdversary: string | null = null;
  let hoveredItem: string | null = null;
  let hoverAdv: string | null = null;
  let hoverAsset: string | null = null;
  let sway = false;
  onMount(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const set = () => { sway = !mq.matches; };
    set();
    mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  });
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

  const ADVERSARY_ORDER = ['opportunistic', 'targeted_individual', 'criminal_org', 'intimate_partner', 'employer',
    'isp_network', 'data_broker', 'domestic_government', 'foreign_government', 'ai_automated'];
  const ADVERSARY_LABELS: Record<string, string> = Object.fromEntries(
    ADVERSARY_ORDER.map(v => [v, ADVERSARY_OPTIONS.find(o => o.value === v)?.label ?? v]));

  const ASSET_LABELS: Record<string, string> = named(note, 'protects');


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
  const COL_ADV = 170;
  const COL_ITEM = 480;
  const COL_ASSET = 790;
  const NODE_R = 22;
  const ITEM_W = 380;
  const ITEM_H = 46;
  const ROW_PITCH = 56;
  const LABEL_SIZE = 13;
  const LABEL_LEAD = 16;
  const LABEL_FONT = `400 ${LABEL_SIZE}px "Public Sans"`;
  const LABEL_LINES = 2;
  const LABEL_W = ITEM_W - 12 - 30;

  let measure: (s: string) => number = (s) => s.length * LABEL_SIZE * 0.56;

  function wrapLabel(text: string, width: number, maxLines: number, fits: (s: string) => number): string[] {
    const words = text.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let line = '';
    let overflow = false;
    const cut = (s: string) => { while (s.length > 1 && fits(`${s}…`) > width) s = s.slice(0, -1); return `${s}…`; };

    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (fits(candidate) <= width) { line = candidate; continue; }
      if (lines.length + 1 >= maxLines && line) { overflow = true; break; }
      if (line) lines.push(line);
      line = fits(word) > width ? cut(word) : word;
    }
    if (line) lines.push(line);

    if (overflow) lines[lines.length - 1] = cut(lines[lines.length - 1]);
    return lines.length > 0 ? lines : [text];
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
    selected: selectedAdversary === adv,
    lines: wrapLabel(ADVERSARY_LABELS[adv] ?? adv, COL_ADV - NODE_R - 12, 2, measure)
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
    lines: wrapLabel(item.title, LABEL_W, LABEL_LINES, measure),
    category: item.category,
    hovered: hoveredItem === item.id,
    chosen: selectedItem === item.id
  }));

  $: assetPositions = assetList.map((asset, i) => ({
    id: asset,
    x: COL_ASSET,
    y: yPos(i, Math.max(assetList.length, 1)),
    coverage: coveredAssets.get(asset) ?? { total: 0, covered: 0 },
    lines: wrapLabel(ASSET_LABELS[asset] ?? asset, SVG_W - COL_ASSET - NODE_R - 14, 2, measure)
  }));

  interface Edge { x1: number; y1: number; x2: number; y2: number; kind: 'done' | 'who' | 'protect' | 'off'; opacity: number; a?: string; i: string; s?: string }

  const SWAY = 7;
  function threadPath(e: Edge, w: number): string {
    const c = (e.x2 - e.x1) * 0.55;
    return `M ${e.x1} ${e.y1} C ${e.x1 + c} ${e.y1 + w * SWAY}, ${e.x2 - c} ${e.y2 - w * SWAY}, ${e.x2} ${e.y2}`;
  }

  $: litItems = hoverAdv ? new Set(itemsByAdversary[hoverAdv] ?? [])
    : hoverAsset ? new Set(baseItems.filter((i: ChecklistItem) => ((i.assets_protected ?? []) as string[]).includes(hoverAsset as string)).map((i: ChecklistItem) => i.id))
    : hoveredItem ? new Set([hoveredItem])
    : null;
  function threadLit(e: Edge, lit: Set<string> | null, adv: string | null, asset: string | null): boolean {
    if (!lit || !lit.has(e.i)) return false;
    return e.s ? (!asset || e.s === asset) : (!adv || e.a === adv);
  }

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
          kind: impl ? 'done' : exposed ? 'who' : 'off', a: ap.id, i: iid,
          opacity: ap.active ? (impl ? 0.45 : 0.25) : 0.08
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
          kind: ip.impl ? 'done' : 'protect', i: item.id, s: asset,
          opacity: ip.impl ? 0.4 : 0.2
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
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href="https://spectra.fpszero.com/graph" />
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">

  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
    <div>
      <h1 class="text-3xl font-bold text-white mb-1">{text(note, 'heading')}</h1>
      <p class="text-sm text-dim">
        {#if profileLoaded && userHarms.length > 0}
          {text(note, 'showing-tapped')}
        {:else if profileLoaded}
          {text(note, 'showing-everything')}
        {:else}
          {text(note, 'loading-setup')}
        {/if}
      </p>
    </div>
    <div class="flex items-center gap-3 flex-wrap">
      <button type="button"
        on:click={openFullScreen}
        class="text-sm px-3 py-1.5 rounded border border-border text-dim hover:text-body transition-colors">
        {text(note, 'full-screen')}
      </button>
      {#if selectedAdversary}
        <button type="button"
          on:click={() => selectedAdversary = null}
          class="text-sm text-dim hover:text-body transition-colors">
          {text(note, 'clear-filter')}
        </button>
      {/if}
      <div class="hidden sm:flex items-center border border-border rounded overflow-hidden">
        <button type="button"
          on:click={() => { zoom = clampZoom(zoom * 1.3); }}
          class="text-sm px-2.5 py-1 text-dim hover:text-body hover:bg-surface transition-colors"
          title={text(note, 'zoom-in')}>+</button>
        <span class="text-xs text-muted px-1.5 border-x border-border">{Math.round(zoom * 100)}%</span>
        <button type="button"
          on:click={() => { zoom = clampZoom(zoom * 0.7); }}
          class="text-sm px-2.5 py-1 text-dim hover:text-body hover:bg-surface transition-colors"
          title={text(note, 'zoom-out')}>−</button>
      </div>
      <button type="button"
        on:click={resetView}
        class="hidden sm:inline-flex text-sm px-3 py-1.5 rounded border border-border text-dim hover:text-body transition-colors"
        title={text(note, 'reset-title')}>
        {text(note, 'reset')}
      </button>
      <a href={goToList.href} class="btn-primary btn-sm whitespace-nowrap">{goToList.text}</a>
    </div>
  </div>

  <p class="hidden sm:block text-sm text-body max-w-3xl mb-6">{ORIENTATION}</p>
  <p class="sm:hidden text-sm text-body mb-6">{text(note, 'orientation-list')}</p>

  {#if selectedAdversary && selectedAdversaryHarms.length > 0}
    <div class="panel px-4 py-3 mb-6 max-w-3xl">
      <p class="text-sm text-body">
        <span class="text-bright font-medium">{ADVERSARY_LABELS[selectedAdversary] ?? selectedAdversary}</span>
      </p>
      <p class="text-sm text-dim mt-1">
        {#each pieces(note, 'because-tapped', { harms: selectedAdversaryHarms.join(', ') }) as piece}{piece}{/each}
      </p>
    </div>
  {/if}

  {#if profileLoaded && displayItems.length > 0}
  <div class="grid grid-cols-2 gap-3 mb-6 max-w-md">
    <div class="panel p-3 text-center">
      <p class="text-lg font-bold text-bright tabular-nums">{implementedCount}</p>
      <p class="text-sm text-dim">{text(note, 'steps-done')}</p>
    </div>
    <div class="panel p-3 text-center">
      <p class="text-lg font-bold text-bright tabular-nums">{gapCount}</p>
      <p class="text-sm text-dim">{text(note, 'still-to-do')}</p>
    </div>
  </div>
  {/if}

  <div class="flex flex-wrap gap-x-4 gap-y-2 mb-2 text-sm">
    <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full inline-block border-2" style="border-color: rgb(var(--c-map-who)); background: rgb(var(--c-map-who) / 0.14)"></span>{text(note, 'column-who')}</span>
    <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full inline-block bg-teal-dim border-2 border-viz"></span>{text(note, 'column-protect')}</span>
    <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm inline-block bg-viz border-2 border-viz"></span>{text(note, 'key-done')}</span>
    <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm inline-block bg-surface border-2 border-teal"></span>{text(note, 'key-to-do')}</span>
    <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm inline-block bg-surface border-2 border-muted"></span>{text(note, 'key-skipped')}</span>
  </div>
  <div class="hidden sm:flex flex-wrap gap-x-4 mb-4 text-sm text-muted">
    <span>{text(note, 'hint-filter')}</span>
    <span>{text(note, 'hint-zoom')}</span>
  </div>

  {#if !profileLoaded}
    <div class="panel p-16 text-center">
      <p class="text-dim text-sm">{text(note, 'loading-profile')}</p>
    </div>
  {:else if displayItems.length === 0}
    <div class="panel p-16 text-center">
      <p class="text-bright font-semibold mb-2">{text(note, 'no-items')}</p>
      <p class="text-sm text-body mb-4">
        {text(note, 'no-items-lead')}
      </p>
      <a href={goToList.href} class="btn-primary text-sm">{goToList.text}</a>
    </div>
  {:else}

  {#if fullScreen}
    <div class="fixed inset-0 z-[90] bg-void/80 backdrop-blur-sm"></div>
  {/if}

  {#if !fullScreen}
  <div class="sm:hidden space-y-3" data-map-list>
    {#each advList.filter(a => activeAdversaries.includes(a) && (!selectedAdversary || a === selectedAdversary)) as adv (adv)}
      {@const steps = myItems.filter(i => (itemsByAdversary[adv] ?? []).includes(i.id))}
      {#if steps.length}
      <section class="panel p-4">
        <h2 class="text-base font-semibold text-bright flex items-center gap-2"><span class="w-3 h-3 rounded-full border-2 flex-shrink-0" style="border-color: rgb(var(--c-map-who)); background: rgb(var(--c-map-who) / 0.14)" aria-hidden="true"></span>{ADVERSARY_LABELS[adv] ?? adv}</h2>
        <ul class="mt-2 space-y-1">
          {#each steps as s (s.id)}
            <li>
              <button type="button" on:click={() => openItem(s.id)}
                class="w-full text-left text-sm py-1.5 flex items-start gap-2 {implemented[s.id] ? 'text-dim' : skipped[s.id] ? 'text-muted' : 'text-body'} hover:text-bright">
                <span class="mt-1 w-3 h-3 flex-shrink-0 rounded-sm border-2 {implemented[s.id] ? 'bg-teal-dim border-viz' : skipped[s.id] ? 'border-muted' : 'border-dim'}" aria-hidden="true"></span>
                <span>{s.title}</span>
              </button>
            </li>
          {/each}
        </ul>
      </section>
      {/if}
    {/each}
    <section class="panel p-4">
      <h2 class="text-base font-semibold text-bright">{text(note, 'column-protect')}</h2>
      <ul class="mt-2 space-y-1.5">
        {#each assetPositions as asp (asp.id)}
          <li class="flex items-baseline justify-between gap-3 text-sm text-body">
            <span class="flex items-center gap-2"><span class="w-3 h-3 rounded-full border-2 border-viz bg-teal-dim flex-shrink-0" aria-hidden="true"></span>{ASSET_LABELS[asp.id] ?? asp.id}</span>
            <span class="tabular-nums text-dim">{fill(note, 'protect-count', { covered: asp.coverage.covered, total: asp.coverage.total })}</span>
          </li>
        {/each}
      </ul>
    </section>
  </div>
  {/if}

  <div
    bind:this={overlay}
    data-map
    role={fullScreen ? 'dialog' : undefined}
    aria-modal={fullScreen ? 'true' : undefined}
    aria-label={fullScreen ? text(note, 'full-screen-label') : undefined}
    class={fullScreen
      ? 'fixed inset-2 sm:inset-6 z-[100] flex flex-col rounded-xl border border-border bg-surface overflow-hidden'
      : 'panel overflow-hidden hidden sm:block'}
  >
    {#if fullScreen}
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4
                  px-4 py-3 border-b border-border flex-shrink-0">
        <p class="text-sm text-dim sm:max-w-2xl">{ORIENTATION}</p>
        <div class="flex items-center justify-end gap-2 flex-shrink-0 order-first sm:order-last">
          <div class="flex items-center border border-border rounded overflow-hidden">
            <button type="button"
              on:click={() => { zoom = clampZoom(zoom * 1.3); }}
              class="text-sm px-2.5 py-1 min-h-[44px] sm:min-h-0 text-dim hover:text-body hover:bg-surface transition-colors"
              title={text(note, 'zoom-in')}>+</button>
            <span class="text-xs text-muted px-1.5 border-x border-border">{Math.round(zoom * 100)}%</span>
            <button type="button"
              on:click={() => { zoom = clampZoom(zoom * 0.7); }}
              class="text-sm px-2.5 py-1 min-h-[44px] sm:min-h-0 text-dim hover:text-body hover:bg-surface transition-colors"
              title={text(note, 'zoom-out')}>−</button>
          </div>
          <button type="button" on:click={resetView}
            class="text-sm px-3 py-1.5 min-h-[44px] sm:min-h-0 rounded border border-border text-dim hover:text-body transition-colors">
            {text(note, 'reset')}
          </button>
          <button type="button" on:click={closeFullScreen}
            class="text-sm px-3 py-1.5 min-h-[44px] sm:min-h-0 rounded border border-border text-dim hover:text-body transition-colors">
            {text(note, 'exit-full-screen')}
          </button>
        </div>
      </div>
    {/if}

    <!-- svelte-ignore a11y-no-static-element-interactions -->
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
        aria-label={text(note, 'drawing-label')}
        class={fullScreen ? 'w-full h-full' : 'block w-full min-w-[600px] max-w-[960px] mx-auto'}
        style={fullScreen ? '' : `aspect-ratio: ${SVG_W} / ${SVG_H}`}
      >
        <g transform="translate({panX},{panY}) scale({zoom})">
        <text x={COL_ADV} y="22" text-anchor="middle" class="m-head" font-size={LABEL_SIZE} font-weight="600">{text(note, 'column-who')}</text>
        <text x={COL_ITEM} y="22" text-anchor="middle" class="m-head" font-size={LABEL_SIZE} font-weight="600">{text(note, 'column-steps')}</text>
        <text x={COL_ASSET} y="22" text-anchor="middle" class="m-head" font-size={LABEL_SIZE} font-weight="600">{text(note, 'column-protect')}</text>

        {#each edges as edge, ei}
          {@const lit = threadLit(edge, litItems, hoverAdv, hoverAsset)}
          <path
            d={threadPath(edge, 0)}
            class="m-edge m-edge-{edge.kind} {lit ? 'm-edge-lit' : ''}"
            stroke-width={lit ? 2 : 1}
            opacity={lit ? 0.95 : litItems ? 0.05 : edge.opacity}
          >{#if sway && lit}<animate attributeName="d" dur="{9 + (ei % 5)}s" begin="-{((ei * 0.73) % 9).toFixed(2)}s"
              repeatCount="indefinite" calcMode="spline" keyTimes="0;0.25;0.5;0.75;1"
              keySplines="0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1"
              values="{threadPath(edge, 0)};{threadPath(edge, 1)};{threadPath(edge, 0)};{threadPath(edge, -1)};{threadPath(edge, 0)}"/>{/if}</path>
        {/each}

        {#each advPositions as ap}
          <g
            class="cursor-pointer"
            on:click={() => toggleAdversary(ap.id)}
            on:mouseenter={() => hoverAdv = ap.id}
            on:mouseleave={() => hoverAdv = null}
            on:focus={() => hoverAdv = ap.id}
            on:blur={() => hoverAdv = null}
            role="button"
            tabindex="0"
            aria-pressed={ap.selected}
            aria-label={fill(note, 'node-who', { name: ADVERSARY_LABELS[ap.id] ?? ap.id, state: ap.active ? text(note, 'in-setup') : text(note, 'not-in-setup') })}
            on:keydown={(e) => activate(e, () => toggleAdversary(ap.id))}
          >
            <circle
              cx={ap.x} cy={ap.y} r={NODE_R}
              class={ap.selected ? 'm-node-chosen' : ap.active ? 'm-node-who' : 'm-node-off'}
              stroke-width={ap.selected ? 2 : 1.5}
            />
            <text
              x={ap.x - NODE_R - 8} y={ap.lines.length > 1 ? ap.y - LABEL_LEAD / 2 + 4.5 : ap.y + 4.5}
              text-anchor="end"
              class={ap.active ? 'm-label-yours' : 'm-label-off'}
              font-size={LABEL_SIZE}
              font-weight={ap.selected ? 600 : 400}
            >{#each ap.lines as line, li}<tspan x={ap.x - NODE_R - 8} dy={li === 0 ? 0 : LABEL_LEAD}>{line}</tspan>{/each}</text>
          </g>
        {/each}

        {#each itemPositions as ip}
          <g
            class="cursor-pointer"
            on:click={() => ip.visible && openItem(ip.id)}
            on:mouseenter={() => ip.visible && (hoveredItem = ip.id)}
            on:mouseleave={() => hoveredItem = null}
            on:focus={() => ip.visible && (hoveredItem = ip.id)}
            on:blur={() => hoveredItem = null}
            role="button"
            tabindex="0"
            aria-label={fill(note, 'node-step', { name: ip.title, state: ip.impl ? text(note, 'step-implemented') : ip.skipped ? text(note, 'step-skipped') : text(note, 'step-not-done') })}
            on:keydown={(e) => activate(e, () => ip.visible && openItem(ip.id))}
            opacity={!ip.visible ? 0.1 : litItems && !litItems.has(ip.id) ? 0.35 : 1}
            style="pointer-events: {ip.visible ? 'auto' : 'none'}"
          >
            <rect
              x={ip.x - ITEM_W / 2} y={ip.y - ITEM_H / 2}
              width={ITEM_W} height={ITEM_H}
              rx="6"
              class={ip.impl ? 'm-step-done' : ip.exposed ? 'm-step-open' : 'm-step-off'}
              data-hot={ip.hovered || ip.chosen ? '' : null}
              stroke-width={ip.chosen ? 2 : ip.hovered ? 1.5 : 1}
              opacity={ip.skipped ? 0.35 : 1}
            />
            {#if ip.impl}
              <circle cx={ip.x + ITEM_W / 2 - 16} cy={ip.y} r="8" class="m-tick-ring" stroke-width="1"/>
              <path d="M {ip.x + ITEM_W/2 - 19.5} {ip.y} l 3 3 l 5.5 -5.5" class="m-tick" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            {/if}
            <text
              x={ip.x - ITEM_W / 2 + 12}
              y={ip.lines.length > 1 ? ip.y - LABEL_LEAD / 2 + 4.5 : ip.y + 4.5}
              class={ip.impl ? 'm-label-done' : ip.exposed || ip.hovered || ip.chosen ? 'm-label-yours' : 'm-label-off'}
              font-size={LABEL_SIZE}
              font-weight={ip.chosen ? 600 : 400}
            >
              {#each ip.lines as line, li}
                <tspan x={ip.x - ITEM_W / 2 + 12} dy={li === 0 ? 0 : LABEL_LEAD}>{line}</tspan>
              {/each}
            </text>
          </g>
        {/each}

        {#each assetPositions as asp}
          {@const pct = asp.coverage.total > 0 ? asp.coverage.covered / asp.coverage.total : 0}
          <g role="group" aria-label={fill(note, 'node-protect', { name: ASSET_LABELS[asp.id] ?? asp.id, covered: asp.coverage.covered, total: asp.coverage.total })}
            on:mouseenter={() => hoverAsset = asp.id} on:mouseleave={() => hoverAsset = null}
            on:focus={() => hoverAsset = asp.id} on:blur={() => hoverAsset = null}>
            <circle
              cx={asp.x} cy={asp.y} r={NODE_R}
              class={pct >= 1 ? 'm-node-done' : 'm-node-protect'}
              stroke-width="1.5"
            />
            {#if pct > 0 && pct < 1}
              <circle
                cx={asp.x} cy={asp.y} r={NODE_R - 3}
                fill="none"
                class="m-arc"
                stroke-width="3"
                stroke-dasharray="{2 * Math.PI * (NODE_R - 3) * pct} {2 * Math.PI * (NODE_R - 3) * (1 - pct)}"
                stroke-dashoffset="{2 * Math.PI * (NODE_R - 3) * 0.25}"
              />
            {/if}
            <text
              x={asp.x + NODE_R + 8} y={asp.lines.length > 1 ? asp.y - LABEL_LEAD / 2 + 4.5 : asp.y + 4.5}
              class="m-label-yours"
              font-size={LABEL_SIZE}
            >{#each asp.lines as line, li}<tspan x={asp.x + NODE_R + 8} dy={li === 0 ? 0 : LABEL_LEAD}>{line}</tspan>{/each}</text>
            {#if pct > 0}
              <text
                x={asp.x} y={asp.y + 4.5}
                text-anchor="middle"
                class="m-label-yours tabular-nums"
                font-size={LABEL_SIZE}
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
    <span class="label-mono flex-shrink-0 self-center">{text(note, 'filter')}</span>
    {#each userAdversaries as adv}
      <button type="button"
        on:click={() => toggleAdversary(adv)}
        class="text-sm px-2.5 py-1 rounded border transition-colors
               {selectedAdversary === adv ? 'border-teal/60 text-teal-light bg-teal-dim/20' : 'border-border text-dim hover:text-body'}">
        {ADVERSARY_LABELS[adv] ?? adv}
      </button>
    {/each}
  </div>
  {/if}

  <p class="text-sm text-muted mt-6 text-center">
    {`${text(note, 'footer')} `}<a href={goToList.href} class="text-dim hover:text-body underline transition-colors">{goToList.text}</a>
  </p>
</div>

{#if selectedItemFull}
  <button type="button" class="fixed inset-0 bg-void/60 z-[105]"
    on:click={() => selectedItem = null} aria-label={text(note, 'close-item')} tabindex="-1"></button>

  <div
    role="dialog" aria-modal="true" aria-label={selectedItemFull.title}
    class="fixed top-0 right-0 h-full w-full max-w-sm bg-surface border-l border-border
           z-[110] overflow-y-auto shadow-2xl sidebar-scroll"
  >
    <div class="flex items-start justify-between gap-3 px-5 py-4 border-b border-border">
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-xs text-dim truncate">
          {categoryLabel(selectedItemFull.category)}
        </span>
      </div>
      <button type="button" on:click={() => selectedItem = null}
        class="w-11 h-11 -mr-3 -mt-3 flex items-center justify-center text-dim hover:text-body
               transition-colors text-lg leading-none flex-shrink-0" aria-label={text(note, 'close-item')}>✕</button>
    </div>

    <div class="px-5 py-5 space-y-4">
      <h2 class="text-base font-semibold text-white leading-snug">{selectedItemFull.title}</h2>

      {#if selectedItemFull.description}
        <p class="text-sm text-body leading-relaxed">{leadSentence(selectedItemFull)}</p>
      {/if}

      {#if implemented[selectedItemFull.id]}
        <div class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0"></span>
          <span class="text-sm text-teal-light">{text(note, 'implemented')}</span>
        </div>
      {:else if skipped[selectedItemFull.id]}
        <div class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-border flex-shrink-0"></span>
          <span class="text-sm text-dim">{text(note, 'skipped')}</span>
        </div>
      {:else}
        <div class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0"></span>
          <span class="text-sm text-teal-light">{text(note, 'not-yet-done')}</span>
        </div>
      {/if}

      {#if selectedItemFull.maturity_level === 1}
        <div class="text-sm text-muted">{text(note, 'essential')}</div>
      {/if}

      <a href="/audit?highlight={selectedItemFull.id}" class="btn-primary text-sm">
        {text(note, 'open-in-audit')}
      </a>
    </div>
  </div>
{/if}

<style>
  :global([data-map] svg text) { font-family: 'Public Sans', system-ui, sans-serif; }
  :global([data-map] .m-head) { fill: rgb(var(--c-dim)); }
  :global([data-map] .m-label-yours) { fill: rgb(var(--c-bright)); }
  :global([data-map] .m-label-done) { fill: rgb(var(--c-body)); }
  :global([data-map] .m-label-off) { fill: rgb(var(--c-dim)); }

  :global([data-map] .m-edge) { fill: none; transition: opacity 200ms ease, stroke-width 200ms ease; }
  @media (prefers-reduced-motion: reduce) {
    :global([data-map] .m-edge) { transition: none; }
  }
  :global([data-map] .m-edge-done) { stroke: rgb(var(--c-viz)); }
  :global([data-map] .m-edge-who) { stroke: rgb(var(--c-map-who)); }
  :global([data-map] .m-edge-protect) { stroke: rgb(var(--c-viz)); }
  :global([data-map] .m-node-who) { fill: rgb(var(--c-map-who) / 0.14); stroke: rgb(var(--c-map-who)); }
  :global([data-map] .m-node-protect) { fill: rgb(var(--c-teal-dim)); stroke: rgb(var(--c-viz)); }
  :global([data-map] .m-edge-off) { stroke: rgb(var(--c-muted)); }

  :global([data-map] .m-node-done),
  :global([data-map] .m-step-done) { fill: rgb(var(--c-teal-dim)); stroke: rgb(var(--c-viz)); }
  :global([data-map] .m-node-chosen) { fill: rgb(var(--c-teal-dim)); stroke: rgb(var(--c-bright)); }
  :global([data-map] .m-node-yours),
  :global([data-map] .m-step-open) { fill: rgb(var(--c-surface)); stroke: rgb(var(--c-teal)); }
  :global([data-map] .m-node-off),
  :global([data-map] .m-step-off) { fill: rgb(var(--c-surface)); stroke: rgb(var(--c-muted)); }
  :global([data-map] rect[data-hot]) { stroke: rgb(var(--c-bright)); }

  :global([data-map] .m-tick-ring) { fill: rgb(var(--c-surface)); stroke: rgb(var(--c-viz)); }
  :global([data-map] .m-tick),
  :global([data-map] .m-arc) { stroke: rgb(var(--c-viz)); }
</style>
