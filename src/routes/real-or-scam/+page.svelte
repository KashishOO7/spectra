<script lang="ts">
  import { onMount, tick } from 'svelte';
  import type { PageData } from './$types.js';
  import { loadProfile, saveSEQuizResult, addTimelineEvent, saveProgress } from '$lib/engine/store.js';
  import { GAME_MESSAGES, pickRound, roundResult, isRight, verdictLine, type GameMessage } from '$lib/audit/game.js';
  import { EMOTIONAL_REGISTER_LABELS } from '$lib/audit/constants.js';
  import { settle } from '$lib/nav/trail.js';
  import game from '#spectra-wiki/page/real-or-scam';
  import { text, fill, link } from '$lib/wiki/page.js';
  import PhoneScreen from '$lib/components/PhoneScreen.svelte';
  import type { SEQuizResult } from '$lib/types.js';

  export let data: PageData;
  const openList = link(game, 'open-list');
  const quizLink = link(game, 'quiz-link');

  let previous: SEQuizResult | null = null;
  let round: GameMessage[] = pickRound(null);
  let at = 0;
  let said: Record<string, 'real' | 'scam'> = {};
  let finished = false;
  let ready = false;

  onMount(async () => {
    let saved;
    try {
      const profile = await loadProfile();
      previous = profile?.se_quiz ?? null;
      saved = profile?.in_progress?.game;
    } catch {
    }
    const kept = saved?.round.map(id => GAME_MESSAGES.find(m => m.id === id));
    if (saved && kept?.every(Boolean) && kept[saved.at]) {
      round = kept as GameMessage[];
      ({ at, said } = saved);
    } else {
      round = pickRound(previous);
    }
    ready = true;
    await tick();
    settle();
  });

  let saving: Promise<void> = Promise.resolve();
  function keep() {
    const state = { round: round.map(x => x.id), at, said };
    saving = saving.then(() => saveProgress('game', state)).catch(() => {});
  }

  $: m = round[at];
  $: answered = m ? said[m.id] : undefined;

  let revealEl: HTMLDivElement;
  async function call(c: 'real' | 'scam') {
    if (answered) return;
    said = { ...said, [m.id]: c };
    keep();
    await tick();
    showReveal(revealEl);
  }

  function showReveal(el: HTMLElement | undefined) {
    if (!el) return;
    el.focus({ preventScroll: true });
    if (matchMedia('(min-width: 900px)').matches) return;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ block: 'start', behavior: still ? 'auto' : 'smooth' });
  }

  async function next() {
    if (at < round.length - 1) { at += 1; keep(); return; }
    finished = true;
    const result = roundResult(previous, said);
    await saving;
    try {
      await saveSEQuizResult(result);
      await saveProgress('game', null);
      const right = round.filter(x => isRight(x, said[x.id])).length;
      await addTimelineEvent({ type: 'se_quiz', item_title: fill(game, 'end', { right, total: round.length }), href: '/real-or-scam' });
      previous = result;
    } catch {
    }
  }

  function again() {
    round = pickRound(previous);
    at = 0;
    said = {};
    finished = false;
  }

  $: right = round.filter(x => said[x.id] && isRight(x, said[x.id])).length;
  $: missed = round.filter(x => x.verdict === 'scam' && said[x.id] && !isRight(x, said[x.id]));
  $: movesSteps = missed.some(x => data.moving.includes(x.register ?? ''));
</script>

<svelte:head>
  <title>{text(game, 'title')}</title>
  <meta name="description" content={text(game, 'description')} />
  <link rel="canonical" href="https://spectra.fpszero.com/real-or-scam" />
</svelte:head>

<div class="two max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16" data-ready={ready ? 'true' : null}>
  <div class="intro">
    <h1 class="text-3xl font-bold text-white mb-3">{text(game, 'heading')}</h1>
    <p class="text-lg text-body max-w-[40ch]">{text(game, 'lead')}</p>
    {#if !finished}
      <div class="mt-6 flex gap-2" aria-hidden="true">
        {#each round as _, i}<span class="h-2 w-10 rounded-full {i < at || (i === at && answered) ? 'bg-teal' : 'bg-viz-off'}"></span>{/each}
      </div>
    {/if}
  </div>

  {#if !finished && answered}
    <div class="reveal panel p-5 animate-fade-up focus:outline-none scroll-mt-24" aria-live="polite" tabindex="-1"
         bind:this={revealEl} data-reveal>
      <div class="flex flex-wrap items-center gap-2 mb-3">
        {#if m.verdict === 'scam'}
          <span data-scam-tag class="pill bg-red-dim text-red-light">{text(game, 'scam')}</span>
        {:else}
          <span class="pill-teal">{text(game, 'real')}</span>
        {/if}
        <span class="text-sm font-semibold text-bright">{text(game, verdictLine(m, answered))}</span>
      </div>
      {#if m.register}
        <p class="text-sm font-semibold text-dim">{text(game, 'feeling-label')}</p>
        <p class="mt-1 text-base font-semibold text-bright" data-feeling={m.register}>{EMOTIONAL_REGISTER_LABELS[m.register]}</p>
      {/if}
      <p class="mt-3 text-sm font-semibold text-dim">{m.verdict === 'scam' ? text(game, 'why-scam') : text(game, 'why-real')}</p>
      <p class="mt-1 text-base text-body">{m.why}</p>
      {#if m.step}
        <p class="mt-3 text-sm font-semibold text-dim">{text(game, 'step-label')}</p>
        <a href="/checklist/{m.step}" class="mt-1 inline-flex min-h-[44px] items-center text-base font-semibold text-teal-light link-inline">{data.steps[m.step]}</a>
      {/if}
      <div class="mt-4">
        <button type="button" class="btn-primary" on:click={next}>
          {at < round.length - 1 ? text(game, 'next') : text(game, 'finish')}
        </button>
      </div>
    </div>
  {/if}

  <div class="board">
  {#if !finished}
    <div class="max-w-[400px] mx-auto">
      <p class="text-sm text-dim">{fill(game, 'position', { n: at + 1, total: round.length })}</p>
      <p class="mt-1 mb-3 text-base text-body">{m.from}</p>
      <PhoneScreen {m} sponsored={text(game, 'sponsored')} />
      {#if !answered}
        <p class="mt-5 text-base font-semibold text-bright">{text(game, 'ask')}</p>
        <div class="mt-2.5 grid grid-cols-2 gap-2.5">
          <button type="button" class="btn-ghost" on:click={() => call('real')}>{text(game, 'real')}</button>
          <button type="button" class="btn-ghost" on:click={() => call('scam')}>{text(game, 'scam')}</button>
        </div>
      {/if}
    </div>
  {:else}
    <div class="panel p-6 sm:p-8" data-round-end>
      <h2 class="text-2xl font-semibold text-bright" data-sentence>{fill(game, 'end', { right, total: round.length })}</h2>
      {#if missed.length}
        <p class="mt-5 text-sm font-semibold text-dim">{text(game, 'end-missed')}</p>
        <ul class="mt-2 space-y-1">
          {#each missed as x}<li class="text-base text-bright">{EMOTIONAL_REGISTER_LABELS[x.register ?? '']}</li>{/each}
        </ul>
        {#if movesSteps}<p class="mt-3 text-base text-body">{text(game, 'end-moved')}</p>{/if}
      {:else}
        <p class="mt-3 text-base text-body">{text(game, 'end-none')}</p>
      {/if}
      <div class="mt-6 flex flex-wrap gap-3">
        <button type="button" class="btn-primary" on:click={again}>{text(game, 'again')}</button>
        <a href={openList.href} class="btn-ghost">{openList.text}</a>
        <a href={quizLink.href} class="btn-ghost" data-quiz-link>{quizLink.text}</a>
      </div>
    </div>
  {/if}
  </div>
</div>

<style>
  .two { display: grid; gap: 2rem; align-items: start; grid-template-areas: 'intro' 'board' 'reveal'; }
  .intro { grid-area: intro; }
  .board { grid-area: board; }
  .reveal { grid-area: reveal; }
  @media (min-width: 900px) {
    .two { grid-template-columns: 0.9fr 1.1fr; grid-template-rows: auto 1fr; gap: 2rem 2.5rem;
           grid-template-areas: 'intro board' 'reveal board'; }
  }
</style>
