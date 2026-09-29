<script lang="ts">
  import type { PageData } from './$types.js';
  import type { Platform, UserProfile } from '$lib/types.js';
  import { platformDisplay, safeHref, noteBlocks, leadSentence } from '$lib/audit/helpers.js';
  import NoteLines from '$lib/components/NoteLines.svelte';
  import { TRACK_OPTIONS, ENVIRONMENT_OPTIONS } from '$lib/audit/constants.js';
  import Glossed from '$lib/components/Glossed.svelte';
  import BackLink from '$lib/components/BackLink.svelte';
  import ChapterStory from '$lib/components/ChapterStory.svelte';
  import { setContext, onMount } from 'svelte';
  import { GLOSS_SCOPE, glossScope } from '$lib/audit/glossScope.js';
  import { loadProfile, markImplemented, markSkipped, markSnoozed, addTimelineEvent, saveLastOpen } from '$lib/engine/store.js';
  import { assessFromAnywhere, invalidateAssessment } from '$lib/engine/lazyAssessment.js';
  import { bumpProfile } from '$lib/engine/session.js';
  import { nameThisPage } from '$lib/nav/trail.js';
  import note from '#spectra-wiki/page/step';
  import { text, link, fill } from '$lib/wiki/page.js';

  const openList = link(note, 'open-list');

  export let data: PageData;
  setContext(GLOSS_SCOPE, glossScope(data.item.id));

  $: item = data.item;
  $: lead = leadSentence(item);
  $: platformNotes = Object.entries(item.platform_notes ?? {}) as [Platform, string][];
  $: universal = platformNotes.length === 1 && platformNotes[0][0] === 'all';

  function split(body: string) {
    const blocks = noteBlocks(body);
    const at = blocks.findIndex(b => /^do this$/i.test((b.heading ?? '').trim()));
    const warned = blocks.slice(at + 1).some(b => /^(do not|don't|never)\b/i.test((b.heading ?? '').trim()));
    if (item.sensitive || at < 0 || warned) return { open: blocks, rest: [] };
    return { open: blocks.slice(0, at + 1), rest: blocks.slice(at + 1) };
  }

  $: situationNotes = Object.entries(item.track_notes ?? {})
    .filter(([t]) => t !== 'general')
    .map(([t, body]) => [TRACK_OPTIONS.find(o => o.value === t)?.label ?? t, body as string] as const);
  $: placeNotes = Object.entries(item.environment_notes ?? {})
    .map(([f, body]) => [ENVIRONMENT_OPTIONS.find(o => o.value === f)?.label ?? f, body as string] as const);

  $: metaDescription = item.description;
  $: canonical = `https://spectra.fpszero.com/checklist/${item.id}`;
  $: title = fill(note, 'title', { step: item.title });

  let profile: UserProfile | null = null;
  let tab: Platform | '' = '';
  let busy = false;
  $: isDone = !!profile?.implemented?.[item.id] && !profile?.skipped?.[item.id];
  $: isSkipped = !!profile?.skipped?.[item.id];
  $: isSnoozed = !!profile?.snoozed?.[item.id];
  $: waiting = data.dependsOn.find(d => d.hard_dependency && !profile?.implemented?.[d.id]);

  async function read() {
    try { profile = await loadProfile(); } catch { profile = null; }
    const mine = (profile?.platforms ?? []).find(p => platformNotes.some(([k]) => k === p));
    if (!tab || !platformNotes.some(([k]) => k === tab)) tab = mine ?? platformNotes[0]?.[0] ?? '';
  }

  let mounted = false;
  onMount(() => { mounted = true; });
  $: if (mounted && item) arrive(item.id);
  let scoreBefore: Promise<number | undefined> = Promise.resolve(undefined);
  function arrive(_id: string) {
    nameThisPage(`/checklist/${item.id}`, item.title);
    invalidateAssessment();
    scoreBefore = assessFromAnywhere().then(r => r?.overall_score).catch(() => undefined);
    tab = '';
    if (!item.sensitive) void saveLastOpen(item.id).catch(() => {});
    void read();
  }

  async function toggleDone() {
    if (busy || (waiting && !isDone)) return;
    busy = true;
    try {
      const doing = !isDone;
      await markImplemented(item.id, doing, item.version);
      const before = await scoreBefore;
      invalidateAssessment();
      bumpProfile();
      await read();
      if (doing) {
        const after = (await assessFromAnywhere())?.overall_score;
        await addTimelineEvent({
          type: 'implemented', item_id: item.id, item_title: item.title, category: item.category,
          score_before: before, score_after: after, formula: 2, timestamp: new Date().toISOString()
        });
      }
      invalidateAssessment();
      scoreBefore = assessFromAnywhere().then(r => r?.overall_score).catch(() => undefined);
    } finally { busy = false; }
  }
  async function toggleSkip() {
    await markSkipped(item.id, isSkipped ? '' : 'not_applicable');
    invalidateAssessment(); bumpProfile(); await read();
  }
  async function toggleSnooze() {
    await markSnoozed(item.id, !isSnoozed);
    invalidateAssessment(); bumpProfile(); await read();
  }
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={metaDescription} />
  <link rel="canonical" href={canonical} />
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-8">

  <BackLink parent={{ href: `/chapter/${data.chapter.id}`, name: data.chapter.name }}
    class="inline-flex items-center min-h-[44px] text-sm text-dim hover:text-body transition-colors mb-4" />

  <div class="mb-6">
    <div class="flex flex-wrap items-center gap-2 mb-3">
      <a href="/chapter/{data.chapter.id}" data-chapter-crumb class="inline-flex items-center min-h-[24px] text-sm font-semibold text-teal-light link-inline mr-1">{data.chapter.name}</a>
      {#if item.maturity_level === 1}
        <span class="pill-teal text-xs">{text(note, 'essential')}</span>
      {/if}
      {#if item.sensitive}<span class="pill-ink text-xs">{text(note, 'sensitive')}</span>{/if}
    </div>

    <h1 class="text-2xl font-semibold text-white" data-sentence>{lead}</h1>
  </div>

  {#if data.chapter.story}<div class="mb-8"><ChapterStory chapter={data.chapter.id} /></div>{/if}

  {#if data.dependsOn.length > 0}
  <div class="panel p-5 mb-6">
    <p class="label-mono mb-3">{text(note, 'first')}</p>
    <div class="space-y-2">
      {#each data.dependsOn as dep}
        <a href="/checklist/{dep.id}"
           class="block p-3 rounded-xl border border-border hover:border-teal transition-colors">
          <span class="text-sm text-body">{dep.title}</span>
          {#if dep.reason}<span class="block text-sm text-dim mt-0.5">{dep.reason}</span>{/if}
        </a>
      {/each}
    </div>
  </div>
  {/if}

  {#if platformNotes.length > 0}
  <div class="panel p-5 mb-6">
    <p class="label-section mb-4" role="heading" aria-level="2">{text(note, 'how')}</p>
    {#if !universal}
      <div class="flex flex-wrap gap-2 mb-5" role="tablist" aria-label={text(note, 'device-tabs')}>
        {#each platformNotes as [platform]}
          <button type="button" role="tab" aria-selected={tab === platform} on:click={() => (tab = platform)}
            class="px-3.5 min-h-[40px] rounded-full border text-sm font-semibold transition-colors
                   {tab === platform ? 'border-teal bg-teal-dim text-bright' : 'border-border text-body hover:border-muted'}">{platformDisplay(platform)}</button>
        {/each}
      </div>
    {/if}
    {#each platformNotes.filter(([k]) => universal || k === (tab || platformNotes[0][0])) as [platform, body] (platform)}
      {@const parts = split(body)}
      <div data-how-open>
        {#each parts.open as block, b}
          <div class="max-w-[68ch] {b > 0 ? 'mt-6 pt-6 border-t border-border' : ''}">
            {#if block.heading}<h3 class="text-lg font-semibold text-bright mb-2" data-sentence>{block.heading}</h3>{/if}
            <NoteLines lines={block.lines} size="base" />
          </div>
        {/each}
      </div>
      {#if parts.rest.length}
        <details class="mt-6 pt-5 border-t border-border" data-fold="how-more">
          <summary class="label-mono cursor-pointer text-dim hover:text-body transition-colors">{text(note, 'how-more')}</summary>
          {#each parts.rest as block, b}
            <div class="max-w-[68ch] {b > 0 ? 'mt-6 pt-6 border-t border-border' : 'mt-4'}">
              {#if block.heading}<h3 class="text-lg font-semibold text-bright mb-2" data-sentence>{block.heading}</h3>{/if}
              <NoteLines lines={block.lines} size="base" />
            </div>
          {/each}
        </details>
      {/if}
    {/each}
  </div>
  {/if}


  <div class="panel p-5 mb-8" data-mark>
    {#if isSkipped}
      <p class="text-base text-body">{text(note, 'set-aside')}</p>
      <button type="button" class="btn-ghost mt-3" on:click={toggleSkip}>{text(note, 'bring-back')}</button>
    {:else}
      {#if waiting && !isDone}
        <p class="text-sm text-dim mb-3">{fill(note, 'blocked', { title: waiting.title ?? '', reason: waiting.reason ?? '' })}</p>
      {/if}
      <div class="flex flex-wrap items-center gap-3">
        <button type="button" class={isDone ? 'btn-ghost' : 'btn-primary'} disabled={busy || (!!waiting && !isDone)} on:click={toggleDone}>
          {isDone ? text(note, 'undo') : text(note, 'mark-done')}
        </button>
        {#if isDone}<span class="text-sm font-semibold text-teal-light">{text(note, 'done')}</span>{/if}
        {#if !isDone}
          <button type="button" on:click={toggleSnooze} aria-pressed={isSnoozed}
            class="px-3 py-1.5 min-h-[36px] inline-flex items-center rounded-full border border-border text-sm text-dim hover:text-body hover:border-muted transition-colors">{text(note, 'not-now')}</button>
          <button type="button" on:click={toggleSkip}
            class="px-3 py-1.5 min-h-[36px] inline-flex items-center rounded-full border border-border text-sm text-dim hover:text-body hover:border-muted transition-colors">{text(note, 'not-for-me')}</button>
        {/if}
      </div>
      {#if isSnoozed && !isDone}<p class="text-sm text-dim mt-3">{text(note, 'snoozed')}</p>{/if}
    {/if}
  </div>

  <details class="panel p-5 mb-3" data-fold="why">
    <summary class="label-mono cursor-pointer text-dim hover:text-body transition-colors">{text(note, 'why')}</summary>
    <p class="mt-3 text-base text-body leading-relaxed max-w-[68ch]"><Glossed text={item.threat_narrative} /></p>
  </details>

  {#if data.guides.length > 0}
  <details class="panel p-5 mb-3" data-fold="where">
    <summary class="label-mono cursor-pointer text-dim hover:text-body transition-colors">{text(note, 'where-to-find')}</summary>
    <div class="mt-3 space-y-1.5">
      {#each data.guides as guide}
        <p class="text-sm">
          <a href={safeHref(guide.url)} target="_blank" rel="noopener noreferrer"
             class="text-teal-light link-inline">{guide.title} ↗</a>
          <span class="text-dim"> {guide.context}</span>
        </p>
      {/each}
    </div>
  </details>
  {/if}

  <details class="panel p-5 mb-3" data-fold="more">
    <summary class="label-mono cursor-pointer text-dim hover:text-body transition-colors">{text(note, 'more')}</summary>
    <div class="mt-4 space-y-4">
      <div>
        <p class="text-sm text-muted mb-1">{text(note, 'description')}</p>
        <p class="text-sm text-body leading-relaxed"><Glossed text={item.description} /></p>
      </div>
      {#if item.platforms?.length}
      <div>
        <p class="text-sm text-muted mb-1">{text(note, 'applies-to')}</p>
        <div class="flex flex-wrap gap-1.5">
          {#each item.platforms as p}<span class="pill-dim text-xs">{platformDisplay(p)}</span>{/each}
        </div>
      </div>
      {/if}
      {#each [[text(note, 'situation'), situationNotes], [text(note, 'place'), placeNotes]] as [heading, notes]}
        {#if notes.length}
        <div>
          <p class="text-sm text-muted mb-1">{heading}</p>
          <div class="space-y-2">
            {#each notes as [name, body]}
              <div class="bg-surface-2 border border-border rounded-xl p-4">
                <p class="label-section mb-1.5">{name}</p>
                {#each noteBlocks(body) as block}
                  {#if block.heading}
                    <p class="text-sm font-semibold text-bright mt-3 first:mt-0 mb-1">{block.heading}</p>
                  {/if}
                  <NoteLines lines={block.lines} />
                {/each}
              </div>
            {/each}
          </div>
        </div>
        {/if}
      {/each}
      {#if item.legal_notes?.length}
      <div>
        <p class="text-sm text-muted mb-1">{text(note, 'legal')}</p>
        {#each item.legal_notes as legal}
          <p class="text-sm text-body leading-relaxed">
            {#if legal.jurisdiction !== 'global'}<span class="text-dim">{legal.jurisdiction}:</span> {/if}<Glossed text={legal.note} />
          </p>
        {/each}
      </div>
      {/if}
    </div>
  </details>

  {#if data.related.length > 0}
  <details class="panel p-5 mb-3" data-fold="related">
    <summary class="label-mono cursor-pointer text-dim hover:text-body transition-colors">{text(note, 'related')}</summary>
    <div class="mt-3 space-y-2">
      {#each data.related as rel}
        <a href="/checklist/{rel.id}"
           class="block p-3 rounded-xl border border-border hover:border-teal transition-colors">
          <span class="text-sm text-body">{rel.title}</span>
          {#if rel.note}<span class="block text-sm text-dim mt-0.5">{rel.note}</span>{/if}
        </a>
      {/each}
    </div>
  </details>
  {/if}

  {#if item.sources?.length}
  <details class="panel p-5 mb-3" data-fold="sources">
    <summary class="label-mono cursor-pointer text-dim hover:text-body transition-colors">{text(note, 'sources')}</summary>
    <ul class="mt-3 space-y-2">
      {#each item.sources as source}
        <li>
          <a href={safeHref(source.url)} target="_blank" rel="noopener noreferrer"
             class="text-sm text-dim hover:text-teal-light link-inline">
            {source.title}
            <span class="text-muted">· {source.type.replace(/_/g, ' ')}</span>
          </a>
        </li>
      {/each}
    </ul>
  </details>
  {/if}

  <nav class="mt-8 grid gap-3 sm:grid-cols-2" aria-label={text(note, 'order-label')}>
    {#if data.prev}
      <a href="/checklist/{data.prev.id}" data-prev class="panel p-4 block hover:border-teal transition-colors">
        <span class="block text-sm text-dim">← {text(note, 'previous')}</span>
        <span class="block mt-1 text-base font-semibold text-bright leading-snug">{data.prev.title}</span>
      </a>
    {:else}<span></span>{/if}
    {#if data.next}
      <a href="/checklist/{data.next.id}" data-next class="panel p-4 block sm:text-right hover:border-teal transition-colors">
        <span class="block text-sm text-dim">{text(note, 'next')} →</span>
        <span class="block mt-1 text-base font-semibold text-bright leading-snug">{data.next.title}</span>
      </a>
    {/if}
  </nav>

  <div class="mt-6 flex flex-wrap gap-3">
    <a href={openList.href} class="btn-ghost text-sm">{openList.text}</a>
  </div>

</div>
