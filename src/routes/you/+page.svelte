<script lang="ts">
  import { onMount, tick } from 'svelte';
  import type { Snapshot } from './$types.js';
  import type { AssessmentResult, UserProfile } from '$lib/types.js';
  import { loadProfile } from '$lib/engine/store.js';
  import { assessFromAnywhere, invalidateAssessment } from '$lib/engine/lazyAssessment.js';
  import { profileVersion } from '$lib/engine/session.js';
  import { harmBreakdown, COVERED_MEANS } from '$lib/engine/coverage.js';
  import { combine, sourcesOf, NO_SIGNAL } from '$lib/engine/feelings.js';
  import { CHAPTERS, chapterProgress } from '$lib/audit/chapters.js';
  import { EMOTIONAL_REGISTER_LABELS } from '$lib/audit/constants.js';
  import { settle } from '$lib/nav/trail.js';
  import BackLink from '$lib/components/BackLink.svelte';
  import SetupPanel from '$lib/components/SetupPanel.svelte';
  import you from '#spectra-wiki/page/you';
  import chrome from '#spectra-wiki/page/header-and-footer';
  import { text, fill, link, named } from '$lib/wiki/page.js';

  const home = { href: '/', name: named(chrome, 'back-names').home };
  const [pastGame, pastQuiz, openMap, journey, print] =
    ['past-game', 'past-quiz', 'open-map', 'journey', 'print'].map(k => link(you, k));

  let profile: UserProfile | null = null;
  let result: AssessmentResult | null = null;
  let ready = false;
  type Opened = { past: boolean; protect: boolean; setup: boolean; more: boolean };
  let opened: Opened = { past: true, protect: true, setup: true, more: true };
  let restored = false;
  export const snapshot: Snapshot<Opened> = {
    capture: () => ({ ...opened }),
    restore: v => { opened = v; restored = true; }
  };

  async function read() {
    try { profile = await loadProfile(); } catch { profile = null; }
    invalidateAssessment();
    result = await assessFromAnywhere();
  }

  onMount(() => {
    const wide = matchMedia('(min-width: 640px)').matches;
    if (!restored) opened = { past: wide, protect: wide, setup: wide, more: wide };
    let first = true;
    const stop = profileVersion.subscribe(() => {
      if (first) { first = false; return; }
      void read();
    });
    void read().then(async () => { ready = true; await tick(); settle(); });
    return stop;
  });

  $: chapters = result ? CHAPTERS.map(c => chapterProgress(c, result!)).filter(c => c.total > 0) : [];
  $: finished = chapters.filter(c => c.done === c.total).length;
  $: lastOpen = profile?.last_open?.id;
  $: lastStep = lastOpen ? result?.all_items.find(i => i.id === lastOpen) : undefined;
  $: resumable = !!lastStep && !lastStep.is_implemented && !lastStep.is_skipped;
  $: continueHref = resumable ? `/checklist/${lastStep!.id}` : '/audit';

  $: played = !!profile?.se_quiz;
  $: signals = profile?.se_quiz ? combine(sourcesOf(profile.se_quiz)) : {};
  $: past = Object.entries(signals).filter(([, v]) => v > NO_SIGNAL).sort((a, b) => b[1] - a[1]).map(([f]) => f);

  $: harms = harmBreakdown(result);

  const date = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
</script>

<svelte:head>
  <title>{text(you, 'title')}</title>
  <meta name="description" content={text(you, 'description')} />
  <link rel="canonical" href="https://spectra.fpszero.com/you" />
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-8" data-ready={ready ? 'true' : null}>
  <BackLink parent={home} class="inline-flex items-center min-h-[44px] text-sm text-dim hover:text-body transition-colors mb-4" />
  <h1 class="text-3xl font-bold text-white">{text(you, 'heading')}</h1>
  <p class="mt-2 text-lg text-body max-w-[52ch]">{text(you, 'lead')}</p>

  <section class="panel p-5 sm:p-6 mt-8" data-you-section="where" aria-labelledby="where-heading">
    <h2 id="where-heading" class="text-lg font-semibold text-bright">{text(you, 'where-heading')}</h2>
    <div class="mt-4 grid grid-cols-3 gap-3">
      <div>
        <p class="text-2xl font-semibold text-bright tabular-nums" data-steps-done>{result ? fill(you, 'count', { done: result.total_implemented, total: result.total_applicable }) : ''}</p>
        <p class="text-sm text-dim">{text(you, 'steps-done')}</p>
      </div>
      <div>
        <p class="text-2xl font-semibold text-bright tabular-nums">{result ? fill(you, 'count', { done: finished, total: chapters.length }) : ''}</p>
        <p class="text-sm text-dim">{text(you, 'chapters-done')}</p>
      </div>
      {#if profile?.last_active && new Date(profile.last_active).toDateString() !== new Date().toDateString()}
      <div data-last-change>
        <p class="text-base font-semibold text-bright mt-1.5">{date(profile.last_active)}</p>
        <p class="text-sm text-dim">{text(you, 'last-change')}</p>
      </div>
      {/if}
    </div>
    {#if resumable && lastStep}
      <p class="mt-5 text-sm text-dim">{text(you, 'last-open')}</p>
      <p class="mt-0.5 text-base font-semibold text-bright">{lastStep.title}</p>
    {/if}
    <a href={continueHref} class="btn-primary btn-sm mt-4" data-you-continue>
      {resumable || (result && result.total_implemented > 0) ? text(you, 'continue') : text(you, 'start')}
    </a>
  </section>

  {#if ready}
  <details class="panel p-5 sm:p-6 mt-4 group" bind:open={opened.past} data-you-section="past">
    <summary class="cursor-pointer list-none flex items-center justify-between gap-3">
      <h2 class="text-lg font-semibold text-bright">{text(you, 'past-heading')}</h2>
      <span class="text-dim sm:hidden transition-transform group-open:rotate-90" aria-hidden="true">›</span>
    </summary>
    {#if !played}
      <p class="mt-3 text-base text-body">{text(you, 'past-none-yet')}</p>
    {:else if past.length === 0}
      <p class="mt-3 text-base text-body">{text(you, 'past-none')}</p>
    {:else}
      <p class="mt-3 text-sm text-dim">{text(you, 'past-lead')}</p>
      <ul class="mt-3 flex flex-wrap gap-2" data-past>
        {#each past as f}<li class="pill-teal text-sm">{EMOTIONAL_REGISTER_LABELS[f] ?? f}</li>{/each}
      </ul>
    {/if}
    <div class="mt-4 flex flex-wrap gap-3">
      <a href={pastGame.href} class="btn-ghost btn-sm">{pastGame.text}</a>
      <a href={pastQuiz.href} class="btn-ghost btn-sm">{pastQuiz.text}</a>
    </div>
  </details>

  <details class="panel p-5 sm:p-6 mt-4 group" bind:open={opened.protect} data-you-section="protect">
    <summary class="cursor-pointer list-none flex items-center justify-between gap-3">
      <h2 class="text-lg font-semibold text-bright">{text(you, 'protect-heading')}</h2>
      <span class="text-dim sm:hidden transition-transform group-open:rotate-90" aria-hidden="true">›</span>
    </summary>
    <p class="mt-3 text-sm text-dim">{text(you, 'protect-lead')}</p>
    <ul class="mt-4 space-y-3">
      {#each harms as row}
        <li class="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5" data-harm-row>
          <span class="text-sm leading-snug {row.picked ? 'text-bright font-semibold' : 'text-body'}">{row.harm}</span>
          <span class="flex items-center gap-2 text-sm text-dim whitespace-nowrap">
            {#if row.covered}<span class="pill-teal text-xs">{text(you, 'covered')}</span>{/if}
            {fill(you, 'count', { done: row.done, total: row.total })}
          </span>
          <span class="col-span-2 grid gap-1" style="grid-template-columns: repeat({Math.max(row.total, 1)}, 1fr)" aria-hidden="true">
            {#each Array.from({ length: Math.max(row.total, 1) }) as _, i}<i class="block h-1.5 rounded-full {i < row.done ? 'bg-teal' : 'bg-viz-off'}"></i>{/each}
          </span>
        </li>
      {/each}
    </ul>
    <p class="mt-4 text-sm text-dim">{COVERED_MEANS}</p>
    <a href={openMap.href} class="mt-3 inline-flex min-h-[44px] items-center text-base font-semibold text-teal-light link-inline">{openMap.text}</a>
  </details>

  <details class="panel p-5 sm:p-6 mt-4 group" bind:open={opened.setup} data-you-section="setup">
    <summary class="cursor-pointer list-none flex items-center justify-between gap-3">
      <h2 class="text-lg font-semibold text-bright">{text(you, 'setup-heading')}</h2>
      <span class="text-dim sm:hidden transition-transform group-open:rotate-90" aria-hidden="true">›</span>
    </summary>
    <p class="mt-3 text-sm text-dim">{text(you, 'setup-lead')}</p>
    <SetupPanel inline />
  </details>

  <details class="panel p-5 sm:p-6 mt-4 group" bind:open={opened.more} data-you-section="more">
    <summary class="cursor-pointer list-none flex items-center justify-between gap-3">
      <h2 class="text-lg font-semibold text-bright">{text(you, 'more-heading')}</h2>
      <span class="text-dim sm:hidden transition-transform group-open:rotate-90" aria-hidden="true">›</span>
    </summary>
    <ul class="mt-3 space-y-1">
      <li><a href={journey.href} class="inline-flex min-h-[44px] items-center text-base text-teal-light link-inline">{journey.text}</a></li>
      <li><a href={print.href} class="inline-flex min-h-[44px] items-center text-base text-teal-light link-inline">{print.text}</a></li>
    </ul>
  </details>
  {/if}
</div>
