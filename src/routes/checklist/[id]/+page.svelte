<script lang="ts">
  import type { PageData } from './$types.js';
  import type { Platform } from '$lib/types.js';
  import { categoryLabel, platformDisplay, safeHref } from '$lib/audit/helpers.js';

  export let data: PageData;

  $: item = data.item;
  $: lead = item.simple_description ?? item.title;
  $: platformNotes = Object.entries(item.platform_notes ?? {}) as [Platform, string][];

  $: metaDescription = item.simple_description ?? item.description;
  $: canonical = `https://spectra.fpszero.com/checklist/${item.id}`;
</script>

<svelte:head>
  <title>{item.title} | Spectra</title>
  <meta name="description" content={metaDescription} />
  <link rel="canonical" href={canonical} />

  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Spectra" />
  <meta property="og:title" content="{item.title} | Spectra" />
  <meta property="og:description" content={metaDescription} />
  <meta property="og:url" content={canonical} />

  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="{item.title} | Spectra" />
  <meta name="twitter:description" content={metaDescription} />
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-up">

  <a href="/audit" class="flex items-center gap-2 text-[13px] text-dim hover:text-body transition-colors mb-8">
    ← Back to your audit
  </a>

  <div class="mb-6">
    <div class="flex flex-wrap items-center gap-2 mb-3">
      <span class="pill-dim text-xs">{categoryLabel(item.category)}</span>
      {#if item.maturity_level === 1}
        <span class="pill-amber text-xs">Essential</span>
      {/if}
      {#if item.time_estimate?.setup}
        <span class="text-xs font-mono text-muted">⏱ {item.time_estimate.setup}</span>
      {/if}
      {#if item.sensitive}<span class="pill-red text-xs">Sensitive</span>{/if}
    </div>

    <h1 class="font-display text-2xl sm:text-3xl font-bold text-white leading-snug">{lead}</h1>
  </div>

  <div class="panel p-5 mb-6">
    <p class="label-mono text-amber mb-2">Why this matters</p>
    <p class="text-sm text-body leading-relaxed">{item.threat_narrative}</p>
  </div>

  {#if platformNotes.length > 0}
  <div class="panel p-5 mb-6">
    <p class="label-section mb-4">How to do it</p>
    <ol class="space-y-4">
      {#each platformNotes as [platform, note], i}
        <li class="flex items-start gap-4">
          <span class="flex-shrink-0 w-6 h-6 rounded-full border border-amber/40 bg-amber-dim/20
                       flex items-center justify-center text-xs font-mono text-amber-light font-semibold">
            {i + 1}
          </span>
          <div class="min-w-0">
            <p class="text-[13px] text-amber-light mb-1">{platformDisplay(platform)}</p>
            <p class="text-sm text-body leading-relaxed">{note}</p>
          </div>
        </li>
      {/each}
    </ol>
  </div>
  {/if}

  {#if data.dependsOn.length > 0}
  <div class="panel p-5 mb-6">
    <p class="label-mono mb-3">Do this first</p>
    <div class="space-y-2">
      {#each data.dependsOn as dep}
        <a href="/checklist/{dep.id}"
           class="block p-3 rounded-lg border border-border hover:border-amber/30 transition-colors">
          <span class="text-sm text-body">{dep.title}</span>
          {#if dep.reason}<span class="block text-[13px] text-dim mt-0.5">{dep.reason}</span>{/if}
        </a>
      {/each}
    </div>
  </div>
  {/if}

  <details class="panel p-5 mb-6">
    <summary class="label-mono cursor-pointer text-dim hover:text-body transition-colors">More detail</summary>
    <div class="mt-4 space-y-4">
      <div>
        <p class="text-[13px] text-muted mb-1">Full title</p>
        <p class="text-sm text-body leading-relaxed">{item.title}</p>
      </div>
      <div>
        <p class="text-[13px] text-muted mb-1">Description</p>
        <p class="text-sm text-body leading-relaxed">{item.description}</p>
      </div>
      {#if item.platforms?.length}
      <div>
        <p class="text-[13px] text-muted mb-1">Applies to</p>
        <div class="flex flex-wrap gap-1.5">
          {#each item.platforms as p}<span class="pill-dim text-xs">{platformDisplay(p)}</span>{/each}
        </div>
      </div>
      {/if}
      {#if item.legal_notes?.length}
      <div>
        <p class="text-[13px] text-muted mb-1">Legal context</p>
        {#each item.legal_notes as note}
          <p class="text-sm text-body leading-relaxed">
            <span class="text-dim">{note.jurisdiction}:</span> {note.note}
          </p>
        {/each}
      </div>
      {/if}
    </div>
  </details>

  {#if data.related.length > 0}
  <div class="panel p-5 mb-6">
    <p class="label-mono mb-3">Related</p>
    <div class="space-y-2">
      {#each data.related as rel}
        <a href="/checklist/{rel.id}"
           class="block p-3 rounded-lg border border-border hover:border-amber/30 transition-colors">
          <span class="text-sm text-body">{rel.title}</span>
          {#if rel.note}<span class="block text-[13px] text-dim mt-0.5">{rel.note}</span>{/if}
        </a>
      {/each}
    </div>
  </div>
  {/if}

  {#if item.sources?.length}
  <div class="panel p-5 mb-6">
    <p class="label-section mb-3">Sources</p>
    <ul class="space-y-2">
      {#each item.sources as source}
        <li>
          <a href={safeHref(source.url)} target="_blank" rel="noopener noreferrer"
             class="text-[13px] text-dim hover:text-amber-light transition-colors">
            {source.title}
            <span class="text-muted">· {source.type.replace(/_/g, ' ')}</span>
          </a>
        </li>
      {/each}
    </ul>
  </div>
  {/if}

  <div class="flex flex-wrap gap-3">
    <a href="/audit" class="btn-primary text-sm">Open your audit →</a>
  </div>

</div>
