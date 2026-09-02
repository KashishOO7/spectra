<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types.js';
  import type { UserProfile, ScoredItem } from '$lib/types.js';
  import { deserializeGraph } from '$lib/content/deserialize.js';
  import { scoreAssessment } from '$lib/engine/scoring.js';
  import { loadProfile, createDefaultProfile, computeAdversaries } from '$lib/engine/store.js';
  import { decodeFingerprint } from '$lib/engine/fingerprint.js';
  import { noteBlocks } from '$lib/audit/helpers.js';

  export let data: PageData;

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

  let showTodo = true;
  let showDone = false;
  let showAside = false;
  let withDetail = true;

  $: groups = [
    ...(showTodo ? [{
      key: 'todo', title: 'Still to do', ticked: false, items: todo,
      blurb: 'In order, most useful first.'
    }] : []),
    ...(showDone ? [{
      key: 'done', title: 'Already done', ticked: true, items: done,
      blurb: 'Kept here as a record of what is set up.'
    }] : []),
    ...(showAside ? [{
      key: 'aside', title: 'Set aside', ticked: false, items: aside,
      blurb: 'Marked as not applying. Here in case that changes.'
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

    const outcome = scoreAssessment(graph, profile);
    todo  = outcome.all_items.filter(i => !i.is_implemented && !i.is_skipped);
    done  = outcome.all_items.filter(i => i.is_implemented);
    aside = outcome.all_items.filter(i => i.is_skipped && !i.is_implemented);
    loading = false;
  });
</script>

<svelte:head>
  <title>Print your list · Spectra</title>
  <meta name="description"
        content="Your steps as a printable page, so you can hand them to someone on paper." />
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-10">

  <div class="no-print mb-10">
    <h1 class="font-display text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
      Print your list
    </h1>
    <p class="text-body leading-relaxed mb-2">
      Choose what goes on the sheet, then print it or save it as a PDF. Made for handing to
      someone who would rather work from paper than from a website.
    </p>
    <p class="text-sm text-dim leading-relaxed mb-6">
      {#if source === 'link'}
        This is the setup that came in the link you opened. Nothing was saved to this device.
      {:else if source === 'device'}
        This is your own list, read from this browser.
      {:else}
        Nobody has set anything up here yet, so this is the list everyone starts with.
      {/if}
    </p>

    <fieldset class="border border-border rounded-lg p-4 mb-4">
      <legend class="label-mono px-2">What to put on the sheet</legend>
      <div class="flex flex-col gap-2.5">
        <label class="flex items-center gap-2.5 text-sm text-body cursor-pointer">
          <input type="checkbox" bind:checked={showTodo} class="accent-current" />
          Still to do <span class="text-dim">({todo.length})</span>
        </label>
        <label class="flex items-center gap-2.5 text-sm text-body cursor-pointer">
          <input type="checkbox" bind:checked={showDone} class="accent-current" />
          Already done <span class="text-dim">({done.length})</span>
        </label>
        <label class="flex items-center gap-2.5 text-sm text-body cursor-pointer">
          <input type="checkbox" bind:checked={showAside} class="accent-current" />
          Set aside <span class="text-dim">({aside.length})</span>
        </label>
        <label class="flex items-center gap-2.5 text-sm text-body cursor-pointer border-t border-border/60 pt-2.5 mt-1">
          <input type="checkbox" bind:checked={withDetail} class="accent-current" />
          Include how to do each one
        </label>
      </div>
    </fieldset>

    <div class="flex flex-wrap items-center gap-4">
      <button type="button" class="btn-primary" on:click={() => window.print()}
              disabled={loading || total === 0}>
        Print this page
      </button>
      <a href="/audit" class="text-sm text-dim hover:text-body underline underline-offset-2 transition-colors">
        Back to your list
      </a>
    </div>

    <p class="text-sm text-dim mt-3 leading-relaxed">
      With the instructions this runs to several sheets, which is what you want if you are handing
      it over. Without them it is a short list to tick off.
    </p>
  </div>

  <div class="playbook-sheet">
    <header class="mb-8 pb-4 border-b border-border">
      <div class="flex items-center gap-2.5 mb-3">
        <svg width="20" height="20" viewBox="0 0 28 28" fill="none" aria-hidden="true"
             class="text-amber-light">
          <path d="M14 3.5a10.5 10.5 0 0 0 0 21" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
          <path d="M14 3.5a10.5 10.5 0 0 1 0 21" stroke="currentColor" stroke-width="2.6"
                stroke-linecap="round" stroke-dasharray="1 4.4" opacity="0.85"/>
        </svg>
        <span class="font-display text-bright font-semibold tracking-tight">Spectra</span>
      </div>

      <h2 class="font-display text-xl font-bold text-white mb-1">Your list</h2>
      <p class="text-sm text-dim">
        {#if loading}
          Working it out.
        {:else if total === 0}
          Nothing to print with those choices.
        {:else if onlyTodo}
          {total} thing{total === 1 ? '' : 's'} to do, most useful first.
          Tick them off as you go.
        {:else}
          {total} step{total === 1 ? '' : 's'} on this sheet.
        {/if}
      </p>
    </header>

    {#if !loading}
      {#each groups as group (group.key)}
        {#if group.items.length}
          <section class="mb-8">
            {#if grouped}
              <h3 class="playbook-group font-display text-base font-semibold text-bright mb-1">
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
                      {step.simple_description ?? step.title}
                    </p>
                    {#if withDetail}
                      {#each howFor(step) as block}
                        <div class="mt-2">
                          {#if block.heading}
                            <p class="text-sm font-semibold text-dim">{block.heading}</p>
                          {/if}
                          {#each block.lines as line}
                            <p class="text-sm text-dim leading-relaxed">{line}</p>
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
          Tick at least one of the boxes above to put something on the sheet.
        </p>
      {/if}
    {/if}

    <footer class="mt-10 pt-4 border-t border-border text-sm text-dim">
      <p>Made with Spectra. spectra.fpszero.com</p>
      <p class="mt-1">Educational information, not legal or professional security advice.</p>
    </footer>
  </div>
</div>
