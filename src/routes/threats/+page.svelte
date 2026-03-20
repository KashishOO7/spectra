<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types.js';

  export let data: PageData;

  // Types
  type Severity = 'critical' | 'high' | 'moderate' | 'low';
  type SeverityFilter = 'all' | Severity;

  // `now` is kept live: updated every 60s so events that expire while the page is
  // open are filtered out on the next tick rather than requiring a page reload.
  let now = new Date();
  onMount(() => {
    const interval = setInterval(() => { now = new Date(); }, 60_000);
    return () => clearInterval(interval);
  });

  $: allActive = (data.landscapeEvents ?? [])
    .filter(e => new Date(e.expires_at) > now)
    .sort((a, b) => {
      const order: Record<string, number> = { critical: 4, high: 3, moderate: 2, low: 1 };
      const diff = (order[b.severity] ?? 0) - (order[a.severity] ?? 0);
      return diff !== 0 ? diff : new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    });

  $: expiredCount = (data.landscapeEvents ?? []).filter(e => new Date(e.expires_at) <= now).length;

  // Filter state
  const SEVERITIES: Severity[] = ['critical', 'high', 'moderate', 'low'];
  const FILTERS: SeverityFilter[] = ['all', 'critical', 'high', 'moderate', 'low'];
  let activeFilter: SeverityFilter = 'all';

  $: displayed = activeFilter === 'all'
    ? allActive
    : allActive.filter(e => e.severity === activeFilter);

  // Severity counts
  $: counts = {
    critical: allActive.filter(e => e.severity === 'critical').length,
    high:     allActive.filter(e => e.severity === 'high').length,
    moderate: allActive.filter(e => e.severity === 'moderate').length,
    low:      allActive.filter(e => e.severity === 'low').length
  };

  // Helpers
  function severityBadge(s: string): string {
    switch (s) {
      case 'critical': return 'text-red-light bg-red-dim/70 border-red/30';
      case 'high':     return 'text-amber-light bg-amber-dim/70 border-amber/30';
      case 'moderate': return 'text-teal-light bg-teal-dim/70 border-teal/30';
      default:         return 'text-dim bg-muted/10 border-border';
    }
  }

  function severityDot(s: string): string {
    switch (s) {
      case 'critical': return 'bg-red-light shadow-[0_0_6px_rgba(231,76,60,0.5)]';
      case 'high':     return 'bg-amber-light shadow-[0_0_6px_rgba(240,168,78,0.4)]';
      case 'moderate': return 'bg-teal-light';
      default:         return 'bg-dim';
    }
  }

  function severityText(s: string): string {
    switch (s) {
      case 'critical': return 'text-red-light';
      case 'high':     return 'text-amber-light';
      case 'moderate': return 'text-teal-light';
      default:         return 'text-dim';
    }
  }

  function expiryClass(expiresAt: string): string {
    const msLeft = new Date(expiresAt).getTime() - Date.now();
    const daysLeft = msLeft / 86400000;
    if (daysLeft < 14) return 'text-amber-light';
    if (daysLeft < 30) return 'text-body';
    return 'text-muted';
  }

  function fmt(d: string): string {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function hostname(url: string): string {
    try { return new URL(url).hostname.replace('www.', ''); }
    catch { return url; }
  }

  // Guard against javascript: URIs in YAML source data
  function safeHref(url: string): string {
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return url;
      return '#';
    } catch {
      return '#';
    }
  }

  function getItemTitle(id: string): string {
    return (data.graph?.items as Record<string, { title: string }>)?.[id]?.title ?? id;
  }

  function filterCount(f: SeverityFilter): number {
    return f === 'all' ? allActive.length : (counts[f as Severity] ?? 0);
  }

  // Guard multiplier: YAML could have a missing or non-numeric value
  function fmtMultiplier(m: unknown): string {
    return (typeof m === 'number' ? m : 0).toFixed(2);
  }
</script>

<svelte:head>
  <title>Threat Landscape | Spectra</title>
  <meta name="description" content="Live security events affecting Spectra framework recommendations. Manually curated, source-backed.">
</svelte:head>

<div class="max-w-6xl mx-auto px-4 sm:px-6 py-8">

  <div class="mb-8">
    <div class="flex items-center gap-3 mb-3">
      {#if allActive.length > 0}
        <div class="w-2 h-2 rounded-full bg-red-light animate-pulse"></div>
        <span class="label-mono text-red-light/70 text-[10px] tracking-widest uppercase">Live</span>
      {:else}
        <div class="w-2 h-2 rounded-full bg-dim"></div>
        <span class="label-mono text-dim text-[10px] tracking-widest uppercase">No active events</span>
      {/if}
    </div>
    <h1 class="font-display text-2xl sm:text-3xl text-bright font-semibold mb-3">
      Threat Landscape
    </h1>
    <p class="text-body text-sm leading-relaxed max-w-2xl">
      Documented security events that affect the relevance of this framework's recommendations.
      Each active event temporarily elevates the scoring weight of related checklist items.
      Every entry is manually reviewed, source-backed, and capped at four active events
      to prevent alert fatigue.
    </p>
  </div>

  <div class="flex items-center gap-5 mb-7 px-4 py-3 bg-surface border border-border rounded-lg flex-wrap">
    <div class="text-center min-w-[3rem]">
      <div class="font-mono text-xl text-bright leading-none">{allActive.length}</div>
      <div class="text-[10px] text-dim font-mono mt-0.5">active</div>
    </div>

    {#if allActive.length > 0}
      <div class="w-px h-7 bg-border"></div>
      {#each SEVERITIES as sev}
        {#if counts[sev] > 0}
          <div class="text-center min-w-[3rem]">
            <div class="font-mono text-base leading-none {severityText(sev)}">{counts[sev]}</div>
            <div class="text-[10px] text-dim font-mono mt-0.5">{sev}</div>
          </div>
        {/if}
      {/each}
    {/if}

    <div class="ml-auto text-[11px] text-muted font-mono">
      {expiredCount} expired · historical record maintained
    </div>
  </div>

  <div class="flex items-center gap-1 mb-6 flex-wrap">
    {#each FILTERS as f}
      {@const count = filterCount(f)}
      <button
        on:click={() => activeFilter = f}
        class="px-3 py-1.5 rounded text-xs font-mono transition-all duration-150
               {activeFilter === f
                 ? 'bg-surface border border-border text-bright shadow-sm'
                 : 'text-dim hover:text-body border border-transparent hover:border-border/50'}"
      >
        {f === 'all' ? 'All' : f}
        <span class="ml-1 {activeFilter === f ? 'opacity-70' : 'opacity-40'}">({count})</span>
      </button>
    {/each}
  </div>

  {#if displayed.length === 0}
    <div class="py-24 text-center">
      <div class="text-dim font-mono text-sm mb-2">
        {allActive.length === 0
          ? 'No active threat events at this time.'
          : 'No events match the selected filter.'}
      </div>
      {#if allActive.length === 0}
        <p class="text-muted font-mono text-xs">
          The framework monitors the landscape continuously. Check back soon.
        </p>
      {/if}
    </div>

  {:else}
    <div class="space-y-4">
      {#each displayed as event (event.id)}
        <article class="bg-surface border border-border rounded-lg overflow-hidden
                        hover:border-border/80 transition-colors duration-200">

          <div class="flex items-center justify-between gap-4 px-5 py-4 border-b border-border/50">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-2 h-2 rounded-full flex-shrink-0 {severityDot(event.severity)}"></div>
              <h2 class="font-sans font-medium text-bright text-sm leading-snug truncate">
                {event.title}
              </h2>
            </div>
            <span class="flex-shrink-0 px-2.5 py-0.5 rounded text-[10px] font-mono
                         uppercase tracking-widest border {severityBadge(event.severity)}">
              {event.severity}
            </span>
          </div>

          <div class="px-5 py-4 grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div class="lg:col-span-2 space-y-4">
              <p class="text-body text-sm leading-relaxed">{event.description}</p>

              <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
                <div class="flex items-center gap-2">
                  <span class="text-[11px] font-mono text-dim">score multiplier</span>
                  <span class="px-2 py-0.5 rounded bg-amber-dim/50 border border-amber/20
                               text-amber-light text-xs font-mono font-semibold">
                    ×{fmtMultiplier(event.multiplier)}
                  </span>
                  <span class="text-[11px] text-muted font-mono">on affected items</span>
                </div>

                <div class="flex items-center gap-3 text-[11px] font-mono text-muted">
                  <span>Published {fmt(event.published_at)}</span>
                  <span class="text-border">·</span>
                  <span class={expiryClass(event.expires_at)}>
                    Expires {fmt(event.expires_at)}
                  </span>
                </div>
              </div>
            </div>

            <div class="space-y-5">
              {#if (event.related_items?.length ?? 0) > 0}
                <div>
                  <div class="text-[10px] font-mono text-dim uppercase tracking-widest mb-2">
                    Affected checklist items
                  </div>
                  <ul class="space-y-1.5">
                    {#each event.related_items as itemId}
                      <li>
                        <a href="/audit?highlight={itemId}"
                           title="Go to audit — jump directly to this item"
                           class="flex items-start gap-2 text-xs text-body hover:text-bright
                                  transition-colors duration-150 group">
                          <span class="mt-0.5 text-dim group-hover:text-amber-light transition-colors">▸</span>
                          <span class="leading-snug">{getItemTitle(itemId)}</span>
                        </a>
                      </li>
                    {/each}
                  </ul>
                </div>
              {/if}

              <div>
                <div class="text-[10px] font-mono text-dim uppercase tracking-widest mb-1.5">
                  Source
                </div>
                <a href={safeHref(event.source_url)} target="_blank" rel="noopener noreferrer"
                   class="inline-flex items-center gap-1.5 text-xs font-mono text-teal-light
                          hover:text-teal-DEFAULT transition-colors duration-150">
                  {hostname(event.source_url)}
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                       stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                    <path d="M5.5 1H9v3.5M9 1L4.5 5.5M2.5 3H1.5A.5.5 0 001 3.5v5A.5.5 0 001.5 9h5a.5.5 0 00.5-.5V7.5"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

        </article>
      {/each}
    </div>
  {/if}

  <div class="mt-12 p-4 border border-border/40 rounded-lg bg-surface/30">
    <div class="flex items-start gap-3">
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
           stroke-width="1.2" class="text-dim mt-0.5 flex-shrink-0">
        <circle cx="8" cy="8" r="7"/>
        <path d="M8 7v4M8 5v.5" stroke-linecap="round"/>
      </svg>
      <div>
        <div class="text-xs font-mono text-bright mb-1">About this feed</div>
        <p class="text-xs text-muted leading-relaxed max-w-2xl">
          Every entry requires a maintainer PR with a verified source URL.
          Multipliers above ×1.3 require additional review. The feed is hard-capped at
          four active events — more than that creates noise, not signal. Expired events
          are kept in the YAML source as a historical record.
          Automated RSS scanning flags candidate articles daily; a human reviews and
          rewrites them before any entry is added.
        </p>
        <a href="https://github.com/KashishOO7/spectra/issues/new?labels=landscape-candidate&template=landscape-event.md"
           target="_blank" rel="noopener noreferrer"
           class="inline-flex items-center gap-1 text-xs font-mono text-teal-light
                  hover:text-teal-DEFAULT transition-colors mt-2">
          Suggest an event on GitHub
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none"
               stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <path d="M5 1h4v4M9 1L4.5 5.5M2.5 3H1.5A.5.5 0 001 3.5v5A.5.5 0 001.5 9h5a.5.5 0 00.5-.5V7.5"/>
          </svg>
        </a>
      </div>
    </div>
  </div>

</div>