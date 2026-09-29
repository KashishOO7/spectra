<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types.js';
  import { assessFromAnywhere, invalidateAssessment } from '$lib/engine/lazyAssessment.js';
  import { settle } from '$lib/nav/trail.js';
  import BackLink from '$lib/components/BackLink.svelte';
  import ChapterStory from '$lib/components/ChapterStory.svelte';
  import chapters from '#spectra-wiki/page/chapters';
  import chrome from '#spectra-wiki/page/header-and-footer';
  import { text, fill, link, named } from '$lib/wiki/page.js';

  export let data: PageData;
  const openList = link(chapters, 'open-list');
  const playbookName = named(chrome, 'back-names').list;

  let inList: Set<string> | null = null;
  let done = new Set<string>();

  onMount(async () => {
    invalidateAssessment();
    const result = await assessFromAnywhere();
    if (result) {
      inList = new Set(result.all_items.map(i => i.id));
      done = new Set(result.all_items.filter(i => i.is_implemented && !i.is_skipped).map(i => i.id));
    }
    settle();
  });

  $: shown = inList ? data.steps.filter(s => inList!.has(s.id)) : data.steps;
  $: others = inList ? data.steps.filter(s => !inList!.has(s.id)) : [];
  $: count = shown.filter(s => done.has(s.id)).length;
</script>

<svelte:head>
  <title>{data.name} | Spectra</title>
  <meta name="description" content={data.steps.map(s => s.title).join('. ') + '.'} />
  <link rel="canonical" href="https://spectra.fpszero.com/chapter/{data.id}" />
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-8" data-ready={inList ? 'true' : null}>
  <BackLink parent={{ href: '/audit', name: playbookName }}
    class="inline-flex items-center min-h-[44px] text-sm text-dim hover:text-body transition-colors mb-4" />

  <p class="text-sm font-semibold text-teal-light">{text(chapters, 'label')}</p>
  <h1 class="text-3xl font-bold text-white mt-1 mb-6">{data.name}</h1>

  <ChapterStory chapter={data.id} />

  {#if shown.length}
    <div class="mt-8 flex items-center justify-between gap-4">
      <p class="text-sm text-dim">{fill(chapters, 'count', { done: count, total: shown.length })}</p>
    </div>
    <div class="mt-2 grid gap-1.5" style="grid-template-columns: repeat({shown.length}, 1fr)" aria-hidden="true">
      {#each shown as s}<i class="block h-1.5 rounded-full {done.has(s.id) ? 'bg-teal' : 'bg-viz-off'}"></i>{/each}
    </div>
    <ul class="mt-4 panel p-2 divide-y divide-border">
      {#each shown as s (s.id)}
        {@const isDone = done.has(s.id)}
        <li data-chapter-step={s.id}>
          <a href="/checklist/{s.id}" class="flex items-center gap-3.5 px-3 py-3.5 min-h-[56px] rounded-xl hover:bg-surface-2 transition-colors">
            <span data-tick={isDone ? 'done' : 'open'}
                  class="w-7 h-7 rounded-full grid place-items-center flex-none {isDone ? 'bg-teal' : 'border-2 border-muted'}">
              {#if isDone}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="stroke: rgb(var(--c-surface))" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>
              {/if}
            </span>
            <span class="text-base font-semibold leading-snug {isDone ? 'text-dim' : 'text-bright'}">{s.title}</span>
          </a>
        </li>
      {/each}
    </ul>
  {/if}

  {#if others.length}
    <p class="mt-8 text-sm text-dim max-w-[60ch]">{text(chapters, 'not-in-list')}</p>
    <ul class="mt-3 space-y-1">
      {#each others as s (s.id)}
        <li><a href="/checklist/{s.id}" class="inline-flex min-h-[44px] items-center text-base text-teal-light link-inline">{s.title}</a></li>
      {/each}
    </ul>
  {/if}

  <div class="mt-8">
    <a href={openList.href} class="btn-ghost">{openList.text}</a>
  </div>
</div>
