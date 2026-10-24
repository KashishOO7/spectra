<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types.js';
  import { loadProfile } from '$lib/engine/store.js';
  import home from '#spectra-wiki/page/home';
  import { text, fill, lines, items, plainLines } from '$lib/wiki/page.js';
  import FactPicture from '$lib/components/FactPicture.svelte';

  const title = text(home, 'title');
  const description = text(home, 'description');

  export let data: PageData;

  const cards = items(home, 'cards').map(c => {
    const [figure, says, alt] = c.lines.slice(0, 3).map(l => (l[0] as { value: string }).value);
    const step = data.cards.find(s => s.id === c.title)!;
    return { id: c.title, figure, says, alt, title: step.title, why: step.why, what: step.what };
  });
  const bars = plainLines(home, 'ai-bars').map(l => {
    const m = /^(\d+) (.+)$/.exec(l);
    if (!m) throw new Error(`wiki/pages/home.md ai-bars: "${l}" is not a number then a label`);
    return { value: +m[1], label: m[2] };
  });
  const scamLine = text(home, 'hero-scam-message');
  const at = scamLine.lastIndexOf(' ') + 1;
  const scam = { before: scamLine.slice(0, at), link: scamLine.slice(at) };
  const twoStep = cards.find(c => c.id === 'auth-2fa-001')!;
  const count = /^(\d+) of (\d+)\b/.exec(text(home, 'hero-chapter-count'));
  if (!count) throw new Error('wiki/pages/home.md hero-chapter-count: not "n of m"');
  const chapter = { done: +count[1], total: +count[2] };

  let flipped: Record<string, boolean> = {};
  const flip = (id: string) => (flipped = { ...flipped, [id]: !flipped[id] });
  const turnFrom = (e: MouseEvent, id: string) => {
    if ((e.target as Element).closest('a')) return;
    flip(id);
  };

  let row: HTMLDivElement;
  let first = 1, last = 3;
  function measure() {
    if (!row) return;
    const box = row.getBoundingClientRect();
    const shown = (Array.from(row.children) as HTMLElement[])
      .map((k, i) => ({ i, r: k.getBoundingClientRect() }))
      .filter(({ r }) => r.left >= box.left - 2 && r.right <= box.right + 2)
      .map(({ i }) => i + 1);
    if (shown.length) { first = shown[0]; last = shown[shown.length - 1]; }
  }
  function move(dir: 1 | -1) {
    row?.scrollBy({ left: dir * row.clientWidth, behavior: 'smooth' });
  }

  let returning = false;
  let continueHref = '/audit';

  onMount(async () => {
    measure();
    try {
      const profile = await loadProfile();
      returning = !!profile && (
        Object.values(profile.implemented ?? {}).some(Boolean) ||
        Object.keys(profile.skipped ?? {}).length > 0 ||
        !!profile.harms?.length || !!profile.last_open);
      const last = profile?.last_open?.id;
      if (last && !profile?.implemented?.[last] && !profile?.skipped?.[last]) continueHref = `/checklist/${last}`;
    } catch {
    }
  });
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href="https://spectra.fpszero.com/" />
</svelte:head>

<section class="px-4 sm:px-6 pt-8 sm:pt-14 pb-16">
  <div class="hero max-w-6xl mx-auto">
   <div>
    <h1 class="text-3xl font-bold text-white mb-5" data-page-title>{text(home, 'heading')}</h1>
    <p class="text-lg text-bright mb-4 max-w-[40ch]">{text(home, 'lead')}</p>
    <p class="hidden sm:block text-lg text-body mb-6 max-w-[40ch]">{#each lines(home, 'who-for')[0] as p}{#if p.kind === 'link'}<a href={p.href} class="link-inline text-teal-light">{p.value}</a>{:else}{p.value}{/if}{/each}</p>
    <div class="flex flex-wrap items-center gap-3 min-h-[48px]" data-doors>
      {#if returning}
        <a href={continueHref} class="btn-primary max-sm:w-full max-sm:min-h-[52px]">{text(home, 'continue')}</a>
      {:else}
        <a href="/start" class="btn-primary max-sm:w-full max-sm:min-h-[52px]">{text(home, 'start-door')}</a>
      {/if}
      <a href="/real-or-scam" class="btn-ghost max-sm:w-full max-sm:min-h-[52px]">{text(home, 'game-door')}</a>
      <a href="/quiz" class="btn-ghost max-sm:border-0 max-sm:bg-transparent max-sm:px-0 max-sm:min-h-[44px] max-sm:text-teal-light">{text(home, 'quiz-door')} <span class="sm:hidden" aria-hidden="true">→</span></a>
    </div>
    <p class="mt-6 text-sm text-body inline-flex items-center gap-2">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"
           stroke-linecap="round" stroke-linejoin="round" class="text-teal flex-shrink-0" aria-hidden="true">
        <path d="m3.5 8.5 3 3 6-7"/>
      </svg>
      {text(home, 'promise')}
    </p>
    <div class="sm:hidden mt-6 rounded-2xl bg-teal-dim px-4 py-4" data-help-box>
      <p class="text-base font-semibold text-bright">{text(home, 'help-box-heading')}</p>
      <p class="text-sm text-body mt-1">{text(home, 'help-box-lead')}</p>
      <a href="/incident" class="inline-flex items-center min-h-[44px] font-semibold text-teal-light">{text(home, 'help-box-link')}</a>
    </div>
   </div>

    <div class="hidden min-[900px]:block">
    <div class="stack" role="img" aria-label={text(home, 'hero-cards-alt')}>
      <div class="panel hc s1" data-hero-card>
        <span class="sticker pill-ink" data-hero-sticker>{text(home, 'hero-sticker')}</span>
        <div class="flex items-start justify-between gap-3 mb-2">
          <span class="text-sm text-dim">{text(home, 'hero-scam-from')}</span>
          <span data-scam-tag data-hero-tag class="pill bg-red-dim text-red-light">{text(home, 'hero-scam')}</span>
        </div>
        <p class="text-base text-bright">{scam.before}<span class="text-teal-light underline underline-offset-2 [overflow-wrap:anywhere]">{scam.link}</span></p>
        <p class="mt-2.5 text-sm text-dim">{text(home, 'hero-scam-why')}</p>
      </div>
      <div class="panel hc s2" data-hero-card>
        <span class="sticker pill-ink" data-hero-sticker>{text(home, 'hero-sticker')}</span>
        <div class="flex items-start justify-between gap-3 mb-2">
          <span class="text-sm text-dim">{text(home, 'hero-step-label')}</span>
          <span data-hero-tag class="pill-teal">{text(home, 'hero-step-tag')}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="w-[34px] h-[34px] rounded-full grid place-items-center bg-teal-dim text-teal flex-none">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"
                 stroke-linecap="round" stroke-linejoin="round"><path d="m3.5 8.5 3 3 6-7"/></svg>
          </span>
          <p class="text-base font-semibold text-bright leading-snug">{twoStep.title}</p>
        </div>
        <p class="mt-2.5 text-sm text-body" data-step-what>{twoStep.what}</p>
      </div>
      <div class="panel hc s3" data-hero-card>
        <span class="sticker pill-ink" data-hero-sticker>{text(home, 'hero-sticker')}</span>
        <div class="flex items-start justify-between gap-3 mb-2">
          <span class="text-sm text-dim">{text(home, 'hero-chapter-label')}</span>
          <span data-hero-tag class="pill-teal tabular-nums">{text(home, 'hero-chapter-count')}</span>
        </div>
        <p class="text-base font-semibold text-bright">{text(home, 'hero-chapter')}</p>
        <div class="mt-3 grid gap-[5px]" style="grid-template-columns: repeat({chapter.total}, 1fr)">
          {#each Array.from({ length: chapter.total }, (_, i) => i < chapter.done) as on}
            <i class="block h-2 rounded-full {on ? 'bg-teal' : 'bg-viz-off'}"></i>
          {/each}
        </div>
      </div>
    </div>
    </div>
  </div>
</section>

<section class="px-4 sm:px-6 pb-16" aria-labelledby="cards-heading">
  <div class="max-w-6xl mx-auto border-t border-border pt-14 sm:pt-20">
    <div class="sec-head mb-8 sm:mb-10">
      <h2 id="cards-heading" class="text-2xl font-bold text-bright">{text(home, 'cards-heading')}</h2>
      <p class="hidden sm:block text-lg text-body">{text(home, 'cards-lead')}</p>
      <p class="sm:hidden text-base text-body">{text(home, 'cards-lead-phone')}</p>
    </div>

    <ul class="sm:hidden panel p-0 overflow-hidden divide-y divide-border" data-fact-rows>
      {#each cards as c (c.id)}
        <li>
          <a href="/checklist/{c.id}" class="flex items-center gap-3 px-4 py-3.5 min-h-[64px]">
            <span class="flex-1 min-w-0">
              <span class="block text-xl font-bold text-bright">{c.figure}</span>
              <span class="block text-sm text-body mt-0.5">{c.says}</span>
            </span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="text-dim flex-none" aria-hidden="true"><path d="M6 3.5 10.5 8 6 12.5"/></svg>
          </a>
        </li>
      {/each}
    </ul>

    <div class="max-sm:hidden">
    <div bind:this={row} on:scroll={measure} data-cards
         class="cards grid grid-flow-col gap-5 overflow-x-auto snap-x snap-mandatory pb-2">
      {#each cards as c (c.id)}
        {@const back = !!flipped[c.id]}
        <article class="card relative grid snap-start min-h-[26rem]" data-card={c.id}>
          <button type="button" aria-pressed={back} aria-label={text(home, 'flip-front')}
                  on:click={() => flip(c.id)} class="flipper"></button>
          <div data-turn class="turn grid {back ? 'turned' : ''}">
            <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
            <div data-face="front" class="face panel [grid-area:1/1] flex flex-col p-5 sm:p-6"
                 inert={back ? true : undefined} on:click={e => turnFrom(e, c.id)}>
              <FactPicture id={c.id} alt={c.alt} bars={c.id === 'ai-phishing-detect-001' ? bars : []}
                           labels={[text(home, 'dots-without'), text(home, 'dots-with')]}
                           caption={c.id === 'location-exposure-001' ? text(home, 'dots-caption') : ''} />
              <p class="mt-5 text-2xl font-bold text-bright">{c.figure}</p>
              <p class="mt-2 text-base text-body">{c.says}</p>
            </div>
            <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
            <div data-face="back" class="face back panel bg-teal-dim border-transparent [grid-area:1/1] flex flex-col p-5 sm:p-6"
                 inert={back ? undefined : true} on:click={e => turnFrom(e, c.id)}>
              <p class="text-sm font-semibold text-dim">{text(home, 'how-label')}</p>
              <p class="mt-2 text-sm text-body">{c.why}</p>
              <p class="mt-4 text-sm font-semibold text-dim">{text(home, 'step-label')}</p>
              <p class="mt-1 text-base font-semibold text-bright">{c.title}</p>
              <a href="/checklist/{c.id}" class="btn-primary btn-sm self-start mt-4">{text(home, 'show-me-how')}</a>
            </div>
          </div>
        </article>
      {/each}
    </div>

    <div class="flex items-center justify-end gap-3 mt-4">
      <span class="text-sm text-dim tabular-nums" aria-live="polite">{first === last
        ? fill(home, 'cards-position-one', { n: first, total: cards.length })
        : fill(home, 'cards-position', { first, last, total: cards.length })}</span>
      <button type="button" on:click={() => move(-1)} aria-label={text(home, 'cards-previous')} disabled={first === 1}
        class="w-11 h-11 rounded-full border border-muted bg-surface text-bright flex items-center justify-center
               hover:border-teal transition-colors disabled:opacity-40">
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3.5 5.5 8 10 12.5"/></svg>
      </button>
      <button type="button" on:click={() => move(1)} aria-label={text(home, 'cards-next')} disabled={last === cards.length}
        class="w-11 h-11 rounded-full border border-muted bg-surface text-bright flex items-center justify-center
               hover:border-teal transition-colors disabled:opacity-40">
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3.5 10.5 8 6 12.5"/></svg>
      </button>
    </div>
    </div>
  </div>
</section>

<style>
  .cards { grid-auto-columns: 86%; scrollbar-width: none; }
  .cards::-webkit-scrollbar { display: none; }
  @media (min-width: 640px) { .cards { grid-auto-columns: calc((100% - 1.25rem) / 2); } }
  @media (min-width: 900px) { .cards { grid-auto-columns: calc((100% - 2.5rem) / 3); } }
  .card { perspective: 1400px; }
  .turn { transition: transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1); transform-style: preserve-3d; }
  .turn.turned { transform: rotateY(180deg); }
  .face { backface-visibility: hidden; -webkit-backface-visibility: hidden; cursor: pointer; }
  .face.back { transform: rotateY(180deg); }

  .flipper { position: absolute; inset: 0; z-index: 10; border-radius: 1rem; pointer-events: none; background: transparent; }

  .sec-head { display: grid; gap: 0.75rem; }
  @media (min-width: 900px) { .sec-head { grid-template-columns: 1fr 1fr; gap: 2rem; align-items: end; } }

  .hero { display: grid; gap: 1.75rem; align-items: center; }
  @media (min-width: 900px) { .hero { grid-template-columns: 1.08fr 0.92fr; gap: 3.5rem; } }

  .stack { display: flex; flex-direction: column; gap: 14px; }
  .hc { position: relative; width: min(400px, 90%); padding: 18px 20px; }
  .sticker { position: absolute; top: -11px; left: 16px; rotate: -4deg; box-shadow: 0 1px 2px rgb(0 0 0 / 0.12); }
  .s1 { align-self: flex-start; margin-left: 2%; rotate: -2.2deg; }
  .s2 { align-self: flex-end; rotate: 1.6deg; }
  .s3 { align-self: flex-start; margin-left: 8%; rotate: -0.8deg; }

  @media (prefers-reduced-motion: no-preference) and (min-width: 641px) {
    .hc { animation: float 7s ease-in-out infinite; }
    .s2 { animation-delay: -2.3s; }
    .s3 { animation-delay: -4.6s; }
  }
  @keyframes float { 50% { translate: 0 -6px; } }

  @media (max-width: 640px) {
    .stack { gap: 12px; }
    .hc { width: 100%; padding: 14px 16px; }
    .s1 { margin-left: 0; rotate: -1deg; }
    .s2 { rotate: 0.8deg; width: 94%; }
    .s3 { margin-left: 0; rotate: none; width: 90%; }
  }
</style>
