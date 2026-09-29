<script lang="ts">
  import type { PageData } from './$types.js';
  import { onMount, tick } from 'svelte';
  import { loadProfile, markImplemented, saveStart } from '$lib/engine/store.js';
  import { assessFromAnywhere, invalidateAssessment } from '$lib/engine/lazyAssessment.js';
  import { upNext } from '$lib/engine/next.js';
  import { settle } from '$lib/nav/trail.js';
  import start from '#spectra-wiki/page/start';
  import { text, fill, named, link } from '$lib/wiki/page.js';

  export let data: PageData;

  const questions = named(start, 'questions');
  const steps = data.steps.map(s => ({ ...s, question: questions[s.id] }));
  const openList = link(start, 'open-list');

  type Answer = 'yes' | 'no' | 'unsure';
  let at = 0;
  let answers: Record<string, Answer> = {};
  let tickedHere = new Set<string>();
  let first: { id: string; title: string } | null = null;
  let ready = false;

  const inOrder = () => Object.fromEntries(steps.filter(s => answers[s.id]).map(s => [s.id, answers[s.id]]));

  onMount(async () => {
    try {
      const kept = (await loadProfile())?.start;
      if (kept) {
        answers = Object.fromEntries(Object.entries(kept.answers).filter(([id]) => steps.some(s => s.id === id)));
        tickedHere = new Set(kept.ticked);
        at = steps.findIndex(s => !answers[s.id]);
        if (at < 0) at = steps.length;
      }
    } catch {
    }
    if (at >= steps.length) await findFirst();
    ready = true;
    await tick();
    settle();
  });

  async function answer(a: Answer) {
    const s = steps[at];
    answers = { ...answers, [s.id]: a };
    try {
      const profile = await loadProfile();
      const done = !!profile?.implemented?.[s.id];
      if (a === 'yes' && !done) {
        await markImplemented(s.id, true, s.version);
        tickedHere.add(s.id);
      } else if (a !== 'yes' && tickedHere.has(s.id)) {
        await markImplemented(s.id, false);
        tickedHere.delete(s.id);
      }
      await saveStart({ answers: inOrder(), ticked: [...tickedHere] });
    } catch {
    }
    at += 1;
    if (at >= steps.length) await findFirst();
  }

  async function findFirst() {
    invalidateAssessment();
    const result = await assessFromAnywhere();
    const pick = result ? upNext(result.all_items) : null;
    const fallback = open[0] ?? null;
    first = pick ? { id: pick.id, title: pick.title } : fallback && { id: fallback.id, title: fallback.title };
  }

  async function again() {
    at = 0;
    answers = {};
    first = null;
    try { await saveStart({ answers: {}, ticked: [...tickedHere] }); } catch {  }
  }

  $: open = steps.filter(s => answers[s.id] && answers[s.id] !== 'yes');
  $: yes = steps.filter(s => answers[s.id] === 'yes');
  $: finished = at >= steps.length;
  $: firstIsAnswer = !!first && open.some(s => s.id === first!.id);
  $: rest = open.filter(s => s.id !== first?.id);
</script>

<svelte:head>
  <title>{text(start, 'title')}</title>
  <meta name="description" content={text(start, 'description')} />
  <link rel="canonical" href="https://spectra.fpszero.com/start" />
</svelte:head>

<div class="two max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16" data-ready={ready ? 'true' : null}>
  <div>
    <h1 class="text-3xl font-bold text-white mb-3">{text(start, 'heading')}</h1>
    <p class="text-lg text-body max-w-[40ch]">{text(start, 'lead')}</p>
  </div>

  <div class="panel p-6 sm:p-7">
    {#if !finished}
      {@const s = steps[at]}
      <div class="grid gap-1.5 mb-5" style="grid-template-columns: repeat({steps.length}, 1fr)" aria-hidden="true">
        {#each steps as _, i}<span class="h-1.5 rounded-full {i < at ? 'bg-teal' : 'bg-viz-off'}"></span>{/each}
      </div>
      <p class="text-sm text-dim">{fill(start, 'position', { n: at + 1, total: steps.length })}</p>
      <h2 class="mt-2 text-lg font-semibold text-bright min-h-[4.2em]" data-sentence data-question={s.id}>{s.question}</h2>
      <div class="mt-6 grid grid-cols-3 gap-3">
        <button type="button" class="btn-ghost px-3" on:click={() => answer('yes')}>{text(start, 'yes')}</button>
        <button type="button" class="btn-ghost px-3" on:click={() => answer('no')}>{text(start, 'no')}</button>
        <button type="button" class="btn-ghost px-3" on:click={() => answer('unsure')}>{text(start, 'unsure')}</button>
      </div>
      <p class="mt-4 text-sm text-dim">{text(start, 'unsure-note')}</p>
      {#if at > 0}
        <button type="button" class="mt-2 min-h-[44px] text-sm text-body hover:text-bright transition-colors"
                on:click={() => (at -= 1)}>{text(start, 'previous')}</button>
      {/if}
    {:else}
      <p class="text-sm text-dim">{text(start, 'result')}</p>
      {#if open.length}
        <h2 class="mt-2 text-2xl font-semibold text-bright" data-sentence>
          {open.length === 1 ? text(start, 'to-fix-one') : fill(start, 'to-fix-many', { count: open.length })}
        </h2>
        {#if first}
        <div class="mt-5 rounded-2xl bg-teal-dim p-5" data-first={first.id}>
          <p class="text-sm font-semibold text-teal-light">{firstIsAnswer ? text(start, 'first') : text(start, 'first-before')}</p>
          <p class="mt-1 text-lg font-semibold text-bright">{first.title}</p>
          <a href="/checklist/{first.id}" class="btn-primary btn-sm mt-4">{text(start, 'show-me-how')}</a>
        </div>
        {/if}
      {:else}
        <h2 class="mt-2 text-2xl font-semibold text-bright" data-sentence>{text(start, 'all-done')}</h2>
      {/if}

      <ul class="mt-4 space-y-2">
        {#each rest as s}
          <li><a href="/checklist/{s.id}" data-result={s.id}
                 class="flex items-center gap-3 min-h-[48px] px-4 py-2 rounded-xl border border-border bg-surface hover:border-teal transition-colors">
            <span class="w-5 h-5 rounded-full border-2 border-muted flex-shrink-0" aria-hidden="true"></span>
            <span class="text-base text-bright">{s.title}</span>
          </a></li>
        {/each}
        {#each yes as s}
          <li class="flex items-center gap-3 min-h-[48px] px-4 py-2" data-result={s.id}>
            <span class="w-5 h-5 rounded-full bg-teal flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="rgb(var(--c-surface))" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="stroke: rgb(var(--c-surface))"><path d="m2.5 6.5 2.5 2.5 4.5-5.5"/></svg>
            </span>
            <span class="text-base text-dim">{s.title}</span>
            <span class="ml-auto text-sm text-teal-light">{text(start, 'done')}</span>
          </li>
        {/each}
      </ul>

      <div class="mt-6 flex flex-wrap gap-3">
        <button type="button" class="btn-ghost btn-sm" on:click={again}>{text(start, 'again')}</button>
        <a href={openList.href} class="btn-ghost btn-sm">{openList.text}</a>
      </div>
    {/if}
  </div>
</div>

<style>
  .two { display: grid; gap: 2rem; align-items: start; }
  @media (min-width: 900px) { .two { grid-template-columns: 1fr 1fr; gap: 2.5rem; } }
</style>
