<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types.js';
  import type { UserProfile, ScoredItem, Track } from '$lib/types.js';
  import { deserializeGraph } from '$lib/content/deserialize.js';
  import { scoreAssessment } from '$lib/engine/scoring.js';
  import { loadProfile, createDefaultProfile, computeAdversaries } from '$lib/engine/store.js';
  import { decodeFingerprint } from '$lib/engine/fingerprint.js';
  import { noteBlocks, getActiveTrackNotes, leadSentence, lineParts } from '$lib/audit/helpers.js';
  import note from '#spectra-wiki/page/print';
  import { text, link, pieces, rows } from '$lib/wiki/page.js';

  export let data: PageData;

  const groupWords = rows(note, 'groups', ['todo', 'done', 'aside'] as const, 2);
  const back = link(note, 'back');

  interface Group {
    key: string;
    title: string;
    blurb: string;
    items: ScoredItem[];
    ticked: boolean;
  }

  let todo: ScoredItem[] = [];
  let done: ScoredItem[] = [];
  let aside: ScoredItem[] = [];

  let source: 'link' | 'device' | 'basics' = 'basics';
  let loading = true;
  let tracks: Track[] = ['general'];

  let showTodo = true;
  let showDone = false;
  let showAside = false;
  let withDetail = true;

  $: groups = [
    ...(showTodo ? [{
      key: 'todo', title: groupWords.todo[0], ticked: false, items: todo,
      blurb: groupWords.todo[1]
    }] : []),
    ...(showDone ? [{
      key: 'done', title: groupWords.done[0], ticked: true, items: done,
      blurb: groupWords.done[1]
    }] : []),
    ...(showAside ? [{
      key: 'aside', title: groupWords.aside[0], ticked: false, items: aside,
      blurb: groupWords.aside[1]
    }] : [])
  ] as Group[];

  $: total = groups.reduce((n, g) => n + g.items.length, 0);
  $: onlyTodo = groups.length === 1 && groups[0].key === 'todo';
  $: grouped = groups.length > 1;

  function howFor(item: ScoredItem): Array<{ heading: string | null; lines: string[] }> {
    const notes = item.platform_notes;
    if (!notes) return [];
    const key = notes.all !== undefined ? 'all' : Object.keys(notes)[0];
    const note = key ? notes[key as keyof typeof notes] : undefined;
    return note ? noteBlocks(note) : [];
  }

  function situationFor(item: ScoredItem): Array<{ heading: string | null; lines: string[] }> {
    return getActiveTrackNotes(item.track_notes, tracks).flatMap(([, note]) => noteBlocks(note));
  }

  onMount(async () => {
    const graph = deserializeGraph(data.graph);

    let profile: UserProfile;
    const decoded = decodeFingerprint(location.hash.slice(1));

    if (decoded) {
      profile = createDefaultProfile();
      profile.harms = decoded.harms;
      profile.tracks = decoded.tracks;
      profile.platforms = decoded.platforms;
      profile.adversariesManual = decoded.adversariesManual;
      profile.implemented = decoded.implemented;
      profile.skipped = decoded.skipped;
      profile.snoozed = decoded.snoozed;
      source = 'link';
    } else {
      const stored = await loadProfile();
      profile = stored ?? createDefaultProfile();
      source = stored ? 'device' : 'basics';
    }

    profile.adversaries = computeAdversaries(profile);
    tracks = profile.tracks ?? ['general'];

    const outcome = scoreAssessment(graph, profile);
    todo  = outcome.all_items.filter(i => !i.is_implemented && !i.is_skipped);
    done  = outcome.all_items.filter(i => i.is_implemented);
    aside = outcome.all_items.filter(i => i.is_skipped && !i.is_implemented);
    loading = false;
  });
</script>

<svelte:head>
  <title>{text(note, 'title')}</title>
  <meta name="description"
        content={text(note, 'description')} />
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-10">

  <div class="no-print mb-10">
    <h1 class="text-3xl font-bold text-white mb-3 tracking-tight">
      {text(note, 'heading')}
    </h1>
    <p class="text-body leading-relaxed mb-2">
      {text(note, 'intro')}
    </p>
    <p class="text-sm text-dim leading-relaxed mb-6">
      {#if source === 'link'}
        {text(note, 'from-link')}
      {:else if source === 'device'}
        {text(note, 'from-device')}
      {:else}
        {text(note, 'from-basics')}
      {/if}
    </p>

    {#if tracks.includes('known_person_risk')}
      <p class="text-sm text-teal-light border border-teal/30 bg-teal-dim/10 rounded px-3 py-2 mb-4 leading-relaxed">
        {text(note, 'known-person')}
      </p>
    {/if}

    <fieldset class="border border-border rounded-xl p-4 mb-4">
      <legend class="label-mono px-2">{text(note, 'choose')}</legend>
      <div class="flex flex-col gap-2.5">
        <label class="flex items-center gap-2.5 text-sm text-body cursor-pointer">
          <input type="checkbox" bind:checked={showTodo} class="accent-current" />
          {groupWords.todo[0]} <span class="text-dim">({todo.length})</span>
        </label>
        <label class="flex items-center gap-2.5 text-sm text-body cursor-pointer">
          <input type="checkbox" bind:checked={showDone} class="accent-current" />
          {groupWords.done[0]} <span class="text-dim">({done.length})</span>
        </label>
        <label class="flex items-center gap-2.5 text-sm text-body cursor-pointer">
          <input type="checkbox" bind:checked={showAside} class="accent-current" />
          {groupWords.aside[0]} <span class="text-dim">({aside.length})</span>
        </label>
        <label class="flex items-center gap-2.5 text-sm text-body cursor-pointer border-t border-border/60 pt-2.5 mt-1">
          <input type="checkbox" bind:checked={withDetail} class="accent-current" />
          {text(note, 'with-detail')}
        </label>
      </div>
    </fieldset>

    <div class="flex flex-wrap items-center gap-4">
      <button type="button" class="btn-primary" on:click={() => window.print()}
              disabled={loading || total === 0}>
        {text(note, 'print')}
      </button>
      <a href={back.href} data-print-back class="inline-flex items-center min-h-[24px] text-sm text-dim hover:text-body underline underline-offset-2 transition-colors">
        {back.text}
      </a>
    </div>

    <p class="text-sm text-dim mt-3 leading-relaxed">
      {text(note, 'sheets')}
    </p>
  </div>

  <div class="playbook-sheet">
    <header class="mb-8 pb-4 border-b border-border">
      <div class="flex items-center gap-2.5 mb-3">
        <svg width="20" height="20" viewBox="0 0 28 28" fill="none" aria-hidden="true"
             class="text-teal-light">
          <path d="M14 3.5a10.5 10.5 0 0 0 0 21" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
          <path d="M14 3.5a10.5 10.5 0 0 1 0 21" stroke="currentColor" stroke-width="2.6"
                stroke-linecap="round" stroke-dasharray="1 4.4" opacity="0.85"/>
        </svg>
        <span class="text-bright font-semibold tracking-tight">{text(note, 'mark')}</span>
      </div>

      <h2 class="text-lg font-bold text-white mb-1">{text(note, 'sheet-heading')}</h2>
      <p class="text-sm text-dim">
        {#if loading}
          {text(note, 'working')}
        {:else if total === 0}
          {text(note, 'nothing')}
        {:else if onlyTodo}
          {#each pieces(note, total === 1 ? 'count-todo-one' : 'count-todo-many', { count: total }) as piece}{piece}{/each}
        {:else}
          {#each pieces(note, total === 1 ? 'count-one' : 'count-many', { count: total }) as piece}{piece}{/each}
        {/if}
      </p>
    </header>

    {#if !loading}
      {#each groups as group (group.key)}
        {#if group.items.length}
          <section class="mb-8">
            {#if grouped}
              <h3 class="playbook-group text-base font-semibold text-bright mb-1">
                {group.title}
              </h3>
              <p class="text-sm text-dim mb-4">{group.blurb}</p>
            {/if}

            <ol class="space-y-6">
              {#each group.items as step, i (step.id)}
                <li class="playbook-step flex gap-4">
                  <span class="playbook-tick {group.ticked ? 'playbook-tick--done' : ''}"
                        aria-hidden="true"></span>
                  <div class="min-w-0 flex-1">
                    <p class="playbook-line text-body font-medium leading-snug">
                      <span class="text-dim tabular-nums mr-1">{i + 1}.</span>
                      {leadSentence(step)}
                    </p>
                    {#if withDetail}
                      {#each howFor(step) as block}
                        <div class="mt-2">
                          {#if block.heading}
                            <p class="text-sm font-semibold text-dim">{block.heading}</p>
                          {/if}
                          {#each lineParts(block.lines) as part}
                            {#if part.kind === 'p'}
                              <p class="text-sm text-dim leading-relaxed">{part.text}</p>
                            {:else}
                              <svelte:element this={part.kind} class="text-sm text-dim leading-relaxed pl-5 {part.kind === 'ol' ? 'list-decimal' : 'list-disc'}" data-print-list>
                                {#each part.items as item}<li>{item}</li>{/each}
                              </svelte:element>
                            {/if}
                          {/each}
                        </div>
                      {/each}
                      {#each situationFor(step) as block}
                        <div class="mt-2">
                          {#if block.heading}
                            <p class="text-sm font-semibold text-dim">{block.heading}</p>
                          {/if}
                          {#each lineParts(block.lines) as part}
                            {#if part.kind === 'p'}
                              <p class="text-sm text-dim leading-relaxed">{part.text}</p>
                            {:else}
                              <svelte:element this={part.kind} class="text-sm text-dim leading-relaxed pl-5 {part.kind === 'ol' ? 'list-decimal' : 'list-disc'}" data-print-list>
                                {#each part.items as item}<li>{item}</li>{/each}
                              </svelte:element>
                            {/if}
                          {/each}
                        </div>
                      {/each}
                    {/if}
                  </div>
                </li>
              {/each}
            </ol>
          </section>
        {/if}
      {/each}

      {#if total === 0}
        <p class="text-body">
          {text(note, 'tick-one')}
        </p>
      {/if}
    {/if}

    <footer class="mt-10 pt-4 border-t border-border text-sm text-dim">
      <p>{text(note, 'made-with')}</p>
      <p class="mt-1">{text(note, 'not-advice')}</p>
    </footer>
  </div>
</div>
