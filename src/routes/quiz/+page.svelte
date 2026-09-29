<script lang="ts">
  import { onMount, tick } from 'svelte';
  import type { PageData } from './$types.js';
  import { loadProfile, saveSEQuizResult, addTimelineEvent, saveProgress } from '$lib/engine/store.js';
  import { SITUATIONS, quizResult, lastPicks, type Picks } from '$lib/audit/tricks.js';
  import { EMOTIONAL_REGISTER_LABELS } from '$lib/audit/constants.js';
  import { settle } from '$lib/nav/trail.js';
  import tricks from '#spectra-wiki/page/tricks';
  import { text, fill, link } from '$lib/wiki/page.js';
  import type { SEQuizResult } from '$lib/types.js';

  export let data: PageData;
  const openList = link(tricks, 'open-list');

  let previous: SEQuizResult | null = null;
  let started = false;
  let at = 0;
  let picks: Picks = {};
  let finished = false;
  let ready = false;
  let revealEl: HTMLDivElement;

  onMount(async () => {
    try {
      const profile = await loadProfile();
      previous = profile?.se_quiz ?? null;
      const saved = profile?.in_progress?.quiz;
      const last = lastPicks(previous);
      if (saved && SITUATIONS[saved.at]) {
        ({ at, picks } = saved);
        started = true;
      } else if (last) {
        picks = last;
        started = finished = true;
      }
    } catch {
    }
    ready = true;
    await tick();
    settle();
  });

  $: s = SITUATIONS[at];
  $: picked = s ? picks[s.id] : undefined;
  $: lastRun = previous?.quiz_at ?? (previous && Object.keys(previous.answers ?? {}).some(k => k.startsWith('q_')) ? previous.completed_at : undefined);

  let saving: Promise<void> = Promise.resolve();
  function keep() {
    const state = { at, picks };
    saving = saving.then(() => saveProgress('quiz', state)).catch(() => {});
  }

  function begin() {
    started = true;
    void keep();
  }

  async function pick(p: 0 | 1 | 2) {
    if (picked !== undefined) return;
    picks = { ...picks, [s.id]: p };
    void keep();
    await tick();
    if (!revealEl) return;
    revealEl.focus({ preventScroll: true });
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    revealEl.scrollIntoView({ block: 'nearest', behavior: still ? 'auto' : 'smooth' });
  }

  async function next() {
    if (at < SITUATIONS.length - 1) { at += 1; void keep(); return; }
    finished = true;
    const result = quizResult(previous, picks);
    await saving;
    try {
      await saveSEQuizResult(result);
      await saveProgress('quiz', null);
      await addTimelineEvent({ type: 'se_quiz', item_title: fill(tricks, 'end', { right: safest, total: SITUATIONS.length }), href: '/quiz' });
      previous = result;
    } catch {
    }
  }

  function again() {
    at = 0;
    picks = {};
    finished = false;
    begin();
  }

  $: safest = SITUATIONS.filter(x => picks[x.id] === 2).length;
  $: openTo = SITUATIONS.filter(x => picks[x.id] !== undefined && picks[x.id] !== 2);
  const date = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
</script>

<svelte:head>
  <title>{text(tricks, 'title')}</title>
  <meta name="description" content={text(tricks, 'description')} />
  <link rel="canonical" href="https://spectra.fpszero.com/quiz" />
</svelte:head>

<div class="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16" data-ready={ready ? 'true' : null}>
  <h1 class="text-3xl font-bold text-white mb-3">{text(tricks, 'heading')}</h1>

  {#if !started}
    <p class="text-lg text-body">{text(tricks, 'lead')}</p>
    <p class="mt-4 text-base text-body">{text(tricks, 'why')}</p>
    {#if lastRun}<p class="mt-4 text-sm text-dim" data-last-run>{fill(tricks, 'last-run', { date: date(lastRun) })}</p>{/if}
    <button type="button" class="btn-primary mt-6" on:click={begin}>{text(tricks, 'start')}</button>

  {:else if !finished}
    <div class="mt-4 flex gap-2" aria-hidden="true">
      {#each SITUATIONS as _, i}<span class="h-2 w-8 rounded-full {i < at || (i === at && picked !== undefined) ? 'bg-teal' : 'bg-viz-off'}"></span>{/each}
    </div>
    <p class="mt-5 text-sm text-dim">{fill(tricks, 'position', { n: at + 1, total: SITUATIONS.length })}</p>
    <p class="mt-2 text-lg text-bright" data-situation={s.id}>{s.text}</p>

    <p class="mt-6 text-base font-semibold text-bright">{text(tricks, 'ask')}</p>
    <div class="mt-3 grid gap-2.5" role="group" aria-label={text(tricks, 'ask')}>
      {#each s.order as i}
        {@const chosen = picked === i}
        <button type="button" data-answer={i} disabled={picked !== undefined && !chosen}
          aria-pressed={chosen}
          class="text-left min-h-[52px] px-4 py-3 rounded-xl border text-base transition-colors
                 {chosen ? 'border-teal bg-teal-dim text-bright' : 'border-border bg-surface text-body hover:border-muted'}
                 disabled:opacity-60"
          on:click={() => pick(i)}>{s.answers[i]}</button>
      {/each}
    </div>

    {#if picked !== undefined}
      <div class="mt-6 panel p-5 animate-fade-up focus:outline-none scroll-mt-24 scroll-mb-24" aria-live="polite" tabindex="-1"
           bind:this={revealEl} data-reveal>
        {#if picked === 2}
          <p class="text-base font-semibold text-bright">{text(tricks, 'picked-safest')}</p>
        {:else}
          <p class="text-sm font-semibold text-dim">{text(tricks, 'safest')}</p>
          <p class="mt-1 text-base font-semibold text-bright">{s.answers[2]}</p>
        {/if}
        <p class="mt-4 text-sm font-semibold text-dim">{text(tricks, 'feeling-label')}</p>
        <p class="mt-1 text-base font-semibold text-bright" data-feeling={s.register}>{EMOTIONAL_REGISTER_LABELS[s.register]}</p>
        <p class="mt-3 text-sm font-semibold text-dim">{text(tricks, 'why-label')}</p>
        <p class="mt-1 text-base text-body">{s.why}</p>
        <p class="mt-3 text-sm font-semibold text-dim">{s.also ? text(tricks, 'steps-label') : text(tricks, 'step-label')}</p>
        {#each [s.step, s.also].filter(Boolean) as id}
          <a href="/checklist/{id}" class="mt-1 flex min-h-[44px] items-center text-base font-semibold text-teal-light link-inline">{data.steps[id ?? '']}</a>
        {/each}
        <div class="mt-4">
          <button type="button" class="btn-primary" on:click={next}>
            {at < SITUATIONS.length - 1 ? text(tricks, 'next') : text(tricks, 'finish')}
          </button>
        </div>
      </div>
    {/if}

  {:else}
    <div class="mt-4 panel p-6 sm:p-8" data-quiz-end>
      <h2 class="text-2xl font-semibold text-bright" data-sentence>{fill(tricks, 'end', { right: safest, total: SITUATIONS.length })}</h2>
      {#if lastRun}<p class="mt-2 text-sm text-dim" data-last-run>{fill(tricks, 'last-run', { date: date(lastRun) })}</p>{/if}
      {#if openTo.length}
        <p class="mt-5 text-sm font-semibold text-dim">{text(tricks, 'end-missed')}</p>
        <ul class="mt-2 space-y-2">
          {#each openTo as x}
            <li>
              <p class="text-base font-semibold text-bright">{EMOTIONAL_REGISTER_LABELS[x.register]}</p>
              <a href="/checklist/{x.step}" class="inline-flex min-h-[44px] items-center text-base text-teal-light link-inline">{data.steps[x.step]}</a>
            </li>
          {/each}
        </ul>
        <p class="mt-3 text-base text-body">{text(tricks, 'end-moved')}</p>
      {:else}
        <p class="mt-3 text-base text-body">{text(tricks, 'end-none')}</p>
      {/if}
      <div class="mt-6 flex flex-wrap gap-3">
        <button type="button" class="btn-primary" on:click={again}>{text(tricks, 'again')}</button>
        <a href={openList.href} class="btn-ghost">{openList.text}</a>
      </div>
    </div>
  {/if}
</div>
